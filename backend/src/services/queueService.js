import { Queue, Worker } from 'bullmq';

const connection = {
    host: '127.0.0.1',
    port: 6379
};

export const jobQueue = new Queue('cron-jobs', { 
    connection 
});

export const createJobWorker = (processor) => {
    return new Worker('cron-jobs', processor, { connection });
};

export const addJobToQueue = async (jobData) => {
    await jobQueue.add('execute', jobData, {
        jobId: jobData.id
    });
    console.log(`[Queue] Job added: ${jobData.name}`);
};

export const closeQueue = async () => {
    await jobQueue.close();
};

export { connection };
