// Generic: at the end of a player's turn, launches its spaceship once its `SpaceRacePolicy` says it should. Launching
//  isn't a choice a player is ever made to take, so no other strategy is offered it.
import AfterTurn from '@civ-clone/core-strategy-ai-client/PlayerActions/AfterTurn';
import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import SpaceRacePolicy from '../../lib/Space/SpaceRacePolicy';
import VictoryDependencies from '../../lib/VictoryDependencies';

export class LaunchSpaceship extends AIStrategy {
  private _policy: SpaceRacePolicy;
  private _victoryDependencies: VictoryDependencies;

  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    policy: SpaceRacePolicy,
    victoryDependencies: VictoryDependencies
  ) {
    super(dependencies, knowledge);

    this._policy = policy;
    this._victoryDependencies = victoryDependencies;
  }

  handles(action: PlayerAction): boolean {
    return action instanceof AfterTurn;
  }

  attempt(action: AfterTurn): boolean {
    const spaceship =
      this._victoryDependencies.spaceshipRegistry.getActiveByPlayer(
        action.player()
      );

    if (
      spaceship === null ||
      spaceship.launched() !== false ||
      spaceship.activeParts().length === 0 ||
      !this._policy.shouldLaunch(
        this.dependencies(),
        this._victoryDependencies,
        spaceship
      )
    ) {
      return true;
    }

    spaceship.launch();

    return true;
  }
}

export default LaunchSpaceship;
