/* A local, synthetic document and a replayable trace. Both renderers use this module. */
(function () {
    'use strict';

    const documentId = 'IN-07';
    const pages = {
        '1': { kind: 'cover', matrix: [] },
        '2': { kind: 'lines', matrix: [['batch', '', 'pieces'], ['A-17', '', '12'], ['B-06', '', '7']] }
    };

    function initial() {
        return { page: '2', mode: 'keep', runs: [], selected: 0 };
    }

    function execute(page, mode) {
        const source = pages[page].matrix;
        const columns = (source[0] || []).map((_, i) => i);
        const keep = mode === 'trim' ? columns.filter(i => source.some(row => row[i].trim())) : columns;
        const matrix = source.map(row => keep.map(i => row[i]));
        // The topology audit flags a phantom column only if the entire column is empty.
        const empty = matrix.length > 1 && keep.length > 2
            ? matrix[0].map((_, i) => i).filter(i => matrix.every(row => !row[i].trim())) : [];
        const status = !matrix.length ? 'noTable' : empty.length ? 'ghost' : 'passed';
        const quantityColumn = matrix[0]?.indexOf('pieces');
        const total = status === 'passed'
            ? matrix.slice(1).reduce((sum, row) => sum + Number(row[quantityColumn]), 0) : null;
        return { page, mode, matrix, empty, status, total };
    }

    function reduce(state, action, value) {
        if (action === 'tools-page' && Object.hasOwn(pages, value)) return { ...state, page: value };
        if (action === 'tools-mode' && ['keep', 'trim'].includes(value)) return { ...state, mode: value };
        if (action === 'tools-run') {
            const runs = [...state.runs, execute(state.page, state.mode)];
            return { ...state, runs, selected: runs.length };
        }
        if (action === 'tools-history') {
            const n = Number(value);
            if (Number.isInteger(n) && n >= 1 && n <= state.runs.length) return { ...state, selected: n };
        }
        return state;
    }

    function fill(template, fields) {
        return template.replace(/\{(\w+)\}/g, (_, key) => String(fields[key]));
    }

    function select(action, label, options, value, h) {
        return `<label class="lab-control"><span>${h(label)}</span><select data-case-change="${action}">${Object.entries(options)
            .map(([key, title]) => `<option value="${h(key)}"${key === String(value) ? ' selected' : ''}>${h(title)}</option>`).join('')}</select></label>`;
    }

    function table(matrix, copy, caption, h) {
        if (!matrix.length) return `<p class="tools-empty">${h(copy.noRows)}</p>`;
        const [header, ...rows] = matrix;
        return `<div class="lab-table"><table><caption>${h(caption)}</caption><thead><tr>${header.map(key =>
            `<th scope="col">${h(key ? copy.fields[key] : copy.blank)}</th>`).join('')}</tr></thead><tbody>${rows.map(row =>
            `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row">${h(cell)}</th>` : `<td>${h(cell || copy.blank)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }

    function runLabel(copy, run, n) {
        return fill(copy.runLabel, { n, result: copy.verdict[run.status], page: run.page });
    }

    function renderRequest(copy, state, h) {
        const plan = copy.plan;
        const request = fill(plan.request, { doc: documentId, page: copy.pages[state.page], mode: copy.modes[state.mode] });
        return `<div class="tools-request" data-tools-request><p class="tools-request-input" data-case-feedback>${h(request)}</p>
            <h6>${h(plan.check)}</h6><p>${h(plan.rule)}</p>
            <h6>${h(plan.route)}</h6><ul>${plan.paths.map(path => `<li>${h(path)}</li>`).join('')}</ul></div>`;
    }

    function renderTrace(copy, example, run, h) {
        const page = fill(copy.pageRef, { page: run.page });
        const source = pages[run.page];
        const shape = fill(copy.shape, { rows: Math.max(0, run.matrix.length - 1), cols: run.matrix[0]?.length || 0 });
        const total = fill(copy.total, { n: run.total });
        const detail = run.status === 'ghost'
            ? fill(copy.reason.ghost, { col: run.empty[0] + 1, rows: run.matrix.length - 1 })
            : copy.reason[run.status];
        const step = (name, input, output, extra = '') => `<li><strong><code>${name}</code></strong><dl>
            <dt>${h(example.input)}</dt><dd>${h(input)}</dd><dt>${h(example.output)}</dt><dd>${h(output)}</dd></dl>${extra}</li>`;
        const inspection = table(run.matrix, copy, copy.parsed, h);
        const auditOut = run.status === 'ghost' ? 'TOPOLOGY_VIOLATION' : run.status === 'noTable' ? 'NO_TABLE' : 'PASS';
        const dispatchInput = run.status === 'passed'
            ? run.matrix.slice(1).map(row => row[run.matrix[0].indexOf('pieces')]).join(' + ')
            : auditOut;
        return `<div class="lab-result" data-tools-verdict="${run.status}"><strong data-case-feedback>${h(run.status === 'passed' ? total : copy.verdict[run.status])}</strong><p>${h(detail)}</p></div>
            <details class="tools-trace" open><summary>${h(copy.trace)}</summary><ol>
            ${step('read_document', `${documentId} · ${page}`, copy.pageOutput[source.kind])}
            ${step('extract_table', `${page} · ${copy.modes[run.mode]}`, shape, inspection)}
            ${step('audit_table', shape, auditOut)}
            ${step(run.status === 'passed' ? 'count_units' : 'route', dispatchInput,
                run.status === 'passed' ? total : copy.routes[run.status])}</ol></details>`;
    }

    function render(copy, example, state, h) {
        const source = pages[state.page];
        const run = state.runs[state.selected - 1];
        const history = Object.fromEntries(state.runs.map((item, i) => [i + 1, runLabel(copy, item, i + 1)]));
        const sourceTable = source.kind === 'lines'
            ? table(source.matrix.map(row => [row[0], row[2]]), copy, copy.sheetCaption, h)
            : `<p>${h(copy.cover)}</p>`;
        return `<p class="lab-caption">${h(copy.brief)}</p><div class="lab-workspace tools-lab">
            <div class="lab-source"><h5>${h(copy.sourceTitle)} · ${documentId}</h5>
            ${select('tools-page', copy.pageLabel, copy.pages, state.page, h)}
            <div class="tools-slip"><p>${h(copy.pages[state.page])}</p>${sourceTable}</div>
            ${select('tools-mode', copy.modeLabel, copy.modes, state.mode, h)}
            <div class="lab-actions"><button type="button" data-case-action="tools-run" data-value="">${h(run ? copy.again : copy.run)}</button></div></div>
            <div class="lab-inspect"><h5>${h(run ? copy.inspector : copy.plan.title)}</h5>
            ${run ? (state.runs.length > 1 ? select('tools-history', copy.history, history, state.selected, h)
                    : `<p class="tools-record">${h(history[state.selected])}</p>`) + renderTrace(copy, example, run, h)
                : renderRequest(copy, state, h)}</div></div>`;
    }

    const api = { initial, reduce, render };
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (typeof window !== 'undefined') window.StudioCaseTools = api;
})();
