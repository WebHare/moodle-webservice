"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const MoodleQuestion_1 = __importDefault(require("./MoodleQuestion"));
const types_1 = require("../types");
const debug_1 = __importDefault(require("debug"));
class MoodleQMultiChoice {
    //TODO: Replace with Custom Error class in the future
    static _error(message) {
        return new Error(message);
    }
    static _couldNotFind(thing) {
        return MoodleQMultiChoice._error(`Could not find ${thing} in HTML data.`);
    }
    static _removeChoiceNumber(label) {
        return label.slice(3);
    }
    static _extractChoiceLabel(choiceElement) {
        MoodleQMultiChoice._debug(`Extracting label from choice HTML element...`);
        const labelElement = choiceElement.querySelector('div[data-region="answer-label"]');
        if (!labelElement)
            throw MoodleQMultiChoice._couldNotFind(`label element`);
        const label = MoodleQMultiChoice._removeChoiceNumber(labelElement.text);
        MoodleQMultiChoice._debug(`Successfully extracted label: ${label} from choice HTML element.`);
        return label;
    }
    static _extractChoiceInputElement(choiceElement) {
        MoodleQMultiChoice._debug(`Extracting input element from choice HTML element...`);
        const inputElement = choiceElement.querySelector('input[type="radio"]');
        if (!inputElement)
            throw MoodleQMultiChoice._couldNotFind('input element');
        MoodleQMultiChoice._debug(`Successfully extracted input element from choice HTML element.`);
        return inputElement;
    }
    static _extractChoice(choiceElement) {
        const inputElement = MoodleQMultiChoice._extractChoiceInputElement(choiceElement);
        const label = MoodleQMultiChoice._extractChoiceLabel(choiceElement);
        const isChosen = inputElement.getAttribute('checked') === 'checked';
        const value = Number(inputElement.getAttribute('value'));
        //TODO: Find what images look like and extract them as well.
        const choice = { label, value };
        return { choice, isChosen };
    }
    static _extractChoices(parsedHTML) {
        let chosenValue;
        const choices = [];
        const choiceElements = parsedHTML.querySelectorAll('.answer > div');
        if (choiceElements.length === 0)
            throw MoodleQMultiChoice._couldNotFind('choice elements');
        for (let i = 0; i < choiceElements.length; i++) {
            const choiceElement = choiceElements[i];
            MoodleQMultiChoice._debug(`Extracting choice number: ${i}...`);
            const { choice, isChosen } = MoodleQMultiChoice._extractChoice(choiceElement);
            choices.push(choice);
            MoodleQMultiChoice._debug(`Successfully extracted choice number: ${i}.`);
            if (isChosen) {
                MoodleQMultiChoice._debug(`Found selected answer: #${choice.value}.`);
                chosenValue = choice.value;
            }
        }
        return { choices, chosenValue };
    }
    static _checkCompatibility(question) {
        if (question.type !== types_1.QuestionTypes.MultiChoice)
            throw MoodleQMultiChoice._error('Trying to parse a question that is not multichoice!');
    }
    static _removeHTML(question) {
        const noHTMLQuestion = Object.assign({}, question);
        delete noHTMLQuestion.html;
        return noHTMLQuestion;
    }
    static parse(question) {
        MoodleQMultiChoice._debug(`Parsing multichoice question #${question.slot}...`);
        MoodleQMultiChoice._checkCompatibility(question);
        const parsedHTML = (0, node_html_parser_1.parse)(question.html);
        // Accessing 'private' members.
        // Since there is really no such thing as 'private' members in javascript
        const instance = MoodleQuestion_1.default['_extractInstance'](parsedHTML);
        const text = MoodleQuestion_1.default['_extractText'](parsedHTML);
        const { choices, chosenValue } = MoodleQMultiChoice._extractChoices(parsedHTML);
        MoodleQMultiChoice._debug(`Successfully parsed multichoice question #${question.slot}...`);
        return Object.assign(Object.assign({}, MoodleQMultiChoice._removeHTML(question)), { instance,
            text,
            choices, answer: chosenValue });
    }
}
exports.default = MoodleQMultiChoice;
MoodleQMultiChoice._debug = (0, debug_1.default)('moodle:helper:question:multichoice');
