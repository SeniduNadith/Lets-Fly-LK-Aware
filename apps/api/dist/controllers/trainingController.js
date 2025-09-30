"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrainingModule = exports.updateTrainingModule = exports.createTrainingModule = exports.completeTraining = exports.updateTrainingProgress = exports.startTraining = exports.getTrainingProgress = exports.getTrainingModuleById = exports.getTrainingModules = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
exports.getTrainingModules = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category, role_id, content_type, search } = req.query;
    const userId = req.user?.id;
    let query = `
    SELECT tm.*, r.name as role_name,
           tp.status, tp.progress_percentage, tp.time_spent,
           tp.started_at, tp.completed_at
    FROM training_modules tm
    LEFT JOIN roles r ON tm.role_id = r.id
    LEFT JOIN training_progress tp ON tm.id = tp.module_id AND tp.user_id = ?
    WHERE tm.is_active = TRUE
  `;
    const params = [userId];
    if (category) {
        query += ' AND tm.category = ?';
        params.push(category);
    }
    if (role_id) {
        query += ' AND tm.role_id = ?';
        params.push(role_id);
    }
    if (content_type) {
        query += ' AND tm.content_type = ?';
        params.push(content_type);
    }
    if (search) {
        query += ' AND (tm.title LIKE ? OR tm.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }
    query += ' ORDER BY tm.category ASC, tm.created_at DESC';
    try {
        const modules = await (0, database_1.executeQuery)(query, params);
        logger_1.logger.info(`Retrieved ${modules.length} training modules for user ${userId}`);
        res.json({
            success: true,
            data: modules,
            count: modules.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving training modules:', error);
        res.status(500).json({ error: 'Failed to retrieve training modules' });
    }
});
exports.getTrainingModuleById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const modules = await (0, database_1.executeQuery)(`
      SELECT tm.*, r.name as role_name
      FROM training_modules tm
      LEFT JOIN roles r ON tm.role_id = r.id
      WHERE tm.id = ? AND tm.is_active = TRUE
    `, [id]);
        if (modules.length === 0) {
            res.status(404).json({ error: 'Training module not found' });
            return;
        }
        const module = modules[0];
        const progress = await (0, database_1.executeQuery)(`
      SELECT * FROM training_progress 
      WHERE user_id = ? AND module_id = ?
    `, [userId, id]);
        let prerequisites = [];
        if (module.prerequisites) {
            try {
                const prereqIds = JSON.parse(module.prerequisites);
                if (Array.isArray(prereqIds) && prereqIds.length > 0) {
                    prerequisites = await (0, database_1.executeQuery)(`
            SELECT id, title, category FROM training_modules 
            WHERE id IN (${prereqIds.map(() => '?').join(',')})
          `, prereqIds);
                }
            }
            catch (e) {
                logger_1.logger.warn(`Failed to parse prerequisites for module ${id}:`, e);
            }
        }
        logger_1.logger.info(`Retrieved training module ${id} for user ${userId}`);
        res.json({
            success: true,
            data: {
                ...module,
                progress: progress[0] || null,
                prerequisites: prerequisites
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving training module:', error);
        res.status(500).json({ error: 'Failed to retrieve training module' });
    }
});
exports.getTrainingProgress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    try {
        const progress = await (0, database_1.executeQuery)(`
      SELECT 
        tp.*,
        tm.title,
        tm.category,
        tm.content_type,
        tm.duration,
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
        logger_1.logger.info(`Training progress retrieved for user ${userId}`);
        res.json({
            success: true,
            data: {
                progress: progress,
                summary: {
                    total_modules: totalModules,
                    completed: completedModules,
                    in_progress: inProgressModules,
                    not_started: notStartedModules,
                    overall_percentage: overallProgress
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving training progress:', error);
        res.status(500).json({ error: 'Failed to retrieve training progress' });
    }
});
exports.startTraining = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const modules = await (0, database_1.executeQuery)(`
      SELECT * FROM training_modules WHERE id = ? AND is_active = TRUE
    `, [id]);
        if (modules.length === 0) {
            res.status(404).json({ error: 'Training module not found or inactive' });
            return;
        }
        const module = modules[0];
        if (module.prerequisites) {
            try {
                const prereqIds = JSON.parse(module.prerequisites);
                if (Array.isArray(prereqIds) && prereqIds.length > 0) {
                    const prereqProgress = await (0, database_1.executeQuery)(`
            SELECT module_id, status FROM training_progress 
            WHERE user_id = ? AND module_id IN (${prereqIds.map(() => '?').join(',')})
          `, [userId, ...prereqIds]);
                    const incompletePrereqs = prereqIds.filter(prereqId => {
                        const progress = prereqProgress.find(p => p.module_id === prereqId);
                        return !progress || progress.status !== 'completed';
                    });
                    if (incompletePrereqs.length > 0) {
                        res.status(400).json({
                            error: 'Prerequisites not completed',
                            incomplete_prerequisites: incompletePrereqs
                        });
                        return;
                    }
                }
            }
            catch (e) {
                logger_1.logger.warn(`Failed to check prerequisites for module ${id}:`, e);
            }
        }
        const existingProgress = await (0, database_1.executeQuery)(`
      SELECT * FROM training_progress WHERE user_id = ? AND module_id = ?
    `, [userId, id]);
        if (existingProgress.length > 0) {
            await (0, database_1.executeQuery)(`
        UPDATE training_progress 
        SET status = 'in_progress', started_at = NOW(), updated_at = NOW()
        WHERE user_id = ? AND module_id = ?
      `, [userId, id]);
        }
        else {
            await (0, database_1.executeQuery)(`
        INSERT INTO training_progress (user_id, module_id, status, started_at)
        VALUES (?, ?, 'in_progress', NOW())
      `, [userId, id]);
        }
        logger_1.logger.info(`Training module ${id} started by user ${userId}`);
        res.json({
            success: true,
            message: 'Training started successfully',
            module: module
        });
    }
    catch (error) {
        logger_1.logger.error('Error starting training:', error);
        res.status(500).json({ error: 'Failed to start training' });
    }
});
exports.updateTrainingProgress = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { progress_percentage, time_spent } = req.body;
    const userId = req.user?.id;
    try {
        const progress = await (0, database_1.executeQuery)(`
      SELECT * FROM training_progress WHERE user_id = ? AND module_id = ?
    `, [userId, id]);
        if (progress.length === 0) {
            res.status(404).json({ error: 'Training progress not found' });
            return;
        }
        await (0, database_1.executeQuery)(`
      UPDATE training_progress 
      SET progress_percentage = ?, time_spent = ?, updated_at = NOW()
      WHERE user_id = ? AND module_id = ?
    `, [progress_percentage, time_spent, userId, id]);
        logger_1.logger.info(`Training progress updated for module ${id} by user ${userId}`);
        res.json({
            success: true,
            message: 'Progress updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating training progress:', error);
        res.status(500).json({ error: 'Failed to update training progress' });
    }
});
exports.completeTraining = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { final_progress, total_time_spent } = req.body;
    const userId = req.user?.id;
    try {
        const progress = await (0, database_1.executeQuery)(`
      SELECT * FROM training_progress WHERE user_id = ? AND module_id = ?
    `, [userId, id]);
        if (progress.length === 0) {
            res.status(404).json({ error: 'Training progress not found' });
            return;
        }
        await (0, database_1.executeQuery)(`
      UPDATE training_progress 
      SET status = 'completed', progress_percentage = ?, 
          completed_at = NOW(), time_spent = ?, updated_at = NOW()
      WHERE user_id = ? AND module_id = ?
    `, [final_progress || 100, total_time_spent, userId, id]);
        logger_1.logger.info(`Training module ${id} completed by user ${userId}`);
        res.json({
            success: true,
            message: 'Training completed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error completing training:', error);
        res.status(500).json({ error: 'Failed to complete training' });
    }
});
exports.createTrainingModule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, role_id, category, content_type, content_url, duration, prerequisites } = req.body;
    const createdBy = req.user?.id;
    const userRoleId = req.user?.role_id;
    const isProduction = (process.env.NODE_ENV || 'development') === 'production';
    try {
        if (!title || !category) {
            res.status(400).json({ error: 'Title and category are required' });
            return;
        }
        const effectiveRoleId = role_id || userRoleId || 1;
        const effectiveType = content_type || 'interactive';
        const effectiveDuration = duration || 0;
        const effectivePrereqs = JSON.stringify(prerequisites || []);
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO training_modules (title, description, role_id, category, content_type, content_url, duration, prerequisites)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, effectiveRoleId, category, effectiveType, content_url, effectiveDuration, effectivePrereqs]);
        logger_1.logger.info(`Training module created with ID ${result.insertId} by user ${createdBy}`);
        res.status(201).json({
            success: true,
            message: 'Training module created successfully',
            module_id: result.insertId
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating training module:', error);
        res.status(500).json({ error: 'Failed to create training module' });
    }
});
exports.updateTrainingModule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, description, role_id, category, content_type, content_url, duration, prerequisites, is_active } = req.body;
    const updatedBy = req.user?.id;
    try {
        const existingModules = await (0, database_1.executeQuery)(`
      SELECT * FROM training_modules WHERE id = ?
    `, [id]);
        if (existingModules.length === 0) {
            res.status(404).json({ error: 'Training module not found' });
            return;
        }
        const current = existingModules[0];
        const nextTitle = title ?? current.title;
        const nextDescription = description ?? current.description;
        const nextRoleId = role_id ?? current.role_id;
        const nextCategory = category ?? current.category;
        const nextContentType = content_type ?? current.content_type;
        const nextContentUrl = content_url ?? current.content_url ?? '';
        const nextDuration = typeof duration === 'number' ? duration : current.duration;
        const nextPrereqs = JSON.stringify(prerequisites ?? current.prerequisites ?? []);
        const nextActive = typeof is_active === 'boolean' ? is_active : current.is_active;
        await (0, database_1.executeQuery)(`
      UPDATE training_modules 
      SET title = ?, description = ?, role_id = ?, category = ?, content_type = ?, 
          content_url = ?, duration = ?, prerequisites = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [nextTitle, nextDescription, nextRoleId, nextCategory, nextContentType, nextContentUrl, nextDuration, nextPrereqs, nextActive, id]);
        logger_1.logger.info(`Training module ${id} updated by user ${updatedBy}`);
        res.json({
            success: true,
            message: 'Training module updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating training module:', error);
        res.status(500).json({ error: 'Failed to update training module' });
    }
});
exports.deleteTrainingModule = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    try {
        const existingModules = await (0, database_1.executeQuery)(`
      SELECT * FROM training_modules WHERE id = ?
    `, [id]);
        if (existingModules.length === 0) {
            res.status(404).json({ error: 'Training module not found' });
            return;
        }
        const progress = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM training_progress WHERE module_id = ?
    `, [id]);
        if (progress[0].count > 0) {
            await (0, database_1.executeQuery)(`
        UPDATE training_modules SET is_active = FALSE, updated_at = NOW() WHERE id = ?
      `, [id]);
        }
        else {
            await (0, database_1.executeQuery)('DELETE FROM training_progress WHERE module_id = ?', [id]);
            await (0, database_1.executeQuery)('DELETE FROM training_modules WHERE id = ?', [id]);
        }
        logger_1.logger.info(`Training module ${id} deleted by user ${deletedBy}`);
        res.json({
            success: true,
            message: 'Training module deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting training module:', error);
        res.status(500).json({ error: 'Failed to delete training module' });
    }
});
//# sourceMappingURL=trainingController.js.map