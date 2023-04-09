import { IMoodleQuestion } from '../interfaces';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
export default abstract class MoodleQuestion {
    private static _debug;
    private static _error;
    private static _extractText;
    private static _extractInstance;
    static parseQuestions(questions: IMoodleQuestion[]): IMoodleParsedQuestion[];
    static parse(question: IMoodleQuestion): IMoodleParsedQuestion;
}
