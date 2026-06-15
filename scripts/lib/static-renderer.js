'use strict';

const { escapeHtml } = require('./escape');

function getStatusText(status, ui) {
    if (!ui || !ui.projectStatus) {
        return status;
    }
    const statusMap = {
        production: ui.projectStatus.production,
        active: ui.projectStatus.active,
        testing: ui.projectStatus.testing,
        development: ui.projectStatus.development,
        planned: ui.projectStatus.planned
    };
    return statusMap[status] || status;
}

function renderTags(tags, muted = false) {
    if (!tags || !tags.length) {
        return '';
    }
    const cls = muted ? 'tag-pill tag-pill--muted' : 'tag-pill';
    return tags.map(tag => `<span class="${cls}">${escapeHtml(tag)}</span>`).join('');
}

function renderFeaturedProject(project, ui) {
    const highlights = project.highlights && project.highlights.length
        ? `<ul class="media-card-highlights">${project.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
        : '';
    return `
                <article class="media-card media-card--featured">
                    <div class="media-card-visual">
                        <span class="media-card-emoji">${escapeHtml(project.icon)}</span>
                        <span class="media-card-badge">${escapeHtml(getStatusText(project.status, ui))}</span>
                    </div>
                    <div class="media-card-body">
                        <h3>${escapeHtml(project.title)}</h3>
                        <p class="media-card-sub">${escapeHtml(project.subtitle)}</p>
                        <p class="media-card-desc">${escapeHtml(project.description)}</p>
                        ${highlights}
                        <div class="tag-row">${renderTags(project.tags)}</div>
                    </div>
                </article>`;
}

function renderProjectCard(project) {
    return `
                <article class="media-card">
                    <div class="media-card-visual media-card-visual--sm">
                        <span class="media-card-emoji">${escapeHtml(project.icon)}</span>
                    </div>
                    <div class="media-card-body">
                        <h3>${escapeHtml(project.title)}</h3>
                        <p class="media-card-sub">${escapeHtml(project.subtitle)}</p>
                        <p class="media-card-desc">${escapeHtml(project.description)}</p>
                        <div class="tag-row">${renderTags(project.tags, true)}</div>
                    </div>
                </article>`;
}

/**
 * 从 homeConfig 生成爬虫可读的静态 HTML（注入 #app，Vue 挂载前可见）
 */
function renderAppShell(config) {
    const ui = config.ui || {};
    const profile = config.profile || {};
    const nav = ui.nav || [];
    const greeting = ui.greetings?.morning || profile.greeting?.text || '';

    const navHtml = nav.map(item => `
            <a href="#${escapeHtml(item.id)}" class="nav-item">
                <i class="${escapeHtml(item.icon)}"></i>
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

    const featured = config.featured;
    const featuredHtml = featured && featured.items && featured.items.length
        ? `
        <section id="showcase" class="content-section">
            <div class="section-head">
                <h2>${escapeHtml(featured.title)}</h2>
                <p>${escapeHtml(featured.subtitle)}</p>
            </div>
            <div class="media-row-wrap">
            <div class="media-row">
                ${featured.items.map(p => renderFeaturedProject(p, ui)).join('')}
            </div>
            </div>
        </section>`
        : '';

    const showcaseRows = (config.projectShowcase?.rows || [])
        .map(row => `
        <section${row.id === 'enterprise-ai' ? ' id="projects"' : ''} class="content-section">
            <div class="section-head section-head--row">
                <h2>${escapeHtml(row.title)}</h2>
                <p>${escapeHtml(row.description)}</p>
            </div>
            <div class="media-row-wrap">
            <div class="media-row">
                ${(row.items || []).map(renderProjectCard).join('')}
            </div>
            </div>
        </section>`)
        .join('');

    const experience = config.experience;
    const experienceHtml = experience && experience.items
        ? `
        <section id="experience" class="content-section">
            <div class="section-head">
                <h2>${escapeHtml(experience.title)}</h2>
                <p>${escapeHtml(experience.subtitle)}</p>
            </div>
            <div class="timeline">
                ${experience.items.map(item => `
                <article class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-card">
                        <span class="timeline-period">${escapeHtml(item.period)}</span>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.description)}</p>
                        <div class="tag-row">${renderTags(item.tags, true)}</div>
                    </div>
                </article>`).join('')}
            </div>
        </section>`
        : '';

    const skills = config.skills;
    const skillsHtml = skills
        ? `
        <section id="skills" class="content-section">
            <div class="section-head">
                <h2>${escapeHtml(skills.title)}</h2>
                <p class="section-motto">${skills.motto || ''}</p>
            </div>
            <div class="skills-grid">
                ${(skills.items || []).map(skill => `
                <article class="skill-tile">
                    <span class="skill-tile-icon">${escapeHtml(skill.icon)}</span>
                    <h3>${escapeHtml(skill.title)}</h3>
                    <p>${escapeHtml(skill.description)}</p>
                    <div class="tag-row">${renderTags(skill.tags)}</div>
                </article>`).join('')}
            </div>
        </section>`
        : '';

    const services = config.services;
    const partners = services?.partners;
    const servicesHtml = services
        ? `
        <section id="services" class="content-section">
            <div class="section-head">
                <h2>${escapeHtml(services.title)}</h2>
            </div>
            <div class="services-grid">
                ${(services.items || []).map(service => `
                <article class="service-tile">
                    <div class="service-tile-top">
                        <span>${escapeHtml(service.icon)}</span>
                        <span class="service-badge">${escapeHtml(service.badge)}</span>
                    </div>
                    <h3>${escapeHtml(service.title)}</h3>
                    <p>${escapeHtml(service.description)}</p>
                    <div class="tag-row">${renderTags(service.technologies, true)}</div>
                </article>`).join('')}
            </div>
            ${partners ? `
            <div class="partners-banner">
                <h3>${escapeHtml(partners.title)}</h3>
                <div class="partners-row">
                    ${(partners.types || []).map(partner => `
                    <div class="partner-pill">
                        <span>${escapeHtml(partner.icon)}</span>
                        <div>
                            <strong>${escapeHtml(partner.type)}</strong>
                            <p>${escapeHtml(partner.description)}</p>
                        </div>
                    </div>`).join('')}
                </div>
                <p class="partners-note">${partners.note || ''}</p>
            </div>` : ''}
        </section>`
        : '';

    const innovation = config.projects?.innovation;
    const philosophyHtml = innovation
        ? `
        <section class="content-section">
            <div class="philosophy-card">
                <span>${escapeHtml(innovation.icon)}</span>
                <div>
                    <h3>${escapeHtml(innovation.title)}</h3>
                    <p>${escapeHtml(innovation.text)}</p>
                </div>
            </div>
        </section>`
        : '';

    const mobileNav = nav.map(item => `
        <a href="#${escapeHtml(item.id)}" class="mobile-nav-item">
            <i class="${escapeHtml(item.icon)}"></i>
            <span>${escapeHtml(item.shortLabel || item.label)}</span>
        </a>`).join('');

    return `
    <aside class="sidebar" aria-label="主导航">
        <div class="sidebar-brand">
            <span class="brand-mark">${escapeHtml(profile.avatar)}</span>
            <div class="brand-text">
                <strong>${escapeHtml(profile.name)}</strong>
                <span>${escapeHtml(profile.tagline)}</span>
            </div>
        </div>
        <nav class="sidebar-nav">${navHtml}
        </nav>
        <div class="sidebar-footer">
            <button type="button" class="lang-btn" title="${escapeHtml(ui.languageToggle?.tooltip || '')}">
                <i class="fas fa-globe"></i>
                <span>${escapeHtml(ui.languageToggle?.buttonText || 'EN')}</span>
            </button>
        </div>
    </aside>

    <main class="main-view">
        <header class="top-bar">
            <div class="top-bar-brand">
                <span class="brand-avatar">${escapeHtml(profile.avatar)}</span>
                <div class="brand-meta">
                    <strong>${escapeHtml(profile.name)}</strong>
                    <span class="status-dot">${escapeHtml(profile.tagline)}</span>
                </div>
            </div>
            <div class="search-pill" role="search">
                <i class="fas fa-search"></i>
                <span>${escapeHtml(ui.searchPlaceholder || '')}</span>
            </div>
            <button type="button" class="lang-btn lang-btn--compact">${escapeHtml(ui.languageToggle?.buttonText || 'EN')}</button>
        </header>

        <section id="home" class="hero-banner">
            <div class="hero-inner">
                <div class="hero-profile">
                    <div class="hero-avatar-ring">
                        <span class="hero-avatar">${escapeHtml(profile.avatar)}</span>
                    </div>
                    <div class="hero-status-badge">${escapeHtml(profile.status)}</div>
                </div>
                <div class="hero-content">
                    <p class="hero-eyebrow">${escapeHtml(greeting)}</p>
                    <h1 class="hero-title">${escapeHtml(profile.heroTitle)}</h1>
                    <p class="hero-subtitle">${profile.greeting?.description || ''}</p>
                    <div class="hero-chips">${heroChips}</div>
                    <div class="hero-actions">
                        <button type="button" class="btn-primary">${escapeHtml(ui.heroCtaPrimary || '')}</button>
                        <button type="button" class="btn-secondary">${escapeHtml(ui.heroCtaSecondary || '')}</button>
                    </div>
                </div>
                <div class="hero-stats">${stats}
                </div>
            </div>
        </section>
        ${featuredHtml}
        ${showcaseRows}
        ${experienceHtml}
        ${skillsHtml}
        ${servicesHtml}
        ${philosophyHtml}
    </main>

    <nav class="mobile-bottom-nav" aria-label="快捷导航">${mobileNav}
    </nav>
`.trim();
}

module.exports = { renderAppShell, getStatusText };
