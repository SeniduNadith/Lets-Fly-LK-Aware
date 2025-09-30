"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = exports.getPolicyAcknowledgmentReport = exports.getQuizPerformanceReport = exports.getTrainingProgressReport = exports.getComplianceReport = exports.getDashboardStats = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
exports.getDashboardStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    try {
        const userRoles = await (0, database_1.executeQuery)(`
      SELECT role_id FROM users WHERE id = ?
    `, [userId]);
        const userRoleId = userRoles[0]?.role_id;
        const totalPolicies = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM policies WHERE status != 'archived'
    `);
        const acknowledgedPolicies = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM policy_acknowledgments WHERE user_id = ?
    `, [userId]);
        const totalQuizzes = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM quizzes WHERE is_active = TRUE
    `);
        const completedQuizzes = await (0, database_1.executeQuery)(`
      SELECT COUNT(DISTINCT quiz_id) as count FROM quiz_attempts 
      WHERE user_id = ? AND completed_at IS NOT NULL
    `, [userId]);
        const totalGames = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM mini_games WHERE is_active = TRUE
    `);
        const completedGames = await (0, database_1.executeQuery)(`
      SELECT COUNT(DISTINCT game_id) as count FROM game_attempts 
      WHERE user_id = ? AND completed_at IS NOT NULL
    `, [userId]);
        const totalTraining = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM training_modules WHERE is_active = TRUE
    `);
        const completedTraining = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM training_progress 
      WHERE user_id = ? AND status = 'completed'
    `, [userId]);
        const recentActivity = await (0, database_1.executeQuery)(`
      SELECT 
        'policy' as type,
        p.title as title,
        pa.acknowledged_at as date,
        'Policy Acknowledged' as action
      FROM policy_acknowledgments pa
      JOIN policies p ON pa.policy_id = p.id
      WHERE pa.user_id = ?
      
      UNION ALL
      
      SELECT 
        'quiz' as type,
        q.title as title,
        qa.completed_at as date,
        CONCAT('Quiz Completed - Score: ', qa.score, '/', qa.max_score) as action
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ? AND qa.completed_at IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'game' as type,
        g.title as title,
        ga.completed_at as date,
        CONCAT('Game Completed - Score: ', ga.score, '/', ga.max_score) as action
      FROM game_attempts ga
      JOIN mini_games g ON ga.game_id = g.id
      WHERE ga.user_id = ? AND ga.completed_at IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'training' as type,
        tm.title as title,
        tp.completed_at as date,
        'Training Completed' as action
      FROM training_progress tp
      JOIN training_modules tm ON tp.module_id = tm.id
      WHERE tp.user_id = ? AND tp.status = 'completed'
      
      ORDER BY date DESC
      LIMIT 10
    `, [userId, userId, userId, userId]);
        logger_1.logger.info(`Dashboard stats retrieved for user ${userId}`);
        res.json({
            success: true,
            data: {
                policies: {
                    total: totalPolicies[0].count,
                    acknowledged: acknowledgedPolicies[0].count,
                    pending: totalPolicies[0].count - acknowledgedPolicies[0].count
                },
                quizzes: {
                    total: totalQuizzes[0].count,
                    completed: completedQuizzes[0].count,
                    pending: totalQuizzes[0].count - completedQuizzes[0].count
                },
                games: {
                    total: totalGames[0].count,
                    completed: completedGames[0].count,
                    pending: totalGames[0].count - completedGames[0].count
                },
                training: {
                    total: totalTraining[0].count,
                    completed: completedTraining[0].count,
                    pending: totalTraining[0].count - completedTraining[0].count
                },
                recent_activity: recentActivity
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving dashboard stats:', error);
        res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
    }
});
exports.getComplianceReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { start_date, end_date } = req.query;
    try {
        let dateFilter = '';
        const params = [userId];
        if (start_date && end_date) {
            dateFilter = ' AND DATE(pa.acknowledged_at) BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        const policyCompliance = await (0, database_1.executeQuery)(`
      SELECT 
        p.category,
        COUNT(p.id) as total_policies,
        COUNT(pa.id) as acknowledged_policies,
        ROUND((COUNT(pa.id) / COUNT(p.id)) * 100, 2) as compliance_rate
      FROM policies p
      LEFT JOIN policy_acknowledgments pa ON p.id = pa.policy_id AND pa.user_id = ?
      WHERE p.status != 'archived'
      ${dateFilter}
      GROUP BY p.category
      ORDER BY compliance_rate DESC
    `, params);
        const trainingCompliance = await (0, database_1.executeQuery)(`
      SELECT 
        tm.category,
        COUNT(tm.id) as total_modules,
        COUNT(CASE WHEN tp.status = 'completed' THEN 1 END) as completed_modules,
        ROUND((COUNT(CASE WHEN tp.status = 'completed' THEN 1 END) / COUNT(tm.id)) * 100, 2) as completion_rate
      FROM training_modules tm
      LEFT JOIN training_progress tp ON tm.id = tp.module_id AND tp.user_id = ?
      WHERE tm.is_active = TRUE
      ${dateFilter.replace('pa.acknowledged_at', 'tp.completed_at')}
      GROUP BY tm.category
      ORDER BY completion_rate DESC
    `, params);
        logger_1.logger.info(`Compliance report generated for user ${userId}`);
        res.json({
            success: true,
            data: {
                policy_compliance: policyCompliance,
                training_compliance: trainingCompliance,
                period: {
                    start_date: start_date || 'all',
                    end_date: end_date || 'all'
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error generating compliance report:', error);
        res.status(500).json({ error: 'Failed to generate compliance report' });
    }
});
exports.getTrainingProgressReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    try {
        const progress = await (0, database_1.executeQuery)(`
      SELECT 
        tm.title,
        tm.category,
        tm.content_type,
        tm.duration,
        tp.status,
        tp.progress_percentage,
        tp.time_spent,
        tp.started_at,
        tp.completed_at,
        r.name as role_name
      FROM training_progress tp
      JOIN training_modules tm ON tp.module_id = tm.id
      LEFT JOIN roles r ON tm.role_id = r.id
      WHERE tp.user_id = ?
      ORDER BY tp.updated_at DESC
    `, [userId]);
        const totalModules = progress.length;
        const completedModules = progress.filter(p => p.status === 'completed').length;
        const inProgressModules = progress.filter(p => p.status === 'in_progress').length;
        const notStartedModules = progress.filter(p => p.status === 'not_started').length;
        const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
        const totalTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent || 0), 0);
        logger_1.logger.info(`Training progress report generated for user ${userId}`);
        res.json({
            success: true,
            data: {
                progress: progress,
                summary: {
                    total_modules: totalModules,
                    completed: completedModules,
                    in_progress: inProgressModules,
                    not_started: notStartedModules,
                    overall_percentage: overallProgress,
                    total_time_spent: totalTimeSpent
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error generating training progress report:', error);
        res.status(500).json({ error: 'Failed to generate training progress report' });
    }
});
exports.getQuizPerformanceReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { start_date, end_date } = req.query;
    try {
        let dateFilter = '';
        const params = [userId];
        if (start_date && end_date) {
            dateFilter = ' AND DATE(qa.completed_at) BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        const performance = await (0, database_1.executeQuery)(`
      SELECT 
        q.title,
        q.category,
        q.difficulty,
        qa.score,
        qa.max_score,
        ROUND((qa.score / qa.max_score) * 100, 2) as percentage,
        qa.passed,
        qa.time_taken,
        qa.completed_at,
        ROUND((qa.score / qa.max_score) * 100, 2) as performance_score
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ? AND qa.completed_at IS NOT NULL
      ${dateFilter}
      ORDER BY qa.completed_at DESC
    `, params);
        const totalAttempts = performance.length;
        const passedAttempts = performance.filter(p => p.passed).length;
        const averageScore = totalAttempts > 0 ?
            performance.reduce((sum, p) => sum + p.percentage, 0) / totalAttempts : 0;
        const averageTime = totalAttempts > 0 ?
            performance.reduce((sum, p) => sum + (p.time_taken || 0), 0) / totalAttempts : 0;
        const performanceByCategory = await (0, database_1.executeQuery)(`
      SELECT 
        q.category,
        COUNT(*) as attempts,
        AVG(qa.score / qa.max_score * 100) as avg_percentage,
        COUNT(CASE WHEN qa.passed THEN 1 END) as passed_attempts
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ? AND qa.completed_at IS NOT NULL
      ${dateFilter}
      GROUP BY q.category
      ORDER BY avg_percentage DESC
    `, params);
        logger_1.logger.info(`Quiz performance report generated for user ${userId}`);
        res.json({
            success: true,
            data: {
                performance: performance,
                summary: {
                    total_attempts: totalAttempts,
                    passed_attempts: passedAttempts,
                    pass_rate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
                    average_score: Math.round(averageScore * 100) / 100,
                    average_time: Math.round(averageTime)
                },
                by_category: performanceByCategory,
                period: {
                    start_date: start_date || 'all',
                    end_date: end_date || 'all'
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error generating quiz performance report:', error);
        res.status(500).json({ error: 'Failed to generate quiz performance report' });
    }
});
exports.getPolicyAcknowledgmentReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { start_date, end_date } = req.query;
    try {
        let dateFilter = '';
        const params = [userId];
        if (start_date && end_date) {
            dateFilter = ' AND DATE(pa.acknowledged_at) BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        const acknowledgments = await (0, database_1.executeQuery)(`
      SELECT 
        p.title,
        p.category,
        p.priority,
        p.version,
        pa.acknowledged_at,
        pa.ip_address,
        pa.user_agent
      FROM policy_acknowledgments pa
      JOIN policies p ON pa.policy_id = p.id
      WHERE pa.user_id = ?
      ${dateFilter}
      ORDER BY pa.acknowledged_at DESC
    `, params);
        const pendingPolicies = await (0, database_1.executeQuery)(`
      SELECT 
        p.id,
        p.title,
        p.category,
        p.priority,
        p.version,
        p.effective_date
      FROM policies p
      LEFT JOIN policy_acknowledgments pa ON p.id = pa.policy_id AND pa.user_id = ?
      WHERE p.status = 'published' AND pa.id IS NULL
      ORDER BY p.priority DESC, p.effective_date ASC
    `, [userId]);
        logger_1.logger.info(`Policy acknowledgment report generated for user ${userId}`);
        res.json({
            success: true,
            data: {
                acknowledged: acknowledgments,
                pending: pendingPolicies,
                summary: {
                    total_acknowledged: acknowledgments.length,
                    total_pending: pendingPolicies.length,
                    compliance_rate: (acknowledgments.length / (acknowledgments.length + pendingPolicies.length)) * 100
                },
                period: {
                    start_date: start_date || 'all',
                    end_date: end_date || 'all'
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error generating policy acknowledgment report:', error);
        res.status(500).json({ error: 'Failed to generate policy acknowledgment report' });
    }
});
exports.exportReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { report_type, format = 'json', start_date, end_date } = req.body;
    const userId = req.user?.id;
    try {
        let reportData = {};
        switch (report_type) {
            case 'compliance':
                break;
            case 'training_progress':
                break;
            case 'quiz_performance':
                break;
            case 'policy_acknowledgments':
                break;
            default:
                res.status(400).json({ error: 'Invalid report type' });
                return;
        }
        const filename = `security_report_${report_type}_${new Date().toISOString().split('T')[0]}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
        }
        else {
            res.setHeader('Content-Type', 'application/json');
        }
        logger_1.logger.info(`Report exported for user ${userId}: ${report_type}`);
        res.json({
            success: true,
            message: 'Report exported successfully',
            filename: filename,
            data: reportData
        });
    }
    catch (error) {
        logger_1.logger.error('Error exporting report:', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
});
//# sourceMappingURL=reportController.js.map