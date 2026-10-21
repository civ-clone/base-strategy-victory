// Generic: the way to a goal's advances, worked out from the ruleset's `Requirements` rules, whatever they are.
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Requirements from '@civ-clone/core-science/Rules/Requirements';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';

// Per ruleset and set of advances: every advance as a stand-in for "known", and each advance's direct prerequisites.
type Probe = {
  known: Advance[];
  direct: Map<typeof Advance, (typeof Advance)[]>;
};

const probes = new WeakMap<RuleRegistry, WeakMap<AdvanceRegistry, Probe>>();

const probeFor = (
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
): Probe => {
  if (!probes.has(ruleRegistry)) {
    probes.set(ruleRegistry, new WeakMap());
  }

  const byAdvances = probes.get(ruleRegistry)!;

  if (!byAdvances.has(advanceRegistry)) {
    byAdvances.set(advanceRegistry, {
      // Stand-ins rather than `new`: `instanceof` is all a rule asks of a completed advance, and a real one would take
      //  the next id from its class, so a game would number its advances differently once this had run.
      known: advanceRegistry
        .entries()
        .map(
          (AdvanceType: typeof Advance) =>
            Object.create(AdvanceType.prototype) as Advance
        ),
      direct: new Map(),
    });
  }

  return byAdvances.get(advanceRegistry)!;
};

// The advances `Goal` needs directly: those without which it can't be researched even knowing everything else. The
//  rules are opaque, so each is asked: is `Goal` still available with everything known but this one? Requirements are
//  taken as all-of, as Civ1's are.
export const directPrerequisites = (
  Goal: typeof Advance,
  advanceRegistry: AdvanceRegistry,
  ruleRegistry: RuleRegistry
): (typeof Advance)[] => {
  const probe = probeFor(advanceRegistry, ruleRegistry);

  if (!probe.direct.has(Goal)) {
    const known = probe.known.filter(
        (advance: Advance): boolean => !(advance instanceof Goal)
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

    probe.direct.set(
      Goal,
      satisfied(known)
        ? advanceRegistry
            .entries()
            .filter(
              (Prerequisite: typeof Advance): boolean =>
                Prerequisite !== Goal &&
                !satisfied(
                  known.filter(
                    (advance: Advance): boolean =>
                      !(advance instanceof Prerequisite)
                  )
                )
            )
        : []
    );
  }

  return probe.direct.get(Goal)!;
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
