import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const testConnection: () => Promise<void>;
export declare const getConnection: () => Promise<mysql.PoolConnection>;
export declare const executeQuery: <T>(query: string, params?: any[]) => Promise<T>;
export declare const executeTransaction: <T>(queries: Array<{
    query: string;
    params: any[];
}>) => Promise<T[]>;
export default pool;
//# sourceMappingURL=database.d.ts.map