"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const factController_1 = require("../controllers/factController");
const router = express_1.default.Router();
router.get('/', factController_1.getFacts);
router.get('/random', factController_1.getRandomFact);
router.get('/categories', factController_1.getFactCategories);
router.get('/category/:category', factController_1.getFactsByCategory);
router.get('/:id', factController_1.getFactById);
router.post('/', factController_1.createFact);
router.put('/:id', factController_1.updateFact);
router.delete('/:id', factController_1.deleteFact);
exports.default = router;
//# sourceMappingURL=facts.js.map