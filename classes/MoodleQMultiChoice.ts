import { IMoodleQuestion } from '../interfaces';
import { parse, HTMLElement } from 'node-html-parser';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
import IMoodleQuestionChoice from '../interfaces/IMoodleQuestionChoice';
import MoodleQuestion from './MoodleQuestion';
import { QuestionTypes } from '../types';
import debug from 'debug';

export default class MoodleQMultiChoice {
  private static _debug = debug('moodle:helper:question:multichoice');

  //TODO: Replace with Custom Error class in the future
  private static _error(message: string) {
    return new Error(message);
  }

  private static _couldNotFind(thing: string) {
    return MoodleQMultiChoice._error(`Could not find ${thing} in HTML data.`);
  }

  private static _removeChoiceNumber(label: string) {
    return label.slice(3);
  }

  private static _extractChoiceLabel(choiceElement: HTMLElement) {
    MoodleQMultiChoice._debug(`Extracting label from choice HTML element...`);
    const labelElement = choiceElement.querySelector(
      'div[data-region="answer-label"]'
    );
    if (!labelElement) throw MoodleQMultiChoice._couldNotFind(`label element`);
    const label = MoodleQMultiChoice._removeChoiceNumber(labelElement.text);
    MoodleQMultiChoice._debug(
      `Successfully extracted label: ${label} from choice HTML element.`
    );
    return label;
  }

  private static _extractChoiceInputElement(choiceElement: HTMLElement) {
    MoodleQMultiChoice._debug(
      `Extracting input element from choice HTML element...`
    );
    const inputElement = choiceElement.querySelector('input[type="radio"]');
    if (!inputElement) throw MoodleQMultiChoice._couldNotFind('input element');
    MoodleQMultiChoice._debug(
      `Successfully extracted input element from choice HTML element.`
    );
    return inputElement;
  }

  private static _extractChoice(choiceElement: HTMLElement) {
    const inputElement =
      MoodleQMultiChoice._extractChoiceInputElement(choiceElement);

    const label: string = MoodleQMultiChoice._extractChoiceLabel(choiceElement);

    const isChosen: boolean =
      inputElement.getAttribute('checked') === 'checked';

    const value: number = Number(inputElement.getAttribute('value'));

    //TODO: Find what images look like and extract them as well.
    const choice: IMoodleQuestionChoice = { label, value };

    return { choice, isChosen };
  }

  private static _extractChoices(parsedHTML: HTMLElement): {
    chosenValue: number | undefined;
    choices: IMoodleQuestionChoice[];
  } {
    let chosenValue: number | undefined;
    const choices: IMoodleQuestionChoice[] = [];
    const choiceElements = parsedHTML.querySelectorAll('.answer > div');

    if (choiceElements.length === 0)
      throw MoodleQMultiChoice._couldNotFind('choice elements');

    for (let i = 0; i < choiceElements.length; i++) {
      const choiceElement = choiceElements[i];
      MoodleQMultiChoice._debug(`Extracting choice number: ${i}...`);
      const { choice, isChosen } =
        MoodleQMultiChoice._extractChoice(choiceElement);
      choices.push(choice);
      MoodleQMultiChoice._debug(`Successfully extracted choice number: ${i}.`);

      if (isChosen) {
        MoodleQMultiChoice._debug(`Found selected answer: #${choice.value}.`);
        chosenValue = choice.value;
      }
    }

    return { choices, chosenValue };
  }

  private static _checkCompatibility(question: IMoodleQuestion) {
    if (question.type !== QuestionTypes.MultiChoice)
      throw MoodleQMultiChoice._error(
        'Trying to parse a question that is not multichoice!'
      );
  }

  private static _removeHTML(question: IMoodleQuestion) {
    const noHTMLQuestion: Partial<IMoodleQuestion> = { ...question };
    delete noHTMLQuestion.html;
    return noHTMLQuestion as Required<IMoodleQuestion>;
  }

  public static parse(question: IMoodleQuestion): IMoodleParsedQuestion {
    MoodleQMultiChoice._debug(
      `Parsing multichoice question #${question.slot}...`
    );

    MoodleQMultiChoice._checkCompatibility(question);

    const parsedHTML = parse(question.html);

    // Accessing 'private' members.
    // Since there is really no such thing as 'private' members in javascript
    const instance: number = MoodleQuestion['_extractInstance'](parsedHTML);
    const text: string = MoodleQuestion['_extractText'](parsedHTML);

    const { choices, chosenValue } =
      MoodleQMultiChoice._extractChoices(parsedHTML);

    MoodleQMultiChoice._debug(
      `Successfully parsed multichoice question #${question.slot}...`
    );

    return {
      ...MoodleQMultiChoice._removeHTML(question),
      instance,
      text,
      choices,
      answer: chosenValue,
    };
  }
}
