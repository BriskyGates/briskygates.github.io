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
    assert.equal(core.detectCurrentLanguage('?lang=plain-Hant', 'zh', false), 'plain-Hant');
    assert.equal(core.detectCurrentLanguage('?lang=plain-en', 'zh', false), 'plain-en');
    assert.equal(core.detectCurrentLanguage('?lang=zh-Hant', 'zh', false), 'zh-Hant');
});

test('detectCurrentLanguage: localStorage 作为 URL 缺失时的备选', () => {
    assert.equal(core.detectCurrentLanguage('', 'en', false), 'en');
    assert.equal(core.detectCurrentLanguage('', 'zh', false), 'zh');
    assert.equal(core.detectCurrentLanguage('', 'plain', false), 'plain');
    assert.equal(core.detectCurrentLanguage('', 'plain-Hant', false), 'plain-Hant');
    assert.equal(core.detectCurrentLanguage('', 'plain-en', false), 'plain-en');
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
    assert.equal(core.getConfigPathForLang('plain-Hant'), '/assets/data/homeConfig.plain-Hant.json');
    assert.equal(core.getConfigPathForLang('plain-en'), '/assets/data/homeConfig.plain-en.json');
    assert.equal(core.getConfigPathForLang('zh-Hant'), '/assets/data/homeConfig.zh-Hant.json');
});

test('getNextLang: 在六种语言之间循环', () => {
    assert.equal(core.getNextLang('zh'), 'zh-Hant');
    assert.equal(core.getNextLang('zh-Hant'), 'plain');
    assert.equal(core.getNextLang('plain'), 'plain-Hant');
    assert.equal(core.getNextLang('plain-Hant'), 'en');
    assert.equal(core.getNextLang('en'), 'plain-en');
    assert.equal(core.getNextLang('plain-en'), 'zh');
});

test('getOppositeLang: 与 getNextLang 行为一致', () => {
    assert.equal(core.getOppositeLang('zh'), 'zh-Hant');
    assert.equal(core.getOppositeLang('zh-Hant'), 'plain');
    assert.equal(core.getOppositeLang('plain'), 'plain-Hant');
    assert.equal(core.getOppositeLang('plain-Hant'), 'en');
    assert.equal(core.getOppositeLang('en'), 'plain-en');
    assert.equal(core.getOppositeLang('plain-en'), 'zh');
});

test('getLanguageOptions: 返回完整语言列表', () => {
    assert.deepEqual(core.getLanguageOptions(), core.LANGUAGE_OPTIONS);
    assert.equal(core.getLanguageOptions().length, 6);
});

test('getLanguageLabel: 返回对应语言的展示名称', () => {
    assert.equal(core.getLanguageLabel('zh'), '简体中文');
    assert.equal(core.getLanguageLabel('zh-Hant'), '繁體中文');
    assert.equal(core.getLanguageLabel('plain'), '大白话');
    assert.equal(core.getLanguageLabel('plain-Hant'), '大白話·繁');
    assert.equal(core.getLanguageLabel('en'), 'English');
    assert.equal(core.getLanguageLabel('plain-en'), 'Plain English');
    assert.equal(core.getLanguageLabel('invalid'), '简体中文');
});

test('getDocumentLang: 返回正确的 html lang 属性值', () => {
    assert.equal(core.getDocumentLang('zh'), 'zh-CN');
    assert.equal(core.getDocumentLang('zh-Hant'), 'zh-TW');
    assert.equal(core.getDocumentLang('plain'), 'zh-CN');
    assert.equal(core.getDocumentLang('plain-Hant'), 'zh-TW');
    assert.equal(core.getDocumentLang('en'), 'en');
    assert.equal(core.getDocumentLang('plain-en'), 'en');
});

test('getDefaultToastMessage: 返回对应语言的默认提示', () => {
    assert.equal(core.getDefaultToastMessage('zh'), '已复制到剪贴板');
    assert.equal(core.getDefaultToastMessage('zh-Hant'), '已複製到剪貼簿');
    assert.equal(core.getDefaultToastMessage('plain'), '已复制到剪贴板');
    assert.equal(core.getDefaultToastMessage('plain-Hant'), '已複製到剪貼簿');
    assert.equal(core.getDefaultToastMessage('en'), 'Copied to clipboard');
    assert.equal(core.getDefaultToastMessage('plain-en'), 'Copied to clipboard');
});
