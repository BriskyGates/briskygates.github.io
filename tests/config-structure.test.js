const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const zhConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.json'), 'utf8')
);
const enConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.en.json'), 'utf8')
);

const REQUIRED_UI_KEYS = [
    'pageTitle',
    'pageDescription',
    'labelSuffix',
    'languageToggle',
    'toast',
    'projectStatus'
];

const REQUIRED_PROJECT_STATUS_KEYS = [
    'production',
    'active',
    'testing',
    'development',
    'planned',
    'highlightsLabel',
    'progressLabel'
];

const TOP_LEVEL_KEYS = [
    'ui',
    'profile',
    'featured',
    'projectShowcase',
    'experience',
    'skills',
    'services',
    'projects',
    'contact'
];

function collectKeys(obj, prefix = '') {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return [prefix];
    }
    return Object.keys(obj).flatMap(key => {
        const next = prefix ? `${prefix}.${key}` : key;
        return collectKeys(obj[key], next);
    });
}

test('中英文配置文件均可解析为 JSON', () => {
    assert.ok(zhConfig.profile);
    assert.ok(enConfig.profile);
});

test('中英文配置文件顶层结构一致', () => {
    assert.deepEqual(Object.keys(zhConfig).sort(), Object.keys(enConfig).sort());
    TOP_LEVEL_KEYS.forEach(key => {
        assert.ok(key in zhConfig, `中文配置缺少 ${key}`);
        assert.ok(key in enConfig, `英文配置缺少 ${key}`);
    });
});

test('ui 区块包含国际化所需字段', () => {
    [zhConfig, enConfig].forEach((config, index) => {
        const label = index === 0 ? '中文' : '英文';
        REQUIRED_UI_KEYS.forEach(key => {
            assert.ok(config.ui[key], `${label}配置 ui.${key} 缺失`);
        });
        REQUIRED_PROJECT_STATUS_KEYS.forEach(key => {
            assert.ok(
                config.ui.projectStatus[key],
                `${label}配置 ui.projectStatus.${key} 缺失`
            );
        });
    });
});

test('languageToggle 按钮文案与目标语言匹配', () => {
    assert.equal(zhConfig.ui.languageToggle.buttonText, 'EN');
    assert.equal(enConfig.ui.languageToggle.buttonText, '中文');
});

test('项目、技能、服务条目数量在中英文配置中一致', () => {
    assert.equal(zhConfig.skills.items.length, enConfig.skills.items.length);
    assert.equal(zhConfig.services.items.length, enConfig.services.items.length);
    assert.equal(zhConfig.projects.items.length, enConfig.projects.items.length);
});

test('中英文配置嵌套 key 结构一致', () => {
    const zhKeys = collectKeys(zhConfig).sort();
    const enKeys = collectKeys(enConfig).sort();
    assert.deepEqual(zhKeys, enKeys);
});

test('index.html 使用配置驱动渲染且无硬编码亮点文案', () => {
    const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.doesNotMatch(indexHtml, /亮点：/);
    assert.match(indexHtml, /getStatusText/);
    assert.match(indexHtml, /@click="switchLanguage"/);
});

test('main.js 不再使用 DOMContentLoaded 绑定 langToggle', () => {
    const mainJs = fs.readFileSync(path.join(ROOT, 'assets/js/main.js'), 'utf8');
    assert.doesNotMatch(mainJs, /langToggle\.addEventListener/);
    assert.match(mainJs, /switchLanguage\(\)/);
});

test('default.html 按顺序加载 app-core.js 与 main.js', () => {
    const layout = fs.readFileSync(path.join(ROOT, '_layouts/default.html'), 'utf8');
    const coreIndex = layout.indexOf("'/assets/js/app-core.js'");
    const mainIndex = layout.indexOf("'/assets/js/main.js'");
    assert.ok(coreIndex > -1 && mainIndex > -1);
    assert.ok(coreIndex < mainIndex);
});

test('SEO 模板包含 canonical 与 Open Graph 标签', () => {
    const layout = fs.readFileSync(path.join(ROOT, '_layouts/default.html'), 'utf8');
    const seoHead = fs.readFileSync(path.join(ROOT, '_includes/seo-head.html'), 'utf8');
    assert.match(layout, /seo-head\.html/);
    assert.match(seoHead, /rel="canonical"/);
    assert.match(seoHead, /property="og:title"/);
    assert.match(seoHead, /name="twitter:card"/);
});

test('robots.txt 指向 sitemap 且 _config 排除测试目录', () => {
    const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
    const config = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
    assert.match(robots, /Sitemap: https:\/\/briskygates\.github\.io\/sitemap\.xml/);
    assert.match(config, /- tests\//);
    assert.match(config, /- DEPLOY\.md/);
});
