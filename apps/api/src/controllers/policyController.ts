import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import '../middleware/auth'; // Import to get the Request type extension

interface Policy {
  id: number;
  title: string;
  content: string;
  version: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'published' | 'archived';
  published_by?: number;
  published_at?: Date;
  effective_date?: Date;
  expiry_date?: Date;
  created_at: Date;
  updated_at: Date;
}

interface PolicyWithAcknowledgment extends Policy {
  acknowledged: boolean;
  acknowledged_at?: Date;
}

// Get all policies with optional filtering
export const getPolicies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
  
  const params: any[] = [userId];

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
    const policies = await executeQuery<PolicyWithAcknowledgment[]>(query, params);
    
    logger.info(`Retrieved ${policies.length} policies for user ${userId}`);
    
    res.json({
      success: true,
      data: policies,
      count: policies.length
    });
  } catch (error) {
    logger.error('Error retrieving policies:', error);
    res.status(500).json({ error: 'Failed to retrieve policies' });
  }
});

// Get policy by ID
export const getPolicyById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const policies = await executeQuery<PolicyWithAcknowledgment[]>(`
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
    
    logger.info(`Retrieved policy ${id} for user ${userId}`);
    
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Error retrieving policy:', error);
    res.status(500).json({ error: 'Failed to retrieve policy' });
  }
});

// Create new policy (admin only)
export const createPolicy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, content, version, category, priority, status, effective_date, expiry_date } = req.body;
  const publishedBy = (req as any).user?.id;

  // Validate required fields
  if (!title || !content || !category) {
    res.status(400).json({ error: 'Title, content, and category are required' });
    return;
  }

  try {
    const result = await executeQuery<any>(`
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

    const newPolicy = await executeQuery<Policy[]>(`
      SELECT * FROM policies WHERE id = ?
    `, [result.insertId]);

    logger.info(`Policy created with ID ${result.insertId} by user ${publishedBy}`);

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: newPolicy[0]
    });
  } catch (error) {
    logger.error('Error creating policy:', error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
});

// Update policy (admin only)
export const updatePolicy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, content, version, category, priority, status, effective_date, expiry_date } = req.body;
  const updatedBy = (req as any).user?.id;

  try {
    // Check if policy exists
    const existingPolicies = await executeQuery<Policy[]>(`
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
    const nextPriority = (priority ?? current.priority) as Policy['priority'];
    const nextStatus = (status ?? current.status) as Policy['status'];
    const nextEffective = effective_date ?? current.effective_date ?? null;
    const nextExpiry = expiry_date ?? current.expiry_date ?? null;

    // Update policy with safe fallbacks
    await executeQuery(`
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

    // Get updated policy
    const updatedPolicies = await executeQuery<Policy[]>(`
      SELECT * FROM policies WHERE id = ?
    `, [id]);

    logger.info(`Policy ${id} updated by user ${updatedBy}`);

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: updatedPolicies[0]
    });
  } catch (error) {
    logger.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

// Delete policy (soft delete by archiving)
export const deletePolicy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deletedBy = (req as any).user?.id;

  try {
    // Check if policy exists
    const existingPolicies = await executeQuery<Policy[]>(`
      SELECT * FROM policies WHERE id = ?
    `, [id]);

    if (existingPolicies.length === 0) {
      res.status(404).json({ error: 'Policy not found' });
      return;
    }

    // Soft delete by archiving
    await executeQuery(`
      UPDATE policies 
      SET status = 'archived', updated_at = NOW()
      WHERE id = ?
    `, [id]);

    logger.info(`Policy ${id} archived by user ${deletedBy}`);

    res.json({
      success: true,
      message: 'Policy archived successfully'
    });
  } catch (error) {
    logger.error('Error archiving policy:', error);
    res.status(500).json({ error: 'Failed to archive policy' });
  }
});

// Acknowledge policy
export const acknowledgePolicy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { ip_address, user_agent } = req.body;

  try {
    // Check if policy exists and is published
    const policies = await executeQuery<Policy[]>(`
      SELECT * FROM policies WHERE id = ? AND status = 'published'
    `, [id]);

    if (policies.length === 0) {
      res.status(404).json({ error: 'Policy not found or not published' });
      return;
    }

    // Check if already acknowledged
    const existingAcks = await executeQuery<any[]>(`
      SELECT * FROM policy_acknowledgments WHERE user_id = ? AND policy_id = ?
    `, [userId, id]);

    if (existingAcks.length > 0) {
      res.status(400).json({ error: 'Policy already acknowledged' });
      return;
    }

    // Create acknowledgment
    await executeQuery(`
      INSERT INTO policy_acknowledgments (user_id, policy_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `, [userId, id, ip_address, user_agent]);

    logger.info(`Policy ${id} acknowledged by user ${userId}`);

    res.json({
      success: true,
      message: 'Policy acknowledged successfully'
    });
  } catch (error) {
    logger.error('Error acknowledging policy:', error);
    res.status(500).json({ error: 'Failed to acknowledge policy' });
  }
});

// Get policy statistics
export const getPolicyStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    // Get total policies
    const totalResult = await executeQuery<any[]>(`
      SELECT COUNT(*) as total FROM policies WHERE status != 'archived'
    `);
    const total = totalResult[0].total;

    // Get acknowledged policies by user
    const acknowledgedResult = await executeQuery<any[]>(`
      SELECT COUNT(*) as acknowledged FROM policy_acknowledgments WHERE user_id = ?
    `, [userId]);
    const acknowledged = acknowledgedResult[0].acknowledged;

    // Get policies by category
    const categoryStats = await executeQuery<any[]>(`
      SELECT category, COUNT(*) as count 
      FROM policies 
      WHERE status != 'archived' 
      GROUP BY category
    `);

    // Get policies by priority
    const priorityStats = await executeQuery<any[]>(`
      SELECT priority, COUNT(*) as count 
      FROM policies 
      WHERE status != 'archived' 
      GROUP BY priority
    `);

    logger.info(`Policy stats retrieved for user ${userId}`);

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
  } catch (error) {
    logger.error('Error retrieving policy stats:', error);
    res.status(500).json({ error: 'Failed to retrieve policy statistics' });
  }
});
