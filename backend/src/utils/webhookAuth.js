import crypto from 'crypto';

export const signPayload = (payload, secret) => {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    return hmac.digest('hex');
};

export const verifySignature = (payload, signature, secret) => {
    if (!signature || !secret) return false;
    const expectedSignature = signPayload(payload, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

export const createWebhookPayload = (job, executionResult) => {
    return {
        jobId: job.id,
        jobName: job.name,
        url: job.url,
        status: executionResult.status,
        statusCode: executionResult.statusCode,
        duration: executionResult.duration,
        executedAt: executionResult.executedAt,
        timestamp: new Date().toISOString()
    };
};
