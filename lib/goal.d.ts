import Advance from '@civ-clone/core-science/Advance';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Player from '@civ-clone/core-player/Player';
import VictoryDependencies from './VictoryDependencies';
export interface VictoryGoal {
  readonly name: string;
  weight(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): number;
  advances(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): (typeof Advance)[];
}
export declare const goalFor: (
  goals: VictoryGoal[],
  dependencies: Dependencies,
  victoryDependencies: VictoryDependencies,
  player: Player
) => VictoryGoal | null;
export default goalFor;
