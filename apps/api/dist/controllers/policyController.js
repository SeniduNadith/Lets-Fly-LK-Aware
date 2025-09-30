"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicyStats = exports.acknowledgePolicy = exports.deletePolicy = exports.updatePolicy = exports.createPolicy = exports.getPolicyById = exports.getPolicies = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
exports.getPolicies = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category, status, priority, search } = req.query;
    const userId = req.user?.id;
    let query = `
    SELECT p.*, 
           u.username as published_by_username,
           CASE WHEN pa.user_id IS NOT NULL THEN TRUE ELSE FALSE END as acknowledged,
           pa.acknowledged_at
    FROM policies p
    LEFT JOIN users u ON p.published_by = u.id
    LEFT JOIN policy_acknowledgments pa ON p.id = pa.policy_id AND pa.user_id = ?
    WHERE p.status != 'archived'
  `;
    const params = [userId];
    if (category) {
        query += ' AND p.category = ?';
        params.push(category);
    }
    if (status) {
        query += ' AND p.status = ?';
        params.push(status);
    }
    if (priority) {
        query += ' AND p.priority = ?';
        params.push(priority);
    }
    if (search) {
        query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }
    query += ' ORDER BY p.priority DESC, p.created_at DESC';
    try {
        const policies = await (0, database_1.executeQuery)(query, params);
        logger_1.logger.info(`Retrieved ${policies.length} policies for user ${userId}`);
        res.json({
            success: true,
            data: policies,
            count: policies.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving policies:', error);
        res.status(500).json({ error: 'Failed to retrieve policies' });
    }
});
exports.getPolicyById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const policies = await (0, database_1.executeQuery)(`
      SELECT p.*, 
             u.username as published_by_username,
             CASE WHEN pa.user_id IS NOT NULL THEN TRUE ELSE FALSE END as acknowledged,
             pa.acknowledged_at
      FROM policies p
      LEFT JOIN users u ON p.published_by = u.id
      LEFT JOIN policy_acknowledgments pa ON p.id = pa.policy_id AND pa.user_id = ?
      WHERE p.id = ? AND p.status != 'archived'
    `, [userId, id]);
        if (policies.length === 0) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        const policy = policies[0];
        logger_1.logger.info(`Retrieved policy ${id} for user ${userId}`);
        res.json({
            success: true,
            data: policy
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving policy:', error);
        res.status(500).json({ error: 'Failed to retrieve policy' });
    }
});
exports.createPolicy = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, content, version, category, priority, status, effective_date, expiry_date } = req.body;
    const publishedBy = req.user?.id;
    if (!title || !content || !category) {
        res.status(400).json({ error: 'Title, content, and category are required' });
        return;
    }
    try {
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO policies (title, content, version, category, priority, status, published_by, published_at, effective_date, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `, [
            title,
            content,
            version || '1.0',
            category,
            priority || 'medium',
            status || 'draft',
            publishedBy || 1,
            effective_date || null,
            expiry_date || null
        ]);
        const newPolicy = await (0, database_1.executeQuery)(`
      SELECT * FROM policies WHERE id = ?
    `, [result.insertId]);
        logger_1.logger.info(`Policy created with ID ${result.insertId} by user ${publishedBy}`);
        res.status(201).json({
            success: true,
            message: 'Policy created successfully',
            data: newPolicy[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating policy:', error);
        res.status(500).json({ error: 'Failed to create policy' });
    }
});
exports.updatePolicy = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, content, version, category, priority, status, effective_date, expiry_date } = req.body;
    const updatedBy = req.user?.id;
    try {
        const existingPolicies = await (0, database_1.executeQuery)(`
      SELECT * FROM policies WHERE id = ?
    `, [id]);
        if (existingPolicies.length === 0) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        const current = existingPolicies[0];
        const nextTitle = title ?? current.title;
        const nextContent = content ?? current.content;
        const nextVersion = version ?? current.version;
        const nextCategory = category ?? current.category;
        const nextPriority = (priority ?? current.priority);
        const nextStatus = (status ?? current.status);
        const nextEffective = effective_date ?? current.effective_date ?? null;
        const nextExpiry = expiry_date ?? current.expiry_date ?? null;
        await (0, database_1.executeQuery)(`
      UPDATE policies 
      SET title = ?, content = ?, version = ?, category = ?, priority = ?, status = ?, 
          effective_date = ?, expiry_date = ?, updated_at = NOW(), published_by = COALESCE(published_by, ?), published_at = COALESCE(published_at, NOW())
      WHERE id = ?
    `, [
            nextTitle,
            nextContent,
            nextVersion,
            nextCategory,
            nextPriority,
            nextStatus,
            nextEffective,
            nextExpiry,
            updatedBy || current.published_by || null,
            id
        ]);
        const updatedPolicies = await (0, database_1.executeQuery)(`
      SELECT * FROM policies WHERE id = ?
    `, [id]);
        logger_1.logger.info(`Policy ${id} updated by user ${updatedBy}`);
        res.json({
            success: true,
            message: 'Policy updated successfully',
            data: updatedPolicies[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating policy:', error);
        res.status(500).json({ error: 'Failed to update policy' });
    }
});
exports.deletePolicy = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    try {
        const existingPolicies = await (0, database_1.executeQuery)(`
      SELECT * FROM policies WHERE id = ?
    `, [id]);
        if (existingPolicies.length === 0) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        await (0, database_1.executeQuery)(`
      UPDATE policies 
      SET status = 'archived', updated_at = NOW()
      WHERE id = ?
    `, [id]);
        logger_1.logger.info(`Policy ${id} archived by user ${deletedBy}`);
        res.json({
            success: true,
            message: 'Policy archived successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error archiving policy:', error);
        res.status(500).json({ error: 'Failed to archive policy' });
    }
});
exports.acknowledgePolicy = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { ip_address, user_agent } = req.body;
    try {
        const policies = await (0, database_1.executeQuery)(`
      SELECT * FROM policies WHERE id = ? AND status = 'published'
    `, [id]);
        if (policies.length === 0) {
            res.status(404).json({ error: 'Policy not found or not published' });
            return;
        }
        const existingAcks = await (0, database_1.executeQuery)(`
      SELECT * FROM policy_acknowledgments WHERE user_id = ? AND policy_id = ?
    `, [userId, id]);
        if (existingAcks.length > 0) {
            res.status(400).json({ error: 'Policy already acknowledged' });
            return;
        }
        await (0, database_1.executeQuery)(`
      INSERT INTO policy_acknowledgments (user_id, policy_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `, [userId, id, ip_address, user_agent]);
        logger_1.logger.info(`Policy ${id} acknowledged by user ${userId}`);
        res.json({
            success: true,
            message: 'Policy acknowledged successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error acknowledging policy:', error);
        res.status(500).json({ error: 'Failed to acknowledge policy' });
    }
});
exports.getPolicyStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    try {
        const totalResult = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as total FROM policies WHERE status != 'archived'
    `);
        const total = totalResult[0].total;
        const acknowledgedResult = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as acknowledged FROM policy_acknowledgments WHERE user_id = ?
    `, [userId]);
        const acknowledged = acknowledgedResult[0].acknowledged;
        const categoryStats = await (0, database_1.executeQuery)(`
      SELECT category, COUNT(*) as count 
      FROM policies 
      WHERE status != 'archived' 
      GROUP BY category
    `);
        const priorityStats = await (0, database_1.executeQuery)(`
      SELECT priority, COUNT(*) as count 
      FROM policies 
      WHERE status != 'archived' 
      GROUP BY priority
    `);
        logger_1.logger.info(`Policy stats retrieved for user ${userId}`);
        res.json({
            success: true,
            data: {
                total,
                acknowledged,
                pending: total - acknowledged,
                byCategory: categoryStats,
                byPriority: priorityStats
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving policy stats:', error);
        res.status(500).json({ error: 'Failed to retrieve policy statistics' });
    }
});
//# sourceMappingURL=policyController.js.map