"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const _1 = __importStar(require("."));
const moodle = (0, _1.default)({
    baseUrl: 'http://aunonline.aun.edu.eg/med-ns/',
    token: '3752087c24677b2960cc03b821bd27cd',
});
moodle.mod.quiz.getAttemptReview({ attemptid: 3665103 }).then((res) => {
    const questions = res.questions; //<-- of type IMoodleQuestion[].
    //IMoodleQuestion does not contain the actual question text or choices.
    questions[0].text; //<-- Error no such property on questions
    //IMoodleParsedQuestion contains additional data such as the name, instance number and choices
    const parsedQuestion = _1.MoodleQuestion.parse(questions[0]); //<-- of type IMoodleParsedQuestion.
    console.log(parsedQuestion.text);
    //Output: "The muscles of facial expression are supplied by the ____ nerve."
});
