const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '../..');
const FIXTURE = path.join(__dirname, '../fixtures/site/index.html');
const PORT = Number(process.env.TEST_SERVER_PORT || 4174);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8'
};

function sendFile(res, filePath) {
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];

    if (url === '/' || url === '/index.html') {
        sendFile(res, FIXTURE);
        return;
    }

    if (url === '/vendor/vue.global.js') {
        sendFile(res, path.join(ROOT, 'node_modules/vue/dist/vue.global.js'));
        return;
    }

    if (url.startsWith('/assets/')) {
        sendFile(res, path.join(ROOT, url));
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    process.stdout.write(`test server listening on http://127.0.0.1:${PORT}\n`);
});

process.on('SIGTERM', () => server.close());
