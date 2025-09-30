"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const policyController_1 = require("../controllers/policyController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', (0, errorHandler_1.asyncHandler)(policyController_1.getPolicies));
router.get('/stats', (0, errorHandler_1.asyncHandler)(policyController_1.getPolicyStats));
router.get('/:id', (0, errorHandler_1.asyncHandler)(policyController_1.getPolicyById));
router.post('/:id/acknowledge', (0, errorHandler_1.asyncHandler)(policyController_1.acknowledgePolicy));
router.post('/', (0, errorHandler_1.asyncHandler)(policyController_1.createPolicy));
router.put('/:id', (0, errorHandler_1.asyncHandler)(policyController_1.updatePolicy));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(policyController_1.deletePolicy));
exports.default = router;
//# sourceMappingURL=policies.js.map