import express from 'express';
// Auth disabled
// import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getQuizzes, 
  getQuizById, 
  startQuiz, 
  submitQuiz, 
  getQuizResults,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  clearIncompleteAttempts
} from '../controllers/quizController';

const router = express.Router();

// Get all quizzes (filtered by user's role)
router.get('/', getQuizzes);

// Development utility routes (must come before parameterized routes)
router.delete('/clear-incomplete', clearIncompleteAttempts);

// Get quiz by ID
router.get('/:id', getQuizById);

// Start a new quiz attempt
router.post('/:id/start', startQuiz);

// Submit quiz attempt
router.post('/:id/attempt', submitQuiz);

// Get quiz results
router.get('/:id/results', getQuizResults);

// Admin routes
router.post('/', createQuiz);

router.put('/:id', updateQuiz);

router.delete('/:id', deleteQuiz);

export default router;
