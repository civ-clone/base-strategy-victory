import { AdvanceRegistry } from '@civ-clone/core-science/AdvanceRegistry';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { SpaceshipRegistry } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { Year } from '@civ-clone/core-game-year/Year';
import { Game } from '@civ-clone/core-game';
export interface VictoryDependencies {
  advanceRegistry: AdvanceRegistry;
  difficulty: GameDifficultyRegistry;
  playerRegistry: PlayerRegistry;
  spaceshipRegistry: SpaceshipRegistry;
  year: Year;
}
export declare const createVictoryDependencies: (
  dependencies?: Partial<VictoryDependencies>
) => VictoryDependencies;
export declare const victoryDependenciesFor: (
  game: Game
) => VictoryDependencies;
export default VictoryDependencies;
