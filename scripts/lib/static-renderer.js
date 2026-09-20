'use strict';

const { escapeHtml, stripHtml } = require('./escape');

/**
 * 精简预渲染：仅输出爬虫需要的核心文本（Hero + 摘要列表），
 * 完整交互内容由 Vue 通过 fetch homeConfig.json 加载。
 */
function renderAppShell(config) {
    const ui = config.ui || {};
    const profile = config.profile || {};
    const nav = ui.nav || [];
    const greeting = ui.greetings?.morning || profile.greeting?.text || '';

    const navHtml = nav.map(item => `
            <a href="#${escapeHtml(item.id)}" class="nav-item">
                <span>${escapeHtml(item.label)}</span>
            </a>`).join('');

    const heroChips = (profile.heroChips || [])
        .map(chip => `<span class="hero-chip">${escapeHtml(chip)}</span>`)
        .join('');

    const stats = (profile.stats || [])
        .map(stat => `
                    <div class="hero-stat-card">
                        <span class="hero-stat-num">${escapeHtml(stat.number)}</span>
                        <span class="hero-stat-label">${escapeHtml(stat.label)}</span>
                    </div>`)
        .join('');

    const featuredTitles = (config.featured?.items || [])
        .map(p => `<li>${escapeHtml(p.title)} — ${escapeHtml(p.description)}</li>`)
        .join('');

    const skillLines = (config.skills?.items || [])
        .map(s => `<li><strong>${escapeHtml(s.title)}</strong>：${escapeHtml(s.description)}</li>`)
        .join('');

    const serviceLines = (config.services?.items || [])
        .map(s => `<li>${escapeHtml(s.title)}：${escapeHtml(s.description)}</li>`)
        .join('');

    const heroAvatarSvg = `<svg class="brand-avatar-svg brand-avatar-svg--lg" width="44" height="44" viewBox="0 0 32 32" fill="none" role="img" aria-label="${escapeHtml(profile.name || '阿布')}">
                    <defs>
                        <linearGradient id="av-p-lg-static" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#1b2237"/>
                            <stop offset="100%" stop-color="#0a0d15"/>
                        </linearGradient>
                        <linearGradient id="av-i-lg-static" x1="2.8" y1="16" x2="29.2" y2="16" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#5ccdfa"/>
                            <stop offset="50%" stop-color="#98a2fb"/>
                            <stop offset="100%" stop-color="#cc9bfd"/>
                        </linearGradient>
                    </defs>
                    <rect width="32" height="32" rx="16" fill="url(#av-p-lg-static)"/>
                    <rect x="0.8" y="0.8" width="30.4" height="30.4" rx="15.3" fill="none" stroke="#8fc4ff" stroke-opacity="0.28" stroke-width="0.7"/>
                    <g fill="none" stroke="url(#av-i-lg-static)" stroke-width="2.7">
                        <ellipse cx="5.62" cy="17.6" rx="2.82" ry="4.2"/>
                        <path d="M8.44 13.4V21.8" stroke-linecap="round"/>
                        <path d="M13.19 10.2V21.8" stroke-linecap="round"/>
                        <ellipse cx="16" cy="17.6" rx="2.82" ry="4.2"/>
                        <path d="M22.22 13.4V17.6A2.82 4.2 0 0 0 27.84 17.6V13.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                </svg>`;

    return `
    <aside class="sidebar" aria-label="主导航">
        <div class="sidebar-brand">
            <strong>${escapeHtml(profile.name)}</strong>
            <span>${escapeHtml(profile.tagline)}</span>
        </div>
        <nav class="sidebar-nav">${navHtml}
        </nav>
    </aside>

    <main class="main-view">
        <section id="home" class="hero-banner bento-hero">
            <div class="bento-hero-grid noise-overlay">
                <article class="bento-card bento-card--main liquid-glass">
                    <div class="bento-card__header">
                        <div class="hero-profile-inline">
                            <div class="hero-avatar-ring">
                                <span class="hero-avatar">${heroAvatarSvg}</span>
                            </div>
                            <div class="hero-profile-meta">
                                <strong>${escapeHtml(profile.name)}</strong>
                                <span>${escapeHtml(profile.tagline)}</span>
                            </div>
                        </div>
                        <div class="radar-status-badge">
                            <span class="radar-pulse"></span>
                            <span>${escapeHtml(profile.status || '可接项目')}</span>
                        </div>
                    </div>
                    <div class="bento-card__body">
                        <p class="hero-eyebrow">${escapeHtml(greeting)}</p>
                        <h1 class="hero-title">${escapeHtml(profile.heroTitle)}</h1>
                        <p class="hero-subtitle">${profile.greeting?.description || ''}</p>
                        <div class="hero-chips">${heroChips}</div>
                    </div>
                </article>
                <article class="bento-card bento-card--stats liquid-glass">
                    <div class="bento-card-label">
                        <span>DELIVERY IMPACT</span>
                    </div>
                    <div class="hero-stats-grid">${stats}
                    </div>
                </article>
            </div>
        </section>

        <section id="showcase" class="content-section seo-prerender" aria-label="精选代表作摘要">
            <h2>${escapeHtml(config.featured?.title || '精选代表作')}</h2>
            <ul>${featuredTitles}</ul>
        </section>

        <section id="skills" class="content-section seo-prerender" aria-label="技能摘要">
            <h2>${escapeHtml(config.skills?.title || '核心技术')}</h2>
            <p>${stripHtml(config.skills?.motto || '')}</p>
            <ul>${skillLines}</ul>
        </section>

        <section id="services" class="content-section seo-prerender" aria-label="服务摘要">
            <h2>${escapeHtml(config.services?.title || '合作服务')}</h2>
            <ul>${serviceLines}</ul>
        </section>
    </main>
`.trim();
}

module.exports = { renderAppShell };
