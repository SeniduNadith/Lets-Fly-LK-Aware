import express from 'express';
// Auth disabled for all routes
// import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getFacts, 
  getRandomFact, 
  getFactById, 
  getFactsByCategory,
  getFactCategories,
  createFact,
  updateFact,
  deleteFact
} from '../controllers/factController';

const router = express.Router();

// Get all security facts
router.get('/', getFacts);

// Get random security fact
router.get('/random', getRandomFact);

// Get fact categories
router.get('/categories', getFactCategories);

// Get facts by category
router.get('/category/:category', getFactsByCategory);

// Get security fact by ID
router.get('/:id', getFactById);

// Admin routes
router.post('/', createFact);

router.put('/:id', updateFact);

router.delete('/:id', deleteFact);

export default router;
