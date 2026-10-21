// Generic: the registries playing to win reads, beyond those every strategy has (`base-strategy-ai`'s `Dependencies`).
//  Kept here rather than there, so the generic AI knows nothing of spaceships or Wonders unless a goal needs them.
import {
  AdvanceRegistry,
  instance as advanceRegistryInstance,
} from '@civ-clone/core-science/AdvanceRegistry';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  PlayerRegistry,
  instance as playerRegistryInstance,
} from '@civ-clone/core-player/PlayerRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { Year, instance as yearInstance } from '@civ-clone/core-game-year/Year';
import { Game } from '@civ-clone/core-game';

export interface VictoryDependencies {
  advanceRegistry: AdvanceRegistry;
  // The level the game is played at, which a ruleset's goals may weigh (Civ1's final year comes sooner the harder it is).
  difficulty: GameDifficultyRegistry;
  playerRegistry: PlayerRegistry;
  spaceshipRegistry: SpaceshipRegistry;
  year: Year;
}

// The module-level singletons, with any of them replaced.
export const createVictoryDependencies = (
  dependencies: Partial<VictoryDependencies> = {}
): VictoryDependencies => ({
  advanceRegistry: advanceRegistryInstance,
  difficulty: gameDifficultyRegistryInstance,
  playerRegistry: playerRegistryInstance,
  spaceshipRegistry: spaceshipRegistryInstance,
  year: yearInstance,
  ...dependencies,
});

// The game's registries.
export const victoryDependenciesFor = (game: Game): VictoryDependencies =>
  createVictoryDependencies({
    advanceRegistry: game.advances,
    difficulty: game.difficulty,
    playerRegistry: game.players,
    spaceshipRegistry: game.spaceships,
    year: game.year,
  });

export default VictoryDependencies;
