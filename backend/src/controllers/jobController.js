import { JobModel } from '../models/jobModel.js';
import cron from 'node-cron';
import { scheduler } from '../services/scheduler.js';

// Basic validation helper
const validateJob = (data) => {
    const { name, url, cronExpression } = data;
    if (!name || !url || !cronExpression) {
        return 'Name, URL, and Cron Expression are required';
    }
    if (!cron.validate(cronExpression)) {
        return 'Invalid cron expression';
    }
    return null;
};

export const getJobs = async (req, res) => {
    try {
        const jobs = await JobModel.findAll();
        // Parse JSON strings back to objects
        const parsedJobs = jobs.map(job => ({
            ...job,
            headers: job.headers ? JSON.parse(job.headers) : {},
            body: job.body ? JSON.parse(job.body) : {}
        }));
        res.json(parsedJobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getJobById = async (req, res) => {
    try {
        const job = await JobModel.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        job.headers = job.headers ? JSON.parse(job.headers) : {};
        job.body = job.body ? JSON.parse(job.body) : {};

        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createJob = async (req, res) => {
    try {
        const error = validateJob(req.body);
        if (error) return res.status(400).json({ error });

        const job = await JobModel.create(req.body);

        // Schedule the new job immediately
        if (job.status === 'active') {
            scheduler.schedule(job);
        }

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        // Optional: Validate if cron is updated
        if (req.body.cronExpression && !cron.validate(req.body.cronExpression)) {
            return res.status(400).json({ error: 'Invalid cron expression' });
        }

        const job = await JobModel.update(req.params.id, req.body);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Update scheduler
        if (job.status === 'active') {
            scheduler.schedule(job);
        } else {
            scheduler.stop(job.id);
        }

        job.headers = job.headers ? JSON.parse(job.headers) : {};
        job.body = job.body ? JSON.parse(job.body) : {};

        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        await JobModel.delete(req.params.id);
        // Remove from scheduler
        scheduler.stop(req.params.id);

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleJob = async (req, res) => {
    try {
        const job = await JobModel.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const newStatus = job.status === 'active' ? 'paused' : 'active';
        const updatedJob = await JobModel.update(req.params.id, { status: newStatus });

        if (newStatus === 'active') {
            scheduler.schedule(updatedJob);
        } else {
            scheduler.stop(updatedJob.id);
        }

        updatedJob.headers = updatedJob.headers ? JSON.parse(updatedJob.headers) : {};
        updatedJob.body = updatedJob.body ? JSON.parse(updatedJob.body) : {};

        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
