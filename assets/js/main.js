// 使用 Vue.js 来渲染页面内容
// 从 JSON 配置文件加载内容

const {
    getBasePath,
    detectCurrentLanguage,
    getConfigPathForLang,
    getOppositeLang,
    getDocumentLang,
    getDefaultToastMessage
} = window.SiteAppCore;

const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/95c6e7c8-7469-442c-bcb4-4217417cbdd6';

let currentLang = 'zh';
let currentConfig = null;
let vueAppInstance = null;
let vueApp = null;

function showFatalError(messageHtml) {
    const app = document.getElementById('app');
    if (app) {
        app.removeAttribute('v-cloak');
        app.innerHTML = messageHtml;
    }
}

async function fetchConfig(configPath) {
    const basePath = getBasePath(window.location.pathname);
    let response = await fetch(basePath + configPath);
    if (!response.ok) {
        response = await fetch(configPath);
        if (!response.ok) {
            throw new Error(`无法加载配置文件: ${configPath}`);
        }
    }
    return response.json();
}

function updatePageMeta(config) {
    if (!config || !config.ui) {
        return;
    }
    if (config.ui.pageTitle) {
        document.title = config.ui.pageTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && config.ui.pageDescription) {
        metaDesc.setAttribute('content', config.ui.pageDescription);
    }
    document.documentElement.lang = getDocumentLang(currentLang);
}

