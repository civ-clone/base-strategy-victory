// Generic: the space race, as a goal (`lib/goal`), with the ruleset's judgements left to a `SpaceRacePolicy`.
//  `simple-ai-client`'s `Civ1/spaceRace` has Civ1's.
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
  // How much `player` wants to race for space now: 0 not at all.
  weight(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): number;
  // The advances a ship needs: researched towards while space is the goal.
  advances(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): (typeof Advance)[];
  // What gives a player a ship to build (Civ1's Apollo Program), and the one city of `player`'s to build it in.
  enablers: IBuildable[];
  enablerCity(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): City | null;
  // Whether `city` builds parts for its player's ship.
  buildsParts(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    city: City
  ): boolean;
  // The part `spaceship` wants next, of those `available` to build, given the ones already being built: `null` when it
  //  wants none of them.
  nextPart(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    spaceship: Spaceship,
    available: (typeof Part)[],
    building: (typeof Part)[]
  ): typeof Part | null;
  // Whether to launch `spaceship` now.
  shouldLaunch(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    spaceship: Spaceship
  ): boolean;
}

// The goal of reaching space first, played as `policy` says.
export const spaceRaceGoal = (policy: SpaceRacePolicy): VictoryGoal => ({
  name: 'space',
  weight: (dependencies, victoryDependencies, player) =>
    policy.weight(dependencies, victoryDependencies, player),
  advances: (dependencies, victoryDependencies, player) =>
    policy.advances(dependencies, victoryDependencies, player),
});

export default SpaceRacePolicy;
