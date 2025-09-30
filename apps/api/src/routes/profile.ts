import express from 'express';
// Auth disabled
// import { authenticateToken } from '../middleware/auth';
import { 
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
  getActivityHistory,
  toggleMFA,
  getUserStats
} from '../controllers/profileController';

const router = express.Router();

// Get user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

// Change password
router.put('/password', changePassword);

// Get user preferences
router.get('/preferences', getPreferences);

// Update user preferences
router.put('/preferences', updatePreferences);

// Get user activity history
router.get('/activity', getActivityHistory);

// Toggle MFA
router.put('/mfa', toggleMFA);

// Get user statistics
router.get('/stats', getUserStats);

export default router;