function renderWithVue(config) {
    if (!config) {
        console.error('配置数据为空，无法渲染！');
        return;
    }

    if (typeof Vue === 'undefined') {
        showFatalError(
            '<div style="padding: 20px; text-align: center;">' +
            '<h2>页面加载失败</h2>' +
            '<p>Vue.js 未能从 CDN 加载，请检查网络连接后刷新页面。</p>' +
            '</div>'
        );
        return;
    }

    if (vueAppInstance) {
        vueAppInstance.config = config;
        vueAppInstance.currentLang = currentLang;
        updatePageMeta(config);
        return;
    }

    const { createApp } = Vue;
    const appElement = document.getElementById('app');

    if (!appElement) {
        console.error('找不到 #app 元素！');
        return;
    }

    vueApp = createApp({
        template: '#vue-app-template',
        data() {
            return {
                config: config || {},
                currentLang: currentLang,
                showToast: false,
                toastMessage: '',
                activeSection: 'home',
                sidebarOpen: false,
                _scrollSpyHandler: null,
                contactForm: {
                    name: '',
                    contact: '',
                    topic: '',
                    message: ''
                },
                contactSending: false,
                contactFeedback: '',
                contactFeedbackType: ''
            };
        },
        computed: {
            timeGreeting() {
                const greetings = this.config?.ui?.greetings;
                const hour = new Date().getHours();
                if (!greetings) {
                    return this.config?.profile?.greeting?.text || '';
                }
                if (hour >= 5 && hour < 12) {
                    return greetings.morning;
                }
                if (hour >= 12 && hour < 18) {
                    return greetings.afternoon;
                }
                if (hour >= 18 && hour < 23) {
                    return greetings.evening;
                }
                return greetings.night;
            },
            heroGradientStyle() {
                const colors = this.config?.profile?.heroGradient || ['#1db954', '#1ed760', '#509bf5'];
                const [a, b, c] = colors;
                return {
                    background: `linear-gradient(135deg, ${a} 0%, ${b} 45%, ${c} 100%)`
                };
            },
            activeNavLabel() {
                const nav = this.config?.ui?.nav;
                if (!nav) {
                    return '';
                }
                const item = nav.find(entry => entry.id === this.activeSection);
                return item?.label || '';
            }
        },
        mounted() {
            this._scrollSpyHandler = () => this.updateActiveSection();
            window.addEventListener('scroll', this._scrollSpyHandler, { passive: true });
            this.$nextTick(() => this.updateActiveSection());
        },
        unmounted() {
            if (this._scrollSpyHandler) {
                window.removeEventListener('scroll', this._scrollSpyHandler);
            }
        },
        methods: {
            getScrollOffset() {
                const topbar = parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue('--topbar-height'),
                    10
                );
                const extra = window.innerWidth <= 768 ? 12 : 20;
                return (topbar || 60) + extra;
            },
            scrollToSection(id) {
                this.sidebarOpen = false;
                const el = document.getElementById(id);
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - this.getScrollOffset();
                    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                    this.activeSection = id;
                }
            },
            updateActiveSection() {
                const nav = this.config?.ui?.nav;
                if (!nav || !nav.length) {
                    return;
                }
                const offset = this.getScrollOffset();
                let current = nav[0].id;
                for (const item of nav) {
                    const el = document.getElementById(item.id);
                    if (el && el.getBoundingClientRect().top <= offset) {
                        current = item.id;
                    }
                }
                this.activeSection = current;
            },
            async switchLanguage() {
                await switchLanguage();
            },
            getStatusText(status) {
                if (!this.config || !this.config.ui || !this.config.ui.projectStatus) {
                    return status;
                }
                const statusMap = {
                    production: this.config.ui.projectStatus.production,
                    active: this.config.ui.projectStatus.active,
                    testing: this.config.ui.projectStatus.testing,
                    development: this.config.ui.projectStatus.development,
                    planned: this.config.ui.projectStatus.planned
                };
                return statusMap[status] || status;
            },
            async copyToClipboard(text, type) {
                try {
                    await navigator.clipboard.writeText(text);
                    this.showToastMessage(this.getToastMessage(type));
                } catch (err) {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        this.showToastMessage(this.getToastMessage(type));
                    } catch (e) {
                        console.error('复制失败:', e);
                    }
                    document.body.removeChild(textArea);
                }
            },
            getToastMessage(type) {
                const fallback = getDefaultToastMessage(this.currentLang);
                if (!this.config || !this.config.ui || !this.config.ui.toast) {
                    return fallback;
                }
                const toastMap = {
                    wechat: this.config.ui.toast.wechatCopied,
                    xianyu: this.config.ui.toast.xianyuCopied,
                    im: this.config.ui.toast.imCopied
                };
                return toastMap[type] || fallback;
            },
            showToastMessage(message) {
                this.toastMessage = message;
                this.showToast = true;
                setTimeout(() => {
                    this.showToast = false;
                }, 2000);
            },
            async submitContactForm() {
                const cfg = this.config?.contact?.form;
                if (!cfg) return;
                this.contactSending = true;
                this.contactFeedback = '';
                this.contactFeedbackType = '';

                const now = new Date();
                const timeStr = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
                const lang = navigator.language || 'zh-CN';

                const cardPayload = {
                    msg_type: 'interactive',
                    card: {
                        header: {
                            title: {
                                tag: 'plain_text',
                                content: '📬 个人网站联系人模块 · 新留言'
                            },
                            template: 'blue'
                        },
                        elements: [
                            {
                                tag: 'div',
                                fields: [
                                    { is_short: true, text: { tag: 'lark_md', content: `**👤 称呼**\n${this._esc(this.contactForm.name)}` } },
                                    { is_short: true, text: { tag: 'lark_md', content: `**📞 联系方式**\n${this._esc(this.contactForm.contact)}` } }
                                ]
                            },
                            {
                                tag: 'div',
                                text: { tag: 'lark_md', content: `**💬 话题**\n${this._esc(this.contactForm.topic)}` }
                            },
                            {
                                tag: 'hr'
                            },
                            {
                                tag: 'div',
                                text: { tag: 'lark_md', content: `**📝 详细描述**\n${this._esc(this.contactForm.message)}` }
                            },
                            {
                                tag: 'hr'
                            },
                            {
                                tag: 'note',
                                elements: [
                                    { tag: 'plain_text', content: `🔑 个人网站联系人模块  ·  ⏰ ${timeStr}  ·  🌐 ${lang}` }
                                ]
                            }
                        ]
                    }
                };

                try {
                    const res = await fetch(FEISHU_WEBHOOK, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cardPayload)
                    });
                    const result = await res.json();
                    if (res.ok && result.code === 0) {
                        this.contactFeedback = cfg.success;
                        this.contactFeedbackType = 'success';
                        this.contactForm = { name: '', contact: '', topic: '', message: '' };
                    } else {
                        throw new Error(result.msg || 'webhook error');
                    }
                } catch (err) {
                    console.error('Contact form submit error:', err);
                    this.contactFeedback = cfg.error;
                    this.contactFeedbackType = 'error';
                } finally {
                    this.contactSending = false;
                }
            },
            _esc(text) {
                if (!text) return '';
                return String(text).replace(/[&<>"']/g, function (m) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
                });
            }
        }
    });

    vueAppInstance = vueApp.mount('#app');
    updatePageMeta(config);
}

