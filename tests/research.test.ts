import {
  directPrerequisites,
  nextAdvanceFor,
  researchPath,
} from '../lib/research';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Requirements from '@civ-clone/core-science/Rules/Requirements';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import { expect } from 'chai';

// A small tree: Roots ← Wheel; Roots ← Bronze; Wheel + Bronze ← Chariot; Chariot ← Flight; Unrelated stands alone.
class Roots extends Advance {}
class Wheel extends Advance {}
class Bronze extends Advance {}
class Chariot extends Advance {}
class Flight extends Advance {}
class Unrelated extends Advance {}

const needs = (
  Target: typeof Advance,
  ...Prerequisites: (typeof Advance)[]
): Requirements =>
  new Requirements(
    new Criterion(
      (AdvanceType: typeof Advance): boolean => AdvanceType === Target
    ),
    new Effect((AdvanceType: typeof Advance, complete: Advance[]): boolean =>
      Prerequisites.every((Prerequisite) =>
        complete.some((advance) => advance instanceof Prerequisite)
      )
    )
  );

const setUp = (known: (typeof Advance)[] = []) => {
  const rules = new RuleRegistry(),
    advances = new AdvanceRegistry(),
    research = new PlayerResearch(new Player(rules), advances, rules);

  advances.register(Roots, Wheel, Bronze, Chariot, Flight, Unrelated);
  rules.register(
    needs(Wheel, Roots),
    needs(Bronze, Roots),
    needs(Chariot, Wheel, Bronze),
    needs(Flight, Chariot)
  );
  known.forEach((AdvanceType) => research.addAdvance(AdvanceType));

  return { advances, research, rules };
};

describe('research', (): void => {
  it('finds the advances an advance needs directly, from the rules alone', (): void => {
    const { advances, rules } = setUp();

    expect(directPrerequisites(Chariot, advances, rules)).to.deep.equal([
      Wheel,
      Bronze,
    ]);
    expect(directPrerequisites(Roots, advances, rules)).to.deep.equal([]);
  });

  it('lays out the way to a goal, prerequisites first, leaving out what is known', (): void => {
    const { advances, research, rules } = setUp([Roots, Bronze]);

    expect(researchPath([Flight], research, advances, rules)).to.deep.equal([
      Wheel,
      Chariot,
      Flight,
    ]);
  });

  it('researches the first advance on the way that can be researched now', (): void => {
    const { advances, research, rules } = setUp([Roots]);

    expect(nextAdvanceFor([Flight], research, advances, rules)).to.equal(Wheel);

    research.addAdvance(Wheel);
    research.addAdvance(Bronze);
    research.addAdvance(Chariot);
    research.addAdvance(Flight);

    expect(nextAdvanceFor([Flight], research, advances, rules)).to.equal(null);
  });
});
