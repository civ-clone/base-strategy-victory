"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchForGoal = void 0;
// Generic: while a player plays for a goal (`lib/goal`), researches the way to the advances it needs
//  (`lib/research`). With no goal, or nothing on the way to research yet, it leaves the choice to the strategies after
//  it.
const AIStrategy_1 = require("@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy");
const PlayerResearch_1 = require("@civ-clone/core-science/PlayerResearch");
const goal_1 = require("../../lib/goal");
const research_1 = require("../../lib/research");
class ResearchForGoal extends AIStrategy_1.default {
    constructor(dependencies, knowledge, goals, victoryDependencies) {
        super(dependencies, knowledge);
        this._goals = goals;
        this._victoryDependencies = victoryDependencies;
    }
    handles(action) {
        return action.value() instanceof PlayerResearch_1.default;
    }
    attempt(action) {
        const playerResearch = action.value(), player = playerResearch.player(), goal = (0, goal_1.goalFor)(this._goals, this.dependencies(), this._victoryDependencies, player);
        if (goal === null) {
            return false;
        }
        const next = (0, research_1.nextAdvanceFor)(goal.advances(this.dependencies(), this._victoryDependencies, player), playerResearch, this._victoryDependencies.advanceRegistry, this.dependencies().ruleRegistry);
        if (next === null) {
            return false;
        }
        playerResearch.research(next);
        return true;
    }
}
exports.ResearchForGoal = ResearchForGoal;
exports.default = ResearchForGoal;
//# sourceMappingURL=ResearchForGoal.js.map