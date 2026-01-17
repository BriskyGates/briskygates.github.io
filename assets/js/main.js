// 使用 Vue.js 来渲染页面内容
// 从 Jekyll 数据文件加载配置

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成');
    console.log('window.siteConfig:', window.siteConfig);
    console.log('Vue 是否加载:', typeof Vue !== 'undefined');
    
    // 优先使用 Jekyll 传递的配置数据
    if (typeof window.siteConfig !== 'undefined' && window.siteConfig !== null) {
        console.log('使用 window.siteConfig');
        initApp(window.siteConfig);
    } else {
        console.log('尝试从 JSON 文件加载配置');
        // 备用方案：从 JSON 文件加载（使用相对路径）
        const configPath = '/assets/data/homeConfig.json';
        // 如果是 GitHub Pages，可能需要调整路径
        const basePath = window.location.pathname.includes('/briskygates.github.io') 
            ? '/briskygates.github.io' 
            : '';
        fetch(basePath + configPath)
            .then(response => {
                if (!response.ok) {
                    // 尝试根路径
                    return fetch(configPath);
                }
                return response;
            })
            .then(response => response.json())
            .then(data => {
                console.log('从 JSON 文件加载配置成功:', data);
                initApp(data);
            })
            .catch(error => {
                console.error('加载配置失败:', error);
                console.error('请确保 assets/data/homeConfig.json 文件存在且可访问');
                // 显示错误提示
                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>配置加载失败</h2><p>请检查浏览器控制台查看详细错误信息</p></div>';
                }
            });
    }
});

// 当前语言状态
let currentLang = 'zh'; // 'zh' 或 'en'
let currentConfig = null;

// 检测当前语言
function detectCurrentLanguage() {
    // 1. 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam === 'en' || langParam === 'zh') {
        return langParam;
    }
    
    // 2. 检查 localStorage
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang === 'en' || savedLang === 'zh') {
        return savedLang;
    }
    
    // 3. 检查当前加载的配置文件路径
    if (window.siteConfig) {
        // 如果是从 Jekyll 加载的，默认是中文
        return 'zh';
    }
    
    // 4. 默认返回中文
    return 'zh';
}

function initApp(config) {
    console.log('初始化应用，配置数据:', config);
    
    if (!config) {
        console.error('配置数据为空！');
        return;
    }
    
    // 检测当前语言
    currentLang = detectCurrentLanguage();
    
    // 如果检测到是英文，但当前配置是中文，需要切换
    if (currentLang === 'en') {
        // 检查配置文件的路径或内容来判断
        const configPath = '/assets/data/homeConfig.en.json';
        const basePath = window.location.pathname.includes('/briskygates.github.io') 
            ? '/briskygates.github.io' 
            : '';
        
        // 尝试加载英文配置
        fetch(basePath + configPath)
            .then(response => {
                if (!response.ok) {
                    return fetch(configPath);
                }
                return response;
            })
            .then(response => response.json())
            .then(data => {
                currentConfig = data;
                renderWithVue(data);
                updateLanguageButton();
            })
            .catch(error => {
                console.warn('无法加载英文配置，使用当前配置:', error);
                currentConfig = config;
                renderWithVue(config);
                updateLanguageButton();
            });
    } else {
        currentConfig = config;
        renderWithVue(config);
        updateLanguageButton();
    }
}

// 更新语言切换按钮
function updateLanguageButton() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langText = langToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = currentLang === 'en' ? '中文' : 'EN';
        }
        langToggle.title = currentLang === 'en' 
            ? 'Switch to Chinese / 切换到中文' 
            : 'Switch to English / 切换到英文';
    }
    
    // 更新页面语言属性
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';
}

// 使用 Vue.js 渲染
let vueAppInstance = null;
let vueApp = null;

