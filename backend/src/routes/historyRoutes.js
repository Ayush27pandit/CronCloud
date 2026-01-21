import express from 'express';
import { HistoryModel } from '../models/historyModel.js';

const router = express.Router();

// Get recent history
router.get('/', async (req, res) => {
    try {
        const history = await HistoryModel.getRecent();
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get history for a specific job
router.get('/:jobId', async (req, res) => {
    try {
        const history = await HistoryModel.getByJobId(req.params.jobId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
