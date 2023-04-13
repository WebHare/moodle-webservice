import { IMoodleAttemptData, IMoodleAttemptReview } from '../interfaces';
import IMoodleParsedAttemptData from '../interfaces/IMoodleParsedAttemptData';
import IMoodleParsedAttemptReview from '../interfaces/IMoodleParsedAttemptReview';
export default abstract class MoodleAttempt {
    private static _debug;
    static parse(attemptData: IMoodleAttemptData): IMoodleParsedAttemptData;
    static parse(attemptReview: IMoodleAttemptReview): IMoodleParsedAttemptReview;
}
