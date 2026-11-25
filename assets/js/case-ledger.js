(function (host) {
  'use strict';

  function initial() {
    return {
      order: 'B', ticket: false, draft: '', proof: '', verified: false,
      feedback: 'inspectB', events: ['initialA', 'initialB']
    };
  }

  function record(state, changes, event) {
    const events = state.events.at(-1) === event ? state.events : [...state.events, event];
    return { ...state, ...changes, feedback: event, events };
  }

  function reduce(state, action, value) {
    if (action === 'order' && (value === 'A' || value === 'B')) {
      if (value === state.order) return state;
      let feedback = 'inspectA';
      if (value === 'B') feedback = state.events.at(-1);
      return { ...state, order: value, feedback };
    }
    if (state.order !== 'B' || state.verified) return state;
    switch (action) {
      case 'request':
        return state.ticket ? state : record(state, { ticket: true }, 'requested');
      case 'proof':
        if (!state.ticket || !['', 'A', 'B'].includes(value)) return state;
        return { ...state, draft: value, feedback: value ? 'chosen' : state.events.at(-1) };
      case 'attach':
        if (!state.ticket || !state.draft || state.draft === state.proof) return state;
        return record(state, { proof: state.draft }, state.draft === 'A' ? 'attachedA' : 'attachedB');
      case 'verify':
        if (!state.proof) return record(state, {}, 'noProof');
        if (state.proof === 'A') return record(state, {}, 'mismatch');
        return record(state, { verified: true }, 'verified');
      default:
        return state;
    }
  }

  function render(copy, example, state, h) {
    const label = key => h(copy[key]);
    const orders = { A: example.idA, B: example.idB };
    const message = key => h(copy[key].replace(/\{([AB])\}/g, (_, order) => orders[order]));
    const bStatus = state.verified ? copy.closed : state.proof ? copy.proposed : state.ticket ? copy.pending : example.missing;
    const left = ['A', 'B'].map(key => {
      const badge = key === 'A' ? example.matched : bStatus;
      return `<button type="button" class="ledger-order" data-case-action="order" data-value="${key}" aria-pressed="${state.order === key}">
        <strong>${h(orders[key])}</strong><span>${h(badge)}</span></button>`;
    }).join('');
    const attached = state.order === 'A' ? 'A' : state.proof;
    const credit = state.order;
    const reference = (type, order) => `<span class="ledger-ref">${label(type + order)}</span> <span aria-hidden="true">·</span> ${h(orders[order])}`;
    let controls = '';
    if (state.order === 'B' && !state.verified) {
      const samples = ['', 'A', 'B'].map(key => {
        const name = key ? copy['proof' + key] + ' · ' + orders[key] : copy.choose;
        return `<option value="${key}"${key === state.draft ? ' selected' : ''}>${h(name)}</option>`;
      }).join('');
      const attach = state.ticket ? `<div class="ledger-attach"><label>${label('proofSelect')}<select data-case-change="proof">${samples}</select></label>
        <button type="button" data-case-action="attach"${state.draft && state.draft !== state.proof ? '' : ' disabled'}>${label('attach')}</button></div>` : '';
      controls = `${attach}<div class="lab-actions ledger-actions">
        ${state.ticket ? '' : `<button type="button" data-case-action="request">${label('openTicket')}</button>`}
        <button type="button" data-case-action="verify">${label('verify')}</button></div>`;
    }
    const events = state.events.map(event => `<li>${message(event)}</li>`).join('');
    return `<p class="lab-caption ledger-sample">${label('sample')}</p>
      <div class="lab-workspace ledger-workspace">
        <section class="lab-source"><h4>${label('queue')}</h4><div class="ledger-orders">${left}</div></section>
        <section class="lab-inspect"><h4>${label('inspect')}</h4>
          <dl class="ledger-evidence">
            <div><dt>${label('order')}</dt><dd>${h(orders[state.order])} · ${h(example.posted)}</dd></div>
            <div><dt>${label('proof')}</dt><dd>${attached ? reference('proof', attached) : h(example.missing)}</dd></div>
            <div><dt>${label('credit')}</dt><dd>${reference('credit', credit)}</dd></div>
            ${state.order === 'B' && state.ticket ? `<div><dt>${label('ticket')}</dt><dd>${h(bStatus)}</dd></div>` : ''}
          </dl>
          ${controls}
          <p class="lab-result ledger-feedback" data-case-feedback>${message(state.feedback)}</p>
        </section>
      </div>
      <section class="ledger-log"><h4>${label('history')}</h4><ol>${events}</ol></section>`;
  }

  const api = { initial, reduce, render };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else host.StudioCaseLedger = api;
})(typeof globalThis === 'undefined' ? this : globalThis);
