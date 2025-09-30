"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quizController_1 = require("../controllers/quizController");
const router = express_1.default.Router();
router.get('/', quizController_1.getQuizzes);
router.delete('/clear-incomplete', quizController_1.clearIncompleteAttempts);
router.get('/:id', quizController_1.getQuizById);
router.post('/:id/start', quizController_1.startQuiz);
router.post('/:id/attempt', quizController_1.submitQuiz);
router.get('/:id/results', quizController_1.getQuizResults);
router.post('/', quizController_1.createQuiz);
router.put('/:id', quizController_1.updateQuiz);
router.delete('/:id', quizController_1.deleteQuiz);
exports.default = router;
//# sourceMappingURL=quizzes.js.map