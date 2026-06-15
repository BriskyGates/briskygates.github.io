const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '../..');
const FIXTURE = path.join(__dirname, '../fixtures/site/index.html');
const PORT = Number(process.env.PORT || process.env.TEST_SERVER_PORT || 4174);

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

    if (url === '/vendor/vue.global.js' || url === '/assets/vendor/vue.global.prod.js') {
        const vuePath = path.join(ROOT, 'assets/vendor/vue.global.prod.js');
        const fallback = path.join(ROOT, 'node_modules/vue/dist/vue.global.prod.js');
        sendFile(res, fs.existsSync(vuePath) ? vuePath : fallback);
        return;
    }

    if (url.startsWith('/assets/')) {
        sendFile(res, path.join(ROOT, url));
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        process.stderr.write(
            `\n端口 ${PORT} 已被占用（EADDRINUSE）。\n` +
            `  → 若本机已在跑 dev，直接打开: http://127.0.0.1:${PORT}\n` +
            `  → 换端口启动:  $env:PORT=4000; npm run dev\n` +
            `  → 结束占用进程: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n\n`
        );
        process.exit(1);
    }
    throw err;
});

server.listen(PORT, () => {
    process.stdout.write(`dev server → http://127.0.0.1:${PORT}\n`);
});

process.on('SIGTERM', () => server.close());
