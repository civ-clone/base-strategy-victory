// Generic: conquest, as a goal (`lib/goal`), with the ruleset's judgements left to a `ConquestPolicy`.
//  `simple-ai-client`'s `Civ1/conquest` has Civ1's.
import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import VictoryDependencies from '../VictoryDependencies';
import { VictoryGoal } from '../goal';

export interface ConquestPolicy {
  // How much `player` wants to conquer now: 0 not at all.
  weight(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): number;
  // The advances a campaign needs: researched towards while conquest is the goal.
  advances(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): (typeof Advance)[];
  // The city `player` campaigns against next, if any.
  target(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): City | null;
  // The city of `player`'s its attackers gather in before going for `target`, if any: none where it can't be reached
  //  by land.
  musterCity(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player,
    target: City
  ): City | null;
  // The most turns an attacker marches to join the campaign: one further from the muster city keeps to its other work.
  marchTurns: number;
  // Whether `unit` is one of the attackers a campaign takes.
  isAttacker(dependencies: Dependencies, unit: Unit): boolean;
  // Whether `unit`, an attacker fortified where it is, can be called away to the campaign: one a city of the player's
  //  needs, to defend it or keep order in it, can't.
  mayLeave(
    dependencies: Dependencies,
    knowledge: Knowledge,
    unit: Unit
  ): boolean;
  // Whether the attackers gathered at `muster` and near `target` are enough to go.
  mustered(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player,
    target: City,
    muster: City
  ): boolean;
}

// The goal of conquering the world, played as `policy` says.
export const conquestGoal = (policy: ConquestPolicy): VictoryGoal => ({
  name: 'conquest',
  weight: (dependencies, victoryDependencies, player) =>
    policy.weight(dependencies, victoryDependencies, player),
  advances: (dependencies, victoryDependencies, player) =>
    policy.advances(dependencies, victoryDependencies, player),
});

export default ConquestPolicy;
