"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const _1 = require(".");
const util_1 = __importDefault(require("util"));
const api = (0, _1.MoodleApi)({
    baseUrl: "http://aunonline.aun.edu.eg/med-ns/",
    token: "3752087c24677b2960cc03b821bd27cd",
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const newAttempt = _1.MoodleAttempt.parse(yield api.mod.quiz.getAttemptData({
        attemptid: 3681310,
        page: 0,
    }));
    const oldAttempt = _1.MoodleAttempt.parse(yield api.mod.quiz.getAttemptReview({ attemptid: 3665103 }));
    const solvedAttempt = _1.MoodleAttempt.cheatFrom(newAttempt, oldAttempt);
    const attemptUpdate = _1.MoodleAttempt.toUpdate(solvedAttempt);
    yield api.mod.quiz.saveAttempt({
        attemptid: newAttempt.attempt.id,
        data: attemptUpdate,
    });
    console.log(util_1.default.inspect(attemptUpdate, { depth: null, colors: true }));
});
main();
