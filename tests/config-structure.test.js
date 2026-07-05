const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const core = require('../assets/js/app-core.js');
const zhConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.json'), 'utf8')
);
const enConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.en.json'), 'utf8')
);
const plainConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.plain.json'), 'utf8')
);
const plainHantConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.plain-Hant.json'), 'utf8')
);
const plainEnConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.plain-en.json'), 'utf8')
);
const hantConfig = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'assets/data/homeConfig.zh-Hant.json'), 'utf8')
);

const ALL_CONFIGS = [
    { config: zhConfig, label: '简体' },
    { config: enConfig, label: '英文' },
    { config: plainConfig, label: '大白话' },
    { config: plainHantConfig, label: '大白话·繁' },
    { config: plainEnConfig, label: 'Plain English' },
    { config: hantConfig, label: '繁体' }
];

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

test('各语言配置文件均可解析为 JSON', () => {
    ALL_CONFIGS.forEach(({ config, label }) => {
        assert.ok(config.profile, `${label}配置缺少 profile`);
    });
});

test('各语言配置文件顶层结构一致', () => {
    const zhKeys = Object.keys(zhConfig).sort();
    ALL_CONFIGS.forEach(({ config, label }) => {
        assert.deepEqual(zhKeys, Object.keys(config).sort(), `${label}顶层 key 不一致`);
    });
    TOP_LEVEL_KEYS.forEach(key => {
        ALL_CONFIGS.forEach(({ config, label }) => {
            assert.ok(key in config, `${label}配置缺少 ${key}`);
        });
    });
});

test('ui 区块包含国际化所需字段', () => {
    ALL_CONFIGS.forEach(({ config, label }) => {
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

test('languageToggle 包含无障碍提示文案', () => {
    ALL_CONFIGS.forEach(({ config, label }) => {
        assert.ok(config.ui.languageToggle.tooltip, `${label}配置 ui.languageToggle.tooltip 缺失`);
    });
});

test('语言选项列表包含六种语言且默认简体中文排第一', () => {
    assert.deepEqual(core.LANGUAGE_OPTIONS.map(option => option.code), [
        'zh', 'zh-Hant', 'plain', 'plain-Hant', 'en', 'plain-en'
    ]);
    assert.equal(core.getLanguageLabel('zh'), '简体中文');
    assert.equal(core.getLanguageLabel('plain-Hant'), '大白話·繁');
    assert.equal(core.getLanguageLabel('plain-en'), 'Plain English');
    assert.equal(core.getLanguageLabel('en'), 'English');
});

test('项目、技能、服务条目数量在各语言配置中一致', () => {
    ALL_CONFIGS.forEach(({ config }) => {
        assert.equal(config.skills.items.length, zhConfig.skills.items.length);
        assert.equal(config.services.items.length, zhConfig.services.items.length);
        assert.equal(config.projects.items.length, zhConfig.projects.items.length);
    });
});

test('各语言配置嵌套 key 结构一致', () => {
    const zhKeys = collectKeys(zhConfig).sort();
    ALL_CONFIGS.forEach(({ config, label }) => {
        assert.deepEqual(zhKeys, collectKeys(config).sort(), `${label}嵌套 key 结构不一致`);
    });
});

test('index.html 使用配置驱动渲染且无硬编码亮点文案', () => {
    const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.doesNotMatch(indexHtml, /亮点：/);
    assert.match(indexHtml, /getStatusText/);
    assert.match(indexHtml, /selectLanguage/);
    assert.match(indexHtml, /lang-dropdown/);
});

test('main.js 不再使用 DOMContentLoaded 绑定 langToggle', () => {
    const mainJs = fs.readFileSync(path.join(ROOT, 'assets/js/main.js'), 'utf8');
    assert.doesNotMatch(mainJs, /langToggle\.addEventListener/);
    assert.match(mainJs, /setLanguage\(/);
    assert.match(mainJs, /selectLanguage/);
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

test('语言配置文件不含 UTF-8 BOM', () => {
    const configDir = path.join(__dirname, '../assets/data');
    fs.readdirSync(configDir)
        .filter(name => name.endsWith('.json'))
        .forEach(name => {
            const filePath = path.join(configDir, name);
            const bytes = fs.readFileSync(filePath);
            const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
            assert.ok(!hasBom, `${name} 不应包含 UTF-8 BOM`);
        });
});

test('robots.txt 指向 sitemap 且 _config 排除测试目录', () => {
    const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
    const config = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
    const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    assert.match(robots, /Sitemap: https:\/\/briskygates\.github\.io\/sitemap\.xml/);
    assert.match(sitemap, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.doesNotMatch(sitemap, /^---/);
    assert.match(sitemap, /<loc>https:\/\/briskygates\.github\.io\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/briskygates\.github\.io\/llms-full\.txt<\/loc>/);
    assert.doesNotMatch(sitemap, /googleba2439275fc52107/);
    assert.match(config, /- tests\//);
    assert.match(config, /- DEPLOY\.md/);
});
