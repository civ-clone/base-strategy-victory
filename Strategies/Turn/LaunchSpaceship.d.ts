import AfterTurn from '@civ-clone/core-strategy-ai-client/PlayerActions/AfterTurn';
import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import SpaceRacePolicy from '../../lib/Space/SpaceRacePolicy';
import VictoryDependencies from '../../lib/VictoryDependencies';
export declare class LaunchSpaceship extends AIStrategy {
  private _policy;
  private _victoryDependencies;
  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    policy: SpaceRacePolicy,
    victoryDependencies: VictoryDependencies
  );
  handles(action: PlayerAction): boolean;
  attempt(action: AfterTurn): boolean;
}
export default LaunchSpaceship;
