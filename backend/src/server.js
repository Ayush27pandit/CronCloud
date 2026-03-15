import app from './app.js';
import { initDb } from './models/schema.js';
import { scheduler } from './services/scheduler.js';
import { createJobWorker } from './services/queueService.js';
import { processJob } from './services/jobExecutor.js';

const PORT = process.env.PORT || 5000;

// Start BullMQ worker
const worker = createJobWorker(processJob);
worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed:`, err.message);
});

// Initialize Database then start server
initDb().then(async () => {
    // Start the scheduler
    await scheduler.init();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
