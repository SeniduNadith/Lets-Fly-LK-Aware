import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import '../middleware/auth'; // Import to get the Request type extension
import bcrypt from 'bcryptjs';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  department: string;
  is_active: boolean;
  mfa_enabled: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

// Get user profile
export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const users = await executeQuery<UserProfile[]>(`
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

    // Remove sensitive information
    delete (user as any).password_hash;

    logger.info(`Profile retrieved for user ${userId}`);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error retrieving user profile:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { first_name, last_name, email, department } = req.body;

  try {
    // Check if email is already taken by another user
    if (email) {
      const existingUsers = await executeQuery<any[]>(`
        SELECT id FROM users WHERE email = ? AND id != ?
      `, [email, userId]);

      if (existingUsers.length > 0) {
        res.status(400).json({ error: 'Email already taken by another user' });
        return;
      }
    }

    // Update profile
    await executeQuery(`
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, department = ?, updated_at = NOW()
      WHERE id = ?
    `, [first_name, last_name, email, department, userId]);

    logger.info(`Profile updated for user ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { current_password, new_password } = req.body;

  try {
    // Validate required fields
    if (!current_password || !new_password) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    // Get current password hash
    const users = await executeQuery<any[]>(`
      SELECT password_hash FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await executeQuery(`
      UPDATE users 
      SET password_hash = ?, updated_at = NOW()
      WHERE id = ?
    `, [newPasswordHash, userId]);

    logger.info(`Password changed for user ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user preferences
export const getPreferences = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    // For now, return default preferences
    // In a real application, you might have a separate preferences table
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

    logger.info(`Preferences retrieved for user ${userId}`);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    logger.error('Error retrieving user preferences:', error);
    res.status(500).json({ error: 'Failed to retrieve user preferences' });
  }
});

// Update user preferences
export const updatePreferences = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const preferences = req.body;

  try {
    // Validate preferences structure
    if (!preferences || typeof preferences !== 'object') {
      res.status(400).json({ error: 'Invalid preferences format' });
      return;
    }

    // In a real application, you would save these to a preferences table
    // For now, just return success
    logger.info(`Preferences updated for user ${userId}`);

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Get user activity history
export const getActivityHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const activities = await executeQuery<any[]>(`
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
    `, [userId, userId, userId, userId, userId, parseInt(limit as string), parseInt(offset as string)]);

    // Get total count for pagination
    const totalCount = await executeQuery<any[]>(`
      SELECT 
        (SELECT COUNT(*) FROM policy_acknowledgments WHERE user_id = ?) +
        (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND completed_at IS NOT NULL) +
        (SELECT COUNT(*) FROM game_attempts WHERE user_id = ? AND completed_at IS NOT NULL) +
        (SELECT COUNT(*) FROM training_progress WHERE user_id = ? AND status = 'completed') +
        (SELECT CASE WHEN last_login IS NOT NULL THEN 1 ELSE 0 END FROM users WHERE id = ?) as total
    `, [userId, userId, userId, userId, userId]);

    logger.info(`Activity history retrieved for user ${userId}`);

    res.json({
      success: true,
      data: {
        activities: activities,
        total: totalCount[0].total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    logger.error('Error retrieving user activity history:', error);
    res.status(500).json({ error: 'Failed to retrieve user activity history' });
  }
});

// Toggle MFA
export const toggleMFA = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { enable, secret } = req.body;

  try {
    if (enable && !secret) {
      res.status(400).json({ error: 'MFA secret is required when enabling MFA' });
      return;
    }

    // Update MFA status
    await executeQuery(`
      UPDATE users 
      SET mfa_enabled = ?, mfa_secret = ?, updated_at = NOW()
      WHERE id = ?
    `, [enable, enable ? secret : null, userId]);

    logger.info(`MFA ${enable ? 'enabled' : 'disabled'} for user ${userId}`);

    res.json({
      success: true,
      message: `MFA ${enable ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling MFA:', error);
    res.status(500).json({ error: 'Failed to toggle MFA' });
  }
});

// Get user statistics
export const getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    // Get various statistics
    const policyStats = await executeQuery<any[]>(`
      SELECT 
        COUNT(*) as total_policies,
        COUNT(pa.id) as acknowledged_policies
      FROM policies p
      LEFT JOIN policy_acknowledgments pa ON p.id = pa.policy_id AND pa.user_id = ?
      WHERE p.status != 'archived'
    `, [userId]);

    const quizStats = await executeQuery<any[]>(`
      SELECT 
        COUNT(DISTINCT qa.quiz_id) as total_quizzes,
        COUNT(*) as total_attempts,
        AVG(qa.score / qa.max_score * 100) as avg_score,
        COUNT(CASE WHEN qa.passed THEN 1 END) as passed_attempts
      FROM quiz_attempts qa
      WHERE qa.user_id = ? AND qa.completed_at IS NOT NULL
    `, [userId]);

    const gameStats = await executeQuery<any[]>(`
      SELECT 
        COUNT(DISTINCT ga.game_id) as total_games,
        COUNT(*) as total_attempts,
        AVG(ga.score / ga.max_score * 100) as avg_score,
        AVG(ga.time_taken) as avg_time
      FROM game_attempts ga
      WHERE ga.user_id = ? AND ga.completed_at IS NOT NULL
    `, [userId]);

    const trainingStats = await executeQuery<any[]>(`
      SELECT 
        COUNT(*) as total_modules,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_modules,
        SUM(time_spent) as total_time_spent
      FROM training_progress
      WHERE user_id = ?
    `, [userId]);

    logger.info(`User statistics retrieved for user ${userId}`);

    res.json({
      success: true,
      data: {
        policies: policyStats[0],
        quizzes: quizStats[0],
        games: gameStats[0],
        training: trainingStats[0]
      }
    });
  } catch (error) {
    logger.error('Error retrieving user statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve user statistics' });
  }
});
