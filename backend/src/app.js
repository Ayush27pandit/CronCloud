import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'CronCloud API is running' });
});

import jobRoutes from './routes/jobRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/history', historyRoutes);


export default app;
