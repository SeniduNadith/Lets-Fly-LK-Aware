"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../controllers/profileController");
const router = express_1.default.Router();
router.get('/', profileController_1.getProfile);
router.put('/', profileController_1.updateProfile);
router.put('/password', profileController_1.changePassword);
router.get('/preferences', profileController_1.getPreferences);
router.put('/preferences', profileController_1.updatePreferences);
router.get('/activity', profileController_1.getActivityHistory);
router.put('/mfa', profileController_1.toggleMFA);
router.get('/stats', profileController_1.getUserStats);
exports.default = router;
//# sourceMappingURL=profile.js.map