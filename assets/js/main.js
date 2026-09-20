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
                const g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
                if (!g._navIconSeq) g._navIconSeq = 0;
                const seq = ++g._navIconSeq;
                const gid = (name) => `nav-g-${name}-${seq}`;
                const fid = (name) => `nav-f-${name}-${seq}`;

                const icons = {
                    home: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="${gid('home')}" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#38bdf8"/>
                                <stop offset="100%" stop-color="#0284c7"/>
                            </linearGradient>
                            <linearGradient id="${fid('home')}" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.22"/>
                                <stop offset="100%" stop-color="#0284c7" stop-opacity="0.06"/>
                            </linearGradient>
                        </defs>
                        <path d="M3 10.25L12 3.5l9 6.75V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20V10.25z" fill="url(#${fid('home')})"/>
                        <path d="M3 10.25L12 3.5l9 6.75V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20V10.25z" stroke="url(#${gid('home')})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.5 21.5V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7.5" stroke="url(#${gid('home')})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="8.2" r="1.25" fill="#38bdf8"/>
                    </svg>`,
                    // 代表作：五角星（精选作品），原为火苗——火苗读作"热门/爆款"，与"作品集"不符
                    showcase: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="${gid('showcase')}" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb923c"/>
                                <stop offset="50%" stop-color="#f97316"/>
                                <stop offset="100%" stop-color="#ef4444"/>
                            </linearGradient>
                            <linearGradient id="${fid('showcase')}" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb923c" stop-opacity="0.28"/>
                                <stop offset="100%" stop-color="#ef4444" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <path d="M12 3l2.12 6.09 6.44.13-5.14 3.89 1.87 6.17L12 15.6l-5.29 3.68 1.87-6.17L3.44 9.22l6.44-.13L12 3z" fill="url(#${fid('showcase')})" stroke="url(#${gid('showcase')})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12.4" r="1.9" fill="url(#${gid('showcase')})"/>
                    </svg>`,
                    'flow-rag': `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="${gid('flow')}" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#c084fc"/>
                                <stop offset="100%" stop-color="#818cf8"/>
                            </linearGradient>
                            <linearGradient id="${fid('flow')}" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#c084fc" stop-opacity="0.22"/>
                                <stop offset="100%" stop-color="#818cf8" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <rect x="3" y="3.5" width="18" height="4.5" rx="1.75" fill="url(#${fid('flow')})"/>
                        <rect x="3" y="3.5" width="18" height="4.5" rx="1.75" stroke="url(#${gid('flow')})" stroke-width="1.8"/>
                        <rect x="3" y="9.75" width="18" height="4.5" rx="1.75" fill="url(#${fid('flow')})"/>
                        <rect x="3" y="9.75" width="18" height="4.5" rx="1.75" stroke="url(#${gid('flow')})" stroke-width="1.8"/>
                        <rect x="3" y="16" width="18" height="4.5" rx="1.75" fill="url(#${fid('flow')})"/>
                        <rect x="3" y="16" width="18" height="4.5" rx="1.75" stroke="url(#${gid('flow')})" stroke-width="1.8"/>
                        <circle cx="6.5" cy="5.75" r="1" fill="#c084fc"/>
                        <circle cx="12" cy="12" r="1" fill="#a855f7"/>
                        <circle cx="17.5" cy="18.25" r="1" fill="#818cf8"/>
                    </svg>`,
                    experience: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="${gid('exp')}" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#34d399"/>
                                <stop offset="100%" stop-color="#059669"/>
                            </linearGradient>
                        </defs>
                        <path d="M5.5 4v16" stroke="url(#${gid('exp')})" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="0.1 3.5"/>
                        <rect x="9.5" y="3.5" width="11" height="4.2" rx="1.5" fill="rgba(52, 211, 153, 0.16)" stroke="url(#${gid('exp')})" stroke-width="1.6"/>
                        <circle cx="5.5" cy="5.6" r="2.2" fill="#34d399"/>
                        <rect x="9.5" y="9.9" width="11" height="4.2" rx="1.5" fill="rgba(52, 211, 153, 0.16)" stroke="url(#${gid('exp')})" stroke-width="1.6"/>
                        <circle cx="5.5" cy="12" r="2.2" fill="#10b981"/>
                        <rect x="9.5" y="16.3" width="11" height="4.2" rx="1.5" fill="rgba(52, 211, 153, 0.16)" stroke="url(#${gid('exp')})" stroke-width="1.6"/>
                        <circle cx="5.5" cy="18.4" r="2.2" fill="#059669"/>
                    </svg>`,
                    skills: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="${gid('skills')}" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fde047"/>
                                <stop offset="50%" stop-color="#fbbf24"/>
                                <stop offset="100%" stop-color="#f59e0b"/>
                            </linearGradient>
                            <linearGradient id="${fid('skills')}" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fde047" stop-opacity="0.28"/>
                                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.1"/>
                            </linearGradient>
                        </defs>
                        <path d="M13 2.5L3.5 13.5a1 1 0 0 0 .8 1.5H11l-2 7.5L19.5 10.5a1 1 0 0 0-.8-1.5H13l2-6.5a.5.5 0 0 0-.8-.5H13z" fill="url(#${fid('skills')})"/>
                        <path d="M13 2.5L3.5 13.5a1 1 0 0 0 .8 1.5H11l-2 7.5L19.5 10.5a1 1 0 0 0-.8-1.5H13l2-6.5a.5.5 0 0 0-.8-.5H13z" stroke="url(#${gid('skills')})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <polygon points="12,7 9,13 14,13 11,18 16,11 11,11" fill="#fde047" opacity="0.6"/>
                    </svg>`,
                    services: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="${gid('services')}" x1="2" y1="4" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#60a5fa"/>
                                <stop offset="100%" stop-color="#6366f1"/>
                            </linearGradient>
                            <linearGradient id="${fid('services')}" x1="2" y1="4" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.22"/>
                                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <rect x="2.5" y="7" width="19" height="13.5" rx="3" fill="url(#${fid('services')})"/>
                        <rect x="2.5" y="7" width="19" height="13.5" rx="3" stroke="url(#${gid('services')})" stroke-width="1.8"/>
                        <path d="M8 7V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V7" stroke="url(#${gid('services')})" stroke-width="1.8" stroke-linecap="round"/>
                        <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="url(#${gid('services')})" stroke-width="1.5" stroke-dasharray="1.5 2"/>
                        <rect x="10" y="10.5" width="4" height="3" rx="1" fill="#818cf8"/>
                    </svg>`,
                    contact: `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs>
                            <linearGradient id="${gid('contact')}" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb7185"/>
                                <stop offset="100%" stop-color="#e11d48"/>
                            </linearGradient>
                            <linearGradient id="${fid('contact')}" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fb7185" stop-opacity="0.24"/>
                                <stop offset="100%" stop-color="#e11d48" stop-opacity="0.08"/>
                            </linearGradient>
                        </defs>
                        <rect x="2.5" y="4.5" width="19" height="15" rx="3" fill="url(#${fid('contact')})"/>
                        <rect x="2.5" y="4.5" width="19" height="15" rx="3" stroke="url(#${gid('contact')})" stroke-width="1.8"/>
                        <path d="M3 6.5l8.15 6.11a1.5 1.5 0 0 0 1.7 0L21 6.5" stroke="url(#${gid('contact')})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="14" r="1.3" fill="#fb7185"/>
                    </svg>`
                };
                return icons[id] || `<svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/></svg>`;
            },
            getShowcaseVisual(project) {
                const id = project?.id || '';
                if (id === 'fastapi_celery_kb') {
                    return `<svg class="showcase-visual-svg" viewBox="0 0 480 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <defs>
                            <linearGradient id="sc-g-kb-line" x1="40" y1="110" x2="440" y2="110" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#b49bc8" stop-opacity="0.3"/>
                                <stop offset="50%" stop-color="#c084fc"/>
                                <stop offset="100%" stop-color="#38bdf8"/>
                            </linearGradient>
                        </defs>
                        <g opacity="0.14" stroke="#a78bfa" stroke-width="0.75" stroke-dasharray="2 4">
                            <line x1="40" y1="55" x2="440" y2="55"/>
                            <line x1="40" y1="110" x2="440" y2="110"/>
                            <line x1="40" y1="165" x2="440" y2="165"/>
                            <line x1="100" y1="20" x2="100" y2="200"/>
                            <line x1="210" y1="20" x2="210" y2="200"/>
                            <line x1="320" y1="20" x2="320" y2="200"/>
                        </g>
                        <path d="M 75 110 L 160 110 L 250 110 L 340 110 L 405 110" stroke="url(#sc-g-kb-line)" stroke-width="2.5" stroke-linecap="round"/>
                        <path d="M 160 110 C 185 68, 205 68, 245 68 L 305 68 C 325 68, 335 90, 345 110" stroke="#c084fc" stroke-width="1.4" stroke-dasharray="3 3" opacity="0.6"/>
                        <path d="M 160 110 C 185 152, 205 152, 245 152 L 305 152 C 325 152, 335 130, 345 110" stroke="#818cf8" stroke-width="1.4" stroke-dasharray="3 3" opacity="0.6"/>
                        <!-- Node 1: Input Docs -->
                        <g transform="translate(45, 82)">
                            <rect width="56" height="56" rx="12" fill="#161922" stroke="#c084fc" stroke-width="1.6"/>
                            <rect x="13" y="14" width="22" height="28" rx="3" fill="#c084fc" fill-opacity="0.16" stroke="#c084fc" stroke-width="1.5"/>
                            <line x1="18" y1="21" x2="29" y2="21" stroke="#c084fc" stroke-width="1.5" stroke-linecap="round"/>
                            <line x1="18" y1="27" x2="27" y2="27" stroke="#c084fc" stroke-width="1.5" stroke-linecap="round"/>
                            <line x1="18" y1="33" x2="24" y2="33" stroke="#c084fc" stroke-width="1.5" stroke-linecap="round"/>
                            <circle cx="42" cy="20" r="3" fill="#38bdf8"/>
                            <text x="28" y="68" fill="#9aa3b2" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="600">研报 / 公告</text>
                        </g>
                        <!-- Node 2: Async Chunker -->
                        <g transform="translate(155, 82)">
                            <rect width="56" height="56" rx="12" fill="#161922" stroke="#a855f7" stroke-width="1.6"/>
                            <rect x="13" y="15" width="30" height="10" rx="3" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7" stroke-width="1.2"/>
                            <rect x="13" y="31" width="30" height="10" rx="3" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7" stroke-width="1.2"/>
                            <circle cx="28" cy="20" r="1.5" fill="#fde047"/>
                            <circle cx="28" cy="36" r="1.5" fill="#fde047"/>
                            <text x="28" y="68" fill="#9aa3b2" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="600">异步分块</text>
                        </g>
                        <!-- Node 3: Hybrid Store -->
                        <g transform="translate(255, 75)">
                            <rect width="66" height="70" rx="14" fill="#1a1e28" stroke="#818cf8" stroke-width="1.8"/>
                            <path d="M 18 20 C 18 16, 48 16, 48 20 C 48 24, 18 24, 18 20 Z" fill="#818cf8" fill-opacity="0.3" stroke="#818cf8" stroke-width="1.2"/>
                            <path d="M 18 20 V 32 C 18 36, 48 36, 48 32 V 20" fill="none" stroke="#818cf8" stroke-width="1.2"/>
                            <path d="M 18 32 V 44 C 18 48, 48 48, 48 44 V 32" fill="none" stroke="#818cf8" stroke-width="1.2"/>
                            <circle cx="33" cy="32" r="2" fill="#38bdf8"/>
                            <text x="33" y="80" fill="#818cf8" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="700">双路召回</text>
                        </g>
                        <!-- Node 4: Neural Rerank -->
                        <g transform="translate(365, 78)">
                            <rect width="64" height="64" rx="14" fill="#161922" stroke="#38bdf8" stroke-width="1.8"/>
                            <polygon points="18,17 46,17 38,33 26,33" fill="#38bdf8" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.5"/>
                            <line x1="32" y1="33" x2="32" y2="47" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="32" cy="47" r="3" fill="#34d399"/>
                            <text x="32" y="76" fill="#38bdf8" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="700">时效重排</text>
                        </g>
                    </svg>`;
                }
                if (id === 'doc_intelligence') {
                    return `<svg class="showcase-visual-svg" viewBox="0 0 480 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <g opacity="0.14" stroke="#6366f1" stroke-width="0.75" stroke-dasharray="2 4">
                            <line x1="40" y1="55" x2="440" y2="55"/>
                            <line x1="40" y1="110" x2="440" y2="110"/>
                            <line x1="40" y1="165" x2="440" y2="165"/>
                            <line x1="120" y1="20" x2="120" y2="200"/>
                            <line x1="240" y1="20" x2="240" y2="200"/>
                            <line x1="360" y1="20" x2="360" y2="200"/>
                        </g>
                        <!-- Left: Scanned messy document with bounding boxes -->
                        <g transform="translate(60, 42)">
                            <rect width="84" height="114" rx="8" fill="#161922" stroke="#6366f1" stroke-width="1.6"/>
                            <line x1="16" y1="94" x2="68" y2="24" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2 3" opacity="0.5"/>
                            <rect x="12" y="16" width="60" height="12" rx="2" fill="#6366f1" fill-opacity="0.2" stroke="#6366f1" stroke-width="1" stroke-dasharray="2 2"/>
                            <rect x="12" y="34" width="28" height="42" rx="2" fill="#38bdf8" fill-opacity="0.15" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
                            <rect x="44" y="34" width="28" height="42" rx="2" fill="#38bdf8" fill-opacity="0.15" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
                            <rect x="12" y="82" width="60" height="20" rx="2" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7" stroke-width="1" stroke-dasharray="2 2"/>
                            <text x="42" y="128" fill="#9aa3b2" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="600">复杂扫描版面</text>
                        </g>
                        <!-- Center: Coordinate Scanner Crosshair Beam -->
                        <g transform="translate(195, 76)">
                            <path d="M 0 25 L 45 6 L 45 44 Z" fill="#6366f1" fill-opacity="0.16" stroke="#6366f1" stroke-width="1.4"/>
                            <circle cx="48" cy="25" r="18" fill="#1a1e28" stroke="#38bdf8" stroke-width="2"/>
                            <line x1="36" y1="25" x2="60" y2="25" stroke="#38bdf8" stroke-width="1.5"/>
                            <line x1="48" y1="13" x2="48" y2="37" stroke="#38bdf8" stroke-width="1.5"/>
                            <circle cx="48" cy="25" r="5" fill="#38bdf8" fill-opacity="0.35"/>
                            <text x="48" y="58" fill="#38bdf8" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="700">规则 + 坐标对齐</text>
                        </g>
                        <!-- Right: Clean Structured Tree & Table -->
                        <g transform="translate(325, 42)">
                            <rect width="96" height="114" rx="8" fill="#161922" stroke="#34d399" stroke-width="1.6"/>
                            <rect x="14" y="16" width="38" height="6" rx="2" fill="#34d399"/>
                            <rect x="14" y="28" width="68" height="38" rx="3" fill="#34d399" fill-opacity="0.08" stroke="#34d399" stroke-width="1"/>
                            <line x1="14" y1="40" x2="82" y2="40" stroke="#34d399" stroke-width="0.8"/>
                            <line x1="14" y1="52" x2="82" y2="52" stroke="#34d399" stroke-width="0.8"/>
                            <line x1="48" y1="28" x2="48" y2="66" stroke="#34d399" stroke-width="0.8"/>
                            <line x1="14" y1="76" x2="76" y2="76" stroke="#9aa3b2" stroke-width="1.5" stroke-linecap="round"/>
                            <line x1="14" y1="84" x2="64" y2="84" stroke="#9aa3b2" stroke-width="1.5" stroke-linecap="round"/>
                            <line x1="14" y1="92" x2="70" y2="92" stroke="#9aa3b2" stroke-width="1.5" stroke-linecap="round"/>
                            <text x="48" y="128" fill="#34d399" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="700">结构化 Markdown/AST</text>
                        </g>
                    </svg>`;
                }
                if (id === 'group_management_bot') {
                    return `<svg class="showcase-visual-svg" viewBox="0 0 480 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <g opacity="0.14" stroke="#10b981" stroke-width="0.75" stroke-dasharray="2 4">
                            <line x1="40" y1="55" x2="440" y2="55"/>
                            <line x1="40" y1="110" x2="440" y2="110"/>
                            <line x1="40" y1="165" x2="440" y2="165"/>
                            <line x1="110" y1="20" x2="110" y2="200"/>
                            <line x1="230" y1="20" x2="230" y2="200"/>
                            <line x1="350" y1="20" x2="350" y2="200"/>
                        </g>
                        <!-- Left: High concurrency chat streams -->
                        <g transform="translate(60, 60)">
                            <rect width="64" height="84" rx="10" fill="#161922" stroke="#34d399" stroke-width="1.5"/>
                            <rect x="10" y="16" width="34" height="12" rx="4" fill="#34d399" fill-opacity="0.25"/>
                            <rect x="20" y="34" width="34" height="12" rx="4" fill="#38bdf8" fill-opacity="0.25"/>
                            <rect x="10" y="52" width="38" height="12" rx="4" fill="#34d399" fill-opacity="0.25"/>
                            <text x="32" y="98" fill="#9aa3b2" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="600">多群事件流</text>
                        </g>
                        <!-- Center: Risk Shield & Transaction Audit Engine -->
                        <g transform="translate(195, 48)">
                            <path d="M 40 8 L 76 23 V 63 C 76 93, 40 113, 40 113 C 40 113, 4 93, 4 63 V 23 Z" fill="#1a1e28" stroke="#10b981" stroke-width="2"/>
                            <path d="M 40 20 L 66 32 V 62 C 66 84, 40 100, 40 100 C 40 100, 14 84, 14 62 V 32 Z" fill="#10b981" fill-opacity="0.16" stroke="#34d399" stroke-width="1"/>
                            <path d="M 28 56 L 36 64 L 52 46" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <text x="40" y="128" fill="#34d399" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="700">风控防刷 + 财务对账</text>
                        </g>
                        <!-- Right: Redis / Dispatch & Ops Console -->
                        <g transform="translate(340, 60)">
                            <rect width="78" height="84" rx="10" fill="#161922" stroke="#f59e0b" stroke-width="1.5"/>
                            <circle cx="20" cy="22" r="4" fill="#34d399"/>
                            <line x1="30" y1="22" x2="66" y2="22" stroke="#9aa3b2" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="20" cy="42" r="4" fill="#38bdf8"/>
                            <line x1="30" y1="42" x2="58" y2="42" stroke="#9aa3b2" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="20" cy="62" r="4" fill="#f59e0b"/>
                            <line x1="30" y1="62" x2="64" y2="62" stroke="#9aa3b2" stroke-width="2" stroke-linecap="round"/>
                            <text x="39" y="98" fill="#f59e0b" font-size="8.5" font-family="sans-serif" text-anchor="middle" font-weight="700">运营控制台 / 工单</text>
                        </g>
                        <!-- Connecting pulse rays -->
                        <path d="M 124 95 L 195 85" stroke="#34d399" stroke-width="2" stroke-dasharray="3 3"/>
                        <path d="M 271 85 L 340 95" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3"/>
                    </svg>`;
                }
                return `<div class="media-card-fallback-accent" style="background:${project?.accent || 'var(--accent)'}"></div>`;
            },
            getTechIcon(idOrKey, context) {
                const k = String(idOrKey || '').trim();
                // ⚠️ 调用方必须优先传**跨语言稳定**的键：id（如 `flow-rag`）或 icon emoji（如 `🩺`）。
                // 绝不能把 title / type / label 这类会随语言变的文案放在前面——一旦换个语言改了措辞，
                // 下面的关键词分支就全部失配，整块图标会掉成兜底的文本角标（曾出现在「大白话」「繁體」「英文」版）。
                // 正确写法见 index.html：`getTechIcon(skill.icon || skill.title, 'skill')`。

                // 1. Hero Flow Entries
                if (context === 'hero-flow') {
                    if (k === 'flow-rag' || k === '📚') {
                        return `<svg class="tech-icon tech-icon--flow-rag" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="ti-g-rag" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs>
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="url(#ti-g-rag)" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="rgba(56,189,248,0.12)" stroke="url(#ti-g-rag)" stroke-width="1.8"/>
                            <line x1="9" y1="7" x2="16" y2="7" stroke="url(#ti-g-rag)" stroke-width="1.6" stroke-linecap="round"/>
                            <line x1="9" y1="11" x2="14" y2="11" stroke="url(#ti-g-rag)" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'flow-agent' || k === '🤖') {
                        return `<svg class="tech-icon tech-icon--flow-agent" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="ti-g-agent" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs>
                            <rect x="3" y="11" width="18" height="10" rx="3" fill="rgba(192,132,252,0.14)" stroke="url(#ti-g-agent)" stroke-width="1.8"/>
                            <circle cx="12" cy="5" r="2" fill="url(#ti-g-agent)"/>
                            <path d="M12 7v4M8 15h.01M16 15h.01" stroke="url(#ti-g-agent)" stroke-width="2" stroke-linecap="round"/>
                            <path d="M9 18h6" stroke="url(#ti-g-agent)" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'flow-finance' || k === '📈') {
                        return `<svg class="tech-icon tech-icon--flow-finance" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="ti-g-fin" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs>
                            <path d="M3 20h18" stroke="url(#ti-g-fin)" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M5 16l5-6 4 3 6-8" fill="none" stroke="url(#ti-g-fin)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <polygon points="17,5 20,5 20,8" fill="url(#ti-g-fin)"/>
                        </svg>`;
                    }
                    if (k === 'flow-community' || k === '🤝') {
                        return `<svg class="tech-icon tech-icon--flow-community" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="ti-g-comm" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#f97316"/></linearGradient></defs>
                            <path d="M12 2l8 4v6c0 5.5-3.5 10-8 12-4.5-2-8-6.5-8-12V6l8-4z" fill="rgba(251,146,60,0.15)" stroke="url(#ti-g-comm)" stroke-width="1.8" stroke-linejoin="round"/>
                            <path d="M9 12l2 2 4-4" stroke="url(#ti-g-comm)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                }

                // 2. Skills
                if (context === 'skill' || k === '🤖' || k === '📊' || k === '📄' || k === '⚡') {
                    if (k.includes('工程化') || k.includes('Engineering') || k === '🤖') {
                        // 应用工程化：代码工程语义（原为芯片外观 —— 芯片读作"硬件/算力"，与"工程化"不符）
                        return `<svg class="skill-icon-svg" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sk-g-eng" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs>
                            <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="rgba(56,189,248,0.1)" stroke="url(#sk-g-eng)" stroke-width="1.8"/>
                            <path d="M10.2 9.4 7.7 12l2.5 2.6M13.8 9.4 16.3 12l-2.5 2.6" stroke="url(#sk-g-eng)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="12.9" y1="8.6" x2="11.1" y2="15.4" stroke="url(#sk-g-eng)" stroke-width="1.9" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k.includes('知识库') || k.includes('文本') || k.includes('Knowledge') || k === '📊') {
                        return `<svg class="skill-icon-svg" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sk-g-kb" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs>
                            <ellipse cx="12" cy="5" rx="8" ry="3" fill="rgba(192,132,252,0.2)" stroke="url(#sk-g-kb)" stroke-width="1.8"/>
                            <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" stroke="url(#sk-g-kb)" stroke-width="1.8"/>
                            <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" stroke="url(#sk-g-kb)" stroke-width="1.8"/>
                            <circle cx="16" cy="14" r="1.5" fill="#fde047"/>
                        </svg>`;
                    }
                    if (k.includes('文档') || k.includes('Document') || k === '📄') {
                        return `<svg class="skill-icon-svg" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sk-g-doc" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(96,165,250,0.12)" stroke="url(#sk-g-doc)" stroke-width="1.8"/>
                            <polyline points="14 2 14 8 20 8" stroke="url(#sk-g-doc)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="9" y1="13" x2="15" y2="13" stroke="url(#sk-g-doc)" stroke-width="1.8" stroke-linecap="round"/>
                            <line x1="9" y1="17" x2="13" y2="17" stroke="url(#sk-g-doc)" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k.includes('集成') || k.includes('自动化') || k.includes('Automation') || k === '⚡') {
                        return `<svg class="skill-icon-svg" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sk-g-aut" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs>
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(253,224,71,0.15)" stroke="url(#sk-g-aut)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                }

                // 3. Services
                if (context === 'service') {
                    if (k.includes('15') || k.includes('澄清') || k.includes('Clarification') || k === '💬') {
                        return `<svg class="service-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sv-g-msg" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs>
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="rgba(56,189,248,0.12)" stroke="url(#sv-g-msg)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="8.5" cy="12" r="1" fill="#38bdf8"/>
                            <circle cx="12" cy="12" r="1" fill="#38bdf8"/>
                            <circle cx="15.5" cy="12" r="1" fill="#38bdf8"/>
                        </svg>`;
                    }
                    if (k.includes('诊断') || k.includes('Audit') || k === '🩺') {
                        return `<svg class="service-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sv-g-diag" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs>
                            <circle cx="12" cy="12" r="9" fill="rgba(52,211,153,0.12)" stroke="url(#sv-g-diag)" stroke-width="1.8"/>
                            <polyline points="7 12 10 12 11.5 8 13.5 16 15 12 17 12" stroke="url(#sv-g-diag)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    if (k.includes('顾问') || k.includes('Advisory') || k === '📚') {
                        return `<svg class="service-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sv-g-adv" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs>
                            <circle cx="12" cy="12" r="9" fill="rgba(129,140,248,0.12)" stroke="url(#sv-g-adv)" stroke-width="1.8"/>
                            <polygon points="12,7 15,13 12,11 9,13" fill="url(#sv-g-adv)"/>
                            <polygon points="12,17 9,11 12,13 15,11" fill="rgba(129,140,248,0.4)"/>
                        </svg>`;
                    }
                    if (k.includes('模块') || k.includes('Module') || k === '📦') {
                        return `<svg class="service-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sv-g-mod" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs>
                            <path d="M12 2l8 4.5v11l-8 4.5-8-4.5v-11L12 2z" fill="rgba(251,191,36,0.12)" stroke="url(#sv-g-mod)" stroke-width="1.8" stroke-linejoin="round"/>
                            <polyline points="20 6.5 12 11 4 6.5" stroke="url(#sv-g-mod)" stroke-width="1.8"/>
                            <line x1="12" y1="11" x2="12" y2="22" stroke="url(#sv-g-mod)" stroke-width="1.8"/>
                        </svg>`;
                    }
                    if (k.includes('项目') || k.includes('完整') || k.includes('Project') || k === '🚀') {
                        return `<svg class="service-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <defs><linearGradient id="sv-g-proj" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#fb7185"/><stop offset="100%" stop-color="#e11d48"/></linearGradient></defs>
                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="rgba(251,113,133,0.2)" stroke="url(#sv-g-proj)" stroke-width="1.6"/>
                            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="rgba(251,113,133,0.12)" stroke="url(#sv-g-proj)" stroke-width="1.8"/>
                            <circle cx="15.5" cy="8.5" r="1.5" fill="#fb7185"/>
                        </svg>`;
                    }
                }

                // 4. Philosophy
                if (context === 'philosophy' || k === '💡') {
                    return `<svg class="philosophy-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs><linearGradient id="ph-g-idea" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient></defs>
                        <path d="M9 18h6M10 22h4" stroke="url(#ph-g-idea)" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" fill="rgba(253,224,71,0.12)" stroke="url(#ph-g-idea)" stroke-width="1.8"/>
                        <circle cx="12" cy="9" r="2.5" fill="#fde047"/>
                    </svg>`;
                }

                // 5. Business Flows Project Cards (28 Technical Micro-projects)
                if (context === 'flow-project') {
                    // Document Ingestion & Parsing
                    if (k === 'pdf2xml' || k === '📄') {
                        return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#38bdf8" stroke-width="1.8"/>
                            <polyline points="14 2 14 8 20 8" stroke="#38bdf8" stroke-width="1.8"/>
                            <path d="M9 13l-1.5 1.5 1.5 1.5M15 13l1.5 1.5-1.5 1.5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'pdf_watermark' || k === '💧') {
                        return `<svg class="flow-p-svg flow-p-svg--cyan" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="#06b6d4" stroke-width="1.8"/>
                            <path d="M7 14c1.5 1.5 4 1.5 5 0s3.5-1.5 5 0" stroke="#06b6d4" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'paddle_ocr_vl' || k === '👁️' || k === '👁') {
                        return `<svg class="flow-p-svg flow-p-svg--indigo" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round"/>
                            <circle cx="12" cy="12" r="3.5" stroke="#818cf8" stroke-width="1.8"/>
                            <circle cx="12" cy="12" r="1.5" fill="#818cf8"/>
                        </svg>`;
                    }
                    if (k === 'extract_pdf_toc' || k === '📑') {
                        return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <line x1="8" y1="6" x2="21" y2="6" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                            <line x1="8" y1="12" x2="21" y2="12" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                            <line x1="8" y1="18" x2="21" y2="18" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                            <polyline points="3 5 4.5 6.5 3 8" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="3 11 4.5 12.5 3 14" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <polyline points="3 17 4.5 18.5 3 20" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    if (k === 'gpu_rapid_layout' || k === '🖼️' || k === '🖼') {
                        return `<svg class="flow-p-svg flow-p-svg--violet" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="4" y="4" width="16" height="16" rx="2.5" stroke="#a78bfa" stroke-width="1.8"/>
                            <rect x="7" y="7" width="4" height="4" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="1.4"/>
                            <rect x="13" y="7" width="4" height="10" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" stroke-width="1.4"/>
                            <rect x="7" y="13" width="4" height="4" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="1.4"/>
                        </svg>`;
                    }
                    // Semantic Chunking
                    if (k === 'pdf_chunker' || k === '✂️' || k === '✂') {
                        return `<svg class="flow-p-svg flow-p-svg--teal" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="6" cy="6" r="3" stroke="#2dd4bf" stroke-width="1.8"/>
                            <circle cx="6" cy="18" r="3" stroke="#2dd4bf" stroke-width="1.8"/>
                            <line x1="20" y1="4" x2="8.12" y2="15.88" stroke="#2dd4bf" stroke-width="1.8" stroke-linecap="round"/>
                            <line x1="14.47" y1="14.48" x2="20" y2="20" stroke="#2dd4bf" stroke-width="1.8" stroke-linecap="round"/>
                            <line x1="8.12" y1="8.12" x2="12" y2="12" stroke="#2dd4bf" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'multi_source_chunk' || k === '🔗') {
                        return `<svg class="flow-p-svg flow-p-svg--cyan" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    // Vector Recall & Rerank
                    if (k === 'qwen3_pg_recall' || k === '🔍') {
                        return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <ellipse cx="9" cy="6" rx="6" ry="2.5" stroke="#38bdf8" stroke-width="1.8"/>
                            <path d="M3 6v6c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5V6" stroke="#38bdf8" stroke-width="1.8"/>
                            <circle cx="16" cy="16" r="4" stroke="#38bdf8" stroke-width="1.8"/>
                            <line x1="19" y1="19" x2="22" y2="22" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'report_recall' || k === '📈') {
                        return `<svg class="flow-p-svg flow-p-svg--emerald" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M3 20h18" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M4 15l5-5 4 3 7-7" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="20" cy="6" r="2" fill="#10b981"/>
                        </svg>`;
                    }
                    if (k === 'rerank_system' || k === '🎯') {
                        return `<svg class="flow-p-svg flow-p-svg--rose" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="#fb7185" stroke-width="1.8"/>
                            <circle cx="12" cy="12" r="5" stroke="#fb7185" stroke-width="1.6"/>
                            <circle cx="12" cy="12" r="1.5" fill="#fb7185"/>
                            <line x1="12" y1="2" x2="12" y2="5" stroke="#fb7185" stroke-width="1.8"/>
                            <line x1="12" y1="19" x2="12" y2="22" stroke="#fb7185" stroke-width="1.8"/>
                            <line x1="2" y1="12" x2="5" y2="12" stroke="#fb7185" stroke-width="1.8"/>
                            <line x1="19" y1="12" x2="22" y2="12" stroke="#fb7185" stroke-width="1.8"/>
                        </svg>`;
                    }
                    // Async Pipeline & Gateway
                    if (k === 'fastapi_celery_kb' || k === '📚') {
                        return `<svg class="flow-p-svg flow-p-svg--indigo" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="#818cf8" stroke-width="1.8" fill="rgba(129,140,248,0.12)"/>
                            <polyline points="2 12 12 17 22 12" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round"/>
                            <polyline points="2 17 12 22 22 17" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'enterprise_chat_openapi' || k === '💬') {
                        return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#38bdf8" stroke-width="1.8" stroke-linejoin="round"/>
                            <path d="M8 11h8M8 14h5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    // Agent Pipeline
                    if (k === 'dynamic_mcp' || k === '⚡') {
                        return `<svg class="flow-p-svg flow-p-svg--amber" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    if (k === 'mcp_json_rpc' || k === '🔧') {
                        return `<svg class="flow-p-svg flow-p-svg--violet" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="3" stroke="#a78bfa" stroke-width="1.8"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#a78bfa" stroke-width="1.6"/>
                        </svg>`;
                    }
                    if (k === 'ai_mcp_middleware' || k === '🌐') {
                        return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="#38bdf8" stroke-width="1.8"/>
                            <line x1="3.6" y1="9" x2="20.4" y2="9" stroke="#38bdf8" stroke-width="1.6"/>
                            <line x1="3.6" y1="15" x2="20.4" y2="15" stroke="#38bdf8" stroke-width="1.6"/>
                            <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" stroke="#38bdf8" stroke-width="1.6"/>
                        </svg>`;
                    }
                    if (k === 'multi_agent_collab' || k === '🤝') {
                        return `<svg class="flow-p-svg flow-p-svg--purple" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="6" cy="6" r="3" stroke="#c084fc" stroke-width="1.8"/>
                            <circle cx="18" cy="6" r="3" stroke="#c084fc" stroke-width="1.8"/>
                            <circle cx="12" cy="18" r="3" stroke="#c084fc" stroke-width="1.8"/>
                            <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" stroke="#c084fc" stroke-width="1.6"/>
                            <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" stroke="#c084fc" stroke-width="1.6"/>
                            <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" stroke="#c084fc" stroke-width="1.6"/>
                        </svg>`;
                    }
                    if (k === 'phone_autoglm' || k === '📱') {
                        return `<svg class="flow-p-svg flow-p-svg--emerald" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="5" y="2" width="14" height="20" rx="2.5" stroke="#10b981" stroke-width="1.8"/>
                            <line x1="12" y1="18" x2="12.01" y2="18" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
                            <path d="M9 7h6M9 11h6" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>`;
                    }
                    // Finance Pipeline
                    if (k === 'email_auto_crawl' || k === '📬') {
                        return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" stroke="#38bdf8" stroke-width="1.8"/>
                            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="#38bdf8" stroke-width="1.8"/>
                            <line x1="12" y1="3" x2="12" y2="8" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>
                            <polyline points="10 6 12 8 14 6" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    if (k === 'cc_monitor_gmail' || k === '📧') {
                        return `<svg class="flow-p-svg flow-p-svg--teal" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#2dd4bf" stroke-width="1.8"/>
                            <polyline points="22,6 12,13 2,6" stroke="#2dd4bf" stroke-width="1.8"/>
                        </svg>`;
                    }
                    // 这两张卡片在「金融资讯」节点里紧挨着，图标必须一眼分得开：
                    //   打标分类 = 两个错位标签（多标签）
                    //   实体识别 = 文本行 + 被框出的片段（从正文里认出实体）
                    // 曾经两者都是"单标签"，只差一个斜角，20px 下完全分不出。
                    if (k === 'announcement_tagging' || k === '🏷️️') {
                        return `<svg class="flow-p-svg flow-p-svg--amber" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M9 4.6H2.6v6.4l5.72 5.72a2 2 0 0 0 2.83 0l4.98-4.98a2 2 0 0 0 0-2.83L9 4.6z" stroke="#fbbf24" stroke-width="1.8" stroke-linejoin="round"/>
                            <circle cx="5.9" cy="8.5" r="1.25" fill="#fbbf24"/>
                            <path d="M15.4 4.6l5.3 5.3a2 2 0 0 1 0 2.83l-4.7 4.7" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    if (k === 'temp_ner' || k === '🏷️' || k === '🏷') {
                        return `<svg class="flow-p-svg flow-p-svg--amber" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <line x1="3" y1="6" x2="18" y2="6" stroke="#fbbf24" stroke-width="1.7" stroke-linecap="round" opacity="0.55"/>
                            <line x1="3" y1="11.4" x2="13.4" y2="11.4" stroke="#fbbf24" stroke-width="1.7" stroke-linecap="round" opacity="0.55"/>
                            <line x1="3" y1="16.8" x2="10" y2="16.8" stroke="#fbbf24" stroke-width="1.7" stroke-linecap="round" opacity="0.55"/>
                            <circle cx="15.9" cy="16" r="4.2" fill="rgba(251,191,36,0.16)" stroke="#fbbf24" stroke-width="1.8"/>
                            <line x1="19" y1="19.1" x2="21.6" y2="21.7" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'etf_unusual' || k === '📉') {
                        return `<svg class="flow-p-svg flow-p-svg--rose" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M3 3v18h18" stroke="#fb7185" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M4 8l5 6 4-3 7 7" stroke="#fb7185" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="20" cy="18" r="2" fill="#fb7185"/>
                        </svg>`;
                    }
                    if (k === 'onchain_token_monitor' || k === '⛓️' || k === '⛓') {
                        return `<svg class="flow-p-svg flow-p-svg--cyan" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="2" y="7" width="6" height="10" rx="1.5" stroke="#06b6d4" stroke-width="1.8"/>
                            <rect x="16" y="7" width="6" height="10" rx="1.5" stroke="#06b6d4" stroke-width="1.8"/>
                            <line x1="8" y1="12" x2="16" y2="12" stroke="#06b6d4" stroke-width="1.8"/>
                            <circle cx="12" cy="12" r="1.8" fill="#06b6d4"/>
                        </svg>`;
                    }
                    if (k === 'multi_llm_analysis' || k === '🧠') {
                        return `<svg class="flow-p-svg flow-p-svg--purple" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 3a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3.5 5.5V17a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2.5c2-1 3.5-3 3.5-5.5a6 6 0 0 0-6-6z" stroke="#c084fc" stroke-width="1.8"/>
                            <line x1="9" y1="21" x2="15" y2="21" stroke="#c084fc" stroke-width="1.8" stroke-linecap="round"/>
                            <circle cx="12" cy="9" r="2" fill="#c084fc"/>
                        </svg>`;
                    }
                    // Community Pipeline
                    if (k === 'group_management_bot' || k === '🤖') {
                        return `<svg class="flow-p-svg flow-p-svg--emerald" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="4" y="11" width="16" height="10" rx="2.5" stroke="#10b981" stroke-width="1.8"/>
                            <circle cx="12" cy="5" r="2" fill="#10b981"/>
                            <path d="M12 7v4M8 15h.01M16 15h.01" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
                            <path d="M9 18h6" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'need_radar_bot' || k === '📡') {
                        return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4 11a8 8 0 0 1 8-8" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M4 16a13 13 0 0 1 13-13" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                            <circle cx="5" cy="19" r="2" fill="#38bdf8"/>
                            <path d="M7 17l6-6M15 9l4-4" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'tg_ai_search' || k === '🔎') {
                        return `<svg class="flow-p-svg flow-p-svg--indigo" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#818cf8" stroke-width="1.8" stroke-linejoin="round"/>
                            <circle cx="11" cy="10" r="2.5" stroke="#818cf8" stroke-width="1.6"/>
                            <line x1="13" y1="12" x2="16" y2="15" stroke="#818cf8" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k === 'lark_sync' || k === '🚀') {
                        return `<svg class="flow-p-svg flow-p-svg--cyan" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round"/>
                            <polyline points="3 3 3 8 8 8" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round"/>
                            <polyline points="16 16 21 16 21 21" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    if (k === 'smart_clipboard' || k === '📋') {
                        return `<svg class="flow-p-svg flow-p-svg--amber" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="#fbbf24" stroke-width="1.8"/>
                            <rect x="8" y="2" width="8" height="4" rx="1" stroke="#fbbf24" stroke-width="1.6" fill="rgba(251,191,36,0.15)"/>
                            <polyline points="9 13 11 15 15 10" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    // Generic fallback for flow-project
                    return `<svg class="flow-p-svg flow-p-svg--sky" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="#38bdf8" stroke-width="1.8"/>
                        <polyline points="2 12 12 17 22 12" stroke="#38bdf8" stroke-width="1.8"/>
                    </svg>`;
                }

                // 6. Partners
                // 注意分支顺序：更具体的"创业/Founder"必须排在"技术/CTO"之前。
                // 否则「创业团队 CTO」会先命中 技术|CTO 分支，和「技术负责人 / 架构师」撞成同一个图标。
                if (context === 'partner') {
                    if (k.includes('创业') || k.includes('独立') || k.includes('Startup') || k.includes('Founder') || k === '🚀') {
                        return `<svg class="partner-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="#fb7185" stroke-width="1.6" fill="rgba(251,113,133,0.15)"/>
                            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="#fb7185" stroke-width="1.8" fill="rgba(251,113,133,0.1)"/>
                            <circle cx="15.5" cy="8.5" r="1.5" fill="#fb7185"/>
                        </svg>`;
                    }
                    if (k.includes('技术') || k.includes('CTO') || k.includes('架构') || k.includes('Tech') || k === '🏗️' || k === '🏗') {
                        return `<svg class="partner-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#38bdf8" stroke-width="1.8" fill="rgba(56,189,248,0.12)"/>
                            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#818cf8" stroke-width="1.8" fill="rgba(129,140,248,0.12)"/>
                            <rect x="8.5" y="14" width="7" height="7" rx="1.5" stroke="#a78bfa" stroke-width="1.8" fill="rgba(167,139,250,0.12)"/>
                            <line x1="6.5" y1="10" x2="12" y2="14" stroke="#818cf8" stroke-width="1.6" stroke-linecap="round"/>
                            <line x1="17.5" y1="10" x2="12" y2="14" stroke="#818cf8" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>`;
                    }
                    if (k.includes('业务') || k.includes('产品') || k.includes('Business') || k.includes('Product') || k === '🏢') {
                        return `<svg class="partner-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="4" y="2" width="16" height="20" rx="2" stroke="#34d399" stroke-width="1.8" fill="rgba(52,211,153,0.1)"/>
                            <line x1="8" y1="6" x2="10" y2="6" stroke="#34d399" stroke-width="1.6"/>
                            <line x1="14" y1="6" x2="16" y2="6" stroke="#34d399" stroke-width="1.6"/>
                            <line x1="8" y1="10" x2="10" y2="10" stroke="#34d399" stroke-width="1.6"/>
                            <line x1="14" y1="10" x2="16" y2="10" stroke="#34d399" stroke-width="1.6"/>
                            <line x1="8" y1="14" x2="10" y2="14" stroke="#34d399" stroke-width="1.6"/>
                            <line x1="14" y1="14" x2="16" y2="14" stroke="#34d399" stroke-width="1.6"/>
                            <path d="M10 22v-4h4v4" stroke="#34d399" stroke-width="1.8"/>
                        </svg>`;
                    }
                }

                // 7. Contact Info & Collaboration Tags
                // 联系页主卡：文档 + 上箭头 = "把你的现状发我"（原为四角星芒，读作"AI 魔法"，与文案无关）
                if (context === 'contact-intro' || k === '✨') {
                    return `<svg class="contact-intro-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <defs><linearGradient id="ct-g-send" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(56,189,248,0.12)" stroke="url(#ct-g-send)" stroke-width="1.8" stroke-linejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="url(#ct-g-send)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 19v-6.4M9.2 15.2 12 12.4l2.8 2.8" stroke="url(#ct-g-send)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
                }
                if (context === 'contact-avail' || k === '⚡' || k === '⏱️' || k === '⏱') {
                    return `<svg class="contact-meta-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="var(--accent)" stroke-width="1.8"/>
                        <polyline points="12 6 12 12 15 14" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M19 4l2 2" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>`;
                }
                if (context === 'contact-collab' || k === '🤝') {
                    return `<svg class="contact-meta-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M16 11l2 2 4-4" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 11l-2 2-4-4" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="var(--accent)" stroke-width="1.8"/>
                    </svg>`;
                }
                if (context === 'contact-type') {
                    if (k.includes('诊断') || k.includes('Audit') || k === '🩺') {
                        return `<svg class="tag-pill-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                            <polyline points="7 12 10 12 11.5 8 13.5 16 15 12 17 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`;
                    }
                    if (k.includes('顾问') || k.includes('咨询') || k.includes('Advisory') || k === '📚') {
                        return `<svg class="tag-pill-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                            <polygon points="12,7 15,13 12,11 9,13" fill="currentColor"/>
                        </svg>`;
                    }
                    if (k.includes('模块') || k.includes('Module') || k === '📦') {
                        return `<svg class="tag-pill-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 2l8 4.5v11l-8 4.5-8-4.5v-11L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                            <polyline points="20 6.5 12 11 4 6.5" stroke="currentColor" stroke-width="2"/>
                            <line x1="12" y1="11" x2="12" y2="22" stroke="currentColor" stroke-width="2"/>
                        </svg>`;
                    }
                    if (k.includes('项目') || k.includes('完整') || k.includes('Project') || k === '🚀') {
                        return `<svg class="tag-pill-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" stroke-width="2"/>
                            <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/>
                        </svg>`;
                    }
                }

                // 兜底：绝不把 key 当文本吐出来（那会在页面上留下裸露文案，如「AI 應用」）。
                // 返回一个中性占位图标——语义不对但至少不脏，而且一眼能看出是"没匹配上"。
                return `<svg class="tech-icon tech-icon--fallback" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3" opacity="0.55"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" opacity="0.55"/>
                </svg>`;
            },
            getBrandAvatar(size = 'md') {
                const idSuffix = arguments[1] || '';
                const raw = (this.config?.profile?.avatar || '').trim();
                // If custom image path or user provided non-dog text, honor it
                if (raw && raw !== '🐶' && raw !== '🐕') {
                    return raw;
                }
                const dim = size === 'lg' ? 44 : (size === 'sm' ? 20 : 24);
                // lg 用在 Hero 的 88px 圆形渐变环里，底盘必须是正圆（圆角方形嵌进圆环会"方圆打架"）；
                // sm/md 没有形状约束，用和 favicon 一致的圆角方形，保持品牌呼应。
                const radius = size === 'lg' ? 16 : 7.5;
                const innerRadius = size === 'lg' ? 15.3 : 6.8;
                const pid = `av-p-${size}${idSuffix ? '-' + idSuffix : ''}`;
                const iid = `av-i-${size}${idSuffix ? '-' + idSuffix : ''}`;
                // abu 字标：与站点 favicon（assets/img/favicon.svg）同一套几何，
                // 按 32 viewBox 等比缩一半。改字标要先改 favicon.svg，再同步这里。
                return `<svg class="brand-avatar-svg brand-avatar-svg--${size}" width="${dim}" height="${dim}" viewBox="0 0 32 32" fill="none" role="img" aria-label="${this.config?.profile?.name || '阿布'}">
                    <defs>
                        <linearGradient id="${pid}" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#1b2237"/>
                            <stop offset="100%" stop-color="#0a0d15"/>
                        </linearGradient>
                        <linearGradient id="${iid}" x1="2.8" y1="16" x2="29.2" y2="16" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#5ccdfa"/>
                            <stop offset="50%" stop-color="#98a2fb"/>
                            <stop offset="100%" stop-color="#cc9bfd"/>
                        </linearGradient>
                    </defs>
                    <rect width="32" height="32" rx="${radius}" fill="url(#${pid})"/>
                    <rect x="0.8" y="0.8" width="30.4" height="30.4" rx="${innerRadius}" fill="none" stroke="#8fc4ff" stroke-opacity="0.28" stroke-width="0.7"/>
                    <g fill="none" stroke="url(#${iid})" stroke-width="2.7">
                        <ellipse cx="5.62" cy="17.6" rx="2.82" ry="4.2"/>
                        <path d="M8.44 13.4V21.8" stroke-linecap="round"/>
                        <path d="M13.19 10.2V21.8" stroke-linecap="round"/>
                        <ellipse cx="16" cy="17.6" rx="2.82" ry="4.2"/>
                        <path d="M22.22 13.4V17.6A2.82 4.2 0 0 0 27.84 17.6V13.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                </svg>`;
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
