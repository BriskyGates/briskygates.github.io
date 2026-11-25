/* Deterministic teaching examples. Nothing here reads customer files or calls a model. */
(function () {
    'use strict';

    const sourceKeys = ['earlier', 'latest', 'digest'];
    const sections = ['supply', 'demand'];

    function select(name, label, options, value, h) {
        return `<label class="lab-control"><span>${h(label)}</span><select data-case-change="${name}">${Object.entries(options).map(([key, text]) =>
            `<option value="${h(key)}"${value === key ? ' selected' : ''}>${h(text)}</option>`).join('')}</select></label>`;
    }

    const report = {
        initial() {
            return { period: 'late', sort: 'publication', source: 'digest', section: 'demand', checked: false };
        },
        reduce(state, action, value) {
            if (action === 'cite') return { ...state, checked: true };
            const options = { period: ['early', 'late'], sort: ['publication', 'primary'], source: sourceKeys, section: sections };
            if (!Object.hasOwn(options, action) || !options[action].includes(value)) return state;
            return { ...state, [action]: value, checked: action === 'sort' ? state.checked : false };
        },
        render(copy, example, state, h) {
            const expected = state.period === 'early' ? 'earlier' : 'latest';
            const order = state.sort === 'publication' ? ['digest', 'latest', 'earlier']
                : [expected, expected === 'earlier' ? 'latest' : 'earlier', 'digest'];
            const doc = copy.docs[state.source];
            const activeSection = doc[state.section];
            const citation = `${doc.title} · ${doc.date} · ${activeSection.ref}`;
            let verdict = 'valid';
            if (state.period === 'early' && state.source !== 'earlier') verdict = 'future';
            else if (state.section !== 'demand') verdict = 'section';
            else if (state.source === 'digest') verdict = 'secondary';
            else if (state.source !== expected) verdict = 'outdated';

            const menu = order.map(key => {
                const entry = copy.docs[key];
                return `<button class="cd-source-choice" type="button" data-case-action="source" data-value="${key}" aria-pressed="${state.source === key}"><strong>${h(entry.title)}</strong><small>${h(entry.date)} · ${h(entry.kind)}</small></button>`;
            }).join('');
            const paragraphs = sections.map(key => {
                const value = doc[key];
                return `<button class="cd-source-passage" type="button" data-case-action="section" data-value="${key}" aria-pressed="${state.section === key}"><strong>${h(example[key])}</strong><span>${h(value.text)}</span></button>`;
            }).join('');
            const verdictBody = state.checked ? `<div class="lab-result cd-verdict" data-document-verdict="${verdict}"><strong data-case-feedback>${h(copy.verdicts[verdict].title)}</strong><p>${h(copy.verdicts[verdict].body)}</p>${verdict === 'valid' ? `<blockquote>${h(activeSection.text)}<cite>${h(citation)}</cite></blockquote>` : ''}</div>` : '';
            return `<p class="lab-caption">${h(copy.brief)}</p>
                <div class="lab-workspace cd-report">
                    <div class="lab-source"><h5>${h(copy.materials)}</h5>
                        ${select('sort', copy.sortLabel, copy.sortOptions, state.sort, h)}
                        <div class="cd-sources" role="group" aria-label="${h(copy.materials)}">${menu}</div>
                        <div class="cd-report-sheet"><div class="cd-paper-title"><b>${h(doc.title)}</b><span>${h(doc.date)}</span></div>
                        <div class="cd-passages" role="group" aria-label="${h(copy.pickPassage)}">${paragraphs}</div></div>
                    </div>
                    <div class="lab-inspect"><h5>${h(copy.question)}</h5>
                        ${select('period', copy.periodLabel, copy.periodOptions, state.period, h)}
                        <p>${h(copy.criteria)}</p><div class="cd-citation"><small>${h(copy.candidate)}</small><p>${h(activeSection.text)}</p><cite${state.checked ? '' : ' data-case-feedback'}>${h(citation)}</cite></div>
                        <div class="lab-actions"><button type="button" data-case-action="cite">${h(copy.check)}</button></div>
                        ${verdictBody}
                    </div>
                </div>`;
        }
    };

    // Synthetic glyph centres on a 0–100 horizontal axis. Ownership is decided from position.
    const rowsX = [{ unit: 52, qty: 77 }, { unit: 63, qty: 83 }];
    function reconstructScan(copy, example, state, h) {
        const cut = Math.max(45, Math.min(88, Number(state.boundary) || 59));
        const original = example.rows;
        const parsed = original.map(([name, unit, qty], i) => {
            const unitColumn = [], qtyColumn = [];
            (rowsX[i].unit < cut ? unitColumn : qtyColumn).push(unit);
            (rowsX[i].qty < cut ? unitColumn : qtyColumn).push(qty);
            return [name, unitColumn.join(' '), qtyColumn.join(' ')];
        });
        const issues = parsed.flatMap(([name, unit, qty]) => {
            if (!unit) return [name + ' · ' + copy.missingUnit];
            if (!qty) return [name + ' · ' + copy.missingQty];
            return [];
        });
        const table = `<table><thead><tr>${example.headers.map(title => `<th scope="col">${h(title)}</th>`).join('')}</tr></thead><tbody>${parsed.map(row => `<tr><th scope="row">${h(row[0])}</th>${row.slice(1).map(cell => `<td${cell ? '' : ' class="cd-empty"'}>${cell ? h(cell) : h(copy.empty)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        const exportText = [example.headers, example.headers.map(() => '---'), ...parsed]
            .map(row => `| ${row.join(' | ')} |`).join('\n');
        const verdict = !state.checked ? `<p class="cd-pending" data-case-feedback>${h(issues.length ? copy.pending : copy.ready)}</p>` : issues.length
            ? `<div class="lab-result cd-verdict" data-document-verdict="review"><strong data-case-feedback>${h(copy.review)}</strong><ul>${issues.map(issue => `<li>${h(issue)}</li>`).join('')}</ul></div>`
            : `<div class="lab-result cd-verdict" data-document-verdict="valid"><strong data-case-feedback>${h(copy.valid)}</strong><pre>${h(exportText)}</pre><a class="cd-download" href="data:text/markdown;charset=utf-8,${encodeURIComponent(exportText + '\n')}" download="parsed-table.md">${h(copy.download)}</a></div>`;
        return { cut, table, verdict };
    }

    const scan = {
        initial() { return { boundary: 59, checked: false }; },
        reduce(state, action, value) {
            if (action === 'check') return { ...state, checked: true };
            if (action !== 'boundary') return state;
            const n = Number(value);
            if (value == null || value === '' || !Number.isFinite(n)) return state;
            return { boundary: Math.max(45, Math.min(88, Math.round(n))), checked: false };
        },
        previewRange(surface, copy, example, nextState, h) {
            const workspace = surface.matches?.('.cd-scan') ? surface : surface.querySelector('.cd-scan');
            if (!workspace) return;
            const { cut, table, verdict } = reconstructScan(copy, example, nextState, h);
            workspace.querySelector('.cd-scan-words').style.setProperty('--cd-cut', cut + '%');
            workspace.querySelector('[data-cut-label]').textContent = cut + '%';
            workspace.querySelector('[data-scan-table]').innerHTML = table;
            workspace.querySelector('[data-scan-verdict]').innerHTML = verdict;
        },
        render(copy, example, state, h) {
            const { cut, table, verdict } = reconstructScan(copy, example, state, h);
            const tokens = example.rows.map(([name, unit, qty], i) => `<div class="cd-scan-row"><span>${h(name)}</span><i style="left:${rowsX[i].unit}%">${h(unit)}</i><i style="left:${rowsX[i].qty}%">${h(qty)}</i></div>`).join('');
            return `<p class="lab-caption">${h(copy.brief)}</p><div class="lab-workspace cd-scan">
                <div class="lab-source"><h5>${h(copy.sourceTitle)}</h5><div class="cd-scan-page"><div class="cd-scan-head">${h(copy.sheet)}</div>
                    <div class="cd-scan-words" style="--cd-cut:${cut}%">${tokens}</div></div>
                    <label class="lab-control cd-adjust"><span>${h(copy.boundary)} <b data-cut-label>${cut}%</b></span><input type="range" min="45" max="88" step="1" value="${cut}" data-case-change="boundary"></label><p>${h(copy.hint)}</p></div>
                <div class="lab-inspect"><h5>${h(copy.output)}</h5><div class="lab-table" data-scan-table>${table}</div><div class="lab-actions"><button type="button" data-case-action="check">${h(copy.check)}</button></div><div data-scan-verdict>${verdict}</div></div>
                </div>`;
        }
    };

    const api = { report, scan };
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (typeof window !== 'undefined') window.StudioCaseDocuments = api;
})();
