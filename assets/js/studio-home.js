(function () {
    'use strict';

    const products = [
        { key: 'glide', label: 'Glide', image: 'assets/img/studio/glide-in-motion.webp', id: 'glide_ai' },
        { key: 'freight', label: 'CrossLeads', image: 'assets/img/studio/crossleads-at-sea.webp', id: 'crossleads_soumaijia' }
    ];

    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

    function escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
    }

    function renderStudioHero(config) {
        const copy = config.ui?.studio?.feature;
        if (!copy) {
            return `<section id="home" class="studio-feature"><div class="studio-feature-intro"><p>${escape(config.profile?.name)}</p><h1 class="hero-title">${escape(config.profile?.heroTitle)}</h1></div></section>`;
        }
        const tabs = products.map(({ key, label }, i) => `
            <button type="button" role="tab" id="feature-tab-${key}" aria-controls="feature-panel-${key}" aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}" data-feature-select="${key}">${label}</button>`).join('');
        const panels = products.map((product, i) => {
            const story = copy[product.key];
            const url = config.projects.items.find(item => item.id === product.id)?.url || '#case-studies';
            return `<div class="studio-feature-panel studio-feature-panel--${product.key}" id="feature-panel-${product.key}" data-feature-panel="${product.key}" role="tabpanel" aria-labelledby="feature-tab-${product.key}" ${i === 0 ? '' : 'hidden'}>
                <img class="studio-feature-photo" src="${product.image}" width="1440" height="810" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} alt="${escape(story.alt)}">
                <div class="studio-feature-copy">
                    <p class="studio-feature-product">${escape(story.name)}</p>
                    <h2>${escape(story.title)}</h2>
                    <a id="launch-${product.key}" class="studio-feature-cta" href="${escape(url)}" data-studio-demo="${product.key}" data-open="${product.key}">${escape(story.action)}</a>
                </div>
            </div>`;
        }).join('');
        const story = config.ui.studio.deliveryStory;
        const entry = story ? `<a class="delivery-entry" href="#glide-delivery">${escape(story.entryLabel)}</a>` : '';
        return `<section id="home" class="studio-feature" aria-labelledby="studio-main-title">
            <div class="studio-feature-intro"><div class="studio-byline"><p>${escape(copy.author)}</p>${entry}</div>
            <h1 class="hero-title" id="studio-main-title">${escape(config.profile?.heroTitle)}</h1></div>
            <div class="studio-feature-tabs" role="tablist" aria-label="${escape(copy.choose)}">${tabs}</div>
            <div class="studio-feature-frame">${panels}</div>
        </section>`;
    }

    function renderDeliveryStory(config) {
        const story = config.ui.studio.deliveryStory;
        if (!story) return '';
        const stages = story.steps.map(step =>
            `<li><h3>${escape(step.title)}</h3><p>${escape(step.body)}</p></li>`
        ).join('');
        const checks = story.checks.map(([input, expected]) =>
            `<tr><th scope="row">${escape(input)}</th><td>${escape(expected)}</td></tr>`
        ).join('');
        const routes = story.routes.map(route => {
            const service = config.services.items.find(item => item.icon === route.icon);
            if (!service) return '';
            return `<article><h4>${escape(service.title)}</h4><p>${escape(route.body)}</p>
                <a href="#contact" data-delivery-route="${escape(route.icon)}">${escape(route.action)}</a></article>`;
        }).join('');
        return `<article id="glide-delivery" class="delivery-story" aria-labelledby="delivery-title">
            <header class="delivery-heading">
                <p class="delivery-eyebrow">${escape(story.eyebrow)}</p>
                <h2 id="delivery-title">${escape(story.title)}</h2><p class="delivery-intro">${escape(story.intro)}</p>
            </header>
            <div class="delivery-record">
                <ol class="delivery-stages">${stages}</ol>
                <aside class="delivery-proof" aria-labelledby="delivery-proof-title">
                    <div class="delivery-build"><div><img src="assets/img/studio/glide-app-icon.webp" width="36" height="36" alt="">
                        <strong lang="en">Glide <span>1.1.8</span></strong></div>
                        <time datetime="2026-10-31">2026.10.31</time></div>
                    <h3 id="delivery-proof-title">${escape(story.proofTitle)}</h3>
                    <table aria-labelledby="delivery-proof-title"><thead><tr><th scope="col">${escape(story.proofColumns[0])}</th><th scope="col">${escape(story.proofColumns[1])}</th></tr></thead><tbody>${checks}</tbody></table>
                    <ul class="delivery-sources">
                        <li><a href="https://www.v2ex.com/t/1244175?p=1#r_18126913">${escape(story.feedbackLabel)}</a></li>
                        <li><a href="https://glide-ai.fun/#changelog">${escape(story.releaseLabel)}</a></li>
                        <li><a href="https://glide-ai.fun/downloads/Glide_v1.1.8_arm64.dmg.sha256">${escape(story.checksumLabel)}</a></li>
                    </ul>
                </aside>
            </div>
            <section class="delivery-collaboration" aria-labelledby="delivery-next">
                <header><h3 id="delivery-next">${escape(story.collaborationTitle)}</h3>
                    <p>${escape(story.collaborationIntro)}</p><a href="#services">${escape(story.servicesLabel)}</a></header>
                <div class="delivery-routes">${routes}</div>
            </section>
        </article>`;
    }

    function mountStudioHome(root) {
        function change(tab) {
            const section = tab.closest('.studio-feature');
            for (const option of section.querySelectorAll('[data-feature-select]')) {
                const active = option === tab;
                option.setAttribute('aria-selected', String(active));
                option.tabIndex = active ? 0 : -1;
            }
            for (const panel of section.querySelectorAll('[data-feature-panel]')) {
                panel.hidden = panel.dataset.featurePanel !== tab.dataset.featureSelect;
            }
        }

        function handleClick(event) {
            const tab = event.target.closest('[data-feature-select]');
            if (tab && root.contains(tab)) change(tab);
        }

        function handleKey(event) {
            const tab = event.target.closest('[data-feature-select]');
            if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            const options = [...tab.closest('[role="tablist"]').querySelectorAll('[data-feature-select]')];
            const offset = event.key === 'ArrowLeft' ? -1 : 1;
            let index = (options.indexOf(tab) + offset + options.length) % options.length;
            if (event.key === 'Home') index = 0;
            if (event.key === 'End') index = options.length - 1;
            event.preventDefault();
            change(options[index]);
            options[index].focus();
        }

        root.addEventListener('click', handleClick);
        root.addEventListener('keydown', handleKey);
        return () => {
            root.removeEventListener('click', handleClick);
            root.removeEventListener('keydown', handleKey);
        };
    }

    const api = { renderStudioHero, renderDeliveryStory, mountStudioHome };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (typeof window !== 'undefined') window.StudioHome = api;
})();
