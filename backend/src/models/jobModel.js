import dbPromise from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const JobModel = {
    async findAll() {
        const db = await dbPromise;
        return db.all('SELECT * FROM jobs ORDER BY createdAt DESC');
    },

    async findById(id) {
        const db = await dbPromise;
        return db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    },

    async create(jobData) {
        const db = await dbPromise;
        const { name, url, method, headers, body, cronExpression } = jobData;
        const id = uuidv4();

        await db.run(
            `INSERT INTO jobs (id, name, url, method, headers, body, cronExpression) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                name,
                url,
                method || 'GET',
                headers ? JSON.stringify(headers) : '{}',
                body ? JSON.stringify(body) : '{}',
                cronExpression
            ]
        );

        return this.findById(id);
    },

    async update(id, jobData) {
        const db = await dbPromise;
        const { name, url, method, headers, body, cronExpression, status } = jobData;

        // Helper to handle undefined -> null for SQL COALESCE
        const v = (val) => val === undefined ? null : val;
        const jsonV = (val) => val === undefined ? null : JSON.stringify(val);

        await db.run(
            `UPDATE jobs SET 
        name = COALESCE(?, name),
        url = COALESCE(?, url),
        method = COALESCE(?, method),
        headers = COALESCE(?, headers),
        body = COALESCE(?, body),
        cronExpression = COALESCE(?, cronExpression),
        status = COALESCE(?, status)
       WHERE id = ?`,
            [
                v(name),
                v(url),
                v(method),
                jsonV(headers),
                jsonV(body),
                v(cronExpression),
                v(status),
                id
            ]
        );

        return this.findById(id);
    },

    async delete(id) {
        const db = await dbPromise;
        await db.run('DELETE FROM jobs WHERE id = ?', [id]);
    }
};
