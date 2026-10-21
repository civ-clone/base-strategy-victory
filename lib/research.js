"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextAdvanceFor = exports.researchPath = exports.directPrerequisites = void 0;
const Requirements_1 = require("@civ-clone/core-science/Rules/Requirements");
const probes = new WeakMap();
const probeFor = (advanceRegistry, ruleRegistry) => {
    if (!probes.has(ruleRegistry)) {
        probes.set(ruleRegistry, new WeakMap());
    }
    const byAdvances = probes.get(ruleRegistry);
    if (!byAdvances.has(advanceRegistry)) {
        byAdvances.set(advanceRegistry, {
            // Stand-ins rather than `new`: `instanceof` is all a rule asks of a completed advance, and a real one would take
            //  the next id from its class, so a game would number its advances differently once this had run.
            known: advanceRegistry
                .entries()
                .map((AdvanceType) => Object.create(AdvanceType.prototype)),
            direct: new Map(),
        });
    }
    return byAdvances.get(advanceRegistry);
};
// The advances `Goal` needs directly: those without which it can't be researched even knowing everything else. The
//  rules are opaque, so each is asked: is `Goal` still available with everything known but this one? Requirements are
//  taken as all-of, as Civ1's are.
const directPrerequisites = (Goal, advanceRegistry, ruleRegistry) => {
    const probe = probeFor(advanceRegistry, ruleRegistry);
    if (!probe.direct.has(Goal)) {
        const known = probe.known.filter((advance) => !(advance instanceof Goal)), rules = ruleRegistry.get(Requirements_1.default), satisfied = (complete) => rules
            .filter((rule) => rule.validate(Goal, complete))
            .every((rule) => rule.process(Goal, complete) === true);
        probe.direct.set(Goal, satisfied(known)
            ? advanceRegistry
                .entries()
                .filter((Prerequisite) => Prerequisite !== Goal &&
                !satisfied(known.filter((advance) => !(advance instanceof Prerequisite))))
            : []);
    }
    return probe.direct.get(Goal);
};
exports.directPrerequisites = directPrerequisites;
// Every advance the player still needs for `goals`, the goals included, prerequisites first.
const researchPath = (goals, playerResearch, advanceRegistry, ruleRegistry) => {
    const path = [], visit = (AdvanceType) => {
        if (path.includes(AdvanceType) || playerResearch.completed(AdvanceType)) {
            return;
        }
        (0, exports.directPrerequisites)(AdvanceType, advanceRegistry, ruleRegistry).forEach(visit);
        path.push(AdvanceType);
    };
    goals.forEach(visit);
    return path;
};
exports.researchPath = researchPath;
// What to research next for `goals`: the first advance on the way that the player can research now, or `null` once
//  there's none (they're known, or none can be researched yet).
const nextAdvanceFor = (goals, playerResearch, advanceRegistry, ruleRegistry) => {
    var _a;
    const available = playerResearch.available();
    return ((_a = (0, exports.researchPath)(goals, playerResearch, advanceRegistry, ruleRegistry).find((AdvanceType) => available.includes(AdvanceType))) !== null && _a !== void 0 ? _a : null);
};
exports.nextAdvanceFor = nextAdvanceFor;
//# sourceMappingURL=research.js.map