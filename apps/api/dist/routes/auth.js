"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.post('/login', (0, errorHandler_1.asyncHandler)(authController_1.login));
router.post('/register', (0, errorHandler_1.asyncHandler)(authController_1.register));
router.get('/profile', (0, errorHandler_1.asyncHandler)(authController_1.getProfile));
router.put('/profile', (0, errorHandler_1.asyncHandler)(authController_1.updateProfile));
router.put('/change-password', (0, errorHandler_1.asyncHandler)(authController_1.changePassword));
router.post('/logout', (0, errorHandler_1.asyncHandler)(authController_1.logout));
exports.default = router;
//# sourceMappingURL=auth.js.map