async function loadConfigForLanguage(lang) {
    return fetchConfig(getConfigPathForLang(lang));
}

async function applyLanguage(lang, config, options = {}) {
    const { scrollToTop = false, syncUrl = true } = options;

    currentLang = lang;
    currentConfig = config;
    localStorage.setItem('preferredLanguage', lang);

    if (syncUrl) {
        const url = new URL(window.location.href);
        if (url.searchParams.get('lang') !== lang) {
            url.searchParams.set('lang', lang);
            window.history.pushState({ lang }, '', url);
        }
    }

    renderWithVue(config);

    if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function switchLanguage() {
    const newLang = getOppositeLang(currentLang);

    try {
        const data = await loadConfigForLanguage(newLang);
        await applyLanguage(newLang, data, { scrollToTop: true });
    } catch (error) {
        console.error('语言切换失败:', error);
        const message = currentLang === 'en'
            ? `Language switch failed: ${error.message}`
            : `语言切换失败: ${error.message}`;
        alert(message);
    }
}

async function initApp(config) {
    if (!config) {
        console.error('配置数据为空！');
        return;
    }

    currentLang = detectCurrentLanguage(
        window.location.search,
        localStorage.getItem('preferredLanguage'),
        typeof window.siteConfig !== 'undefined' && window.siteConfig !== null
    );

    try {
        const data = currentLang === 'en'
            ? await loadConfigForLanguage('en')
            : config;
        await applyLanguage(currentLang, data);
    } catch (error) {
        console.warn('无法加载目标语言配置，使用默认配置:', error);
        await applyLanguage('zh', config);
    }
}

async function handlePopState() {
    const lang = detectCurrentLanguage(
        window.location.search,
        null,
        false
    );

    if (lang === currentLang) {
        return;
    }

    try {
        const data = await loadConfigForLanguage(lang);
        currentLang = lang;
        currentConfig = data;
        renderWithVue(data);
    } catch (error) {
        console.error('浏览器导航时语言同步失败:', error);
    }
}

function bootstrap() {
    if (typeof Vue === 'undefined') {
        showFatalError(
            '<div style="padding: 20px; text-align: center;">' +
            '<h2>页面加载失败</h2>' +
            '<p>Vue.js 未能从 CDN 加载，请检查网络连接后刷新页面。</p>' +
            '</div>'
        );
        return;
    }

    window.addEventListener('popstate', handlePopState);

    if (typeof window.siteConfig !== 'undefined' && window.siteConfig !== null) {
        initApp(window.siteConfig);
    } else {
        fetchConfig(getConfigPathForLang('zh'))
            .then(initApp)
            .catch(error => {
                console.error('加载配置失败:', error);
                showFatalError(
                    '<div style="padding: 20px; text-align: center;">' +
                    '<h2>配置加载失败</h2>' +
                    '<p>请检查 assets/data/homeConfig.json 是否存在且可访问。</p>' +
                    '</div>'
                );
            });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
