"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextAdvanceFor = exports.researchPath = exports.directPrerequisites = void 0;
const Requirements_1 = require("@civ-clone/core-science/Rules/Requirements");
const directCache = new WeakMap();
// The advances `Goal` needs directly: those without which it can't be researched even knowing everything else. The
//  rules are opaque, so each is asked: is `Goal` still available with everything known but this one?
const directPrerequisites = (Goal, advanceRegistry, ruleRegistry) => {
    if (!directCache.has(ruleRegistry)) {
        directCache.set(ruleRegistry, new Map());
    }
    const cache = directCache.get(ruleRegistry);
    if (!cache.has(Goal)) {
        const others = advanceRegistry
            .entries()
            .filter((AdvanceType) => AdvanceType !== Goal), known = others.map((AdvanceType) => new AdvanceType()), rules = ruleRegistry.get(Requirements_1.default), satisfied = (complete) => rules
            .filter((rule) => rule.validate(Goal, complete))
            .every((rule) => rule.process(Goal, complete) === true);
        cache.set(Goal, satisfied(known)
            ? others.filter((Prerequisite) => !satisfied(known.filter((advance) => !(advance instanceof Prerequisite))))
            : []);
    }
    return cache.get(Goal);
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