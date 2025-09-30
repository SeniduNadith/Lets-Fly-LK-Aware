import { Router } from 'express';
import { 
  getPolicies, 
  getPolicyById, 
  createPolicy, 
  updatePolicy, 
  deletePolicy, 
  acknowledgePolicy,
  getPolicyStats
} from '../controllers/policyController';
// Auth disabled
// import { authenticateToken, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public routes (for authenticated users)
router.get('/', asyncHandler(getPolicies));
router.get('/stats', asyncHandler(getPolicyStats));
router.get('/:id', asyncHandler(getPolicyById));
router.post('/:id/acknowledge', asyncHandler(acknowledgePolicy));

// Admin-only routes
router.post('/', asyncHandler(createPolicy));
router.put('/:id', asyncHandler(updatePolicy));
router.delete('/:id', asyncHandler(deletePolicy));

export default router;
