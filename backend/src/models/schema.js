import dbPromise from '../config/db.js';

const initDb = async () => {
    const db = await dbPromise;

    // Create Jobs table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        method TEXT DEFAULT 'GET',
        headers TEXT,
        body TEXT,
        cronExpression TEXT NOT NULL,
        status TEXT DEFAULT 'active', -- active, paused
        lastExecution TEXT,
        nextExecution TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Execution History table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS execution_history (
        id TEXT PRIMARY KEY,
        jobId TEXT NOT NULL,
        status TEXT NOT NULL, -- success, failed
        statusCode INTEGER,
        response TEXT,
        duration INTEGER,
        executedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jobId) REFERENCES jobs (id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialized');
};

export { initDb };
