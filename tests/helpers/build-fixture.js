const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '../..');
const indexPath = path.join(root, 'index.html');
const outputDir = path.join(__dirname, '../fixtures/site');
const outputPath = path.join(outputDir, 'index.html');

const source = fs.readFileSync(indexPath, 'utf8');
const templateMatch = source.match(/<template id="vue-app-template">[\s\S]*?\{% raw %\}([\s\S]*)\{% endraw %\}[\s\S]*?<\/template>/);

if (!templateMatch) {
    throw new Error('index.html 中未找到 vue-app-template {% raw %} 区块');
}

const appTemplate = templateMatch[1].trim();
const prerenderMatch = source.match(/<!-- PRERENDER:START -->([\s\S]*?)<!-- PRERENDER:END -->/);
const prerender = prerenderMatch ? prerenderMatch[1].trim() : '';

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Test Fixture</title>
    <meta name="description" content="test fixture">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="site-body">
<template id="vue-app-template">
${appTemplate}
</template>
<div id="app" class="app-shell">
${prerender}
</div>
    <script>window.siteConfig = null;</script>
    <script defer src="/assets/vendor/vue.global.prod.js"></script>
    <script defer src="/assets/js/app-core.js"></script>
    <script defer src="/assets/js/main.js"></script>
</body>
</html>
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`Generated ${outputPath}`);
