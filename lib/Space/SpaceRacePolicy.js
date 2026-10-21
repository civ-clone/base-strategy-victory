"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spaceRaceGoal = void 0;
// The goal of reaching space first, played as `policy` says.
const spaceRaceGoal = (policy) => ({
    name: 'space',
    weight: (dependencies, victoryDependencies, player) => policy.weight(dependencies, victoryDependencies, player),
    advances: (dependencies, victoryDependencies, player) => policy.advances(dependencies, victoryDependencies, player),
});
exports.spaceRaceGoal = spaceRaceGoal;
//# sourceMappingURL=SpaceRacePolicy.js.map