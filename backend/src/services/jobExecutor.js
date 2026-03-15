import { HistoryModel } from '../models/historyModel.js';
import { JobModel } from '../models/jobModel.js';
import { emit } from './sseService.js';
import { signPayload } from '../utils/webhookAuth.js';

const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
};

const circuitBreaker = new Map();

const getBackoffDelay = (attempt) => {
    const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, RETRY_CONFIG.maxDelay);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const executeJob = async (job, isRetry = false) => {
    const startTime = Date.now();
    console.log(`[Executor] Running job: ${job.name} (${job.id})`);
    console.log(`[Executor] Job body:`, job.body);

    // Check circuit breaker
    const circuit = circuitBreaker.get(job.id);
    if (circuit && circuit.failures >= 2) {
        console.log(`[Executor] Circuit open for job ${job.name}. Skipping execution.`);
        return;
    }

    const headers = job.headers ? (typeof job.headers === 'string' ? JSON.parse(job.headers) : job.headers) : {};
    
    let requestBody = undefined;
    
    // Add webhook signature if secret exists
    if (job.secret) {
        const timestamp = Date.now();
        const payload = {
            url: job.url,
            method: job.method || 'GET',
            body: job.body,
            timestamp
        };
        const payloadString = JSON.stringify(payload);
        headers['X-Signature'] = signPayload(payloadString, job.secret);
        headers['X-Timestamp'] = timestamp;
        headers['Content-Type'] = 'application/json';
        
        // Include signed payload in body for verification
        requestBody = payloadString;
    } else if (job.method !== 'GET' && job.body) {
        requestBody = typeof job.body === 'string' ? job.body : JSON.stringify(job.body);
        headers['Content-Type'] = 'application/json';
    }

    let finalStatus = 'success';
    let finalStatusCode = 0;
    let finalResponse = '';

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            const response = await fetch(job.url, {
                method: job.method || 'GET',
                headers,
                body: requestBody,
                signal: AbortSignal.timeout(30000)
            });

            const duration = Date.now() - startTime;
            const responseData = await response.text();
            
            finalStatusCode = response.status;
            finalResponse = responseData.substring(0, 1000);

            if (response.ok) {
                finalStatus = 'success';
                circuitBreaker.delete(job.id);
                break;
            } else if (attempt < RETRY_CONFIG.maxRetries) {
                console.log(`[Executor] Job ${job.name} failed (attempt ${attempt + 1}), retrying...`);
                await sleep(getBackoffDelay(attempt));
            } else {
                finalStatus = 'failed';
            }

        } catch (error) {
            console.error(`[Executor] Job ${job.name} failed (attempt ${attempt + 1}):`, error.message);
            
            if (attempt < RETRY_CONFIG.maxRetries) {
                await sleep(getBackoffDelay(attempt));
            } else {
                finalStatus = 'failed';
                finalResponse = error.message;
            }
        }
    }

    const duration = Date.now() - startTime;
    await HistoryModel.create({
        jobId: job.id,
        status: finalStatus,
        statusCode: finalStatusCode,
        response: finalResponse,
        duration
    });

    await JobModel.update(job.id, {
        lastExecution: new Date().toISOString()
    });

    if (finalStatus === 'failed') {
        const current = circuitBreaker.get(job.id) || { failures: 0 };
        circuitBreaker.set(job.id, { failures: current.failures + 1 });
        
        if (current.failures + 1 >= 2) {
            console.log(`[Executor] Circuit breaker triggered for job ${job.name}. Pausing job.`);
            await JobModel.update(job.id, { status: 'paused' });
            const { scheduler } = await import('./scheduler.js');
            scheduler.stop(job.id);
            emit('job:circuit-open', { jobId: job.id, name: job.name });
        }
    }

    emit('job:executed', {
        jobId: job.id,
        status: finalStatus,
        statusCode: finalStatusCode,
        duration,
        executedAt: new Date().toISOString()
    });

    console.log(`[Executor] Job ${job.name} finished. Status: ${finalStatus} (${finalStatusCode})`);
};

// BullMQ job processor
export const processJob = async (job) => {
    await executeJob(job.data);
};

export const resetCircuitBreaker = (jobId) => {
    circuitBreaker.delete(jobId);
};
