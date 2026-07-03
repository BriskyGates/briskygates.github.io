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
    assert.equal(core.detectCurrentLanguage('?lang=plain', 'zh', false), 'plain');
    assert.equal(core.detectCurrentLanguage('?lang=zh-Hant', 'zh', false), 'zh-Hant');
});

test('detectCurrentLanguage: localStorage 作为 URL 缺失时的备选', () => {
    assert.equal(core.detectCurrentLanguage('', 'en', false), 'en');
    assert.equal(core.detectCurrentLanguage('', 'zh', false), 'zh');
    assert.equal(core.detectCurrentLanguage('', 'plain', false), 'plain');
    assert.equal(core.detectCurrentLanguage('', 'zh-Hant', false), 'zh-Hant');
});

test('detectCurrentLanguage: 无效值时默认中文', () => {
    assert.equal(core.detectCurrentLanguage('?lang=fr', 'invalid', false), 'zh');
    assert.equal(core.detectCurrentLanguage('', null, false), 'zh');
});

test('getConfigPathForLang: 返回对应语言配置文件路径', () => {
    assert.equal(core.getConfigPathForLang('zh'), '/assets/data/homeConfig.json');
    assert.equal(core.getConfigPathForLang('en'), '/assets/data/homeConfig.en.json');
    assert.equal(core.getConfigPathForLang('plain'), '/assets/data/homeConfig.plain.json');
    assert.equal(core.getConfigPathForLang('zh-Hant'), '/assets/data/homeConfig.zh-Hant.json');
});

test('getNextLang: 在简体、繁体、大白话、英文之间循环', () => {
    assert.equal(core.getNextLang('zh'), 'zh-Hant');
    assert.equal(core.getNextLang('zh-Hant'), 'plain');
    assert.equal(core.getNextLang('plain'), 'en');
    assert.equal(core.getNextLang('en'), 'zh');
});

test('getOppositeLang: 与 getNextLang 行为一致', () => {
    assert.equal(core.getOppositeLang('zh'), 'zh-Hant');
    assert.equal(core.getOppositeLang('zh-Hant'), 'plain');
    assert.equal(core.getOppositeLang('plain'), 'en');
    assert.equal(core.getOppositeLang('en'), 'zh');
});

test('getLanguageToggleMeta: 按钮文案指向下一种语言', () => {
    assert.deepEqual(core.getLanguageToggleMeta('zh'), {
        buttonText: '繁體',
        tooltip: '切換到繁體中文'
    });
    assert.deepEqual(core.getLanguageToggleMeta('zh-Hant'), {
        buttonText: '白话',
        tooltip: '切換到大白話版本'
    });
    assert.deepEqual(core.getLanguageToggleMeta('plain'), {
        buttonText: 'EN',
        tooltip: 'Switch to English / 切换到英文'
    });
    assert.deepEqual(core.getLanguageToggleMeta('en'), {
        buttonText: '中文',
        tooltip: 'Switch to Chinese / 切换到简体中文'
    });
});

test('getDocumentLang: 返回正确的 html lang 属性值', () => {
    assert.equal(core.getDocumentLang('zh'), 'zh-CN');
    assert.equal(core.getDocumentLang('zh-Hant'), 'zh-TW');
    assert.equal(core.getDocumentLang('plain'), 'zh-CN');
    assert.equal(core.getDocumentLang('en'), 'en');
});

test('getDefaultToastMessage: 返回对应语言的默认提示', () => {
    assert.equal(core.getDefaultToastMessage('zh'), '已复制到剪贴板');
    assert.equal(core.getDefaultToastMessage('zh-Hant'), '已複製到剪貼簿');
    assert.equal(core.getDefaultToastMessage('plain'), '已复制到剪贴板');
    assert.equal(core.getDefaultToastMessage('en'), 'Copied to clipboard');
});
