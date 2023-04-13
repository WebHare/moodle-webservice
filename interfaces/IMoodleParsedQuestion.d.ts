import IMoodleQuestion from './IMoodleQuestion';
import IMoodleQuestionChoice from './IMoodleQuestionChoice';
export default interface IMoodleParsedQuestion extends Omit<IMoodleQuestion, 'html'> {
    instance: number;
    text: string;
    choices?: IMoodleQuestionChoice[];
    answer?: number | string;
}
