import { HistoryModel } from '../models/historyModel.js';
import { JobModel } from '../models/jobModel.js';

export const executeJob = async (job) => {
    const startTime = Date.now();
    console.log(`[Executor] Running job: ${job.name} (${job.id})`);

    try {
        const response = await fetch(job.url, {
            method: job.method || 'GET',
            headers: job.headers ? (typeof job.headers === 'string' ? JSON.parse(job.headers) : job.headers) : {},
            body: job.method !== 'GET' && job.body ? (typeof job.body === 'string' ? job.body : JSON.stringify(job.body)) : undefined
        });

        const duration = Date.now() - startTime;
        const responseData = await response.text();

        // Log success
        await HistoryModel.create({
            jobId: job.id,
            status: response.ok ? 'success' : 'failed',
            statusCode: response.status,
            response: responseData.substring(0, 1000), // Truncate large responses
            duration
        });

        // Update job last execution time
        await JobModel.update(job.id, {
            lastExecution: new Date().toISOString()
            // We could calculate nextExecution here if needed, but node-cron handles the timing
        });

        console.log(`[Executor] Job ${job.name} finished. Status: ${response.status}`);

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Executor] Job ${job.name} failed:`, error.message);

        // Log failure
        await HistoryModel.create({
            jobId: job.id,
            status: 'failed',
            statusCode: 0,
            response: error.message,
            duration
        });
    }
};
