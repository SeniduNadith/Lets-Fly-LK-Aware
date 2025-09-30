"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gameController_1 = require("../controllers/gameController");
const router = express_1.default.Router();
router.get('/', gameController_1.getGames);
router.get('/history', gameController_1.getGameHistory);
router.get('/:id', gameController_1.getGameById);
router.post('/:id/start', gameController_1.startGame);
router.post('/:id/attempt', gameController_1.submitGame);
router.get('/:id/results', gameController_1.getGameResults);
router.get('/:gameId/leaderboard', gameController_1.getGameLeaderboard);
router.post('/', gameController_1.createGame);
router.put('/:id', gameController_1.updateGame);
router.delete('/:id', gameController_1.deleteGame);
exports.default = router;
//# sourceMappingURL=games.js.map