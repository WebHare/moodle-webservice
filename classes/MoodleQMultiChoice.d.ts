import { IMoodleQuestion } from '../interfaces';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
export default class MoodleQMultiChoice {
    private static _debug;
    private static _error;
    private static _couldNotFind;
    private static _removeChoiceNumber;
    private static _extractChoiceLabel;
    private static _extractChoiceInputElement;
    private static _extractChoice;
    private static _extractChoices;
    private static _checkCompatibility;
    private static _removeHTML;
    static parse(question: IMoodleQuestion): IMoodleParsedQuestion;
}
