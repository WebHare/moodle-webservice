import dotenv from 'dotenv';
dotenv.config();
import MoodleApi, { MoodleQuestion } from '.';

const moodle = MoodleApi({
  baseUrl: 'http://aunonline.aun.edu.eg/med-ns/',
  token: '3752087c24677b2960cc03b821bd27cd',
});

moodle.mod.quiz.getAttemptReview({ attemptid: 3665103 }).then((res) => {
  const questions = res.questions; //<-- of type IMoodleQuestion[].
  //IMoodleQuestion does not contain the actual question text or choices.
  questions[0].text; //<-- Error no such property on questions

  //IMoodleParsedQuestion contains additional data such as the name, instance number and choices
  const parsedQuestion = MoodleQuestion.parse(questions[0]); //<-- of type IMoodleParsedQuestion.

  console.log(parsedQuestion.text);
  //Output: "The muscles of facial expression are supplied by the ____ nerve."
});
