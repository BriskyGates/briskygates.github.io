// 使用 Vue.js 来渲染页面内容
// 从 JSON 配置文件加载内容

const {
    getBasePath,
    detectCurrentLanguage,
    getConfigPathForLang,
    getDocumentLang,
    getDefaultToastMessage,
    getLanguageOptions,
    getLanguageLabel,
    isSupportedLang
} = window.SiteAppCore;

const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/95c6e7c8-7469-442c-bcb4-4217417cbdd6';
const FLOW_SECTION_IDS = ['flow-rag', 'flow-agent', 'flow-finance', 'flow-community'];

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
        vueAppInstance.langMenuOpen = false;
        vueAppInstance.langMenuSource = null;
        updatePageMeta(config);
        vueAppInstance.$nextTick(() => {
            vueAppInstance.initScrollReveals();
        });
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
                langMenuOpen: false,
                langMenuSource: null,
                _scrollSpyHandler: null,
                _resizeHandler: null,
                _scrollEndTimer: null,
                _scrollIdleTimer: null,
                _isProgrammaticScroll: false,
                _ticking: false,
                _cachedOffset: null,
                _cachedOffsetWidth: null,
                _langMenuOutsideHandler: null,
                _langMenuEscapeHandler: null,
                _revealObserver: null,
                _statsAnimated: false,
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
                const activeId = FLOW_SECTION_IDS.includes(this.activeSection) ? 'flow-rag' : this.activeSection;
                const item = nav.find(entry => entry.id === activeId);
                return item?.label || '';
            },
            languageOptions() {
                return getLanguageOptions();
            },
            currentLanguageLabel() {
                return getLanguageLabel(this.currentLang);
            }
        },
        mounted() {
            this._ticking = false;
            this._scrollSpyHandler = () => {
                if (this._isProgrammaticScroll) {
                    if (this._scrollIdleTimer) {
                        clearTimeout(this._scrollIdleTimer);
                    }
                    this._scrollIdleTimer = setTimeout(() => {
                        if (this._isProgrammaticScroll) {
                            this._isProgrammaticScroll = false;
                            clearTimeout(this._scrollEndTimer);
                            this._scrollEndTimer = null;
                            this._scrollIdleTimer = null;
                            this.updateActiveSection();
                        }
                    }, 150);
                    return;
                }
                if (!this._ticking) {
                    this._ticking = true;
                    requestAnimationFrame(() => {
                        this.updateActiveSection();
                        this._ticking = false;
                    });
                }
            };
            this._resizeHandler = () => {
                this._cachedOffset = null;
                this._cachedOffsetWidth = null;
                this.updateActiveSection();
            };
            window.addEventListener('scroll', this._scrollSpyHandler, { passive: true });
            window.addEventListener('resize', this._resizeHandler, { passive: true });
            this.$nextTick(() => {
                this.updateActiveSection();
                this.initScrollReveals();
                this.initHeroStatsCounter();
            });

            this._langMenuOutsideHandler = (event) => {
                if (!this.langMenuOpen) {
                    return;
                }
                if (!event.target.closest('.lang-dropdown')) {
                    this.langMenuOpen = false;
                }
            };
            this._langMenuEscapeHandler = (event) => {
                if (event.key === 'Escape' && this.langMenuOpen) {
                    this.langMenuOpen = false;
                }
            };
            document.addEventListener('click', this._langMenuOutsideHandler);
            document.addEventListener('keydown', this._langMenuEscapeHandler);
        },
        unmounted() {
            if (this._revealObserver) {
                this._revealObserver.disconnect();
                this._revealObserver = null;
            }
            if (this._scrollSpyHandler) {
                window.removeEventListener('scroll', this._scrollSpyHandler);
            }
            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
            }
            if (this._scrollEndTimer) {
                clearTimeout(this._scrollEndTimer);
            }
            if (this._scrollIdleTimer) {
                clearTimeout(this._scrollIdleTimer);
            }
            if (this._langMenuOutsideHandler) {
                document.removeEventListener('click', this._langMenuOutsideHandler);
            }
            if (this._langMenuEscapeHandler) {
                document.removeEventListener('keydown', this._langMenuEscapeHandler);
            }
        },
        methods: {
            getNavIcon(id) {
                const icons = {
                    home: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="nav-g-home" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#38bdf8"/>
                                <stop offset="100%" stop-color="#0284c7"/>
                            </linearGradient>
                            <linearGradient id="nav-f-home" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.22"/>
                                <stop offset="100%" stop-color="#0284c7" stop-opacity="0.06"/>
                            </linearGradient>
                        </defs>
                        <path d="M3 10.25L12 3.5l9 6.75V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20V10.25z" fill="url(#nav-f-home)"/>
                        <path d="M3 10.25L12 3.5l9 6.75V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20V10.25z" stroke="url(#nav-g-home)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.5 21.5V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7.5" stroke="url(#nav-g-home)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="8.2" r="1.25" fill="#38bdf8"/>
                    </svg>`,
                    showcase: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="nav-g-showcase" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb923c"/>
                                <stop offset="50%" stop-color="#f97316"/>
                                <stop offset="100%" stop-color="#ef4444"/>
                            </linearGradient>
                            <linearGradient id="nav-f-showcase" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb923c" stop-opacity="0.28"/>
                                <stop offset="100%" stop-color="#ef4444" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <path d="M12 2c-.5 2.5-2.5 4.5-4.5 6.5C5 11 3.5 13.5 3.5 16.5A8.5 8.5 0 0 0 12 22a8.5 8.5 0 0 0 8.5-5.5c0-4-3-7.5-5-9.5-.5 2.5-2 4-3.5 4C12 9 12.5 5 12 2z" fill="url(#nav-f-showcase)"/>
                        <path d="M12 2c-.5 2.5-2.5 4.5-4.5 6.5C5 11 3.5 13.5 3.5 16.5A8.5 8.5 0 0 0 12 22a8.5 8.5 0 0 0 8.5-5.5c0-4-3-7.5-5-9.5-.5 2.5-2 4-3.5 4C12 9 12.5 5 12 2z" stroke="url(#nav-g-showcase)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 18.5a3 3 0 0 0 3-3c0-2-1.5-3-3-4.5-1.5 1.5-3 2.5-3 4.5a3 3 0 0 0 3 3z" fill="url(#nav-g-showcase)" opacity="0.85"/>
                    </svg>`,
                    'flow-rag': `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="nav-g-flow" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#c084fc"/>
                                <stop offset="100%" stop-color="#818cf8"/>
                            </linearGradient>
                            <linearGradient id="nav-f-flow" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#c084fc" stop-opacity="0.22"/>
                                <stop offset="100%" stop-color="#818cf8" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <rect x="3" y="3.5" width="18" height="4.5" rx="1.75" fill="url(#nav-f-flow)"/>
                        <rect x="3" y="3.5" width="18" height="4.5" rx="1.75" stroke="url(#nav-g-flow)" stroke-width="1.8"/>
                        <rect x="3" y="9.75" width="18" height="4.5" rx="1.75" fill="url(#nav-f-flow)"/>
                        <rect x="3" y="9.75" width="18" height="4.5" rx="1.75" stroke="url(#nav-g-flow)" stroke-width="1.8"/>
                        <rect x="3" y="16" width="18" height="4.5" rx="1.75" fill="url(#nav-f-flow)"/>
                        <rect x="3" y="16" width="18" height="4.5" rx="1.75" stroke="url(#nav-g-flow)" stroke-width="1.8"/>
                        <circle cx="6.5" cy="5.75" r="1" fill="#c084fc"/>
                        <circle cx="12" cy="12" r="1" fill="#a855f7"/>
                        <circle cx="17.5" cy="18.25" r="1" fill="#818cf8"/>
                    </svg>`,
                    experience: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="nav-g-exp" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#34d399"/>
                                <stop offset="100%" stop-color="#059669"/>
                            </linearGradient>
                        </defs>
                        <path d="M5.5 4v16" stroke="url(#nav-g-exp)" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="0.1 3.5"/>
                        <rect x="9.5" y="3.5" width="11" height="4.2" rx="1.5" fill="rgba(52, 211, 153, 0.16)" stroke="url(#nav-g-exp)" stroke-width="1.6"/>
                        <circle cx="5.5" cy="5.6" r="2.2" fill="#34d399"/>
                        <rect x="9.5" y="9.9" width="11" height="4.2" rx="1.5" fill="rgba(52, 211, 153, 0.16)" stroke="url(#nav-g-exp)" stroke-width="1.6"/>
                        <circle cx="5.5" cy="12" r="2.2" fill="#10b981"/>
                        <rect x="9.5" y="16.3" width="11" height="4.2" rx="1.5" fill="rgba(52, 211, 153, 0.16)" stroke="url(#nav-g-exp)" stroke-width="1.6"/>
                        <circle cx="5.5" cy="18.4" r="2.2" fill="#059669"/>
                    </svg>`,
                    skills: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="nav-g-skills" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fde047"/>
                                <stop offset="50%" stop-color="#fbbf24"/>
                                <stop offset="100%" stop-color="#f59e0b"/>
                            </linearGradient>
                            <linearGradient id="nav-f-skills" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fde047" stop-opacity="0.28"/>
                                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.1"/>
                            </linearGradient>
                        </defs>
                        <path d="M13 2.5L3.5 13.5a1 1 0 0 0 .8 1.5H11l-2 7.5L19.5 10.5a1 1 0 0 0-.8-1.5H13l2-6.5a.5.5 0 0 0-.8-.5H13z" fill="url(#nav-f-skills)"/>
                        <path d="M13 2.5L3.5 13.5a1 1 0 0 0 .8 1.5H11l-2 7.5L19.5 10.5a1 1 0 0 0-.8-1.5H13l2-6.5a.5.5 0 0 0-.8-.5H13z" stroke="url(#nav-g-skills)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <polygon points="12,7 9,13 14,13 11,18 16,11 11,11" fill="#fde047" opacity="0.6"/>
                    </svg>`,
                    services: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="nav-g-services" x1="2" y1="4" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#60a5fa"/>
                                <stop offset="100%" stop-color="#6366f1"/>
                            </linearGradient>
                            <linearGradient id="nav-f-services" x1="2" y1="4" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.22"/>
                                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <rect x="2.5" y="7" width="19" height="13.5" rx="3" fill="url(#nav-f-services)"/>
                        <rect x="2.5" y="7" width="19" height="13.5" rx="3" stroke="url(#nav-g-services)" stroke-width="1.8"/>
                        <path d="M8 7V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V7" stroke="url(#nav-g-services)" stroke-width="1.8" stroke-linecap="round"/>
                        <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="url(#nav-g-services)" stroke-width="1.5" stroke-dasharray="1.5 2"/>
                        <rect x="10" y="10.5" width="4" height="3" rx="1" fill="#818cf8"/>
                    </svg>`,
                    contact: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="nav-g-contact" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb7185"/>
                                <stop offset="100%" stop-color="#e11d48"/>
                            </linearGradient>
                            <linearGradient id="nav-f-contact" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb7185" stop-opacity="0.24"/>
                                <stop offset="100%" stop-color="#e11d48" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <rect x="2.5" y="4.5" width="19" height="15" rx="3" fill="url(#nav-f-contact)"/>
                        <rect x="2.5" y="4.5" width="19" height="15" rx="3" stroke="url(#nav-g-contact)" stroke-width="1.8"/>
                        <path d="M3 6.5l8.15 6.11a1.5 1.5 0 0 0 1.7 0L21 6.5" stroke="url(#nav-g-contact)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="14" r="1.3" fill="#fb7185"/>
                    </svg>`
                };
                return icons[id] || `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/></svg>`;
            },
            getScrollOffset() {
                if (this._cachedOffset !== null && this._cachedOffsetWidth === window.innerWidth) {
                    return this._cachedOffset;
                }
                const topbar = parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue('--topbar-height'),
                    10
                );
                const extra = window.innerWidth <= 768 ? 12 : 20;
                this._cachedOffset = (topbar || 60) + extra;
                this._cachedOffsetWidth = window.innerWidth;
                return this._cachedOffset;
            },
            scrollToSection(id) {
                this.sidebarOpen = false;
                const navId = FLOW_SECTION_IDS.includes(id) ? 'flow-rag' : id;
                this.activeSection = navId;

                const el = document.getElementById(id);
                if (!el) {
                    return;
                }

                this._isProgrammaticScroll = true;
                if (this._scrollEndTimer) {
                    clearTimeout(this._scrollEndTimer);
                }
                if (this._scrollIdleTimer) {
                    clearTimeout(this._scrollIdleTimer);
                }

                const offset = this.getScrollOffset();
                const top = el.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

                const unlock = () => {
                    if (!this._isProgrammaticScroll) {
                        return;
                    }
                    this._isProgrammaticScroll = false;
                    if (this._scrollEndTimer) {
                        clearTimeout(this._scrollEndTimer);
                        this._scrollEndTimer = null;
                    }
                    if (this._scrollIdleTimer) {
                        clearTimeout(this._scrollIdleTimer);
                        this._scrollIdleTimer = null;
                    }
                    window.removeEventListener('scrollend', unlock);
                    window.removeEventListener('wheel', unlock);
                    window.removeEventListener('touchstart', unlock);
                    this.updateActiveSection();
                };

                window.addEventListener('scrollend', unlock, { once: true });
                window.addEventListener('wheel', unlock, { passive: true, once: true });
                window.addEventListener('touchstart', unlock, { passive: true, once: true });
                this._scrollEndTimer = setTimeout(unlock, 3000);
            },
            updateActiveSection() {
                const nav = this.config?.ui?.nav;
                if (!nav || !nav.length) {
                    return;
                }

                const scrollY = window.scrollY;
                const viewportHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight;

                // 1. 触底检测：保证滚动到底部时联系模块必被点亮
                if (scrollY + viewportHeight >= docHeight - 24) {
                    this.activeSection = nav[nav.length - 1].id;
                    return;
                }

                const offset = this.getScrollOffset();

                // 2. 页面顶部检测：保证在顶部时首页稳妥点亮
                if (scrollY <= Math.max(10, offset / 2)) {
                    this.activeSection = nav[0].id;
                    return;
                }

                // 3. 视口中上部阅读焦点线判定（带容差缓冲）
                const triggerLine = Math.max(offset + 30, Math.min(viewportHeight * 0.35, 240));

                const allSections = [
                    'home',
                    'showcase',
                    'flow-rag',
                    'flow-agent',
                    'flow-finance',
                    'flow-community',
                    'experience',
                    'skills',
                    'services',
                    'contact'
                ];

                let currentSectionId = nav[0].id;
                for (const sid of allSections) {
                    const el = document.getElementById(sid);
                    if (el) {
                        const top = el.getBoundingClientRect().top;
                        if (top <= triggerLine) {
                            currentSectionId = sid;
                        }
                    }
                }

                const finalNavId = FLOW_SECTION_IDS.includes(currentSectionId) ? 'flow-rag' : currentSectionId;
                this.activeSection = finalNavId;
            },
            toggleLangMenu(source) {
                if (this.langMenuOpen && this.langMenuSource === source) {
                    this.langMenuOpen = false;
                    this.langMenuSource = null;
                    return;
                }
                this.langMenuSource = source;
                this.langMenuOpen = true;
            },
            closeLangMenu() {
                this.langMenuOpen = false;
                this.langMenuSource = null;
            },
            async selectLanguage(lang) {
                this.closeLangMenu();
                await setLanguage(lang);
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
            },
            initScrollReveals() {
                if (typeof IntersectionObserver === 'undefined') {
                    document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-revealed'));
                    return;
                }
                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-revealed'));
                    return;
                }

                if (this._revealObserver) {
                    this._revealObserver.disconnect();
                }

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-revealed');
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '0px 0px -40px 0px',
                    threshold: 0.05
                });

                document.querySelectorAll('.motion-reveal').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        el.classList.add('is-revealed');
                    } else {
                        observer.observe(el);
                    }
                });

                this._revealObserver = observer;
            },
            initHeroStatsCounter() {
                if (this._statsAnimated) {
                    return;
                }
                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    this._statsAnimated = true;
                    return;
                }

                const statSection = document.querySelector('.hero-stats');
                if (!statSection) {
                    return;
                }

                const runCounter = () => {
                    if (this._statsAnimated) return;
                    this._statsAnimated = true;

                    const statEls = document.querySelectorAll('.hero-stat-num');
                    statEls.forEach(el => {
                        const raw = el.textContent.trim();
                        const match = raw.match(/^(\D*)(\d+)(.*)$/);
                        if (!match) return;

                        const prefix = match[1] || '';
                        const targetNum = parseInt(match[2], 10);
                        const suffix = match[3] || '';
                        const duration = 1200;
                        const startTime = performance.now();

                        const step = (now) => {
                            const elapsed = now - startTime;
                            const progress = Math.min(1, elapsed / duration);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const current = Math.round(eased * targetNum);
                            el.textContent = `${prefix}${current}${suffix}`;

                            if (progress < 1) {
                                requestAnimationFrame(step);
                            } else {
                                el.textContent = raw;
                            }
                        };
                        requestAnimationFrame(step);
                    });
                };

                if (typeof IntersectionObserver === 'undefined') {
                    runCounter();
                    return;
                }

                const statsObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            runCounter();
                            statsObserver.disconnect();
                        }
                    });
                }, { threshold: 0.1 });

                statsObserver.observe(statSection);
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

async function setLanguage(newLang) {
    if (!isSupportedLang(newLang) || newLang === currentLang) {
        return;
    }

    try {
        const data = await loadConfigForLanguage(newLang);
        await applyLanguage(newLang, data, { scrollToTop: true });
    } catch (error) {
        console.error('语言切换失败:', error);
        const message = currentLang === 'en' || currentLang === 'plain-en'
            ? `Language switch failed: ${error.message}`
            : currentLang === 'zh-Hant' || currentLang === 'plain-Hant'
                ? `語言切換失敗：${error.message}`
                : currentLang === 'plain'
                    ? `切换失败：${error.message}`
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
        const data = currentLang === 'zh'
            ? config
            : await loadConfigForLanguage(currentLang);
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
