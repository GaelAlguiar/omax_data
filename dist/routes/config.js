"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronJob = exports.sp = void 0;
const procedures_1 = __importDefault(require("./backend/procedures"));
exports.sp = procedures_1.default;
const cronjob_1 = __importDefault(require("./backend/cronjob"));
exports.cronJob = cronjob_1.default;
