import Advance from '@civ-clone/core-science/Advance';
import City from '@civ-clone/core-city/City';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import VictoryDependencies from '../VictoryDependencies';
import { VictoryGoal } from '../goal';
export interface ConquestPolicy {
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
  target(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player
  ): City | null;
  musterCity(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player,
    target: City
  ): City | null;
  marchTurns: number;
  isAttacker(dependencies: Dependencies, unit: Unit): boolean;
  mayLeave(
    dependencies: Dependencies,
    knowledge: Knowledge,
    unit: Unit
  ): boolean;
  mustered(
    dependencies: Dependencies,
    victoryDependencies: VictoryDependencies,
    player: Player,
    target: City,
    muster: City
  ): boolean;
}
export declare const conquestGoal: (policy: ConquestPolicy) => VictoryGoal;
export default ConquestPolicy;
