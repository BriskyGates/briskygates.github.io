/* Project case studies, shared by the static build and the interactive homepage. */
(function () {
    'use strict';

    const server = typeof module === 'object' && module.exports;
    const docs = server ? require('./case-documents') : window.StudioCaseDocuments;
    const cases = [
        { kind: 'report', id: 'fastapi_celery_kb', flow: 'flow-rag', lab: docs.report },
        { kind: 'scan', id: 'doc_intelligence', flow: 'flow-rag', lab: docs.scan },
        { kind: 'ledger', id: 'group_management_bot', flow: 'flow-community', lab: server ? require('./case-ledger') : window.StudioCaseLedger },
        { kind: 'tools', id: 'tool-orchestration', flow: 'flow-agent', lab: server ? require('./case-tools') : window.StudioCaseTools }
    ];

    function h(value) {
        return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function renderLab(definition, text, state) {
        return definition.lab.render(text.labs[definition.kind], text.examples[definition.kind], state, h);
    }

    function renderCasebook(config, lang = 'zh') {
        const text = config?.ui?.studio?.casebook;
        if (!text?.reader || !text?.labs) return '';
        const reader = text.reader;
        const plain = lang.startsWith('plain') || config.ui.brief?.enabled;
        const links = [];
        const entries = [];
        for (const [index, item] of cases.entries()) {
            const { id, kind, flow } = item;
            const project = config.featured?.items?.find(p => p.id === id);
            const workflow = config.businessFlows?.flows?.find(f => f.id === flow);
            if (!text.labs[kind] || !text.cases[index] || (!project && !workflow)) continue;
            const [category, title] = text.cases[index];
            const article = reader[kind];
            const brief = plain && config.ui.brief?.cases?.find(c => c.id === id);
            const results = project?.highlights || [];
            const outcome = brief?.result || (kind === 'report' ? results[2] : kind === 'scan' ? results[0] : results[1]) || workflow?.oneLiner;
            const related = !plain && workflow
                ? `<a class="casebook-related" href="#${h(flow)}">${h(text.related)} <span aria-hidden="true">↗</span></a>` : '';
            const panelId = 'case-' + id;
            links.push(`<a href="#${panelId}" data-case-link="${kind}" aria-label="${h(article.short)}"><span class="case-full-label">${h(article.short)}</span><span class="case-short-label">${h(article.navShort)}</span></a>`);
            entries.push(`<article class="casebook-entry" id="${panelId}" data-case-kind="${kind}" aria-labelledby="${panelId}-title">
                <header class="case-intro">
                    <p class="case-kicker">${h(category)}</p>
                    <h3 id="${panelId}-title">${h(title)}</h3>
                    <p class="case-lead">${h(article.lead)}</p>
                </header>
                <section class="case-lab" aria-labelledby="lab-${kind}-title">
                    <header class="case-lab-head"><div><p class="case-lab-type">${h(reader.sample)}</p><h4 id="lab-${kind}-title">${h(article.task)}</h4></div>
                        <button class="lab-reset" type="button" data-case-reset disabled>${h(reader.reset)}</button></header>
                    <div class="case-jumps"><button type="button" data-case-jump="source">${h(reader.back)}</button><button type="button" data-case-jump="inspect">${h(reader.jump)}</button></div>
                    <fieldset class="case-interaction" disabled aria-labelledby="lab-${kind}-title"><div data-case-surface>${renderLab(item, text, item.lab.initial())}</div></fieldset>
                    <span class="case-live" role="status" aria-live="polite" aria-atomic="true"></span>
                </section>
                <div class="case-notes">
                    <section><h4>${h(reader.design)}</h4><p>${h(article.decision)}</p></section>
                    <section><h4>${h(kind === 'tools' ? text.workflowResult : reader.delivery)}</h4><p>${h(outcome)}</p>${related}</section>
                </div>
                <details class="case-record"><summary>${h(reader.record)}</summary><dl>
                    <dt>${h(reader.check)}</dt><dd>${h(article.check)}</dd>
                    <dt>${h(reader.review)}</dt><dd>${h(article.review)}</dd>
                </dl></details>
            </article>`);
        }
        if (!entries.length) return '';
        return `<section class="casebook" id="case-studies" aria-labelledby="casebook-heading">
            <header class="casebook-head"><h2 id="casebook-heading">${h(text.heading)}</h2><p>${h(reader.intro)}</p></header>
            <nav class="casebook-index" aria-label="${h(reader.nav)}">${links.join('')}</nav>
            <noscript><p>${h(reader.noScript)}</p></noscript>
            <div class="casebook-entries">${entries.join('')}</div>
        </section>`.replace(/^[ \t]+$/gm, '');
    }

    function mountCasebook(root, config) {
        const book = root.querySelector('#case-studies');
        if (!book) return () => {};
        const text = config.ui.studio.casebook;
        const articles = [...book.querySelectorAll('[data-case-kind]')];
        const links = [...book.querySelectorAll('[data-case-link]')];
        const definitions = new Map(cases.map(item => [item.kind, item]));
        const states = new Map();
        for (const article of articles) {
            article.querySelector('.case-interaction').disabled = false;
            const kind = article.dataset.caseKind;
            states.set(kind, definitions.get(kind).lab.initial());
        }

        function select(kind) {
            for (const article of articles) article.hidden = article.dataset.caseKind !== kind;
            for (const link of links) {
                if (link.dataset.caseLink === kind) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            }
        }
        function followLocation() {
            const match = articles.find(article => '#' + article.id === location.hash);
            if (match) select(match.dataset.caseKind);
            else if (['#case-studies', '#notes'].includes(location.hash) || articles.every(a => !a.hidden)) select(articles[0].dataset.caseKind);
        }

        function update(control, article, eventType) {
            const kind = article.dataset.caseKind;
            const definition = definitions.get(kind);
            const previous = states.get(kind);
            const reset = control.hasAttribute('data-case-reset');
            const action = eventType === 'change' ? control.dataset.caseChange : control.dataset.caseAction;
            const value = eventType === 'change' ? control.value : control.dataset.value;
            const next = reset ? definition.lab.initial() : definition.lab.reduce(previous, action, value);
            if (next === previous && !reset) return;
            states.set(kind, next);
            const surface = article.querySelector('[data-case-surface]');
            const active = document.activeElement;
            const restore = surface.contains(active) || (active === control && reset);
            surface.innerHTML = renderLab(definition, text, next);
            const resetButton = article.querySelector('[data-case-reset]');
            resetButton.disabled = reset;
            if (restore) {
                const candidates = [...surface.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')];
                const same = candidates.find(el => eventType === 'change'
                    ? el.dataset.caseChange === action && (control.type !== 'radio' || el.value === control.value)
                    : el.dataset.caseAction === action && el.dataset.value === value);
                (reset ? candidates[0] : same || candidates[0])?.focus({ preventScroll: true });
            }
            const message = surface.querySelector('[data-case-feedback]')?.textContent;
            article.querySelector('.case-live').textContent = reset ? text.reader.restored : message || '';
        }

        function click(event) {
            const link = event.target.closest('[data-case-link]');
            if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
                event.preventDefault();
                if (location.hash !== link.hash) history.pushState(history.state, '', link.hash);
                select(link.dataset.caseLink);
                return;
            }
            const jump = event.target.closest('[data-case-jump]');
            if (jump) {
                const panel = jump.closest('.case-lab').querySelector('.lab-' + jump.dataset.caseJump);
                panel.tabIndex = -1;
                panel.focus({ preventScroll: true });
                panel.scrollIntoView({ block: 'start', behavior: 'instant' });
                return;
            }
            const control = event.target.closest('[data-case-action],[data-case-reset]');
            if (control && !control.disabled) update(control, control.closest('[data-case-kind]'), 'click');
        }
        function change(event) {
            const control = event.target.closest('[data-case-change]');
            if (control && !control.disabled) update(control, control.closest('[data-case-kind]'), 'change');
        }
        function previewRange(event) {
            const control = event.target;
            if (control.type !== 'range' || !control.dataset.caseChange) return;
            const article = control.closest('[data-case-kind]');
            const kind = article.dataset.caseKind;
            const lab = definitions.get(kind).lab;
            if (lab.previewRange) {
                const next = lab.reduce(states.get(kind), control.dataset.caseChange, control.value);
                lab.previewRange(article.querySelector('[data-case-surface]'), text.labs[kind], text.examples[kind], next, h);
            }
        }

        book.dataset.caseReady = '';
        book.addEventListener('click', click);
        book.addEventListener('change', change);
        book.addEventListener('input', previewRange);
        window.addEventListener('hashchange', followLocation);
        followLocation();
        return () => {
            delete book.dataset.caseReady;
            book.removeEventListener('click', click);
            book.removeEventListener('change', change);
            book.removeEventListener('input', previewRange);
            window.removeEventListener('hashchange', followLocation);
        };
    }

    if (server) module.exports = { renderCasebook };
    else Object.assign(window, { renderCasebook, mountCasebook });
})();
