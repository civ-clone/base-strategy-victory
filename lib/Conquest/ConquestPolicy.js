"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conquestGoal = void 0;
// The goal of conquering the world, played as `policy` says.
const conquestGoal = (policy) => ({
    name: 'conquest',
    weight: (dependencies, victoryDependencies, player) => policy.weight(dependencies, victoryDependencies, player),
    advances: (dependencies, victoryDependencies, player) => policy.advances(dependencies, victoryDependencies, player),
});
exports.conquestGoal = conquestGoal;
//# sourceMappingURL=ConquestPolicy.js.map