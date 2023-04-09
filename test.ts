import dotenv from 'dotenv';
dotenv.config();
import MoodleApi, { MoodleClient } from '.';
import MoodleAttempt from './classes/MoodleAttempt';
import utils from 'util';

const moodle = MoodleApi({
  baseUrl: 'http://aunonline.aun.edu.eg/med-ns/',
  token: '3752087c24677b2960cc03b821bd27cd',
});

moodle.mod.quiz
  .getAttemptReview({ attemptid: 3665103 })
  .then((res) =>
    console.log(utils.inspect(MoodleAttempt.parse(res), { depth: null }))
  );
