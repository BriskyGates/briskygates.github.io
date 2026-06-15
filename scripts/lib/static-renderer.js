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
                    <div class="hero-stat">
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
        <section id="home" class="hero-banner">
            <div class="hero-inner">
                <div class="hero-content">
                    <p class="hero-eyebrow">${escapeHtml(greeting)}</p>
                    <h1 class="hero-title">${escapeHtml(profile.heroTitle)}</h1>
                    <p class="hero-subtitle">${profile.greeting?.description || ''}</p>
                    <div class="hero-chips">${heroChips}</div>
                </div>
                <div class="hero-stats">${stats}
                </div>
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
