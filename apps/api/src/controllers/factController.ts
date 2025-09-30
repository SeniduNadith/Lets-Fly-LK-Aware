import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import '../middleware/auth'; // Import to get the Request type extension

interface SecurityFact {
  id: number;
  title: string;
  content: string;
  category: string;
  role_id?: number;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Get all security facts
export const getFacts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category, role_id, priority, search } = req.query;
  const userId = req.user?.id;

  let query = `
    SELECT f.*, r.name as role_name
    FROM security_facts f
    LEFT JOIN roles r ON f.role_id = r.id
    WHERE f.is_active = TRUE
  `;
  
  const params: any[] = [];

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
    const facts = await executeQuery<SecurityFact[]>(query, params);
    
    logger.info(`Retrieved ${facts.length} security facts for user ${userId}`);
    
    res.json({
      success: true,
      data: facts,
      count: facts.length
    });
  } catch (error) {
    logger.error('Error retrieving security facts:', error);
    res.status(500).json({ error: 'Failed to retrieve security facts' });
  }
});

// Get random security fact
export const getRandomFact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category, role_id } = req.query;
  const userId = req.user?.id;

  let query = `
    SELECT f.*, r.name as role_name
    FROM security_facts f
    LEFT JOIN roles r ON f.role_id = r.id
    WHERE f.is_active = TRUE
  `;
  
  const params: any[] = [];

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
    const facts = await executeQuery<SecurityFact[]>(query, params);
    
    if (facts.length === 0) {
      res.status(404).json({ error: 'No security facts found' });
      return;
    }

    logger.info(`Random security fact retrieved for user ${userId}`);
    
    res.json({
      success: true,
      data: facts[0]
    });
  } catch (error) {
    logger.error('Error retrieving random security fact:', error);
    res.status(500).json({ error: 'Failed to retrieve random security fact' });
  }
});

// Get security fact by ID
export const getFactById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const facts = await executeQuery<SecurityFact[]>(`
      SELECT f.*, r.name as role_name
      FROM security_facts f
      LEFT JOIN roles r ON f.role_id = r.id
      WHERE f.id = ? AND f.is_active = TRUE
    `, [id]);

    if (facts.length === 0) {
      res.status(404).json({ error: 'Security fact not found' });
      return;
    }

    logger.info(`Security fact ${id} retrieved for user ${userId}`);
    
    res.json({
      success: true,
      data: facts[0]
    });
  } catch (error) {
    logger.error('Error retrieving security fact:', error);
    res.status(500).json({ error: 'Failed to retrieve security fact' });
  }
});

// Get facts by category
export const getFactsByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category } = req.params;
  const { role_id, limit = 10 } = req.query;
  const userId = req.user?.id;

  let query = `
    SELECT f.*, r.name as role_name
    FROM security_facts f
    LEFT JOIN roles r ON f.role_id = r.id
    WHERE f.category = ? AND f.is_active = TRUE
  `;
  
  const params: any[] = [category];

  if (role_id) {
    query += ' AND (f.role_id = ? OR f.role_id IS NULL)';
    params.push(role_id);
  }

  query += ' ORDER BY f.priority DESC, f.created_at DESC LIMIT ?';
  params.push(parseInt(limit as string));

  try {
    const facts = await executeQuery<SecurityFact[]>(query, params);
    
    logger.info(`Retrieved ${facts.length} security facts for category ${category} for user ${userId}`);
    
    res.json({
      success: true,
      data: facts,
      count: facts.length,
      category: category
    });
  } catch (error) {
    logger.error('Error retrieving security facts by category:', error);
    res.status(500).json({ error: 'Failed to retrieve security facts by category' });
  }
});

// Create new security fact (admin only)
export const createFact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, content, category, role_id, priority } = req.body;
  const createdBy = (req as any).user?.id;

  try {
    // Validate required fields
    if (!title || !content || !category) {
      res.status(400).json({ error: 'Title, content, and category are required' });
      return;
    }

    const result = await executeQuery<any>(`
      INSERT INTO security_facts (title, content, category, role_id, priority)
      VALUES (?, ?, ?, ?, ?)
    `, [title, content, category, role_id || 1, priority || 'medium']);

    logger.info(`Security fact created with ID ${result.insertId} by user ${createdBy}`);

    res.status(201).json({
      success: true,
      message: 'Security fact created successfully',
      fact_id: result.insertId
    });
  } catch (error) {
    logger.error('Error creating security fact:', error);
    res.status(500).json({ error: 'Failed to create security fact' });
  }
});

// Update security fact (admin only)
export const updateFact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, content, category, role_id, priority, is_active } = req.body;
  const updatedBy = (req as any).user?.id;

  try {
    // Check if fact exists
    const existingFacts = await executeQuery<SecurityFact[]>(`
      SELECT * FROM security_facts WHERE id = ?
    `, [id]);

    if (existingFacts.length === 0) {
      res.status(404).json({ error: 'Security fact not found' });
      return;
    }

    // Update fact
    await executeQuery(`
      UPDATE security_facts 
      SET title = ?, content = ?, category = ?, role_id = ?, priority = ?, 
          is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, content, category, role_id || 1, priority, is_active, id]);

    logger.info(`Security fact ${id} updated by user ${updatedBy}`);

    res.json({
      success: true,
      message: 'Security fact updated successfully'
    });
  } catch (error) {
    logger.error('Error updating security fact:', error);
    res.status(500).json({ error: 'Failed to update security fact' });
  }
});

// Delete security fact (admin only)
export const deleteFact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deletedBy = (req as any).user?.id;

  try {
    // Check if fact exists
    const existingFacts = await executeQuery<SecurityFact[]>(`
      SELECT * FROM security_facts WHERE id = ?
    `, [id]);

    if (existingFacts.length === 0) {
      res.status(404).json({ error: 'Security fact not found' });
      return;
    }

    // Soft delete by deactivating
    await executeQuery(`
      UPDATE security_facts 
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ?
    `, [id]);

    logger.info(`Security fact ${id} deleted by user ${deletedBy}`);

    res.json({
      success: true,
      message: 'Security fact deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting security fact:', error);
    res.status(500).json({ error: 'Failed to delete security fact' });
  }
});

// Get fact categories
export const getFactCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const categories = await executeQuery<any[]>(`
      SELECT category, COUNT(*) as count
      FROM security_facts
      WHERE is_active = TRUE
      GROUP BY category
      ORDER BY count DESC
    `);

    logger.info(`Fact categories retrieved for user ${userId}`);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error retrieving fact categories:', error);
    res.status(500).json({ error: 'Failed to retrieve fact categories' });
  }
});
