import { IMoodleQuestion } from '../interfaces';
import { QuestionTypes } from '../types';
import { HTMLElement } from 'node-html-parser';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
import MoodleQMultiChoice from './MoodleQMultiChoice';
import debug from 'debug';

export default abstract class MoodleQuestion {
  private static _debug = debug('moodle:helper:question');

  //TODO: Replace with Custom Error class in the future
  private static _error(message: string) {
    return new Error(message);
  }

  private static _extractText(parsedHTML: HTMLElement) {
    MoodleQuestion._debug(`Extracting question text...`);
    const textElement = parsedHTML.querySelector('.qtext');
    if (!textElement)
      throw MoodleQuestion._error(`Could not find question text.`);
    MoodleQuestion._debug(`Successfully extracted question text.`);
    return textElement.text;
  }

  private static _extractInstance(parsedHTML: HTMLElement): number {
    MoodleQuestion._debug(`Extracting question instance number...`);
    const couldNotFind = (thing: string) =>
      `Could not find ${thing} in question.`;

    const questionElement = parsedHTML.querySelector('div');
    if (!questionElement)
      throw MoodleQuestion._error(couldNotFind('question element'));

    const htmlId = questionElement.getAttribute('id');
    if (!htmlId) throw MoodleQuestion._error(couldNotFind('htmlId'));

    const idRegex = RegExp(`question-([0-9]*)-[0-9]*`);
    const matchObj = idRegex.exec(htmlId);
    if (!matchObj) throw MoodleQuestion._error(couldNotFind('instance match'));

    const instance: string = matchObj[1];
    if (!instance) throw MoodleQuestion._error(couldNotFind('instance match'));

    MoodleQuestion._debug(`Successfully extracted question instance number.`);
    return Number(instance);
  }

  public static parseQuestions(questions: IMoodleQuestion[]) {
    const parsedQuestions: IMoodleParsedQuestion[] = [];
    for (const question of questions) {
      const parsedQuestion = MoodleQuestion.parse(question);
      parsedQuestions.push(parsedQuestion);
    }
    return parsedQuestions;
  }

  public static parse(question: IMoodleQuestion): IMoodleParsedQuestion {
    MoodleQuestion._debug(`Parsing question #${question.slot}...`);
    switch (question.type) {
      case QuestionTypes.MultiChoice: {
        MoodleQuestion._debug(
          `Multichoice question detected, passing to multichoice helper...`
        );
        return MoodleQMultiChoice.parse(question);
      }
      default:
        return MoodleQMultiChoice.parse(question);
    }
  }
}
