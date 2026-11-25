(function (host) {
  'use strict';

  const images = 'assets/img/studio/';
  const artworks = {
    glide_ai: { key: 'glide', mark: 'glide-app-icon.webp' },
    crossleads_soumaijia: { key: 'freight', mark: 'crossleads-mark.svg' }
  };
  const activeMounts = new WeakMap();

  function html(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function externalLink(value) {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function format(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));
  }

  function renderProductScene(key, copy) {
    if (key === 'glide') {
      return `<div class="glide-shot" role="img" aria-label="${html(copy.glideAlt)}">
        <div class="glide-shot-window"><div class="glide-shot-bar"><i></i><i></i><i></i></div><div class="glide-shot-note"><b>${html(copy.workNote)}</b><i></i><i></i><i></i></div></div>
        <span class="glide-shot-stroke"><i></i></span><span class="glide-shot-label">${html(copy.left)}</span>
      </div>`;
    }
    return `<div class="freight-shot" role="img" aria-label="${html(copy.freightAlt)}">
      <div class="freight-shot-bill"><span>${html(copy.sampleBill)}</span><b>${html(copy.bikes)}</b><i></i><i></i></div>
      <i class="freight-shot-arrow"></i>
      <div class="freight-shot-buyer"><span>${html(copy.sampleMatch)}</span><b>${html(copy.bikeName)}</b><small lang="en">NL</small></div>
    </div>`;
  }

  function renderCard(item, copy) {
    const art = Object.hasOwn(artworks, item.id) && artworks[item.id];
    const url = html(externalLink(item.url));
    if (!art || !copy) {
      return `<article class="work-card bento-product-tile"><h3 class="bento-product-name">${html(item.name)}</h3><h4 class="bento-product-subtitle">${html(item.title)}</h4><p class="work-summary">${html(item.description)}</p><a class="work-link bento-product-link" href="${url}" target="_blank" rel="noopener noreferrer">${html(item.cta || copy?.home || item.name)}</a></article>`;
    }
    const key = art.key;
    const alias = copy[key + 'Alias'];
    const productName = String(item.name ?? '');
    const brand = alias && productName.endsWith(' ' + alias)
      ? productName.slice(0, -alias.length).trimEnd()
      : productName.replace(/\s+\([^()]*\)$/, '');
    const name = `<span${key === 'glide' ? ' class="bento-product-name"' : ''} lang="en">${html(brand)}</span>`;
    const aliasMarkup = alias ? ` <span class="work-brand-zh">${html(alias)}</span>` : '';
    const cardTitle = key === 'glide' ? 'work-glide' : 'work-crossleads';
    return `<article class="work-card bento-product-tile" data-work="${key}" data-platform="${html(item.platform)}" aria-labelledby="${cardTitle}">
      <a id="card-${key}" class="work-entry" data-open="${key}" href="${url}" aria-label="${html(item.name + ' · ' + copy[key + 'Try'])}">
        <div class="work-poster work-poster--${key}">
          <div class="work-brand-line"><img class="work-mark" src="${images}${art.mark}" alt="" width="48" height="48">
            <h3 class="work-brand${key === 'freight' ? ' bento-product-name' : ''}" id="${cardTitle}">${name}${aliasMarkup}</h3>${key === 'freight' ? `<small class="freight-shot-disclaimer">${html(copy.fictional)}</small>` : ''}
          </div>
          ${renderProductScene(key, copy)}
        </div>
        <div class="work-copy"><h4 class="bento-product-subtitle">${html(item.title)}</h4><span class="work-try">${html(copy[key + 'Try'])}</span></div>
      </a>
      <p class="work-summary">${html(item.description)}</p>
      <a class="work-link bento-product-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${html(item.cta || copy.home)}">${html(copy.home)}</a>
    </article>`;
  }

  function renderStudioProducts(config, lang = 'zh') {
    const projects = config?.projects;
    if (!projects?.items?.length) return '';
    const copy = config.ui?.studio?.productDemo;
    return `<div class="studio-products"><h2 id="work-title">${html(projects.title)}</h2><div class="work-grid">${projects.items.map(item => renderCard(item, copy)).join('\n')}</div></div>` + (copy ? renderViewer(copy) : '');
  }

  function renderViewer(messages) {
    const copy = Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, html(value)]));
    return `<dialog id="project-viewer" class="project-viewer" aria-labelledby="viewer-title">
    <div class="viewer-shell">
      <header class="viewer-bar"><span>${copy.experience}</span><button type="button" class="viewer-close desk-back" autofocus>${copy.close}</button></header>
      <div class="viewer-body" tabindex="-1">
        <div class="viewer-identity"><img class="viewer-icon" alt="" width="56" height="56"><div><p class="viewer-platform"></p><h2 id="viewer-title" tabindex="-1"></h2></div></div>
        <p class="viewer-intro"></p>
        <section id="demo-glide" class="viewer-demo" data-project="glide" data-info="${copy.glideInfo}" hidden>
          <section class="gdraw" data-glide-draw aria-label="${copy.glideDemo}">
            <header class="gdraw-head"><h3 class="gdraw-title">${copy.board}</h3><button class="gdraw-reset" type="button" data-reset disabled>${copy.reset}</button></header>
            <div class="gdraw-pad" data-pad tabindex="-1" role="group" aria-label="${copy.board}" aria-describedby="gdraw-help">
              <div class="gdraw-window" aria-hidden="true">
                <div class="gdraw-chrome"><i></i><i></i><i></i></div>
                <div class="gdraw-page"><div class="gdraw-sidebar"></div><div class="gdraw-doc"><b>${copy.note}</b><ul class="gdraw-note"><li><kbd>↑</kbd>${copy.max}</li><li><kbd>↑←</kbd>${copy.left}</li><li><kbd>↑→</kbd>${copy.right}</li></ul></div></div>
              </div>
              <div class="gdraw-target" aria-hidden="true"></div>
              <canvas class="gdraw-ink" aria-hidden="true"></canvas>
              <span class="gdraw-cue" aria-hidden="true"><i></i>${copy.start}</span>
            </div>
            <div class="gdraw-controls">
              <p class="gdraw-help" id="gdraw-help">${copy.help} <span id="gdraw-touch-help">${copy.touch}</span></p>
              <div class="gdraw-pair" role="group" aria-label="${copy.examples}">
                <span class="gdraw-watch">${copy.watch}</span>
                <button type="button" data-snap="max" aria-pressed="false"><span aria-hidden="true">↑</span>${copy.max}</button>
                <button type="button" data-snap="left" aria-pressed="false"><span aria-hidden="true">↰</span>${copy.left}</button>
                <button type="button" data-snap="right" aria-pressed="false"><span aria-hidden="true">↱</span>${copy.right}</button>
              </div>
              <div class="gdraw-feedback">
                <p class="gdraw-status" role="status" aria-live="polite" aria-atomic="true">${copy.centered}</p>
              </div>
            </div>
          </section>
        </section>
        <section id="demo-freight" class="viewer-demo" data-project="freight" data-info="${copy.freightInfo}" hidden>
          <section class="freight-demo" data-freight-demo aria-label="${copy.freightDemo}">
            <header class="freight-demo__bar">
              <h3>${copy.buyerDesk}</h3>
              <span class="freight-demo__fixture">${copy.fictional}</span>
            </header>
            <div class="freight-demo__body">
              <div class="freight-tabs" role="tablist" aria-label="${copy.buyerDesk}">
                <button type="button" role="tab" id="freight-search-tab" data-freight-tab="search" aria-controls="freight-search-view" aria-selected="true">${copy.search}</button>
                <button type="button" role="tab" id="freight-pool-tab" data-freight-tab="pool" aria-controls="freight-pool-view" aria-selected="false" tabindex="-1">${copy.pool} <b data-freight-count>0</b></button>
              </div>
              <section id="freight-search-view" role="tabpanel" aria-labelledby="freight-search-tab" data-freight-panel="search">
                <div class="freight-demo__search" role="group" aria-label="${copy.products}">
                  <span class="freight-demo__lens" aria-hidden="true"></span>
                  <button type="button" data-freight-key="bikes" aria-pressed="true">${copy.bikes}</button>
                  <button type="button" data-freight-key="filters" aria-pressed="false">${copy.filters}</button>
                </div>
                <div class="freight-demo__results-head">${copy.results}</div>
                <div class="freight-demo__result">
                  <div class="freight-demo__summary">
                    <span class="freight-demo__country" lang="en" data-freight-country>NL</span>
                    <div class="freight-demo__company"><strong data-freight-name>${copy.bikeName}</strong><span data-freight-sector>${copy.bikeSector}</span></div>
                  </div>
                  <button type="button" class="freight-demo__save" data-freight-save aria-pressed="false">
                    <span class="freight-demo__plus" aria-hidden="true"></span><span data-freight-action>${copy.add}</span>
                  </button>
                </div>
              </section>
              <section id="freight-pool-view" role="tabpanel" aria-labelledby="freight-pool-tab" data-freight-panel="pool" hidden>
                <ul class="freight-pool-list" data-freight-list aria-label="${copy.savedList}" hidden></ul>
                <div class="freight-pool-empty" data-freight-empty>
                  <p>${copy.empty}</p>
                  <button type="button" data-freight-find>${copy.goSearch}</button>
                </div>
              </section>
              <p class="freight-pool-feedback" role="status" aria-live="polite" aria-atomic="true"></p>
              <template data-freight-row>
                <li class="freight-pool-row">
                  <div class="freight-demo__summary">
                    <span class="freight-demo__country" lang="en" data-pool-country></span>
                    <div class="freight-demo__company"><strong data-pool-name></strong><span data-pool-sector></span></div>
                  </div>
                  <button type="button" class="freight-pool-remove">${copy.remove}</button>
                </li>
              </template>
            </div>
          </section>
        </section>
        <details class="viewer-detail"><summary>${copy.info}</summary><p></p></details>
      </div>
      <footer class="viewer-footer"><button class="viewer-switch" type="button"></button><a class="viewer-site" target="_blank" rel="noopener noreferrer"></a></footer>
    </div>
  </dialog>`;
  }

  function recognize(points, height) {
    if (points.length < 2) return null;
    const start = points[0];
    const end = points[points.length - 1];
    const rise = start.y - end.y;
    const reach = end.x - start.x;
    const minimum = Math.max(12, Math.min(24, height * .1));
    if (rise < minimum) return null;

    const tolerance = Math.max(6, Math.min(18, rise * .32));
    let length = 0;
    let lateralDrift = 0;
    let hasCorner = false;
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const prev = points[i - 1];
      length += Math.hypot(p.x - prev.x, p.y - prev.y);
      lateralDrift = Math.max(lateralDrift, Math.abs(p.x - start.x));
      // A corner must pass near the top of the first leg, away from its endpoints.
      if (start.y - p.y >= minimum && Math.abs(end.x - p.x) >= minimum &&
          Math.abs(p.x - start.x) <= tolerance && Math.abs(p.y - end.y) <= Math.min(tolerance, Math.abs(reach) * .35)) {
        hasCorner = true;
      }
    }
    if (length > (rise + Math.abs(reach)) * 1.4 + 5) return null;
    if (hasCorner && Math.abs(reach) >= minimum) return reach < 0 ? 'left' : 'right';
    return lateralDrift <= tolerance ? 'max' : null;
  }

  function mountGlide(demo, copy, on, signal) {
    const upcoming = { max: copy.nextMax, left: copy.nextLeft, right: copy.nextRight };
    const completed = { max: copy.doneMax, left: copy.doneLeft, right: copy.doneRight };
    const pad = demo.querySelector('[data-pad]');
    const canvas = demo.querySelector('canvas');
    const pen = canvas.getContext('2d');
    const buttons = demo.querySelectorAll('[data-snap]');
    const reset = demo.querySelector('[data-reset]');
    const status = demo.querySelector('.gdraw-status');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let points = [];
    let pointerId = null;
    let wheelSign = 0;
    let wheelPoint;
    let wheelTimer, fadeTimer, exampleFrame;

    function endInput() {
      const id = pointerId;
      pointerId = null;
      if (id !== null && canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
      wheelSign = 0;
      clearTimeout(wheelTimer);
      cancelAnimationFrame(exampleFrame);
      delete demo.dataset.preview;
      delete demo.dataset.drawing;
    }

    function cleanSlate() {
      endInput();
      clearTimeout(fadeTimer);
      points = [];
      canvas.classList.remove('is-fading');
      const ratio = Math.min(devicePixelRatio || 1, 3);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      if (!pen) return;
      pen.setTransform(ratio, 0, 0, ratio, 0, 0);
      pen.lineCap = 'round';
      pen.lineJoin = 'round';
      pen.lineWidth = 3;
      pen.strokeStyle = '#16799d';
      pen.fillStyle = '#16799d';
    }

    function addPoint(p) {
      const prev = points[points.length - 1];
      if (prev && Math.hypot(p.x - prev.x, p.y - prev.y) < 1.5) return;
      points.push(p);
      if (!pen) return;
      pen.beginPath();
      if (prev) {
        pen.moveTo(prev.x, prev.y);
        pen.lineTo(p.x, p.y);
        pen.stroke();
      } else {
        pen.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        pen.fill();
      }
    }

    function preview() {
      const action = recognize(points, canvas.clientHeight);
      if (action === (demo.dataset.preview || null)) return;
      if (action) demo.dataset.preview = action;
      else delete demo.dataset.preview;
      status.textContent = action ? upcoming[action] : copy.drawing;
    }

    function setWindow(action) {
      if (action) demo.dataset.side = action;
      else delete demo.dataset.side;
      for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.snap === action));
      reset.disabled = !action;
    }

    function finish(action) {
      endInput();
      if (action) {
        setWindow(action);
        status.textContent = completed[action];
      } else {
        status.textContent = copy.missed;
      }
      fadeTimer = setTimeout(() => canvas.classList.add('is-fading'), 440);
    }

    function cancelStroke() {
      cleanSlate();
      status.textContent = demo.dataset.side ? completed[demo.dataset.side] : copy.ready;
    }

    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * canvas.clientWidth / rect.width,
        y: (event.clientY - rect.top) * canvas.clientHeight / rect.height
      };
    }

    on(canvas, 'pointerdown', event => {
      if (!event.isPrimary || pointerId !== null || (event.button !== 0 && event.button !== 2)) return;
      cleanSlate();
      pad.focus({ preventScroll: true });
      event.preventDefault();
      pointerId = event.pointerId;
      demo.dataset.drawing = '';
      canvas.setPointerCapture(pointerId);
      addPoint(localPoint(event));
      status.textContent = copy.drawing;
    });
    on(canvas, 'pointermove', event => {
      if (event.pointerId !== pointerId) return;
      // Pointer capture retains the stroke when a finger crosses the top of a small pad.
      for (const sample of event.getCoalescedEvents?.() || []) addPoint(localPoint(sample));
      addPoint(localPoint(event));
      preview();
    });
    on(canvas, 'pointerup', event => {
      if (event.pointerId !== pointerId) return;
      addPoint(localPoint(event));
      finish(recognize(points, canvas.clientHeight));
    });
    for (const type of ['pointercancel', 'lostpointercapture']) {
      on(canvas, type, event => { if (event.pointerId === pointerId) cancelStroke(); });
    }
    on(canvas, 'contextmenu', event => event.preventDefault());

    // Browsers report scroll offsets, not the physical finger direction. The first
    // vertical wheel movement starts the upward leg for either OS scroll preference.
    on(canvas, 'wheel', event => {
      if (event.ctrlKey || event.metaKey || pointerId !== null) return;
      if (!event.deltaX && !event.deltaY) return;
      if (!wheelSign) {
        if (!event.cancelable || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        cleanSlate();
        wheelSign = -Math.sign(event.deltaY);
        demo.dataset.drawing = '';
        pad.focus({ preventScroll: true });
        wheelPoint = { x: canvas.clientWidth / 2, y: canvas.clientHeight * .78 };
        addPoint(wheelPoint);
        status.textContent = copy.drawing;
      }
      if (event.cancelable) event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
      const limit = canvas.clientHeight * .36;
      const gain = wheelSign * Math.min(unit, limit / Math.max(Math.abs(event.deltaX), Math.abs(event.deltaY)));
      // Keep the virtual pen within the drawing area even during touchpad inertia.
      wheelPoint = {
        x: Math.max(4, Math.min(canvas.clientWidth - 4, wheelPoint.x + event.deltaX * gain)),
        y: Math.max(4, Math.min(canvas.clientHeight - 4, wheelPoint.y + event.deltaY * gain))
      };
      addPoint(wheelPoint);
      preview();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => finish(recognize(points, canvas.clientHeight)), 150);
    }, { passive: false });

    function showExample(action) {
      cleanSlate();
      const x = canvas.clientWidth / 2;
      const h = canvas.clientHeight;
      const start = { x, y: h * .78 };
      const corner = { x, y: h * .28 };
      const endX = action === 'max' ? x : x + (action === 'left' ? -1 : 1) * h * .45;
      addPoint(start);
      const began = performance.now();
      const duration = action === 'max' ? 190 : 270;
      const turn = action === 'max' ? 1 : .54;
      let reachedTurn = false;
      function draw(now) {
        const t = reducedMotion.matches ? 1 : Math.min(1, (now - began) / duration);
        if (t < turn) addPoint({ x, y: start.y + (corner.y - start.y) * t / turn });
        else {
          if (!reachedTurn) {
            addPoint(corner);
            reachedTurn = true;
          }
          if (action !== 'max') addPoint({ x: x + (endX - x) * (t - turn) / (1 - turn), y: corner.y });
        }
        if (t >= 1) finish(action);
        else exampleFrame = requestAnimationFrame(draw);
      }
      demo.dataset.drawing = '';
      demo.dataset.preview = action;
      status.textContent = upcoming[action];
      draw(began);
    }

    for (const button of buttons) on(button, 'click', () => showExample(button.dataset.snap));
    on(reset, 'click', () => {
      cleanSlate();
      setWindow(null);
      status.textContent = copy.centered;
    });
    on(demo, 'glide-hide', cancelStroke);
    signal.addEventListener('abort', cleanSlate, { once: true });
    on(window, 'blur', () => { if (pointerId !== null || wheelSign) cancelStroke(); });
  }

  function mountFreight(demo, copy, on, signal) {
    const samples = {
      bikes: { country: 'NL', name: copy.bikeName, sector: copy.bikeSector },
      filters: { country: 'DE', name: copy.filterName, sector: copy.filterSector }
    };
    const buttons = [...demo.querySelectorAll('[data-freight-key]')];
    const country = demo.querySelector('[data-freight-country]');
    const name = demo.querySelector('[data-freight-name]');
    const sector = demo.querySelector('[data-freight-sector]');
    const count = demo.querySelector('[data-freight-count]');
    const save = demo.querySelector('[data-freight-save]');
    const action = demo.querySelector('[data-freight-action]');
    const status = demo.querySelector('[role="status"]');
    const tabs = [...demo.querySelectorAll('[data-freight-tab]')];
    const panels = [...demo.querySelectorAll('[data-freight-panel]')];
    const list = demo.querySelector('[data-freight-list]');
    const rowTemplate = demo.querySelector('[data-freight-row]');
    const empty = demo.querySelector('[data-freight-empty]');
    const find = demo.querySelector('[data-freight-find]');
    const saved = new Set();
    let active = 'bikes';
    let feedbackTimer;

    function renderResult() {
      const sample = samples[active];
      country.textContent = sample.country;
      name.textContent = sample.name;
      sector.textContent = sample.sector;
      save.setAttribute('aria-pressed', String(saved.has(active)));
      action.textContent = saved.has(active) ? copy.removePool : copy.add;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.freightKey === active)));
    }

    function renderPool() {
      count.textContent = String(saved.size);
      const rows = [];
      for (const key of saved) {
        const sample = samples[key];
        const row = rowTemplate.content.firstElementChild.cloneNode(true);
        row.querySelector('[data-pool-country]').textContent = sample.country;
        row.querySelector('[data-pool-name]').textContent = sample.name;
        row.querySelector('[data-pool-sector]').textContent = sample.sector;
        const remove = row.querySelector('button');
        remove.dataset.freightRemove = key;
        remove.setAttribute('aria-label', format(copy.removeName, sample));
        rows.push(row);
      }
      list.replaceChildren(...rows);
      list.hidden = saved.size === 0;
      empty.hidden = saved.size > 0;
    }

    function showFeedback(message, poolChanged) {
      clearTimeout(feedbackTimer);
      status.textContent = message;
      demo.toggleAttribute('data-pool-feedback', poolChanged);
      feedbackTimer = setTimeout(() => {
        status.textContent = '';
        demo.removeAttribute('data-pool-feedback');
      }, 3100);
    }

    function changePool(key) {
      const adding = !saved.has(key);
      if (adding) saved.add(key);
      else saved.delete(key);
      renderPool();
      renderResult();
      showFeedback(format(adding ? copy.added : copy.removed, { name: samples[key].name, count: saved.size }), true);
    }

    function selectTab(selected) {
      for (const tab of tabs) {
        const current = tab === selected;
        tab.setAttribute('aria-selected', String(current));
        tab.tabIndex = current ? 0 : -1;
      }
      for (const panel of panels) panel.hidden = panel.dataset.freightPanel !== selected.dataset.freightTab;
      selected.focus({ preventScroll: true });
    }

    tabs.forEach((tab, index) => {
      on(tab, 'click', () => selectTab(tab));
      on(tab, 'keydown', event => {
        const destinations = {
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1
        };
        if (!(event.key in destinations)) return;
        event.preventDefault();
        selectTab(tabs[destinations[event.key]]);
      });
    });

    buttons.forEach(button => on(button, 'click', () => {
      active = button.dataset.freightKey;
      renderResult();
      showFeedback(format(copy.found, samples[active]), false);
    }));

    on(save, 'click', () => changePool(active));
    on(list, 'click', event => {
      const remove = event.target.closest('[data-freight-remove]');
      if (!remove || !list.contains(remove)) return;
      changePool(remove.dataset.freightRemove);
      (list.querySelector('[data-freight-remove]') || find).focus({ preventScroll: true });
    });
    on(find, 'click', () => selectTab(tabs[0]));

    signal.addEventListener('abort', () => clearTimeout(feedbackTimer), { once: true });
    renderResult();
    renderPool();
  }


  function mountStudioProducts(root = document, lang = 'zh', config) {
    const viewer = root.querySelector('.project-viewer');
    const copy = config?.ui?.studio?.productDemo;
    const previous = activeMounts.get(root);
    if (previous && previous.viewer === viewer && previous.lang === lang && previous.copy === copy) return previous.dispose;
    if (previous) previous.dispose();
    if (!viewer || !copy || typeof viewer.showModal !== 'function') return () => {};

    const document = root.ownerDocument || root;
    const win = document.defaultView;
    const controller = new win.AbortController();
    const signal = controller.signal;
    const on = (element, type, listener, options = {}) => element.addEventListener(type, listener, { ...options, signal });
    const body = viewer.querySelector('.viewer-body');
    const close = viewer.querySelector('.viewer-close');
    const switcher = viewer.querySelector('.viewer-switch');
    const title = viewer.querySelector('#viewer-title');
    const detail = viewer.querySelector('.viewer-detail');
    const site = viewer.querySelector('.viewer-site');
    const cards = new Map([...root.querySelectorAll('[data-work]')].map(card => [card.dataset.work, card]));
    let activeProject, origin;
    let awaitingBack = false;
    const route = () => cards.has(location.hash.slice(6)) && location.hash.startsWith('#desk-') ? location.hash.slice(6) : null;
    const otherProject = name => name === 'glide' ? 'freight' : 'glide';
    const projectName = card => card.querySelector('.work-brand').textContent.trim();
    const glide = viewer.querySelector('[data-glide-draw]');
    const stopGesture = () => { if (activeProject === 'glide') glide.dispatchEvent(new win.Event('glide-hide')); };

    mountGlide(glide, copy, on, signal);
    mountFreight(viewer.querySelector('[data-freight-demo]'), copy, on, signal);

    function showProject(name) {
      if (viewer.dataset.phase === 'closing') {
        viewer.style.setProperty('--viewer-open-from', getComputedStyle(viewer).transform);
        viewer.style.setProperty('--backdrop-open-from', getComputedStyle(viewer, '::backdrop').opacity);
      } else if (!viewer.open) {
        viewer.style.removeProperty('--viewer-open-from');
        viewer.style.removeProperty('--backdrop-open-from');
      }
      delete viewer.dataset.phase;
      if (viewer.open && activeProject === name) return;
      stopGesture();
      const switching = viewer.open;
      activeProject = viewer.dataset.project = name;
      const card = cards.get(name);
      const panel = viewer.querySelector(`.viewer-demo[data-project="${name}"]`);
      for (const view of viewer.querySelectorAll('.viewer-demo')) view.hidden = view !== panel;
      const displayName = projectName(card);
      title.textContent = displayName;
      viewer.querySelector('.viewer-platform').textContent = card.dataset.platform;
      viewer.querySelector('.viewer-icon').src = card.querySelector('.work-mark').src;
      viewer.querySelector('.viewer-intro').textContent = card.querySelector('h4').textContent;
      detail.open = false;
      detail.querySelector('p').textContent = panel.dataset.info;
      site.href = card.querySelector('.work-link').href;
      site.textContent = format(copy.visit, { name: displayName });
      const next = cards.get(otherProject(name));
      switcher.hidden = !next;
      if (next) switcher.textContent = format(copy.tryOther, { name: projectName(next) });
      close.textContent = origin.id.startsWith('launch-') ? copy.backDesk : copy.backWork;
      delete body.dataset.enter;
      if (switching) {
        void body.offsetWidth;
        body.dataset.enter = '';
        title.focus({ preventScroll: true });
      } else {
        viewer.showModal();
        close.focus({ preventScroll: true });
      }
      body.scrollTop = 0;
    }

    function hideProject() {
      if (!viewer.open || viewer.dataset.phase === 'closing') return;
      stopGesture();
      viewer.style.setProperty('--viewer-close-from', getComputedStyle(viewer).transform);
      viewer.style.setProperty('--backdrop-close-from', getComputedStyle(viewer, '::backdrop').opacity);
      viewer.dataset.phase = 'closing';
      function finish() {
        if (signal.aborted || viewer.dataset.phase !== 'closing' || route()) return;
        viewer.close();
        delete viewer.dataset.phase;
        activeProject = null;
        const source = origin;
        function restoreSource() {
          if (signal.aborted || viewer.open || location.href !== source.base) return;
          let el = document.getElementById(source.id);
          if (!el?.getClientRects().length) el = document.getElementById(source.id.replace(/^launch-/, 'card-'));
          if (!el) return;
          el.focus({ preventScroll: true });
          if (source.direct) el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
          else win.scrollTo({ top: source.y, behavior: 'instant' });
        }
        restoreSource();
        win.requestAnimationFrame(restoreSource);
      }
      const exit = viewer.getAnimations().find(anim => anim.animationName === 'viewer-close');
      if (exit) exit.finished.then(finish, finish);
      else finish();
    }

    function syncLocation() {
      awaitingBack = false;
      const name = route();
      if (!name) { hideProject(); return; }
      if (history.state?.studioViewer) origin = history.state.studioViewer;
      else if (!viewer.open) {
        const shortcut = document.getElementById('launch-' + name);
        const launcher = shortcut?.getClientRects().length ? shortcut : cards.get(name).querySelector('.work-entry');
        origin = { id: launcher.id, y: win.scrollY, base: location.href.split('#')[0], direct: true };
      }
      showProject(name);
    }

    function closeViewer() {
      if (awaitingBack || viewer.dataset.phase === 'closing') return;
      if (history.state?.studioViewer && !history.state.studioViewer.direct) {
        awaitingBack = true;
        history.back();
      } else {
        const state = { ...history.state };
        delete state.studioViewer;
        history.replaceState(state, '', origin.base);
        syncLocation();
      }
    }

    // Keep fallback URLs on ordinary links until native dialog support is confirmed.
    const links = [...document.querySelectorAll('a[data-open]')].filter(link => cards.has(link.dataset.open));
    const fallbackLinks = new Map(links.map(link => [link, link.getAttribute('href')]));
    for (const link of links) {
      link.href = '#desk-' + link.dataset.open;
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', viewer.id);
      on(link, 'click', event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const source = { id: link.id, y: win.scrollY, base: location.href, direct: false };
        history.pushState({ ...history.state, studioViewer: source }, '', link.hash);
        syncLocation();
      });
    }
    on(close, 'click', closeViewer);
    on(switcher, 'click', () => {
      if (awaitingBack || viewer.dataset.phase === 'closing') return;
      history.replaceState({ ...history.state, studioViewer: origin }, '', '#desk-' + otherProject(activeProject));
      syncLocation();
    });
    on(viewer, 'cancel', event => { event.preventDefault(); closeViewer(); });
    let pressedBackdrop = false;
    on(viewer, 'pointerdown', event => { pressedBackdrop = event.target === viewer; });
    on(viewer, 'click', event => {
      if (pressedBackdrop && event.target === viewer) closeViewer();
      pressedBackdrop = false;
    });
    on(win, 'popstate', syncLocation);
    on(win, 'hashchange', syncLocation);
    function dispose() {
      if (signal.aborted) return;
      controller.abort();
      if (viewer.open) viewer.close();
      delete viewer.dataset.phase;
      for (const [link, fallback] of fallbackLinks) {
        if (fallback !== null) link.setAttribute('href', fallback);
        link.removeAttribute('aria-haspopup');
        link.removeAttribute('aria-controls');
      }
      activeMounts.delete(root);
    }
    activeMounts.set(root, { viewer, lang, copy, dispose });
    syncLocation();
    return dispose;
  }

  const api = { renderStudioProducts, mountStudioProducts };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else Object.assign(host, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
