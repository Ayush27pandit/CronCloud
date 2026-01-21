# CronCloud Project Structure and Architecture

## Architecture Overview (Phase 1)

We are building a **Distributed Job Scheduler** named **CronCloud**. 
In Phase 1, we focus on a robust localized version.

### Components:

1.  **Frontend (Client)**: 
    *   Built with **React (Vite)** + **TypeScript**.
    *   Styled with **Tailwind CSS** and **shadcn/ui** components.
    *   Communicates with the Backend via REST API.
    *   Updates in real-time (to be implemented via polling/SSE).

2.  **Backend (Server)**:
    *   Built with **Node.js** + **Express**.
    *   Uses **ES Modules** (`import`/`export`).
    *   **SQLite** file-based database for simple, zero-config persistence.
    *   **node-cron** for handling job scheduling within the Node process.

3.  **Flow**:
    *   User creates a job (e.g., "Hit https://api.example.com every 5 mins") on Frontend.
    *   Frontend sends POST request to Backend.
    *   Backend saves job to SQLite database.
    *   Backend acts as the Scheduler: `node-cron` picks up the job and executes the HTTP request at the scheduled time.
    *   Backend logs the result (success/failure) to the database.
    *   Frontend fetches history to show the user.

## Project Structure

```
CronCloud/
├── backend/                # Node.js API & Scheduler
│   ├── src/
│   │   ├── config/         # Database & app config
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models/schema
│   │   ├── routes/         # API routes definition
│   │   ├── services/       # Business logic (Scheduler, Job Execution)
│   │   ├── utils/          # Helpers (Logger, Validator)
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   ├── .env                # Secrets (PORT, etc.)
│   └── package.json
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (Dashboard, History)
│   │   ├── services/       # API integration
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. `npm run dev` (Runs on port 5000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173 usually)
