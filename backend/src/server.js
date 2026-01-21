import app from './app.js';
import { initDb } from './models/schema.js';
import { scheduler } from './services/scheduler.js';

const PORT = process.env.PORT || 5000;

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
