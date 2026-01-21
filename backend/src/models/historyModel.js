import dbPromise from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const HistoryModel = {
    async create(historyData) {
        const db = await dbPromise;
        const { jobId, status, statusCode, response, duration } = historyData;
        const id = uuidv4();

        await db.run(
            `INSERT INTO execution_history (id, jobId, status, statusCode, response, duration) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [id, jobId, status, statusCode, typeof response === 'object' ? JSON.stringify(response) : response, duration]
        );

        return id;
    },

    async getRecent(limit = 50) {
        const db = await dbPromise;
        return db.all(
            `SELECT h.*, j.name as jobName 
       FROM execution_history h 
       JOIN jobs j ON h.jobId = j.id 
       ORDER BY h.executedAt DESC 
       LIMIT ?`,
            [limit]
        );
    },

    async getByJobId(jobId, limit = 20) {
        const db = await dbPromise;
        return db.all(
            `SELECT * FROM execution_history WHERE jobId = ? ORDER BY executedAt DESC LIMIT ?`,
            [jobId, limit]
        );
    }
};
