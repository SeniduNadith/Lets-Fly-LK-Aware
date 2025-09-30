import express from 'express';
// Auth disabled
// import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getTrainingModules, 
  getTrainingModuleById, 
  getTrainingProgress,
  startTraining, 
  updateTrainingProgress, 
  completeTraining,
  createTrainingModule,
  updateTrainingModule,
  deleteTrainingModule
} from '../controllers/trainingController';

const router = express.Router();

// Get all training modules
router.get('/', getTrainingModules);

// Get user's training progress
router.get('/progress', getTrainingProgress);

// Get training module by ID
router.get('/:id', getTrainingModuleById);

// Start training module
router.post('/:id/start', startTraining);

// Update training progress
router.put('/:id/progress', updateTrainingProgress);

// Complete training module
router.post('/:id/complete', completeTraining);

// Admin routes
router.post('/', createTrainingModule);

router.put('/:id', updateTrainingModule);

router.delete('/:id', deleteTrainingModule);

export default router;
