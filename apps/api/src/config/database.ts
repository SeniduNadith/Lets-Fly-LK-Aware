import mysql from 'mysql2/promise';
import { logger } from './logger';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  // Use the provisioned DB user by default; can be overridden via env vars
  user: process.env.DB_USER || 'dynamicbiz_user',
  password: process.env.DB_PASSWORD || '2003',
  database: process.env.DB_NAME || 'dynamicbiz_security',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // Add these options to handle connection issues
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Handle malformed packet issues
  supportBigNumbers: true,
  bigNumberStrings: true,
  // Connection retry settings
  retryDelay: 2000,
  maxRetries: 3
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ Database connection successful');
    connection.release();
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Get connection from pool
export const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    logger.error('Error getting database connection:', error);
    throw error;
  }
};

// Execute query with connection
export const executeQuery = async <T>(query: string, params: any[] = []): Promise<T> => {
  const connection = await getConnection();
  try {
    // Clean parameters to avoid undefined values
    const cleanParams = params.map(param => param === undefined ? null : param);
    const [rows] = await connection.execute(query, cleanParams);
    return rows as T;
  } catch (error) {
    logger.error('Database query error:', { query, params, error });
    throw error;
  } finally {
    connection.release();
  }
};

// Execute transaction
export const executeTransaction = async <T>(queries: Array<{ query: string; params: any[] }>): Promise<T[]> => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const results: T[] = [];
    
    for (const { query, params } of queries) {
      // Clean parameters to avoid undefined values
      const cleanParams = params.map(param => param === undefined ? null : param);
      const [rows] = await connection.execute(query, cleanParams);
      results.push(rows as T);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      logger.error('Error during rollback:', rollbackError);
    }
    logger.error('Transaction error:', { queries, error });
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;
