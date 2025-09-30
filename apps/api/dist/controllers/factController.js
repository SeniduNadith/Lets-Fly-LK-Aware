"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFactCategories = exports.deleteFact = exports.updateFact = exports.createFact = exports.getFactsByCategory = exports.getFactById = exports.getRandomFact = exports.getFacts = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
exports.getFacts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category, role_id, priority, search } = req.query;
    const userId = req.user?.id;
    let query = `
    SELECT f.*, r.name as role_name
    FROM security_facts f
    LEFT JOIN roles r ON f.role_id = r.id
    WHERE f.is_active = TRUE
  `;
    const params = [];
    if (category) {
        query += ' AND f.category = ?';
        params.push(category);
    }
    if (role_id) {
        query += ' AND (f.role_id = ? OR f.role_id IS NULL)';
        params.push(role_id);
    }
    if (priority) {
        query += ' AND f.priority = ?';
        params.push(priority);
    }
    if (search) {
        query += ' AND (f.title LIKE ? OR f.content LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }
    query += ' ORDER BY f.priority DESC, f.created_at DESC';
    try {
        const facts = await (0, database_1.executeQuery)(query, params);
        logger_1.logger.info(`Retrieved ${facts.length} security facts for user ${userId}`);
        res.json({
            success: true,
            data: facts,
            count: facts.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving security facts:', error);
        res.status(500).json({ error: 'Failed to retrieve security facts' });
    }
});
exports.getRandomFact = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category, role_id } = req.query;
    const userId = req.user?.id;
    let query = `
    SELECT f.*, r.name as role_name
    FROM security_facts f
    LEFT JOIN roles r ON f.role_id = r.id
    WHERE f.is_active = TRUE
  `;
    const params = [];
    if (category) {
        query += ' AND f.category = ?';
        params.push(category);
    }
    if (role_id) {
        query += ' AND (f.role_id = ? OR f.role_id IS NULL)';
        params.push(role_id);
    }
    query += ' ORDER BY RAND() LIMIT 1';
    try {
        const facts = await (0, database_1.executeQuery)(query, params);
        if (facts.length === 0) {
            res.status(404).json({ error: 'No security facts found' });
            return;
        }
        logger_1.logger.info(`Random security fact retrieved for user ${userId}`);
        res.json({
            success: true,
            data: facts[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving random security fact:', error);
        res.status(500).json({ error: 'Failed to retrieve random security fact' });
    }
});
exports.getFactById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const facts = await (0, database_1.executeQuery)(`
      SELECT f.*, r.name as role_name
      FROM security_facts f
      LEFT JOIN roles r ON f.role_id = r.id
      WHERE f.id = ? AND f.is_active = TRUE
    `, [id]);
        if (facts.length === 0) {
            res.status(404).json({ error: 'Security fact not found' });
            return;
        }
        logger_1.logger.info(`Security fact ${id} retrieved for user ${userId}`);
        res.json({
            success: true,
            data: facts[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving security fact:', error);
        res.status(500).json({ error: 'Failed to retrieve security fact' });
    }
});
exports.getFactsByCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category } = req.params;
    const { role_id, limit = 10 } = req.query;
    const userId = req.user?.id;
    let query = `
    SELECT f.*, r.name as role_name
    FROM security_facts f
    LEFT JOIN roles r ON f.role_id = r.id
    WHERE f.category = ? AND f.is_active = TRUE
  `;
    const params = [category];
    if (role_id) {
        query += ' AND (f.role_id = ? OR f.role_id IS NULL)';
        params.push(role_id);
    }
    query += ' ORDER BY f.priority DESC, f.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    try {
        const facts = await (0, database_1.executeQuery)(query, params);
        logger_1.logger.info(`Retrieved ${facts.length} security facts for category ${category} for user ${userId}`);
        res.json({
            success: true,
            data: facts,
            count: facts.length,
            category: category
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving security facts by category:', error);
        res.status(500).json({ error: 'Failed to retrieve security facts by category' });
    }
});
exports.createFact = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, content, category, role_id, priority } = req.body;
    const createdBy = req.user?.id;
    try {
        if (!title || !content || !category) {
            res.status(400).json({ error: 'Title, content, and category are required' });
            return;
        }
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO security_facts (title, content, category, role_id, priority)
      VALUES (?, ?, ?, ?, ?)
    `, [title, content, category, role_id || 1, priority || 'medium']);
        logger_1.logger.info(`Security fact created with ID ${result.insertId} by user ${createdBy}`);
        res.status(201).json({
            success: true,
            message: 'Security fact created successfully',
            fact_id: result.insertId
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating security fact:', error);
        res.status(500).json({ error: 'Failed to create security fact' });
    }
});
exports.updateFact = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, content, category, role_id, priority, is_active } = req.body;
    const updatedBy = req.user?.id;
    try {
        const existingFacts = await (0, database_1.executeQuery)(`
      SELECT * FROM security_facts WHERE id = ?
    `, [id]);
        if (existingFacts.length === 0) {
            res.status(404).json({ error: 'Security fact not found' });
            return;
        }
        await (0, database_1.executeQuery)(`
      UPDATE security_facts 
      SET title = ?, content = ?, category = ?, role_id = ?, priority = ?, 
          is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, content, category, role_id || 1, priority, is_active, id]);
        logger_1.logger.info(`Security fact ${id} updated by user ${updatedBy}`);
        res.json({
            success: true,
            message: 'Security fact updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating security fact:', error);
        res.status(500).json({ error: 'Failed to update security fact' });
    }
});
exports.deleteFact = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    try {
        const existingFacts = await (0, database_1.executeQuery)(`
      SELECT * FROM security_facts WHERE id = ?
    `, [id]);
        if (existingFacts.length === 0) {
            res.status(404).json({ error: 'Security fact not found' });
            return;
        }
        await (0, database_1.executeQuery)(`
      UPDATE security_facts 
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ?
    `, [id]);
        logger_1.logger.info(`Security fact ${id} deleted by user ${deletedBy}`);
        res.json({
            success: true,
            message: 'Security fact deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting security fact:', error);
        res.status(500).json({ error: 'Failed to delete security fact' });
    }
});
exports.getFactCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    try {
        const categories = await (0, database_1.executeQuery)(`
      SELECT category, COUNT(*) as count
      FROM security_facts
      WHERE is_active = TRUE
      GROUP BY category
      ORDER BY count DESC
    `);
        logger_1.logger.info(`Fact categories retrieved for user ${userId}`);
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving fact categories:', error);
        res.status(500).json({ error: 'Failed to retrieve fact categories' });
    }
});
//# sourceMappingURL=factController.js.map