// Generic: while a player plays for a goal (`lib/goal`), researches the way to the advances it needs
//  (`lib/research`). With no goal, or nothing on the way to research yet, it leaves the choice to the strategies after
//  it.
import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import VictoryDependencies from '../../lib/VictoryDependencies';
import { VictoryGoal, goalFor } from '../../lib/goal';
import { nextAdvanceFor } from '../../lib/research';

export class ResearchForGoal extends AIStrategy {
  private _goals: VictoryGoal[];
  private _victoryDependencies: VictoryDependencies;

  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    goals: VictoryGoal[],
    victoryDependencies: VictoryDependencies
  ) {
    super(dependencies, knowledge);

    this._goals = goals;
    this._victoryDependencies = victoryDependencies;
  }

  handles(action: PlayerAction): boolean {
    return action.value() instanceof PlayerResearch;
  }

  attempt(action: PlayerAction<PlayerResearch>): boolean {
    const playerResearch = action.value(),
      player = playerResearch.player(),
      goal = goalFor(
        this._goals,
        this.dependencies(),
        this._victoryDependencies,
        player
      );

    if (goal === null) {
      return false;
    }

    const next = nextAdvanceFor(
      goal.advances(this.dependencies(), this._victoryDependencies, player),
      playerResearch,
      this._victoryDependencies.advanceRegistry,
      this.dependencies().ruleRegistry
    );

    if (next === null) {
      return false;
    }

    playerResearch.research(next);

    return true;
  }
}

export default ResearchForGoal;
