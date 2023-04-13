"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MoodleQuestion_1 = __importDefault(require("./MoodleQuestion"));
const debug_1 = __importDefault(require("debug"));
class MoodleAttempt {
    static parse(attempt) {
        MoodleAttempt._debug(`Parsing attempt: ${attempt.attempt.id}...`);
        const parsedQuestions = MoodleQuestion_1.default.parseQuestions(attempt.questions);
        MoodleAttempt._debug(`Successfully parsed attempt: ${attempt.attempt.id}.`);
        return Object.assign(Object.assign({}, attempt), { questions: parsedQuestions });
    }
}
exports.default = MoodleAttempt;
MoodleAttempt._debug = (0, debug_1.default)('moodle:helper:attempt');
