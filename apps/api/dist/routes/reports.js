"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../controllers/reportController");
const router = express_1.default.Router();
router.get('/dashboard', reportController_1.getDashboardStats);
router.get('/compliance', reportController_1.getComplianceReport);
router.get('/training-progress', reportController_1.getTrainingProgressReport);
router.get('/quiz-performance', reportController_1.getQuizPerformanceReport);
router.get('/policy-acknowledgments', reportController_1.getPolicyAcknowledgmentReport);
router.post('/export', reportController_1.exportReport);
exports.default = router;
//# sourceMappingURL=reports.js.map