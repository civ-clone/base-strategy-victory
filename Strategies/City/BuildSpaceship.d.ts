import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import SpaceRacePolicy from '../../lib/Space/SpaceRacePolicy';
import VictoryDependencies from '../../lib/VictoryDependencies';
import { VictoryGoal } from '../../lib/goal';
export declare class BuildSpaceship extends AIStrategy {
  private _goal;
  private _goals;
  private _policy;
  private _victoryDependencies;
  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    goal: VictoryGoal,
    goals: VictoryGoal[],
    policy: SpaceRacePolicy,
    victoryDependencies: VictoryDependencies
  );
  handles(action: PlayerAction): boolean;
  attempt(action: PlayerAction<CityBuild>): boolean;
}
export default BuildSpaceship;
