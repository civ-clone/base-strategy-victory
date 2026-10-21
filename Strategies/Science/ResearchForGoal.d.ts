import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import VictoryDependencies from '../../lib/VictoryDependencies';
import { VictoryGoal } from '../../lib/goal';
export declare class ResearchForGoal extends AIStrategy {
  private _goals;
  private _victoryDependencies;
  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    goals: VictoryGoal[],
    victoryDependencies: VictoryDependencies
  );
  handles(action: PlayerAction): boolean;
  attempt(action: PlayerAction<PlayerResearch>): boolean;
}
export default ResearchForGoal;
