"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildSpaceship = void 0;
const AIStrategy_1 = require("@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy");
const CityBuild_1 = require("@civ-clone/core-city-build/CityBuild");
const Part_1 = require("@civ-clone/core-spaceship/Part");
const goal_1 = require("../../lib/goal");
// `BuildItem.item()` holds a class, though it's typed as an instance.
const classOf = (buildItem) => buildItem.item();
const partsOf = (Items) => Items.filter((Item) => Item.prototype instanceof Part_1.default);
class BuildSpaceship extends AIStrategy_1.default {
    // `goal` is the space race's own, among the `goals` the player chooses between.
    constructor(dependencies, knowledge, goal, goals, policy, victoryDependencies) {
        super(dependencies, knowledge);
        this._goal = goal;
        this._goals = goals;
        this._policy = policy;
        this._victoryDependencies = victoryDependencies;
    }
    handles(action) {
        return action.value() instanceof CityBuild_1.default;
    }
    attempt(action) {
        const cityBuild = action.value(), city = cityBuild.city(), player = city.player(), dependencies = this.dependencies(), victoryDependencies = this._victoryDependencies;
        if ((0, goal_1.goalFor)(this._goals, dependencies, victoryDependencies, player) !==
            this._goal) {
            return false;
        }
        const available = cityBuild.available().map(classOf), 
        // What the player's other cities are building already.
        building = dependencies.cityRegistry
            .getByPlayer(player)
            .filter((other) => other !== city)
            .map((other) => dependencies.cityBuildRegistry.getByCity(other).building())
            .filter((buildItem) => buildItem !== null)
            .map(classOf), spaceship = victoryDependencies.spaceshipRegistry.getActiveByPlayer(player);
        if (spaceship === null) {
            const Enabler = this._policy.enablers.find((Item) => available.includes(Item) && !building.includes(Item));
            if (!Enabler ||
                this._policy.enablerCity(dependencies, victoryDependencies, player) !==
                    city) {
                return false;
            }
            cityBuild.build(Enabler);
            return true;
        }
        if (spaceship.launched() !== false ||
            !this._policy.buildsParts(dependencies, victoryDependencies, city)) {
            return false;
        }
        const NextPart = this._policy.nextPart(dependencies, victoryDependencies, spaceship, partsOf(available), partsOf(building));
        if (NextPart === null) {
            return false;
        }
        cityBuild.build(NextPart);
        return true;
    }
}
exports.BuildSpaceship = BuildSpaceship;
exports.default = BuildSpaceship;
//# sourceMappingURL=BuildSpaceship.js.map