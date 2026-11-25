(() => {
  const names = { max: '最大化', left: '贴到左半屏', right: '贴到右半屏' };

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

  function mount(demo) {
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
      status.textContent = action ? `即将${names[action]}` : '正在识别手势…';
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
        status.textContent = `窗口已${names[action]}。`;
      } else {
        status.textContent = '未识别。试试直上划一段，再松开。';
      }
      fadeTimer = setTimeout(() => canvas.classList.add('is-fading'), 440);
    }

    function cancelStroke() {
      cleanSlate();
      status.textContent = demo.dataset.side ? `当前窗口已${names[demo.dataset.side]}。` : '准备就绪。';
    }

    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * canvas.clientWidth / rect.width,
        y: (event.clientY - rect.top) * canvas.clientHeight / rect.height
      };
    }

    canvas.addEventListener('pointerdown', event => {
      if (!event.isPrimary || pointerId !== null || (event.button !== 0 && event.button !== 2)) return;
      cleanSlate();
      pad.focus({ preventScroll: true });
      event.preventDefault();
      pointerId = event.pointerId;
      demo.dataset.drawing = '';
      canvas.setPointerCapture(pointerId);
      addPoint(localPoint(event));
      status.textContent = '正在识别手势…';
    });
    canvas.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;
      // Pointer capture retains the stroke when a finger crosses the top of a small pad.
      for (const sample of event.getCoalescedEvents?.() || []) addPoint(localPoint(sample));
      addPoint(localPoint(event));
      preview();
    });
    canvas.addEventListener('pointerup', event => {
      if (event.pointerId !== pointerId) return;
      addPoint(localPoint(event));
      finish(recognize(points, canvas.clientHeight));
    });
    for (const type of ['pointercancel', 'lostpointercapture']) {
      canvas.addEventListener(type, event => { if (event.pointerId === pointerId) cancelStroke(); });
    }
    canvas.addEventListener('contextmenu', event => event.preventDefault());

    // Browsers report scroll offsets, not the physical finger direction. The first
    // vertical wheel movement starts the upward leg for either OS scroll preference.
    canvas.addEventListener('wheel', event => {
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
        status.textContent = '正在识别手势…';
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
      status.textContent = `即将${names[action]}`;
      draw(began);
    }

    for (const button of buttons) button.addEventListener('click', () => showExample(button.dataset.snap));
    reset.addEventListener('click', () => {
      cleanSlate();
      setWindow(null);
      status.textContent = '已还原窗口。';
    });
    demo.addEventListener('glide-hide', cancelStroke);
    window.addEventListener('blur', () => { if (pointerId !== null || wheelSign) cancelStroke(); });
  }
  document.querySelectorAll('[data-glide-draw]').forEach(mount);
})();

(() => {
  const samples = {
    bikes: { country: 'NL', name: '鹿特丹自行车分销商', sector: '荷兰 · 自行车及配件' },
    filters: { country: 'DE', name: '汉堡工业耗材采购商', sector: '德国 · 空气过滤设备' }
  };

  function mount(demo) {
    if (demo.dataset.freightReady) return;
    demo.dataset.freightReady = 'true';
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
      action.textContent = saved.has(active) ? '移出潜客池' : '加入潜客池';
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
        remove.setAttribute('aria-label', '移出' + sample.name);
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
      showFeedback(samples[key].name + (adding ? '已加入' : '已移出') + '，池内 ' + saved.size + ' 家。', true);
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
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
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

    buttons.forEach(button => button.addEventListener('click', () => {
      active = button.dataset.freightKey;
      renderResult();
      showFeedback('检索到' + samples[active].name + '。', false);
    }));

    save.addEventListener('click', () => changePool(active));
    list.addEventListener('click', event => {
      const remove = event.target.closest('[data-freight-remove]');
      if (!remove || !list.contains(remove)) return;
      changePool(remove.dataset.freightRemove);
      (list.querySelector('[data-freight-remove]') || find).focus({ preventScroll: true });
    });
    find.addEventListener('click', () => selectTab(tabs[0]));

    renderResult();
    renderPool();
  }

  function start() { document.querySelectorAll('[data-freight-demo]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
