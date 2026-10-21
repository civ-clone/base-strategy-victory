// Generic: the way to a goal's advances, worked out from the ruleset's `Requirements` rules, whatever they are.
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Requirements from '@civ-clone/core-science/Rules/Requirements';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';

const directCache = new WeakMap<
  RuleRegistry,
  Map<typeof Advance, (typeof Advance)[]>
>();

// The advances `Goal` needs directly: those without which it can't be researched even knowing everything else. The
//  rules are opaque, so each is asked: is `Goal` still available with everything known but this one?
export const directPrerequisites = (
  Goal: typeof Advance,
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
): (typeof Advance)[] => {
  if (!directCache.has(ruleRegistry)) {
    directCache.set(ruleRegistry, new Map());
  }

  const cache = directCache.get(ruleRegistry)!;

  if (!cache.has(Goal)) {
    const others = advanceRegistry
        .entries()
        .filter((AdvanceType: typeof Advance) => AdvanceType !== Goal),
      known = others.map(
        (AdvanceType: typeof Advance) =>
          new (AdvanceType as unknown as new () => Advance)()
      ),
      rules = ruleRegistry.get(Requirements),
      satisfied = (complete: Advance[]): boolean =>
        rules
          .filter((rule: Requirements): boolean =>
            rule.validate(Goal, complete)
          )
          .every(
            (rule: Requirements): boolean =>
              rule.process(Goal, complete) === true
          );

    cache.set(
      Goal,
      satisfied(known)
        ? others.filter(
            (Prerequisite: typeof Advance): boolean =>
              !satisfied(
                known.filter((advance) => !(advance instanceof Prerequisite))
              )
          )
        : []
    );
  }

  return cache.get(Goal)!;
};

// Every advance the player still needs for `goals`, the goals included, prerequisites first.
export const researchPath = (
  goals: (typeof Advance)[],
  playerResearch: PlayerResearch,
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
): (typeof Advance)[] => {
  const path: (typeof Advance)[] = [],
    visit = (AdvanceType: typeof Advance): void => {
      if (path.includes(AdvanceType) || playerResearch.completed(AdvanceType)) {
        return;
      }

      directPrerequisites(AdvanceType, advanceRegistry, ruleRegistry).forEach(
        visit
      );

      path.push(AdvanceType);
    };

  goals.forEach(visit);

  return path;
};

// What to research next for `goals`: the first advance on the way that the player can research now, or `null` once
//  there's none (they're known, or none can be researched yet).
export const nextAdvanceFor = (
  goals: (typeof Advance)[],
  playerResearch: PlayerResearch,
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
): typeof Advance | null => {
  const available = playerResearch.available();

  return (
    researchPath(goals, playerResearch, advanceRegistry, ruleRegistry).find(
      (AdvanceType: typeof Advance): boolean => available.includes(AdvanceType)
    ) ?? null
  );
};
