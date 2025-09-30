"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trainingController_1 = require("../controllers/trainingController");
const router = express_1.default.Router();
router.get('/', trainingController_1.getTrainingModules);
router.get('/progress', trainingController_1.getTrainingProgress);
router.get('/:id', trainingController_1.getTrainingModuleById);
router.post('/:id/start', trainingController_1.startTraining);
router.put('/:id/progress', trainingController_1.updateTrainingProgress);
router.post('/:id/complete', trainingController_1.completeTraining);
router.post('/', trainingController_1.createTrainingModule);
router.put('/:id', trainingController_1.updateTrainingModule);
router.delete('/:id', trainingController_1.deleteTrainingModule);
exports.default = router;
//# sourceMappingURL=training.js.map