import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import '../middleware/auth'; // Import to get the Request type extension

interface JWTPayload {
  userId: number;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  mfaToken?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
  department: string;
}

// User login
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, password, mfaToken }: LoginRequest = req.body;

  // Validate input
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    // Get user information (simplified - no role join)
    const users = await executeQuery<any[]>(
      `SELECT * FROM users 
       WHERE username = ? AND is_active = TRUE`,
      [username]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = users[0];

    // Resolve role name from role_id to support frontend navigation
    let roleName = 'enduser';
    try {
      const roles = await executeQuery<any[]>(
        'SELECT name FROM roles WHERE id = ? LIMIT 1',
        [user.role_id]
      );
      if (roles.length > 0 && roles[0].name) {
        roleName = roles[0].name;
      }
    } catch (e) {
      // If roles table not present, fallback silently
      logger.warn('Roles lookup failed or table missing; defaulting role to enduser');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // MFA is disabled in simplified auth

    // Update last login
    await executeQuery(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    try {
      // Generate JWT token
      // Use a default development secret if none is configured
      const secret = process.env.JWT_SECRET || 'dev-secret';

      const payload: JWTPayload = {
        userId: user.id, 
        username: user.username
      };

      const token = jwt.sign(payload, secret, { expiresIn: '24h' });

      // Don't send password hash back
      const { password_hash, ...userData } = user;

      // Ensure we're sending valid JSON
      const response = {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          department: user.department || '',
          role: roleName,
          role_id: user.role_id,
          mfa_enabled: user.mfa_enabled || false,
          is_active: user.is_active,
          last_login: user.last_login,
          created_at: user.created_at
        }
      };

      logger.info(`User ${user.username} logged in successfully`);
      res.json(response);
      
    } catch (error) {
      logger.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
      res.status(500).json({ 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    logger.error('Login outer error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User registration (simplified)
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, first_name, last_name, role_id, department }: RegisterRequest = req.body;

  // Validate input
  if (!username || !email || !password || !first_name || !last_name || !role_id || !department) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  // Validate password strength
  if (password.length < 12) {
    res.status(400).json({ error: 'Password must be at least 12 characters long' });
    return;
  }

  try {
    // Check if user already exists
    const existingUsers = await executeQuery<any[]>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (use provided role_id and department)
    const result = await executeQuery<any>(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, department) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, passwordHash, first_name, last_name, role_id, department]
    );

    // Get the created user (simplified)
    const newUser = await executeQuery<any[]>(
      `SELECT * FROM users WHERE id = ?`,
      [result.insertId]
    );

    logger.info(`User ${username} registered successfully by admin`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        first_name: newUser[0].first_name,
        last_name: newUser[0].last_name,
        department: newUser[0].department
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const users = await executeQuery<any[]>(
      `SELECT * FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = users[0];

    // Get role name
    let roleName = 'enduser';
    try {
      const roles = await executeQuery<any[]>(
        'SELECT name FROM roles WHERE id = ? LIMIT 1',
        [user.role_id]
      );
      if (roles.length > 0 && roles[0].name) {
        roleName = roles[0].name;
      }
    } catch (e) {
      logger.warn('Roles lookup failed in getProfile');
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department,
        role: roleName,
        role_id: user.role_id,
        mfa_enabled: user.mfa_enabled,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const { first_name, last_name, email } = req.body;

  try {
    // Update user profile
    await executeQuery(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, email, req.user.id]
    );

    logger.info(`User ${req.user.username} updated their profile`);

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new password are required' });
    return;
  }

  if (newPassword.length < 12) {
    res.status(400).json({ error: 'New password must be at least 12 characters long' });
    return;
  }

  try {
    // Get current password hash
    const users = await executeQuery<any[]>(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await executeQuery(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    logger.info(`User ${req.user.username} changed their password`);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout (client-side token removal)
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  logger.info(`User ${req.user.username} logged out`);

  res.json({ message: 'Logout successful' });
});
