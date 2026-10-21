import Advance from '@civ-clone/core-science/Advance';
import { IBuildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Part from '@civ-clone/core-spaceship/Part';
import Player from '@civ-clone/core-player/Player';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import VictoryDependencies from '../VictoryDependencies';
import { VictoryGoal } from '../goal';
export interface SpaceRacePolicy {
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
  enablers: IBuildable[];
  enablerCity(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): City | null;
  buildsParts(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    city: City
  ): boolean;
  nextPart(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    spaceship: Spaceship,
    available: (typeof Part)[],
    building: (typeof Part)[]
  ): typeof Part | null;
  shouldLaunch(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    spaceship: Spaceship
  ): boolean;
}
export declare const spaceRaceGoal: (policy: SpaceRacePolicy) => VictoryGoal;
export default SpaceRacePolicy;
