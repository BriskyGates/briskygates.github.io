const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const core = require('../assets/js/app-core.js');

test('getBasePath: 用户站点根路径返回空字符串', () => {
    assert.equal(core.getBasePath('/'), '');
    assert.equal(core.getBasePath('/index.html'), '');
});

test('getBasePath: 项目页路径返回仓库前缀', () => {
    assert.equal(core.getBasePath('/briskygates.github.io/'), '/briskygates.github.io');
    assert.equal(core.getBasePath('/briskygates.github.io/index.html'), '/briskygates.github.io');
});

test('detectCurrentLanguage: URL 参数优先级最高', () => {
    assert.equal(core.detectCurrentLanguage('?lang=en', 'zh', false), 'en');
    assert.equal(core.detectCurrentLanguage('?lang=zh', 'en', false), 'zh');
});

test('detectCurrentLanguage: localStorage 作为 URL 缺失时的备选', () => {
    assert.equal(core.detectCurrentLanguage('', 'en', false), 'en');
    assert.equal(core.detectCurrentLanguage('', 'zh', false), 'zh');
});

test('detectCurrentLanguage: 无效值时默认中文', () => {
    assert.equal(core.detectCurrentLanguage('?lang=fr', 'invalid', false), 'zh');
    assert.equal(core.detectCurrentLanguage('', null, false), 'zh');
});

test('getConfigPathForLang: 返回对应语言配置文件路径', () => {
    assert.equal(core.getConfigPathForLang('zh'), '/assets/data/homeConfig.json');
    assert.equal(core.getConfigPathForLang('en'), '/assets/data/homeConfig.en.json');
});

test('getOppositeLang: 在中英文之间切换', () => {
    assert.equal(core.getOppositeLang('zh'), 'en');
    assert.equal(core.getOppositeLang('en'), 'zh');
});

test('getLanguageToggleMeta: 按钮文案与当前语言对应', () => {
    assert.deepEqual(core.getLanguageToggleMeta('zh'), {
        buttonText: 'EN',
        tooltip: 'Switch to English / 切换到英文'
    });
    assert.deepEqual(core.getLanguageToggleMeta('en'), {
        buttonText: '中文',
        tooltip: 'Switch to Chinese / 切换到中文'
    });
});

test('getDocumentLang: 返回正确的 html lang 属性值', () => {
    assert.equal(core.getDocumentLang('zh'), 'zh-CN');
    assert.equal(core.getDocumentLang('en'), 'en');
});

test('getDefaultToastMessage: 返回对应语言的默认提示', () => {
    assert.equal(core.getDefaultToastMessage('zh'), '已复制到剪贴板');
    assert.equal(core.getDefaultToastMessage('en'), 'Copied to clipboard');
});
