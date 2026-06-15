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

const configPath = path.join(root, 'assets/data/homeConfig.json');
const siteConfig = fs.readFileSync(configPath, 'utf8').trim();

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Test Fixture</title>
    <meta name="description" content="test fixture">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet">
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
    <script id="site-config-data" type="application/json">${siteConfig}</script>
    <script>window.siteConfig = JSON.parse(document.getElementById('site-config-data').textContent);</script>
    <script src="/vendor/vue.global.js"></script>
    <script src="/assets/js/app-core.js"></script>
    <script src="/assets/js/main.js"></script>
</body>
</html>
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`Generated ${outputPath}`);
