"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.toggleMFA = exports.getActivityHistory = exports.updatePreferences = exports.getPreferences = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    try {
        const users = await (0, database_1.executeQuery)(`
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);
        if (users.length === 0) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }
        const user = users[0];
        delete user.password_hash;
        logger_1.logger.info(`Profile retrieved for user ${userId}`);
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving user profile:', error);
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { first_name, last_name, email, department } = req.body;
    try {
        if (email) {
            const existingUsers = await (0, database_1.executeQuery)(`
        SELECT id FROM users WHERE email = ? AND id != ?
      `, [email, userId]);
            if (existingUsers.length > 0) {
                res.status(400).json({ error: 'Email already taken by another user' });
                return;
            }
        }
        await (0, database_1.executeQuery)(`
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, department = ?, updated_at = NOW()
      WHERE id = ?
    `, [first_name, last_name, email, department, userId]);
        logger_1.logger.info(`Profile updated for user ${userId}`);
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;
    try {
        if (!current_password || !new_password) {
            res.status(400).json({ error: 'Current password and new password are required' });
            return;
        }
        const users = await (0, database_1.executeQuery)(`
      SELECT password_hash FROM users WHERE id = ?
    `, [userId]);
        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(current_password, users[0].password_hash);
        if (!isCurrentPasswordValid) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
        const newPasswordHash = await bcryptjs_1.default.hash(new_password, saltRounds);
        await (0, database_1.executeQuery)(`
      UPDATE users 
      SET password_hash = ?, updated_at = NOW()
      WHERE id = ?
    `, [newPasswordHash, userId]);
        logger_1.logger.info(`Password changed for user ${userId}`);
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});
exports.getPreferences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    try {
        const preferences = {
            notifications: {
                email: true,
                push: true,
                sms: false
            },
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            dashboard_layout: 'default'
        };
        logger_1.logger.info(`Preferences retrieved for user ${userId}`);
        res.json({
            success: true,
            data: preferences
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving user preferences:', error);
        res.status(500).json({ error: 'Failed to retrieve user preferences' });
    }
});
exports.updatePreferences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const preferences = req.body;
    try {
        if (!preferences || typeof preferences !== 'object') {
            res.status(400).json({ error: 'Invalid preferences format' });
            return;
        }
        logger_1.logger.info(`Preferences updated for user ${userId}`);
        res.json({
            success: true,
            message: 'Preferences updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating user preferences:', error);
        res.status(500).json({ error: 'Failed to update user preferences' });
    }
});
exports.getActivityHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { limit = 20, offset = 0 } = req.query;
    try {
        const activities = await (0, database_1.executeQuery)(`
      SELECT 
        'policy_acknowledgment' as type,
        p.title as title,
        pa.acknowledged_at as timestamp,
        'Policy Acknowledged' as description,
        pa.ip_address,
        pa.user_agent
      FROM policy_acknowledgments pa
      JOIN policies p ON pa.policy_id = p.id
      WHERE pa.user_id = ?
      
      UNION ALL
      
      SELECT 
        'quiz_attempt' as type,
        q.title as title,
        qa.completed_at as timestamp,
        CONCAT('Quiz Completed - Score: ', qa.score, '/', qa.max_score) as description,
        NULL as ip_address,
        NULL as user_agent
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ? AND qa.completed_at IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'game_attempt' as type,
        g.title as title,
        ga.completed_at as timestamp,
        CONCAT('Game Completed - Score: ', ga.score, '/', ga.max_score) as description,
        NULL as ip_address,
        NULL as user_agent
      FROM game_attempts ga
      JOIN mini_games g ON ga.game_id = g.id
      WHERE ga.user_id = ? AND ga.completed_at IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'training_completion' as type,
        tm.title as title,
        tp.completed_at as timestamp,
        'Training Module Completed' as description,
        NULL as ip_address,
        NULL as user_agent
      FROM training_progress tp
      JOIN training_modules tm ON tp.module_id = tm.id
      WHERE tp.user_id = ? AND tp.status = 'completed'
      
      UNION ALL
      
      SELECT 
        'login' as type,
        'System' as title,
        u.last_login as timestamp,
        'User Login' as description,
        NULL as ip_address,
        NULL as user_agent
      FROM users u
      WHERE u.id = ? AND u.last_login IS NOT NULL
      
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, userId, userId, userId, parseInt(limit), parseInt(offset)]);
        const totalCount = await (0, database_1.executeQuery)(`
      SELECT 
        (SELECT COUNT(*) FROM policy_acknowledgments WHERE user_id = ?) +
        (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND completed_at IS NOT NULL) +
        (SELECT COUNT(*) FROM game_attempts WHERE user_id = ? AND completed_at IS NOT NULL) +
        (SELECT COUNT(*) FROM training_progress WHERE user_id = ? AND status = 'completed') +
        (SELECT CASE WHEN last_login IS NOT NULL THEN 1 ELSE 0 END FROM users WHERE id = ?) as total
    `, [userId, userId, userId, userId, userId]);
        logger_1.logger.info(`Activity history retrieved for user ${userId}`);
        res.json({
            success: true,
            data: {
                activities: activities,
                total: totalCount[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving user activity history:', error);
        res.status(500).json({ error: 'Failed to retrieve user activity history' });
    }
});
exports.toggleMFA = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { enable, secret } = req.body;
    try {
        if (enable && !secret) {
            res.status(400).json({ error: 'MFA secret is required when enabling MFA' });
            return;
        }
        await (0, database_1.executeQuery)(`
      UPDATE users 
      SET mfa_enabled = ?, mfa_secret = ?, updated_at = NOW()
      WHERE id = ?
    `, [enable, enable ? secret : null, userId]);
        logger_1.logger.info(`MFA ${enable ? 'enabled' : 'disabled'} for user ${userId}`);
        res.json({
            success: true,
            message: `MFA ${enable ? 'enabled' : 'disabled'} successfully`
        });
    }
    catch (error) {
        logger_1.logger.error('Error toggling MFA:', error);
        res.status(500).json({ error: 'Failed to toggle MFA' });
    }
});
exports.getUserStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    try {
        const policyStats = await (0, database_1.executeQuery)(`
      SELECT 
        COUNT(*) as total_policies,
        COUNT(pa.id) as acknowledged_policies
      FROM policies p
      LEFT JOIN policy_acknowledgments pa ON p.id = pa.policy_id AND pa.user_id = ?
      WHERE p.status != 'archived'
    `, [userId]);
        const quizStats = await (0, database_1.executeQuery)(`
      SELECT 
        COUNT(DISTINCT qa.quiz_id) as total_quizzes,
        COUNT(*) as total_attempts,
        AVG(qa.score / qa.max_score * 100) as avg_score,
        COUNT(CASE WHEN qa.passed THEN 1 END) as passed_attempts
      FROM quiz_attempts qa
      WHERE qa.user_id = ? AND qa.completed_at IS NOT NULL
    `, [userId]);
        const gameStats = await (0, database_1.executeQuery)(`
      SELECT 
        COUNT(DISTINCT ga.game_id) as total_games,
        COUNT(*) as total_attempts,
        AVG(ga.score / ga.max_score * 100) as avg_score,
        AVG(ga.time_taken) as avg_time
      FROM game_attempts ga
      WHERE ga.user_id = ? AND ga.completed_at IS NOT NULL
    `, [userId]);
        const trainingStats = await (0, database_1.executeQuery)(`
      SELECT 
        COUNT(*) as total_modules,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_modules,
        SUM(time_spent) as total_time_spent
      FROM training_progress
      WHERE user_id = ?
    `, [userId]);
        logger_1.logger.info(`User statistics retrieved for user ${userId}`);
        res.json({
            success: true,
            data: {
                policies: policyStats[0],
                quizzes: quizStats[0],
                games: gameStats[0],
                training: trainingStats[0]
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving user statistics:', error);
        res.status(500).json({ error: 'Failed to retrieve user statistics' });
    }
});
//# sourceMappingURL=profileController.js.map