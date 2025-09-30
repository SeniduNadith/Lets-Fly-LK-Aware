import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database';
import { logger } from '../config/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        department: string;
      };
    }
  }
}

// JWT token verification middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // In development, allow requests to pass if a dev user was injected upstream
    if (!token && (process.env.NODE_ENV || 'development') !== 'production' && req.user) {
      next();
      return;
    }

    // In development, if token exists but verification fails, fall back to injected user
    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      if ((process.env.NODE_ENV || 'development') !== 'production' && req.user) {
        next();
        return;
      }
      throw e;
    }
    
    // Get user details from database (simplified)
    const users = await executeQuery<any[]>(
      `SELECT id, username, email, department 
       FROM users 
       WHERE id = ? AND is_active = TRUE`,
      [decoded.userId]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'Invalid token or user not found' });
      return;
    }

    const user = users[0];
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      department: user.department
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      logger.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

// Simple authentication check (no role-based access control)
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

// MFA verification middleware
export const requireMFA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const users = await executeQuery<any[]>(
      'SELECT mfa_enabled FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = users[0];
    
    if (user.mfa_enabled) {
      // Check if MFA token is provided in headers
      const mfaToken = req.headers['x-mfa-token'];
      if (!mfaToken) {
        res.status(401).json({ error: 'MFA token required' });
        return;
      }
      
      // Here you would verify the MFA token
      // For now, we'll just check if it exists
      // In production, implement proper MFA verification
    }

    next();
  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
};

// Audit logging middleware
export const auditLog = (action: string, resourceType?: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    
    (res as any).send = function(data: any) {
      // Log the action after response is sent
      if (req.user) {
        executeQuery(
          'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            req.user.id,
            action,
            resourceType,
            req.params.id || null,
            JSON.stringify({
              method: req.method,
              path: req.path,
              body: req.body,
              query: req.query
            }),
            req.ip,
            req.get('User-Agent')
          ]
        ).catch(error => {
          logger.error('Audit logging failed:', error);
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};
