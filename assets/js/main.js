// 使用 Vue.js 来渲染页面内容
// 从 Jekyll 数据文件加载配置

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 优先使用 Jekyll 传递的配置数据
    if (typeof window.siteConfig !== 'undefined') {
        initApp(window.siteConfig);
    } else {
        // 备用方案：从 JSON 文件加载（使用相对路径）
        const configPath = '/_data/homeConfig.json';
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
                initApp(data);
            })
            .catch(error => {
                console.error('加载配置失败:', error);
                console.error('请确保 _data/homeConfig.json 文件存在且可访问');
            });
    }
});

function initApp(config) {
    // 创建 Vue 应用
    if (typeof Vue === 'undefined') {
        // 如果没有 Vue，使用纯 JavaScript 渲染
        renderWithVanillaJS(config);
    } else {
        renderWithVue(config);
    }
}

// 使用 Vue.js 渲染
function renderWithVue(config) {
    const { createApp } = Vue;
    
    createApp({
        data() {
            return {
                config: config,
                showToast: false,
                toastMessage: ''
            };
        },
        methods: {
            getStatusText(status) {
                const statusMap = {
                    'active': config.ui.projectStatus.active,
                    'testing': config.ui.projectStatus.testing,
                    'development': config.ui.projectStatus.development,
                    'planned': config.ui.projectStatus.planned
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
                const toastMap = {
                    'wechat': config.ui.toast.wechatCopied,
                    'xianyu': config.ui.toast.xianyuCopied,
                    'telegram': config.ui.toast.telegramCopied
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
    }).mount('#app');
}

// 使用纯 JavaScript 渲染（备用方案）
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
document.addEventListener('DOMContentLoaded', function() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            // 这里可以实现语言切换逻辑
            alert('语言切换功能待实现');
        });
    }
});
