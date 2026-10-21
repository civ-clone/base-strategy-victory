import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
export declare const directPrerequisites: (
  Goal: typeof Advance,
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
) => (typeof Advance)[];
export declare const researchPath: (
  goals: (typeof Advance)[],
  playerResearch: PlayerResearch,
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
) => (typeof Advance)[];
export declare const nextAdvanceFor: (
  goals: (typeof Advance)[],
  playerResearch: PlayerResearch,
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
) => typeof Advance | null;
