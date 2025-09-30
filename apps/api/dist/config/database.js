"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTransaction = exports.executeQuery = exports.getConnection = exports.testConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const logger_1 = require("./logger");
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'dynamicbiz_user',
    password: process.env.DB_PASSWORD || '2003',
    database: process.env.DB_NAME || 'dynamicbiz_security',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4',
    timezone: '+00:00',
    supportBigNumbers: true,
    bigNumberStrings: true,
    retryDelay: 2000,
    maxRetries: 3
};
const pool = promise_1.default.createPool(dbConfig);
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        logger_1.logger.info('✅ Database connection successful');
        connection.release();
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
const getConnection = async () => {
    try {
        return await pool.getConnection();
    }
    catch (error) {
        logger_1.logger.error('Error getting database connection:', error);
        throw error;
    }
};
exports.getConnection = getConnection;
const executeQuery = async (query, params = []) => {
    const connection = await (0, exports.getConnection)();
    try {
        const cleanParams = params.map(param => param === undefined ? null : param);
        const [rows] = await connection.execute(query, cleanParams);
        return rows;
    }
    catch (error) {
        logger_1.logger.error('Database query error:', { query, params, error });
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.executeQuery = executeQuery;
const executeTransaction = async (queries) => {
    const connection = await (0, exports.getConnection)();
    try {
        await connection.beginTransaction();
        const results = [];
        for (const { query, params } of queries) {
            const cleanParams = params.map(param => param === undefined ? null : param);
            const [rows] = await connection.execute(query, cleanParams);
            results.push(rows);
        }
        await connection.commit();
        return results;
    }
    catch (error) {
        try {
            await connection.rollback();
        }
        catch (rollbackError) {
            logger_1.logger.error('Error during rollback:', rollbackError);
        }
        logger_1.logger.error('Transaction error:', { queries, error });
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.executeTransaction = executeTransaction;
exports.default = pool;
//# sourceMappingURL=database.js.map