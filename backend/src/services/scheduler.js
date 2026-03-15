import cron from 'node-cron';
import { JobModel } from '../models/jobModel.js';
import { addJobToQueue } from './queueService.js';

// In-memory store for active cron tasks
const tasks = new Map();

export const scheduler = {
    // Initialize all active jobs from DB
    async init() {
        console.log('[Scheduler] Initializing...');
        const jobs = await JobModel.findAll();
        let count = 0;

        for (const job of jobs) {
            if (job.status === 'active') {
                this.schedule(job);
                count++;
            }
        }
        console.log(`[Scheduler] Started with ${count} active jobs.`);
    },

    // Schedule a single job
    schedule(job) {
        // If job already exists, stop it first (re-scheduling case)
        if (tasks.has(job.id)) {
            this.stop(job.id);
        }

        try {
            if (!cron.validate(job.cronExpression)) {
                console.error(`[Scheduler] Invalid cron for job ${job.name}: ${job.cronExpression}`);
                return;
            }

            const task = cron.schedule(job.cronExpression, () => {
                addJobToQueue(job);
            });

            tasks.set(job.id, task);
            console.log(`[Scheduler] Scheduled: ${job.name} [${job.cronExpression}]`);
        } catch (err) {
            console.error(`[Scheduler] Failed to schedule ${job.name}:`, err);
        }
    },

    // Stop a job (remove from scheduler)
    stop(jobId) {
        const task = tasks.get(jobId);
        if (task) {
            task.stop();
            tasks.delete(jobId);
            console.log(`[Scheduler] Stopped job: ${jobId}`);
        }
    }
};
