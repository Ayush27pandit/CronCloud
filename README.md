# CronCloud - Distributed Job Scheduler

A production-ready distributed job scheduling platform for scheduling and monitoring HTTP-based automated tasks with real-time logging.

## Features

### Core Features
- **Job Scheduling** - Schedule HTTP requests using cron expressions
- **Real-time Updates** - SSE (Server-Sent Events) for instant job status updates
- **Job History** - Track all executions with status, duration, and response
- **Pause/Resume** - Toggle jobs without deleting them

### Reliability
- **Retry with Exponential Backoff** - Failed jobs automatically retry (3 attempts)
- **Circuit Breaker** - Auto-pauses jobs after 2 consecutive failures
- **30s Timeout** - Prevents jobs from hanging indefinitely

### Production-Ready
- **BullMQ + Redis** - Reliable job queue for distributed processing
- **PostgreSQL Support** - Production database (also supports SQLite for dev)
- **Webhook Signature** - HMAC-SHA256 signed requests for secure webhooks

## Architecture

```
┌─────────────┐     REST API      ┌─────────────┐
│   Frontend  │ ◄────────────────► │   Backend   │
│  (React)    │   Real-time SSE   │  (Express)  │
└─────────────┘                    └──────┬──────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
              ┌─────▼─────┐       ┌──────▼──────┐       ┌─────▼─────┐
              │  Scheduler │       │ BullMQ Queue │       │  SQLite/  │
              │ (node-cron)       │   (Redis)    │       │ PostgreSQL │
              └─────┬─────┘       └──────┬──────┘       └───────────┘
                    │                     │
              ┌─────▼─────────────────────▼─────┐
              │         Job Executor             │
              │   (HTTP Requests + Logging)     │
              └─────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, ES Modules |
| Database | SQLite (dev), PostgreSQL (prod) |
| Queue | BullMQ, Redis |
| Scheduling | node-cron |

## Project Structure

```
CronCloud/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── scheduler.js    # Cron scheduling
│   │   │   ├── jobExecutor.js  # Job execution + retries
│   │   │   ├── queueService.js  # BullMQ queue
│   │   │   └── sseService.js    # Server-Sent Events
│   │   ├── utils/
│   │   │   └── webhookAuth.js   # HMAC signature
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Dashboard
│   │   ├── services/       # API client
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Redis (for job queue)

### Quick Start

**1. Start Redis (Docker)**
```bash
docker run -d -p 6379:6379 redis
```

**2. Start Backend**
```bash
cd backend
npm install
npm run dev
```

**3. Start Frontend (new terminal)**
```bash
cd frontend
npm install
npm run dev
```

**4. Open Browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# SQLite (local development)
DATABASE_URL=file:./dev.db

# PostgreSQL (production)
# DATABASE_URL=postgres://user:pass@host:5432/db

# Redis (required for BullMQ)
REDIS_URL=redis://localhost:6379
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Create a new job |
| GET | `/api/jobs/:id` | Get job by ID |
| PUT | `/api/jobs/:id` | Update job |
| PATCH | `/api/jobs/:id/toggle` | Pause/Resume job |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/history` | Get execution history |
| GET | `/api/events` | SSE real-time events |

## Webhook Security

When creating a job with a `secret`, requests include signed payloads:

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Secure Webhook",
    "url": "https://your-api.com/hook",
    "cronExpression": "*/5 * * * *",
    "method": "POST",
    "body": {"event": "trigger"},
    "secret": "your-secret-key"
  }'
```

**Request Headers:**
- `X-Signature`: HMAC-SHA256 hash
- `X-Timestamp`: Unix timestamp

**Verify on receiving server:**
```javascript
const crypto = require('crypto');
const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
// Compare with X-Signature header
```

## Job Model

```json
{
  "id": "uuid",
  "name": "Job Name",
  "url": "https://example.com/api",
  "method": "POST",
  "headers": {},
  "body": {"key": "value"},
  "cronExpression": "*/5 * * * *",
  "status": "active",
  "secret": "optional-webhook-secret",
  "lastExecution": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Scaling Path

| Phase | Architecture | Use Case |
|-------|--------------|----------|
| Phase 1 | Single Node + SQLite | Development |
| Phase 2 | Single Node + PostgreSQL | Small production |
| Phase 3 | Distributed + BullMQ | High availability |
| Phase 4 | Multi-region workers | Enterprise scale |

## License

MIT
