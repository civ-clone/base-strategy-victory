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
import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import BeforeTurn from '@civ-clone/core-strategy-ai-client/PlayerActions/BeforeTurn';
import City from '@civ-clone/core-city/City';
import ConquestPolicy from '../../lib/Conquest/ConquestPolicy';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import Memory from '@civ-clone/base-strategy-ai/lib/Memory';
import Path from '@civ-clone/core-world-path/Path';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import VictoryDependencies from '../../lib/VictoryDependencies';
import { VictoryGoal, goalFor } from '../../lib/goal';
import isUnitAction from '@civ-clone/base-strategy-ai/Strategies/lib/isUnitAction';
import { noOrders } from '@civ-clone/base-strategy-ai/lib/Unit/orders';
import reachableTiles from '@civ-clone/base-strategy-ai/lib/Unit/reachable';

// Moves `unit` along the path in `memory`, stopping where it ends: the client's own move executor.
export type CampaignTravel = (
  dependencies: Dependencies,
  player: Player,
  memory: Memory,
  knowledge: Knowledge,
  unit: Unit
) => Promise<void>;

export class Campaign extends AIStrategy {
  private _goal: VictoryGoal;
  private _goals: VictoryGoal[];
  private _policy: ConquestPolicy;
  private _travel: CampaignTravel;
  private _victoryDependencies: VictoryDependencies;
  // The path each unit was last given here: followed here if this is the first strategy a unit with a path comes to,
  //  and dropped once the campaign it was for is over.
  private _paths = new WeakMap<Unit, Path>();
  // The turn each unit was last sent on its way: one asked again in the same turn, its path ended or blocked, waits.
  private _sent = new WeakMap<Unit, number>();

  // `goal` is conquest's own, among the `goals` the player chooses between.
  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    goal: VictoryGoal,
    goals: VictoryGoal[],
    policy: ConquestPolicy,
    victoryDependencies: VictoryDependencies,
    travel: CampaignTravel
  ) {
    super(dependencies, knowledge);

    this._goal = goal;
    this._goals = goals;
    this._policy = policy;
    this._travel = travel;
    this._victoryDependencies = victoryDependencies;
  }

  handles(action: PlayerAction): boolean {
    return action instanceof BeforeTurn || isUnitAction(action);
  }

  async attempt(action: PlayerAction): Promise<boolean> {
    if (action instanceof BeforeTurn) {
      this.dropStalePaths(action.player());
      this.wake(action.player());

      return false;
    }

    return this.command(action as PlayerAction<Unit>);
  }

  // The target and the city to gather in, while `player` plays for conquest and has both.
  private campaign(player: Player): { target: City; muster: City } | null {
    const dependencies = this.dependencies(),
      victoryDependencies = this._victoryDependencies;

    if (
      goalFor(this._goals, dependencies, victoryDependencies, player) !==
      this._goal
    ) {
      return null;
    }

    const target = this._policy.target(
      dependencies,
      victoryDependencies,
      player
    );

    if (target === null) {
      return null;
    }

    const muster = this._policy.musterCity(
      dependencies,
      victoryDependencies,
      player,
      target
    );

    return muster === null ? null : { target, muster };
  }

  // Drops the paths given here for a campaign that's over, or that has moved on to another target or muster city.
  private dropStalePaths(player: Player): void {
    const memory = this.memoryFor(player),
      campaign = this.campaign(player),
      current = campaign
        ? [campaign.target.tile(), campaign.muster.tile()]
        : [];

    [...memory.unitPathData.entries()].forEach(([unit, path]): void => {
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
  private wake(player: Player): void {
    const dependencies = this.dependencies(),
      memory = this.memoryFor(player),
      campaign = this.campaign(player);

    if (campaign === null) {
      return;
    }

    const { muster } = campaign;

    dependencies.unitRegistry
      .getByPlayer(player)
      .filter(
        (unit: Unit): boolean =>
          unit.busy() !== null &&
          unit.tile() !== muster.tile() &&
          this._policy.isAttacker(dependencies, unit) &&
          this._policy.mayLeave(dependencies, this.knowledge(), unit)
      )
      .forEach((unit: Unit): void => {
        const path = this.marchPath(
          unit,
          muster.tile(),
          this._policy.marchTurns
        );

        if (path === null) {
          return;
        }

        unit.activate();
        memory.unitPathData.set(unit, path);
        this._paths.set(unit, path);
      });
  }

  // `unit`'s path to `tile`, if it has one it can follow within `turns`.
  private marchPath(unit: Unit, tile: Tile, turns: number): Path | null {
    const dependencies = this.dependencies();

    if (turns !== Infinity && !this.withinMarch(unit, tile)) {
      return null;
    }

    const reachable = reachableTiles(unit, dependencies.turn.value());

    if (reachable !== null && !reachable.has(tile)) {
      return null;
    }

    const path = Path.for(
      unit,
      unit.tile(),
      tile,
      dependencies.pathFinderRegistry
    );

    return path &&
      path.movementCost() / Math.max(1, unit.movement().value()) <= turns
      ? path
      : null;
  }

  // Whether `unit` could be within the policy's march of `tile`, as the crow flies: a cheap check before a path search.
  private withinMarch(unit: Unit, tile: Tile): boolean {
    const reachable = reachableTiles(unit, this.dependencies().turn.value());

    return (
      (reachable === null || reachable.has(tile)) &&
      unit.tile().distanceFrom(tile) <=
        this._policy.marchTurns * Math.max(1, unit.movement().value())
    );
  }

  // Whether an enemy of `player`'s stands next to `unit`: a unit waiting to muster deals with it first.
  private threatened(player: Player, unit: Unit): boolean {
    const dependencies = this.dependencies();

    return unit
      .tile()
      .getNeighbours()
      .some((tile: Tile): boolean =>
        dependencies.unitRegistry
          .getByTile(tile)
          .some((other: Unit): boolean => other.player() !== player)
      );
  }

  private async command(action: PlayerAction<Unit>): Promise<boolean> {
    const unit = action.value(),
      player = action.player(),
      dependencies = this.dependencies(),
      victoryDependencies = this._victoryDependencies,
      memory = this.memoryFor(player),
      turn = dependencies.turn.value(),
      path = memory.unitPathData.get(unit),
      ours = path !== undefined && path === this._paths.get(unit);

    if (
      memory.unitTargetData.has(unit) ||
      !this._policy.isAttacker(dependencies, unit)
    ) {
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
      noOrders(dependencies, unit);

      return true;
    }

    // On its way: it carries on, and waits where its path ends.
    if (ours) {
      this._sent.set(unit, turn);

      await this._travel(dependencies, player, memory, this.knowledge(), unit);

      if (unit.active() && !memory.unitPathData.has(unit)) {
        noOrders(dependencies, unit);
      }

      return true;
    }

    // Sets the unit off for `tile` and moves it there: `false` if there's no way there, or none within `turns`.
    const travelTo = async (
      tile: Tile,
      turns: number = Infinity
    ): Promise<boolean> => {
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
    if (
      unit.tile().distanceFrom(muster.tile()) <=
        Math.max(1, unit.movement().value()) &&
      this._policy.mustered(
        dependencies,
        victoryDependencies,
        player,
        target,
        muster
      )
    ) {
      return travelTo(target.tile());
    }

    if (unit.tile() !== muster.tile()) {
      return travelTo(muster.tile(), this._policy.marchTurns);
    }

    if (this.threatened(player, unit)) {
      return false;
    }

    // Gathered, and waiting for the rest.
    noOrders(dependencies, unit);

    return true;
  }
}

export default Campaign;
