import express from 'express';
// Auth disabled
// import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getGames, 
  getGameById, 
  startGame, 
  submitGame, 
  getGameResults,
  getGameHistory,
  getGameLeaderboard,
  createGame,
  updateGame,
  deleteGame
} from '../controllers/gameController';

const router = express.Router();

// Get all games (filtered by user's role)
router.get('/', getGames);

// Get user's game history
router.get('/history', getGameHistory);

// Get game by ID
router.get('/:id', getGameById);

// Start a new game session
router.post('/:id/start', startGame);

// Submit game attempt
router.post('/:id/attempt', submitGame);

// Get game results
router.get('/:id/results', getGameResults);

// Get leaderboard for a specific game
router.get('/:gameId/leaderboard', getGameLeaderboard);

// Admin routes
router.post('/', createGame);

router.put('/:id', updateGame);

router.delete('/:id', deleteGame);

export default router;
