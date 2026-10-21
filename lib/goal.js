"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalFor = void 0;
// The goal `player` plays for: the one with the most weight above 0, the first listed on a tie, or none.
const goalFor = (goals, dependencies, victoryDependencies, player) => goals.reduce(([best, bestWeight], goal) => {
    const weight = goal.weight(dependencies, victoryDependencies, player);
    return weight > bestWeight ? [goal, weight] : [best, bestWeight];
}, [null, 0])[0];
exports.goalFor = goalFor;
exports.default = exports.goalFor;
//# sourceMappingURL=goal.js.map