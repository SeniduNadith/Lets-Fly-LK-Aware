"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = exports.requireMFA = exports.requireAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token && (process.env.NODE_ENV || 'development') !== 'production' && req.user) {
            next();
            return;
        }
        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.logger.error('JWT_SECRET not configured');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, secret);
        }
        catch (e) {
            if ((process.env.NODE_ENV || 'development') !== 'production' && req.user) {
                next();
                return;
            }
            throw e;
        }
        const users = await (0, database_1.executeQuery)(`SELECT id, username, email, department 
       FROM users 
       WHERE id = ? AND is_active = TRUE`, [decoded.userId]);
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(403).json({ error: 'Invalid token' });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
        }
        else {
            logger_1.logger.error('Authentication error:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    }
};
exports.authenticateToken = authenticateToken;
const requireAuth = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    next();
};
exports.requireAuth = requireAuth;
const requireMFA = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const users = await (0, database_1.executeQuery)('SELECT mfa_enabled FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        const user = users[0];
        if (user.mfa_enabled) {
            const mfaToken = req.headers['x-mfa-token'];
            if (!mfaToken) {
                res.status(401).json({ error: 'MFA token required' });
                return;
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('MFA verification error:', error);
        res.status(500).json({ error: 'MFA verification failed' });
    }
};
exports.requireMFA = requireMFA;
const auditLog = (action, resourceType) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            if (req.user) {
                (0, database_1.executeQuery)('INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)', [
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
                ]).catch(error => {
                    logger_1.logger.error('Audit logging failed:', error);
                });
            }
            originalSend.call(this, data);
        };
        next();
    };
};
exports.auditLog = auditLog;
//# sourceMappingURL=auth.js.map