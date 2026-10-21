"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
// Generic: while a player plays for conquest (`lib/goal`), its attackers with nothing else to do gather in one city
//  near the target its `ConquestPolicy` chooses and wait there until there are enough, then go for the target
//  together. Registered after the strategies that give attackers their missions, it only gathers those the missions
//  had no use for: ahead of them, it kept attackers from the enemy cities they'd have taken one at a time, and players
//  took fewer cities in the arena (civ-clone/web-renderer#377). Before the player's turn, attackers fortified with a
//  path to the muster city within the policy's `marchTurns`, where the policy says they can be spared, are woken and
//  set off along it, and the paths it gave for a campaign that has since ended or moved on are dropped. A unit on its
//  way somewhere, one the policy doesn't count as an attacker, one that can't reach the muster city within
//  `marchTurns`, and one waiting there with an enemy beside it are left to the strategies after this one. Units on a
//  path are moved by whichever strategy follows paths first: this one, if it's registered ahead of the others.
const AIStrategy_1 = require("@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy");
const BeforeTurn_1 = require("@civ-clone/core-strategy-ai-client/PlayerActions/BeforeTurn");
const Path_1 = require("@civ-clone/core-world-path/Path");
const goal_1 = require("../../lib/goal");
const isUnitAction_1 = require("@civ-clone/base-strategy-ai/Strategies/lib/isUnitAction");
const orders_1 = require("@civ-clone/base-strategy-ai/lib/Unit/orders");
const reachable_1 = require("@civ-clone/base-strategy-ai/lib/Unit/reachable");
class Campaign extends AIStrategy_1.default {
    // `goal` is conquest's own, among the `goals` the player chooses between.
    constructor(dependencies, knowledge, goal, goals, policy, victoryDependencies, travel) {
        super(dependencies, knowledge);
        // The path each unit was last given here: followed here if this is the first strategy a unit with a path comes to,
        //  and dropped once the campaign it was for is over.
        this._paths = new WeakMap();
        // The turn each unit was last sent on its way: one asked again in the same turn, its path ended or blocked, waits.
        this._sent = new WeakMap();
        this._goal = goal;
        this._goals = goals;
        this._policy = policy;
        this._travel = travel;
        this._victoryDependencies = victoryDependencies;
    }
    handles(action) {
        return action instanceof BeforeTurn_1.default || (0, isUnitAction_1.default)(action);
    }
    async attempt(action) {
        if (action instanceof BeforeTurn_1.default) {
            this.dropStalePaths(action.player());
            this.wake(action.player());
            return false;
        }
        return this.command(action);
    }
    // The target and the city to gather in, while `player` plays for conquest and has both.
    campaign(player) {
        const dependencies = this.dependencies(), victoryDependencies = this._victoryDependencies;
        if ((0, goal_1.goalFor)(this._goals, dependencies, victoryDependencies, player) !==
            this._goal) {
            return null;
        }
        const target = this._policy.target(dependencies, victoryDependencies, player);
        if (target === null) {
            return null;
        }
        const muster = this._policy.musterCity(dependencies, victoryDependencies, player, target);
        return muster === null ? null : { target, muster };
    }
    // Drops the paths given here for a campaign that's over, or that has moved on to another target or muster city.
    dropStalePaths(player) {
        const memory = this.memoryFor(player), campaign = this.campaign(player), current = campaign
            ? [campaign.target.tile(), campaign.muster.tile()]
            : [];
        [...memory.unitPathData.entries()].forEach(([unit, path]) => {
            if (this._paths.get(unit) !== path) {
                return;
            }
            const [end] = path.entries().slice(-1);
            if (!current.includes(end)) {
                memory.unitPathData.delete(unit);
                this._paths.delete(unit);
            }
        });
    }
    // Wakes the attackers fortified where they can be spared with a path to the muster city within a march, and sets
    //  them off along it. Activating them takes their fortification off, as it does for a player's own unit.
    wake(player) {
        const dependencies = this.dependencies(), memory = this.memoryFor(player), campaign = this.campaign(player);
        if (campaign === null) {
            return;
        }
        const { muster } = campaign;
        dependencies.unitRegistry
            .getByPlayer(player)
            .filter((unit) => unit.busy() !== null &&
            unit.tile() !== muster.tile() &&
            this._policy.isAttacker(dependencies, unit) &&
            this._policy.mayLeave(dependencies, this.knowledge(), unit))
            .forEach((unit) => {
            const path = this.marchPath(unit, muster.tile(), this._policy.marchTurns);
            if (path === null) {
                return;
            }
            unit.activate();
            memory.unitPathData.set(unit, path);
            this._paths.set(unit, path);
        });
    }
    // `unit`'s path to `tile`, if it has one it can follow within `turns`.
    marchPath(unit, tile, turns) {
        const dependencies = this.dependencies();
        if (turns !== Infinity && !this.withinMarch(unit, tile)) {
            return null;
        }
        const reachable = (0, reachable_1.default)(unit, dependencies.turn.value());
        if (reachable !== null && !reachable.has(tile)) {
            return null;
        }
        const path = Path_1.default.for(unit, unit.tile(), tile, dependencies.pathFinderRegistry);
        return path &&
            path.movementCost() / Math.max(1, unit.movement().value()) <= turns
            ? path
            : null;
    }
    // Whether `unit` could be within the policy's march of `tile`, as the crow flies: a cheap check before a path search.
    withinMarch(unit, tile) {
        const reachable = (0, reachable_1.default)(unit, this.dependencies().turn.value());
        return ((reachable === null || reachable.has(tile)) &&
            unit.tile().distanceFrom(tile) <=
                this._policy.marchTurns * Math.max(1, unit.movement().value()));
    }
    // Whether an enemy of `player`'s stands next to `unit`: a unit waiting to muster deals with it first.
    threatened(player, unit) {
        const dependencies = this.dependencies();
        return unit
            .tile()
            .getNeighbours()
            .some((tile) => dependencies.unitRegistry
            .getByTile(tile)
            .some((other) => other.player() !== player));
    }
    async command(action) {
        const unit = action.value(), player = action.player(), dependencies = this.dependencies(), victoryDependencies = this._victoryDependencies, memory = this.memoryFor(player), turn = dependencies.turn.value(), path = memory.unitPathData.get(unit), ours = path !== undefined && path === this._paths.get(unit);
        if (memory.unitTargetData.has(unit) ||
            !this._policy.isAttacker(dependencies, unit)) {
            return false;
        }
        const campaign = this.campaign(player);
        // The campaign is over: a unit on its way for it stops, and is left to the strategies after this one.
        if (campaign === null) {
            if (ours) {
                memory.unitPathData.delete(unit);
            }
            return false;
        }
        const { target, muster } = campaign;
        if (path !== undefined && !ours) {
            return false;
        }
        if (this._sent.get(unit) === turn) {
            (0, orders_1.noOrders)(dependencies, unit);
            return true;
        }
        // On its way: it carries on, and waits where its path ends.
        if (ours) {
            this._sent.set(unit, turn);
            await this._travel(dependencies, player, memory, this.knowledge(), unit);
            if (unit.active() && !memory.unitPathData.has(unit)) {
                (0, orders_1.noOrders)(dependencies, unit);
            }
            return true;
        }
        // Sets the unit off for `tile` and moves it there: `false` if there's no way there, or none within `turns`.
        const travelTo = async (tile, turns = Infinity) => {
            const path = this.marchPath(unit, tile, turns);
            if (path === null) {
                return false;
            }
            memory.unitPathData.set(unit, path);
            this._paths.set(unit, path);
            this._sent.set(unit, turn);
            await this._travel(dependencies, player, memory, this.knowledge(), unit);
            return true;
        };
        // Those gathered go together, with any within a turn of joining them; the rest gather first.
        if (unit.tile().distanceFrom(muster.tile()) <=
            Math.max(1, unit.movement().value()) &&
            this._policy.mustered(dependencies, victoryDependencies, player, target, muster)) {
            return travelTo(target.tile());
        }
        if (unit.tile() !== muster.tile()) {
            return travelTo(muster.tile(), this._policy.marchTurns);
        }
        if (this.threatened(player, unit)) {
            return false;
        }
        // Gathered, and waiting for the rest.
        (0, orders_1.noOrders)(dependencies, unit);
        return true;
    }
}
exports.Campaign = Campaign;
exports.default = Campaign;
//# sourceMappingURL=Campaign.js.map