function renderWithVue(config) {
    console.log('开始使用 Vue.js 渲染，配置:', config);
    
    if (!config) {
        console.error('配置数据为空，无法渲染！');
        return;
    }
    
    if (vueAppInstance) {
        vueAppInstance.config = config;
        return;
    }
    
    const { createApp } = Vue;
    const appElement = document.getElementById('app');
    
    if (!appElement) {
        console.error('找不到 #app 元素！');
        return;
    }
    
    vueApp = createApp({
        data() {
            return {
                config: config,
                showToast: false,
                toastMessage: ''
            };
        },
        methods: {
            getStatusText(status) {
                if (!this.config || !this.config.ui || !this.config.ui.projectStatus) {
                    return status;
                }
                const statusMap = {
                    'active': this.config.ui.projectStatus.active,
                    'testing': this.config.ui.projectStatus.testing,
                    'development': this.config.ui.projectStatus.development,
                    'planned': this.config.ui.projectStatus.planned
                };
                return statusMap[status] || status;
            },
            async copyToClipboard(text, type) {
                try {
                    await navigator.clipboard.writeText(text);
                    this.showToastMessage(this.getToastMessage(type));
                } catch (err) {
                    console.error('复制失败:', err);
                    // 降级方案
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
                if (!this.config || !this.config.ui || !this.config.ui.toast) {
                    return '已复制到剪贴板';
                }
                const toastMap = {
                    'wechat': this.config.ui.toast.wechatCopied,
                    'xianyu': this.config.ui.toast.xianyuCopied,
                    'telegram': this.config.ui.toast.telegramCopied
                };
                return toastMap[type] || '已复制到剪贴板';
            },
            showToastMessage(message) {
                this.toastMessage = message;
                this.showToast = true;
                setTimeout(() => {
                    this.showToast = false;
                }, 2000);
            }
        }
    });
    
    // 挂载应用
    vueAppInstance = vueApp.mount('#app');
    console.log('Vue 应用已成功挂载');
}

// Vanilla JS render (fallback)
function renderWithVanillaJS(config) {
    // 这里可以实现纯 JavaScript 的渲染逻辑
    // 但为了简化，我们建议使用 Vue.js
    console.log('建议使用 Vue.js 以获得更好的体验');
    
    // 基本的文本替换
    document.querySelectorAll('[data-config]').forEach(el => {
        const path = el.getAttribute('data-config').split('.');
        let value = config;
        for (const key of path) {
            value = value[key];
        }
        if (value) {
            el.textContent = value;
        }
    });
}

// 语言切换功能
async function switchLanguage() {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    const configPath = newLang === 'en' ? '/assets/data/homeConfig.en.json' : '/assets/data/homeConfig.json';
    
    // 如果是 GitHub Pages，可能需要调整路径
    const basePath = window.location.pathname.includes('/briskygates.github.io') 
        ? '/briskygates.github.io' 
        : '';
    
    try {
        console.log(`切换到${newLang === 'en' ? '英文' : '中文'}，加载配置: ${basePath + configPath}`);
        
        let response = await fetch(basePath + configPath);
        if (!response.ok) {
            // 尝试根路径
            response = await fetch(configPath);
            if (!response.ok) {
                throw new Error(`无法加载配置文件: ${configPath}`);
            }
        }
        
        const data = await response.json();
        currentLang = newLang;
        currentConfig = data;
        
        // 保存语言偏好到 localStorage
        localStorage.setItem('preferredLanguage', newLang);
        
        // 更新 URL 参数（不刷新页面）
        const url = new URL(window.location);
        url.searchParams.set('lang', newLang);
        window.history.pushState({}, '', url);
        
        // 重新渲染Vue应用
        renderWithVue(data);
        
        // 更新按钮
        updateLanguageButton();
        
        // 滚动到顶部，提供更好的用户体验
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log(`语言已切换到${newLang === 'en' ? '英文' : '中文'}`);
    } catch (error) {
        console.error('语言切换失败:', error);
        alert(`语言切换失败: ${error.message}`);
    }
}

// 初始化语言切换按钮
document.addEventListener('DOMContentLoaded', function() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', switchLanguage);
    }
});
