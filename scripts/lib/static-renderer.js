'use strict';

const { escapeHtml, stripHtml } = require('./escape');
const { renderStudioHero, renderDeliveryStory } = require('../../assets/js/studio-home');
const { renderStudioProducts } = require('../../assets/js/studio-products');
const { renderCasebook } = require('../../assets/js/casebook');

// Render the same first screen and case studies readers will see after Vue loads.
function renderAppShell(config, lang = 'zh') {
    const { ui, profile, skills, contact, services } = config;
    const e = escapeHtml;
    const productsId = ui.brief.enabled ? 'products' : 'showcase';
    const nav = ui.nav.map(item =>
        `<a class="nav-item" href="#${e(item.id)}">${e(item.label)}</a>`
    ).join('');
    const items = group => (group?.items || []).map(item =>
        `<li><strong>${e(item.title)}</strong> · ${e(stripHtml(item.description))}</li>`
    ).join('');
    return `<div class="app-shell-inner studio-homepage">
        <header class="studio-header"><div class="studio-header-inner">
            <a href="#home" class="studio-brand"><img src="assets/img/favicon.svg" alt="" width="29" height="29"><span class="brand-handle" lang="en">Abu Studio</span></a>
            <nav class="sidebar-nav" aria-label="${e(ui.studio.navigation)}">${nav}</nav>
        </div></header>
        <main class="main-view" id="main-content">
            <div class="studio-hero-slot">${renderStudioHero(config, lang)}</div>
            <section id="${productsId}" class="bento-card--products studio-product-slot">${renderStudioProducts(config, lang)}</section>
            <div class="studio-cases-slot">${renderCasebook(config, lang)}</div>
            ${renderDeliveryStory(config)}
            <section id="studio-library" class="studio-library">
                <header class="library-heading"><h2>${e(ui.studio.libraryTitle)}</h2><p>${e(stripHtml(profile.greeting.description))}</p></header>
                <details id="skills" class="library-chapter"><summary>${e(skills.title)}</summary><ul class="library-page">${items(skills)}</ul></details>
                <details class="library-chapter"><summary>${e(services.title)}</summary><ul id="services" class="library-page">${items(services)}</ul></details>
            </section>
            <section id="contact" class="content-section"><div class="section-head"><h2>${e(contact.form.title)}</h2><p>${e(contact.form.subtitle)}</p></div></section>
        </main>
    </div>`;
}

module.exports = { renderAppShell };
