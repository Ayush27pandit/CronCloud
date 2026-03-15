import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sseHandler } from './services/sseService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'CronCloud API is running' });
});

// SSE endpoint for real-time updates
app.get('/api/events', sseHandler);

import jobRoutes from './routes/jobRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/history', historyRoutes);


export default app;
