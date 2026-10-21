"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchSpaceship = void 0;
// Generic: at the end of a player's turn, launches its spaceship once its `SpaceRacePolicy` says it should. Launching
//  isn't a choice a player is ever made to take, so no other strategy is offered it.
const AfterTurn_1 = require("@civ-clone/core-strategy-ai-client/PlayerActions/AfterTurn");
const AIStrategy_1 = require("@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy");
class LaunchSpaceship extends AIStrategy_1.default {
    constructor(dependencies, knowledge, policy, victoryDependencies) {
        super(dependencies, knowledge);
        this._policy = policy;
        this._victoryDependencies = victoryDependencies;
    }
    handles(action) {
        return action instanceof AfterTurn_1.default;
    }
    attempt(action) {
        const spaceship = this._victoryDependencies.spaceshipRegistry.getActiveByPlayer(action.player());
        if (spaceship === null ||
            spaceship.launched() !== false ||
            spaceship.activeParts().length === 0 ||
            !this._policy.shouldLaunch(this.dependencies(), this._victoryDependencies, spaceship)) {
            return true;
        }
        spaceship.launch();
        return true;
    }
}
exports.LaunchSpaceship = LaunchSpaceship;
exports.default = LaunchSpaceship;
//# sourceMappingURL=LaunchSpaceship.js.map