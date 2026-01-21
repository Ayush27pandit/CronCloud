import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

let dbPromiseInstance = null;

const init = async () => {
    if (isPostgres) {
        console.log('Using PostgreSQL');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        // Wrapper to match sqlite API
        return {
            all: async (sql, params = []) => {
                const convertedSql = convertSql(sql);
                const res = await pool.query(convertedSql, params);
                return res.rows;
            },
            get: async (sql, params = []) => {
                const convertedSql = convertSql(sql);
                const res = await pool.query(convertedSql, params);
                return res.rows[0];
            },
            run: async (sql, params = []) => {
                const convertedSql = convertSql(sql);
                const res = await pool.query(convertedSql, params);
                return { changes: res.rowCount };
            },
            exec: async (sql) => {
                await pool.query(sql);
            }
        };
    } else {
        console.log('Using SQLite');
        return open({
            filename: path.join(__dirname, '../../dev.db'),
            driver: sqlite3.Database
        });
    }
};

function convertSql(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => '$' + (++i));
}

// Singleton promise
if (!dbPromiseInstance) {
    dbPromiseInstance = init();
}

export default dbPromiseInstance;
