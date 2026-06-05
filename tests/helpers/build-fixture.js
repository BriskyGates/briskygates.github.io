const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '../..');
const indexPath = path.join(root, 'index.html');
const outputDir = path.join(__dirname, '../fixtures/site');
const outputPath = path.join(outputDir, 'index.html');

const source = fs.readFileSync(indexPath, 'utf8');
const match = source.match(/\{% endcomment %\}\s*\{% raw %\}([\s\S]*)\{% endraw %\}/);

if (!match) {
    throw new Error('index.html 中未找到 {% raw %} 区块');
}

const app = match[1].trim();
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Fixture</title>
    <meta name="description" content="test fixture">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
    <div class="container">
${app}
    </div>
    <script>window.siteConfig = null;</script>
    <script src="/vendor/vue.global.js"></script>
    <script src="/assets/js/app-core.js"></script>
    <script src="/assets/js/main.js"></script>
</body>
</html>
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`Generated ${outputPath}`);
