// Generic: a way to win that a computer player can play for (a space race, a conquest), and choosing between them.
import Advance from '@civ-clone/core-science/Advance';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Player from '@civ-clone/core-player/Player';
import VictoryDependencies from './VictoryDependencies';

export interface VictoryGoal {
  // A stable name, such as `space`, for a goal's strategies and the arena to tell goals apart by.
  readonly name: string;
  // How much `player` wants to play for this now. The player plays for the goal with the most weight, if any has more
  //  than 0; a ruleset puts the numbers in.
  weight(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): number;
  // The advances the goal needs, which the player researches towards while it's the goal (`lib/research`).
  advances(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): (typeof Advance)[];
}

// The goal `player` plays for: the one with the most weight above 0, the first listed on a tie, or none.
export const goalFor = (
  goals: VictoryGoal[],
  dependencies: Dependencies,
  victoryDependencies: VictoryDependencies,
  player: Player
): VictoryGoal | null =>
  goals.reduce(
    (
      [best, bestWeight]: [VictoryGoal | null, number],
      goal: VictoryGoal
    ): [VictoryGoal | null, number] => {
      const weight = goal.weight(dependencies, victoryDependencies, player);

      return weight > bestWeight ? [goal, weight] : [best, bestWeight];
    },
    [null, 0]
  )[0];

export default goalFor;
