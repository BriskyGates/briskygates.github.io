/**
 * 站点核心逻辑（纯函数，可在浏览器与 Node 测试中复用）
 */
(function (global) {
    'use strict';

    function getBasePath(pathname) {
        return pathname && pathname.includes('/briskygates.github.io')
            ? '/briskygates.github.io'
            : '';
    }

    function detectCurrentLanguage(search, savedLang, hasSiteConfig) {
        const urlParams = new URLSearchParams(search || '');
        const langParam = urlParams.get('lang');
        if (langParam === 'en' || langParam === 'zh') {
            return langParam;
        }

        if (savedLang === 'en' || savedLang === 'zh') {
            return savedLang;
        }

        if (hasSiteConfig) {
            return 'zh';
        }

        return 'zh';
    }

    function getConfigPathForLang(lang) {
        return lang === 'en'
            ? '/assets/data/homeConfig.en.json'
            : '/assets/data/homeConfig.json';
    }

    function getOppositeLang(lang) {
        return lang === 'zh' ? 'en' : 'zh';
    }

    function getLanguageToggleMeta(lang) {
        if (lang === 'en') {
            return { buttonText: '中文', tooltip: 'Switch to Chinese / 切换到中文' };
        }
        return { buttonText: 'EN', tooltip: 'Switch to English / 切换到英文' };
    }

    function getDocumentLang(lang) {
        return lang === 'en' ? 'en' : 'zh-CN';
    }

    function getDefaultToastMessage(lang) {
        return lang === 'en' ? 'Copied to clipboard' : '已复制到剪贴板';
    }

    const api = {
        getBasePath,
        detectCurrentLanguage,
        getConfigPathForLang,
        getOppositeLang,
        getLanguageToggleMeta,
        getDocumentLang,
        getDefaultToastMessage
    };

    global.SiteAppCore = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : global);
