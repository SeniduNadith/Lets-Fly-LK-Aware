import { Router } from 'express';
import { 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  changePassword, 
  logout 
} from '../controllers/authController';
// Auth disabled
// import { authenticateToken, requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public routes
router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));

// Protected routes
router.get('/profile', asyncHandler(getProfile));
router.put('/profile', asyncHandler(updateProfile));
router.put('/change-password', asyncHandler(changePassword));
router.post('/logout', asyncHandler(logout));

export default router;
