import IMoodleAttempt from './IMoodleAttempt';
import IMoodleAttemptData from './IMoodleAttemptData';
import IMoodleParsedQuestion from './IMoodleParsedQuestion';
import IMoodleWSWarning from './IMoodleWSWarning';

export default interface IMoodleParsedAttemptData
  extends Omit<IMoodleAttemptData, 'questions'> {
  questions: IMoodleParsedQuestion[];
}
