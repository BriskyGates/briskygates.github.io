/**
 * 站点核心逻辑（纯函数，可在浏览器与 Node 测试中复用）
 */
(function (global) {
    'use strict';

    const SUPPORTED_LANGS = ['zh', 'zh-Hant', 'plain', 'plain-Hant', 'en', 'plain-en'];

    const LANGUAGE_OPTIONS = [
        { code: 'zh', label: '简体中文' },
        { code: 'zh-Hant', label: '繁體中文' },
        { code: 'plain', label: '大白话' },
        { code: 'plain-Hant', label: '大白話·繁' },
        { code: 'en', label: 'English' },
        { code: 'plain-en', label: 'Plain English' }
    ];

    function getBasePath(pathname) {
        return pathname && pathname.includes('/briskygates.github.io')
            ? '/briskygates.github.io'
            : '';
    }

    function isSupportedLang(lang) {
        return SUPPORTED_LANGS.includes(lang);
    }

    function detectCurrentLanguage(search, savedLang, hasSiteConfig) {
        const urlParams = new URLSearchParams(search || '');
        const langParam = urlParams.get('lang');
        if (isSupportedLang(langParam)) {
            return langParam;
        }

        if (isSupportedLang(savedLang)) {
            return savedLang;
        }

        if (hasSiteConfig) {
            return 'zh';
        }

        return 'zh';
    }

    function getConfigPathForLang(lang) {
        if (lang === 'en') {
            return '/assets/data/homeConfig.en.json';
        }
        if (lang === 'plain') {
            return '/assets/data/homeConfig.plain.json';
        }
        if (lang === 'plain-Hant') {
            return '/assets/data/homeConfig.plain-Hant.json';
        }
        if (lang === 'plain-en') {
            return '/assets/data/homeConfig.plain-en.json';
        }
        if (lang === 'zh-Hant') {
            return '/assets/data/homeConfig.zh-Hant.json';
        }
        return '/assets/data/homeConfig.json';
    }

    function getNextLang(lang) {
        const index = SUPPORTED_LANGS.indexOf(lang);
        if (index === -1) {
            return 'zh';
        }
        return SUPPORTED_LANGS[(index + 1) % SUPPORTED_LANGS.length];
    }

    function getOppositeLang(lang) {
        return getNextLang(lang);
    }

    function getLanguageOptions() {
        return LANGUAGE_OPTIONS;
    }

    function getLanguageLabel(lang) {
        const option = LANGUAGE_OPTIONS.find(entry => entry.code === lang);
        return option ? option.label : LANGUAGE_OPTIONS[0].label;
    }

    function getLanguageToggleMeta(lang) {
        const next = getNextLang(lang);
        if (next === 'zh-Hant') {
            return { buttonText: '繁體', tooltip: '切換到繁體中文' };
        }
        if (next === 'plain') {
            return lang === 'zh-Hant'
                ? { buttonText: '白话', tooltip: '切換到大白話版本' }
                : { buttonText: '白话', tooltip: '切换到大白话版本' };
        }
        if (next === 'plain-Hant') {
            return { buttonText: '白話', tooltip: '切換到大白話·繁版本' };
        }
        if (next === 'en') {
            return { buttonText: 'EN', tooltip: 'Switch to English / 切换到英文' };
        }
        if (next === 'plain-en') {
            return { buttonText: 'Plain', tooltip: 'Switch to Plain English' };
        }
        return { buttonText: '中文', tooltip: 'Switch to Chinese / 切换到简体中文' };
    }

    function getDocumentLang(lang) {
        if (lang === 'en' || lang === 'plain-en') {
            return 'en';
        }
        if (lang === 'zh-Hant' || lang === 'plain-Hant') {
            return 'zh-TW';
        }
        return 'zh-CN';
    }

    function getDefaultToastMessage(lang) {
        if (lang === 'en' || lang === 'plain-en') {
            return 'Copied to clipboard';
        }
        if (lang === 'zh-Hant' || lang === 'plain-Hant') {
            return '已複製到剪貼簿';
        }
        return '已复制到剪贴板';
    }

    const api = {
        SUPPORTED_LANGS,
        LANGUAGE_OPTIONS,
        getBasePath,
        isSupportedLang,
        detectCurrentLanguage,
        getConfigPathForLang,
        getNextLang,
        getOppositeLang,
        getLanguageOptions,
        getLanguageLabel,
        getLanguageToggleMeta,
        getDocumentLang,
        getDefaultToastMessage
    };

    global.SiteAppCore = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : global);
