"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchForGoal = exports.LaunchSpaceship = exports.BuildSpaceship = void 0;
__exportStar(require("./lib/VictoryDependencies"), exports);
__exportStar(require("./lib/goal"), exports);
__exportStar(require("./lib/research"), exports);
__exportStar(require("./lib/Space/SpaceRacePolicy"), exports);
var BuildSpaceship_1 = require("./Strategies/City/BuildSpaceship");
Object.defineProperty(exports, "BuildSpaceship", { enumerable: true, get: function () { return BuildSpaceship_1.default; } });
var LaunchSpaceship_1 = require("./Strategies/Turn/LaunchSpaceship");
Object.defineProperty(exports, "LaunchSpaceship", { enumerable: true, get: function () { return LaunchSpaceship_1.default; } });
var ResearchForGoal_1 = require("./Strategies/Science/ResearchForGoal");
Object.defineProperty(exports, "ResearchForGoal", { enumerable: true, get: function () { return ResearchForGoal_1.default; } });
//# sourceMappingURL=index.js.map