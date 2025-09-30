"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username, password, mfaToken } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    try {
        const users = await (0, database_1.executeQuery)(`SELECT * FROM users 
       WHERE username = ? AND is_active = TRUE`, [username]);
        if (users.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const user = users[0];
        let roleName = 'enduser';
        try {
            const roles = await (0, database_1.executeQuery)('SELECT name FROM roles WHERE id = ? LIMIT 1', [user.role_id]);
            if (roles.length > 0 && roles[0].name) {
                roleName = roles[0].name;
            }
        }
        catch (e) {
            logger_1.logger.warn('Roles lookup failed or table missing; defaulting role to enduser');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        await (0, database_1.executeQuery)('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        try {
            const secret = process.env.JWT_SECRET || 'dev-secret';
            const payload = {
                userId: user.id,
                username: user.username
            };
            const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '24h' });
            const { password_hash, ...userData } = user;
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
            logger_1.logger.info(`User ${user.username} logged in successfully`);
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
            res.status(500).json({
                error: 'Login failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Login outer error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { username, email, password, first_name, last_name, role_id, department } = req.body;
    if (!username || !email || !password || !first_name || !last_name || !role_id || !department) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    if (password.length < 12) {
        res.status(400).json({ error: 'Password must be at least 12 characters long' });
        return;
    }
    try {
        const existingUsers = await (0, database_1.executeQuery)('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUsers.length > 0) {
            res.status(409).json({ error: 'Username or email already exists' });
            return;
        }
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        const result = await (0, database_1.executeQuery)(`INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, department) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [username, email, passwordHash, first_name, last_name, role_id, department]);
        const newUser = await (0, database_1.executeQuery)(`SELECT * FROM users WHERE id = ?`, [result.insertId]);
        logger_1.logger.info(`User ${username} registered successfully by admin`);
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
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        const users = await (0, database_1.executeQuery)(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const user = users[0];
        let roleName = 'enduser';
        try {
            const roles = await (0, database_1.executeQuery)('SELECT name FROM roles WHERE id = ? LIMIT 1', [user.role_id]);
            if (roles.length > 0 && roles[0].name) {
                roleName = roles[0].name;
            }
        }
        catch (e) {
            logger_1.logger.warn('Roles lookup failed in getProfile');
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
    }
    catch (error) {
        logger_1.logger.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const { first_name, last_name, email } = req.body;
    try {
        await (0, database_1.executeQuery)('UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = NOW() WHERE id = ?', [first_name, last_name, email, req.user.id]);
        logger_1.logger.info(`User ${req.user.username} updated their profile`);
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        logger_1.logger.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
        const users = await (0, database_1.executeQuery)('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, users[0].password_hash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
        await (0, database_1.executeQuery)('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newPasswordHash, req.user.id]);
        logger_1.logger.info(`User ${req.user.username} changed their password`);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        logger_1.logger.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    logger_1.logger.info(`User ${req.user.username} logged out`);
    res.json({ message: 'Logout successful' });
});
//# sourceMappingURL=authController.js.map