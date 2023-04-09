import {
  IMoodleAttemptData,
  IMoodleAttemptReview,
  IMoodleQuestion,
} from '../interfaces';
import IMoodleParsedAttemptData from '../interfaces/IMoodleParsedAttemptData';
import IMoodleParsedAttemptReview from '../interfaces/IMoodleParsedAttemptReview';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
import MoodleQuestion from './MoodleQuestion';
import debug from 'debug';

export default abstract class MoodleAttempt {
  private static _debug = debug('moodle:helper:attempt');

  public static parse(
    attemptData: IMoodleAttemptData
  ): IMoodleParsedAttemptData;

  public static parse(
    attemptReview: IMoodleAttemptReview
  ): IMoodleParsedAttemptReview;

  public static parse(
    attempt: IMoodleAttemptData | IMoodleAttemptReview
  ): IMoodleParsedAttemptData | IMoodleParsedAttemptReview {
    MoodleAttempt._debug(`Parsing attempt: ${attempt.attempt.id}...`);

    const parsedQuestions = MoodleQuestion.parseQuestions(attempt.questions);

    MoodleAttempt._debug(`Successfully parsed attempt: ${attempt.attempt.id}.`);
    return { ...attempt, questions: parsedQuestions };
  }
}
