const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const { renderAppShell } = require('../scripts/lib/static-renderer');
const { generateLlmsFull } = require('../scripts/lib/llms-generator');
const { generateJsonLd } = require('../scripts/lib/jsonld-generator');

const zhConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../assets/data/homeConfig.json'), 'utf8')
);

test('renderAppShell: 输出真实姓名而非 Vue 占位符', () => {
    const html = renderAppShell(zhConfig);
    assert.match(html, /阿布/);
    assert.doesNotMatch(html, /\{\{\s*config\./);
});

test('renderAppShell: 包含代表作与技能区块', () => {
    const html = renderAppShell(zhConfig);
    assert.match(html, /多 LLM 题型分析引擎/);
    assert.match(html, /核心技术/);
    assert.match(html, /id="showcase"/);
});

test('generateLlmsFull: 生成可读的纯文本履历', () => {
    const text = generateLlmsFull(zhConfig, 'zh');
    assert.match(text, /^# 阿布/m);
    assert.match(text, /RAG & 向量检索/);
    assert.match(text, /homeConfig\.json/);
});

test('generateJsonLd: 包含 Person 与 WebSite 节点', () => {
    const data = generateJsonLd(zhConfig);
    const types = data['@graph'].map(node => node['@type']);
    assert.ok(types.includes('Person'));
    assert.ok(types.includes('WebSite'));
    assert.ok(types.includes('ProfilePage'));
});

test('index.html: 预渲染区块不含 Vue 模板语法', () => {
    const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const match = indexHtml.match(/<!-- PRERENDER:START -->([\s\S]*?)<!-- PRERENDER:END -->/);
    assert.ok(match, '应存在 PRERENDER 标记');
    const block = match[1];
    if (block.trim().length > 0) {
        assert.doesNotMatch(block, /\{\{\s*config\./);
        assert.match(block, /阿布/);
    }
});
