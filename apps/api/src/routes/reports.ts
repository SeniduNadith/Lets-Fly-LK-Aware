import express from 'express';
// Auth disabled
// import { authenticateToken } from '../middleware/auth';
import { 
  getDashboardStats,
  getComplianceReport,
  getTrainingProgressReport,
  getQuizPerformanceReport,
  getPolicyAcknowledgmentReport,
  exportReport
} from '../controllers/reportController';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get compliance report
router.get('/compliance', getComplianceReport);

// Get training progress report
router.get('/training-progress', getTrainingProgressReport);

// Get quiz performance report
router.get('/quiz-performance', getQuizPerformanceReport);

// Get policy acknowledgment report
router.get('/policy-acknowledgments', getPolicyAcknowledgmentReport);

// Export report
router.post('/export', exportReport);

export default router;
