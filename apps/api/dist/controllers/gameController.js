"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGame = exports.updateGame = exports.createGame = exports.getGameLeaderboard = exports.getGameHistory = exports.getGameResults = exports.submitGame = exports.startGame = exports.getGameById = exports.getGames = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
exports.getGames = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { game_type, difficulty, role_id, search } = req.query;
    const userId = req.user?.id;
    let query = `
    SELECT g.*, r.name as role_name,
           CASE WHEN ga.user_id IS NOT NULL THEN TRUE ELSE FALSE END as attempted,
           ga.score as best_score,
           ga.time_taken as best_time
    FROM mini_games g
    LEFT JOIN roles r ON g.role_id = r.id
    LEFT JOIN (
      SELECT user_id, game_id, MAX(score) as score, MIN(time_taken) as time_taken
      FROM game_attempts 
      WHERE user_id = ?
      GROUP BY user_id, game_id
    ) ga ON g.id = ga.game_id
    WHERE g.is_active = TRUE
  `;
    const params = [userId];
    if (game_type) {
        query += ' AND g.game_type = ?';
        params.push(game_type);
    }
    if (difficulty) {
        query += ' AND g.difficulty = ?';
        params.push(difficulty);
    }
    if (role_id) {
        query += ' AND g.role_id = ?';
        params.push(role_id);
    }
    if (search) {
        query += ' AND (g.title LIKE ? OR g.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }
    query += ' ORDER BY g.difficulty ASC, g.created_at DESC';
    try {
        const games = await (0, database_1.executeQuery)(query, params);
        logger_1.logger.info(`Retrieved ${games.length} games for user ${userId}`);
        res.json({
            success: true,
            data: games,
            count: games.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving games:', error);
        res.status(500).json({ error: 'Failed to retrieve games' });
    }
});
exports.getGameById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const games = await (0, database_1.executeQuery)(`
      SELECT g.*, r.name as role_name
      FROM mini_games g
      LEFT JOIN roles r ON g.role_id = r.id
      WHERE g.id = ? AND g.is_active = TRUE
    `, [id]);
        if (games.length === 0) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        const game = games[0];
        const attempts = await (0, database_1.executeQuery)(`
      SELECT * FROM game_attempts 
      WHERE user_id = ? AND game_id = ?
      ORDER BY started_at DESC
    `, [userId, id]);
        logger_1.logger.info(`Retrieved game ${id} for user ${userId}`);
        res.json({
            success: true,
            data: {
                ...game,
                previous_attempts: attempts
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving game:', error);
        res.status(500).json({ error: 'Failed to retrieve game' });
    }
});
exports.startGame = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const games = await (0, database_1.executeQuery)(`
      SELECT * FROM mini_games WHERE id = ? AND is_active = TRUE
    `, [id]);
        if (games.length === 0) {
            res.status(404).json({ error: 'Game not found or inactive' });
            return;
        }
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO game_attempts (user_id, game_id, started_at)
      VALUES (?, ?, NOW())
    `, [userId, id]);
        logger_1.logger.info(`Game ${id} started by user ${userId}`);
        res.json({
            success: true,
            message: 'Game started successfully',
            attempt_id: result.insertId,
            game_data: games[0].game_data
        });
    }
    catch (error) {
        logger_1.logger.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
});
exports.submitGame = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { attempt_id, score, max_score, time_taken, game_result } = req.body;
    const userId = req.user?.id;
    try {
        const attempts = await (0, database_1.executeQuery)(`
      SELECT * FROM game_attempts 
      WHERE id = ? AND user_id = ? AND game_id = ?
    `, [attempt_id, userId, id]);
        if (attempts.length === 0) {
            res.status(400).json({ error: 'Invalid attempt' });
            return;
        }
        await (0, database_1.executeQuery)(`
      UPDATE game_attempts 
      SET completed_at = NOW(), score = ?, max_score = ?, time_taken = ?, game_result = ?
      WHERE id = ?
    `, [score, max_score, time_taken, JSON.stringify(game_result), attempt_id]);
        logger_1.logger.info(`Game ${id} completed by user ${userId} with score ${score}/${max_score}`);
        res.json({
            success: true,
            message: 'Game submitted successfully',
            data: {
                score,
                max_score,
                percentage: Math.round((score / max_score) * 100),
                time_taken
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error submitting game:', error);
        res.status(500).json({ error: 'Failed to submit game' });
    }
});
exports.getGameResults = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const attempts = await (0, database_1.executeQuery)(`
      SELECT * FROM game_attempts 
      WHERE user_id = ? AND game_id = ? AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
    `, [userId, id]);
        if (attempts.length === 0) {
            res.status(404).json({ error: 'No completed attempts found' });
            return;
        }
        const game = await (0, database_1.executeQuery)(`
      SELECT * FROM mini_games WHERE id = ?
    `, [id]);
        logger_1.logger.info(`Game results retrieved for user ${userId}, game ${id}`);
        res.json({
            success: true,
            data: {
                game: game[0],
                attempts: attempts,
                best_score: Math.max(...attempts.map(a => a.score || 0)),
                best_time: Math.min(...attempts.map(a => a.time_taken || Infinity)),
                total_attempts: attempts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving game results:', error);
        res.status(500).json({ error: 'Failed to retrieve game results' });
    }
});
exports.getGameHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { limit = 10, offset = 0 } = req.query;
    try {
        const attempts = await (0, database_1.executeQuery)(`
      SELECT ga.*, g.title as game_title, g.game_type, g.difficulty
      FROM game_attempts ga
      JOIN mini_games g ON ga.game_id = g.id
      WHERE ga.user_id = ? AND ga.completed_at IS NOT NULL
      ORDER BY ga.completed_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);
        const totalCount = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as total FROM game_attempts 
      WHERE user_id = ? AND completed_at IS NOT NULL
    `, [userId]);
        logger_1.logger.info(`Game history retrieved for user ${userId}`);
        res.json({
            success: true,
            data: {
                attempts,
                total: totalCount[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving game history:', error);
        res.status(500).json({ error: 'Failed to retrieve game history' });
    }
});
exports.getGameLeaderboard = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { gameId } = req.params;
    const { limit = 20 } = req.query;
    try {
        const leaderboard = await (0, database_1.executeQuery)(`
      SELECT 
        u.username,
        u.first_name,
        u.last_name,
        ga.score,
        ga.time_taken,
        ga.completed_at,
        RANK() OVER (ORDER BY ga.score DESC, ga.time_taken ASC) as rank
      FROM game_attempts ga
      JOIN users u ON ga.user_id = u.id
      WHERE ga.game_id = ? AND ga.completed_at IS NOT NULL
      ORDER BY ga.score DESC, ga.time_taken ASC
      LIMIT ?
    `, [gameId, parseInt(limit)]);
        logger_1.logger.info(`Leaderboard retrieved for game ${gameId}`);
        res.json({
            success: true,
            data: leaderboard
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving leaderboard:', error);
        res.status(500).json({ error: 'Failed to retrieve leaderboard' });
    }
});
exports.createGame = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, game_type, role_id, difficulty, instructions, game_data } = req.body;
    const createdBy = req.user?.id;
    const userRoleId = req.user?.role_id;
    const allowedTypes = ['phishing_simulator', 'password_challenge', 'threat_detection', 'fraud_detection', 'code_review', 'watermark_protection'];
    try {
        if (!title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }
        const effectiveRoleId = role_id || userRoleId || 1;
        const effectiveType = allowedTypes.includes(game_type) ? game_type : 'phishing_simulator';
        const effectiveDifficulty = difficulty || 'beginner';
        const effectiveInstructions = instructions || '';
        const effectiveGameData = game_data ? JSON.stringify(game_data) : JSON.stringify({});
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO mini_games (title, description, game_type, role_id, difficulty, instructions, game_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, effectiveType, effectiveRoleId, effectiveDifficulty, effectiveInstructions, effectiveGameData]);
        logger_1.logger.info(`Game created with ID ${result.insertId} by user ${createdBy}`);
        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            game_id: result.insertId
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});
exports.updateGame = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, description, game_type, role_id, difficulty, instructions, game_data, is_active } = req.body;
    const updatedBy = req.user?.id;
    try {
        const existingGames = await (0, database_1.executeQuery)(`
      SELECT * FROM mini_games WHERE id = ?
    `, [id]);
        if (existingGames.length === 0) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        const current = existingGames[0];
        const allowedTypes = ['phishing_simulator', 'password_challenge', 'threat_detection', 'fraud_detection', 'code_review', 'watermark_protection'];
        const nextTitle = title ?? current.title;
        const nextDescription = description ?? current.description;
        const nextType = allowedTypes.includes(game_type) ? game_type : current.game_type;
        const nextRoleId = role_id ?? current.role_id;
        const nextDifficulty = difficulty ?? current.difficulty;
        const nextInstructions = instructions ?? current.instructions;
        const nextGameData = game_data ? JSON.stringify(game_data) : JSON.stringify(current.game_data ?? {});
        const nextActive = typeof is_active === 'boolean' ? is_active : current.is_active;
        await (0, database_1.executeQuery)(`
      UPDATE mini_games 
      SET title = ?, description = ?, game_type = ?, role_id = ?, difficulty = ?, 
          instructions = ?, game_data = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [nextTitle, nextDescription, nextType, nextRoleId, nextDifficulty, nextInstructions, nextGameData, nextActive, id]);
        logger_1.logger.info(`Game ${id} updated by user ${updatedBy}`);
        res.json({
            success: true,
            message: 'Game updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating game:', error);
        res.status(500).json({ error: 'Failed to update game' });
    }
});
exports.deleteGame = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    try {
        const existingGames = await (0, database_1.executeQuery)(`
      SELECT * FROM mini_games WHERE id = ?
    `, [id]);
        if (existingGames.length === 0) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        const attempts = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM game_attempts WHERE game_id = ?
    `, [id]);
        if (attempts[0].count > 0) {
            await (0, database_1.executeQuery)(`
        UPDATE mini_games SET is_active = FALSE, updated_at = NOW() WHERE id = ?
      `, [id]);
        }
        else {
            await (0, database_1.executeQuery)('DELETE FROM game_attempts WHERE game_id = ?', [id]);
            await (0, database_1.executeQuery)('DELETE FROM mini_games WHERE id = ?', [id]);
        }
        logger_1.logger.info(`Game ${id} deleted by user ${deletedBy}`);
        res.json({
            success: true,
            message: 'Game deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting game:', error);
        res.status(500).json({ error: 'Failed to delete game' });
    }
});
//# sourceMappingURL=gameController.js.map