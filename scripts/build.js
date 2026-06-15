'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { renderAppShell } = require('./lib/static-renderer');
const { generateLlmsFull } = require('./lib/llms-generator');
const { renderJsonLdScript } = require('./lib/jsonld-generator');

const root = path.join(__dirname, '..');
const PRERENDER_START = '<!-- PRERENDER:START -->';
const PRERENDER_END = '<!-- PRERENDER:END -->';
const SITE_URL = 'https://briskygates.github.io';

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function replaceBetweenMarkers(source, startMarker, endMarker, replacement) {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start === -1 || end === -1 || end <= start) {
        throw new Error(`未在 index.html 中找到 ${startMarker} … ${endMarker} 标记`);
    }
    const before = source.slice(0, start + startMarker.length);
    const after = source.slice(end);
    return `${before}\n${replacement}\n${after}`;
}

function patchSiteConfigScript(source, config) {
    const json = JSON.stringify(config);
    const pattern = /<script id="site-config-data" type="application\/json">[\s\S]*?<\/script>/;
    const block = `<script id="site-config-data" type="application/json">${json}</script>`;
    if (!pattern.test(source)) {
        throw new Error('index.html 中未找到 site-config-data 脚本块');
    }
    return source.replace(pattern, block);
}

function main() {
    const zhConfig = readJson('assets/data/homeConfig.json');
    const enConfig = readJson('assets/data/homeConfig.en.json');

    const prerendered = renderAppShell(zhConfig);
    const indexPath = path.join(root, 'index.html');
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    indexHtml = replaceBetweenMarkers(indexHtml, PRERENDER_START, PRERENDER_END, prerendered);
    indexHtml = patchSiteConfigScript(indexHtml, zhConfig);
    fs.writeFileSync(indexPath, indexHtml);
    console.log('Updated index.html prerender + inline config');

    const llmsFullZh = generateLlmsFull(zhConfig, 'zh');
    const llmsFullEn = generateLlmsFull(enConfig, 'en');
    fs.writeFileSync(path.join(root, 'llms-full.txt'), llmsFullZh);
    fs.writeFileSync(path.join(root, 'llms-full.en.txt'), llmsFullEn);
    console.log('Generated llms-full.txt, llms-full.en.txt');

    const includesDir = path.join(root, '_includes');
    fs.mkdirSync(includesDir, { recursive: true });
    fs.writeFileSync(
        path.join(includesDir, 'json-ld.html'),
        renderJsonLdScript(zhConfig, SITE_URL)
    );
    console.log('Generated _includes/json-ld.html');
}

main();
