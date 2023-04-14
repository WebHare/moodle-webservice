import {
  IMoodleAttemptData,
  IMoodleAttemptReview,
  IMoodleQuestion,
  IMoodleQuestionChoice,
  IMoodleQuestionUpdate,
} from "../interfaces";
import IMoodleParsedAttemptData from "../interfaces/IMoodleParsedAttemptData";
import IMoodleParsedAttemptReview from "../interfaces/IMoodleParsedAttemptReview";
import IMoodleParsedQuestion from "../interfaces/IMoodleParsedQuestion";
import MoodleAttemptUpdate from "./MoodleAttemptUpdate";
import MoodleQuestion from "./MoodleQuestion";
import debug from "debug";

export default abstract class MoodleAttempt {
  private static _debug = debug("moodle:helper:attempt");

  //TODO: Replace with Custom Error class in the future
  private static _error(message: string) {
    return new Error(message);
  }

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

  /**Returns attempt data as new update object that can be passed to `saveAttempt` or `processAttempt` */
  public static toUpdate(
    attempt: IMoodleParsedAttemptData | IMoodleParsedAttemptReview
  ): MoodleAttemptUpdate {
    MoodleAttempt._debug(
      `Converting attempt with id: <${attempt.attempt.id}> to update object...`
    );

    const questionUpdates: IMoodleQuestionUpdate[] = [];
    const questions = attempt.questions;
    for (const question of questions) {
      questionUpdates.push(MoodleQuestion.toUpdate(question));
    }

    const update = new MoodleAttemptUpdate(questionUpdates);
    MoodleAttempt._debug(
      `Successfully converted attempt with id: <${attempt.attempt.id}> to update object.`
    );
    return update;
  }

  /**Cheats answers from one moodle attempt review and returns new moodle attempt data with solved questions*/
  public static cheatFrom(
    destination: IMoodleParsedAttemptData,
    source: IMoodleParsedAttemptReview
  ): IMoodleParsedAttemptData {
    if (destination.attempt.quiz !== source.attempt.quiz)
      throw MoodleAttempt._error(
        `Trying to cheat solution from an attempt of a different quiz.`
      );

    MoodleAttempt._debug(
      `Cheating solution from attempt: <${source.attempt.id}>, to attempt: <${destination.attempt.id}>...`
    );
    const newQuestions: IMoodleParsedQuestion[] = [];
    const destQuestions = destination.questions;
    const sourceQuestions: IMoodleParsedQuestion[] = [...source.questions];

    for (const destQuestion of destQuestions) {
      let matchingQuestion: IMoodleParsedQuestion | undefined;
      let matchingQIndex: number;

      for (let i = 0; i < sourceQuestions.length; i++) {
        const sourceQuestion = sourceQuestions[i];
        const match = MoodleQuestion.match(destQuestion, sourceQuestion);

        if (match) {
          matchingQuestion = sourceQuestion;
          matchingQIndex = i;
          break;
        }
      }
      if (matchingQuestion) {
        sourceQuestions.splice(matchingQIndex!, 1);
        const solvedQuestion = MoodleQuestion.cheatFrom(
          destQuestion,
          matchingQuestion,
          false
        );
        newQuestions.push(solvedQuestion);
      } else {
        MoodleAttempt._debug(
          `Could not find matching question for question with instance: <${destQuestion.instance}>, cannot cheat answer.`
        );
        newQuestions.push(destQuestion);
      }
    }
    MoodleAttempt._debug(
      `Successfully cheated solution from attempt: <${source.attempt.id}>, to attempt: <${destination.attempt.id}>.`
    );
    return { ...destination, questions: newQuestions };
  }
}
