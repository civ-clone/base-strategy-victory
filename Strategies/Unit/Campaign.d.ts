import AIStrategy from '@civ-clone/base-strategy-ai/Strategies/lib/AIStrategy';
import ConquestPolicy from '../../lib/Conquest/ConquestPolicy';
import Dependencies from '@civ-clone/base-strategy-ai/lib/Dependencies';
import Knowledge from '@civ-clone/base-strategy-ai/lib/Knowledge';
import Memory from '@civ-clone/base-strategy-ai/lib/Memory';
import Player from '@civ-clone/core-player/Player';
import PlayerAction from '@civ-clone/core-player/PlayerAction';
import Unit from '@civ-clone/core-unit/Unit';
import VictoryDependencies from '../../lib/VictoryDependencies';
import { VictoryGoal } from '../../lib/goal';
export type CampaignTravel = (
  dependencies: Dependencies,
  player: Player,
  memory: Memory,
  knowledge: Knowledge,
  unit: Unit
) => Promise<void>;
export declare class Campaign extends AIStrategy {
  private _goal;
  private _goals;
  private _policy;
  private _travel;
  private _victoryDependencies;
  private _paths;
  private _sent;
  constructor(
    dependencies: Dependencies,
    knowledge: Knowledge,
    goal: VictoryGoal,
    goals: VictoryGoal[],
    policy: ConquestPolicy,
    victoryDependencies: VictoryDependencies,
    travel: CampaignTravel
  );
  handles(action: PlayerAction): boolean;
  attempt(action: PlayerAction): Promise<boolean>;
  private campaign;
  private dropStalePaths;
  private wake;
  private marchPath;
  private withinMarch;
  private threatened;
  private command;
}
export default Campaign;
