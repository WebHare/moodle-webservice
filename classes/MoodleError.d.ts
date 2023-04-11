import { IMoodleErrorOptions } from '../interfaces';
export default class MoodleError extends Error {
    exception?: string;
    errorcode?: number;
    debuginfo?: string;
    constructor(options: IMoodleErrorOptions);
}
