const clients = new Set();

export const addClient = (res) => {
    clients.add(res);
    console.log(`[SSE] Client connected. Total: ${clients.size}`);
};

export const removeClient = (res) => {
    clients.delete(res);
    console.log(`[SSE] Client disconnected. Total: ${clients.size}`);
};

export const emit = (event, data) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
        client.write(message);
    }
};

export const sseHandler = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    addClient(res);

    res.write('event: connected\ndata: {"status":"connected"}\n\n');

    req.on('close', () => {
        removeClient(res);
    });
};
