"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.victoryDependenciesFor = exports.createVictoryDependencies = void 0;
// Generic: the registries playing to win reads, beyond those every strategy has (`base-strategy-ai`'s `Dependencies`).
//  Kept here rather than there, so the generic AI knows nothing of spaceships or Wonders unless a goal needs them.
const AdvanceRegistry_1 = require("@civ-clone/core-science/AdvanceRegistry");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const PlayerRegistry_1 = require("@civ-clone/core-player/PlayerRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const Year_1 = require("@civ-clone/core-game-year/Year");
// The module-level singletons, with any of them replaced.
const createVictoryDependencies = (dependencies = {}) => ({
    advanceRegistry: AdvanceRegistry_1.instance,
    difficulty: GameDifficultyRegistry_1.instance,
    playerRegistry: PlayerRegistry_1.instance,
    spaceshipRegistry: SpaceshipRegistry_1.instance,
    year: Year_1.instance,
    ...dependencies,
});
exports.createVictoryDependencies = createVictoryDependencies;
// The game's registries.
const victoryDependenciesFor = (game) => (0, exports.createVictoryDependencies)({
    advanceRegistry: game.advances,
    difficulty: game.difficulty,
    playerRegistry: game.players,
    spaceshipRegistry: game.spaceships,
    year: game.year,
});
exports.victoryDependenciesFor = victoryDependenciesFor;
//# sourceMappingURL=VictoryDependencies.js.map