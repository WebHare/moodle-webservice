"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const MoodleQMultiChoice_1 = __importDefault(require("./MoodleQMultiChoice"));
const debug_1 = __importDefault(require("debug"));
class MoodleQuestion {
    //TODO: Replace with Custom Error class in the future
    static _error(message) {
        return new Error(message);
    }
    static _extractText(parsedHTML) {
        MoodleQuestion._debug(`Extracting question text...`);
        const textElement = parsedHTML.querySelector('.qtext');
        if (!textElement)
            throw MoodleQuestion._error(`Could not find question text.`);
        MoodleQuestion._debug(`Successfully extracted question text.`);
        return textElement.text;
    }
    static _extractInstance(parsedHTML) {
        MoodleQuestion._debug(`Extracting question instance number...`);
        const couldNotFind = (thing) => `Could not find ${thing} in question.`;
        const questionElement = parsedHTML.querySelector('div');
        if (!questionElement)
            throw MoodleQuestion._error(couldNotFind('question element'));
        const htmlId = questionElement.getAttribute('id');
        if (!htmlId)
            throw MoodleQuestion._error(couldNotFind('htmlId'));
        const idRegex = RegExp(`question-([0-9]*)-[0-9]*`);
        const matchObj = idRegex.exec(htmlId);
        if (!matchObj)
            throw MoodleQuestion._error(couldNotFind('instance match'));
        const instance = matchObj[1];
        if (!instance)
            throw MoodleQuestion._error(couldNotFind('instance match'));
        MoodleQuestion._debug(`Successfully extracted question instance number.`);
        return Number(instance);
    }
    static parseQuestions(questions) {
        const parsedQuestions = [];
        for (const question of questions) {
            const parsedQuestion = MoodleQuestion.parse(question);
            parsedQuestions.push(parsedQuestion);
        }
        return parsedQuestions;
    }
    static parse(question) {
        MoodleQuestion._debug(`Parsing question #${question.slot}...`);
        switch (question.type) {
            case types_1.QuestionTypes.MultiChoice: {
                MoodleQuestion._debug(`Multichoice question detected, passing to multichoice helper...`);
                return MoodleQMultiChoice_1.default.parse(question);
            }
            default:
                return MoodleQMultiChoice_1.default.parse(question);
        }
    }
}
exports.default = MoodleQuestion;
MoodleQuestion._debug = (0, debug_1.default)('moodle:helper:question');
