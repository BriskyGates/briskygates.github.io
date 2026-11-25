const viewer = document.querySelector('.project-viewer');
const body = viewer.querySelector('.viewer-body');
const closeButton = viewer.querySelector('.viewer-close');
const switchButton = viewer.querySelector('.viewer-switch');
const title = viewer.querySelector('#viewer-title');
const detail = viewer.querySelector('.viewer-detail');
const site = viewer.querySelector('.viewer-site');
const cards = new Map([...document.querySelectorAll('[data-work]')].map(card => [card.dataset.work, card]));
let origin;
let activeProject;
let awaitingBack = false;

function projectFromURL() {
  const name = location.hash.slice('#desk-'.length);
  return location.hash.startsWith('#desk-') && cards.has(name) ? name : null;
}

function otherProject(name) {
  return name === 'glide' ? 'freight' : 'glide';
}

function projectName(card) {
  return [...card.querySelector('.work-brand').children].map(part => part.textContent).join(' ');
}

function stopGesture() {
  if (activeProject === 'glide') viewer.querySelector('[data-glide-draw]').dispatchEvent(new Event('glide-hide'));
}

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
  const card = cards.get(name);
  // Keep route fragments separate from DOM IDs so initial fragment navigation
  // does not scroll past the product title or steal focus inside the dialog.
  const current = document.getElementById(`demo-${name}`);
  activeProject = viewer.dataset.project = name;
  for (const panel of viewer.querySelectorAll('.viewer-demo')) panel.hidden = panel !== current;
  title.textContent = projectName(card);
  viewer.querySelector('.viewer-platform').textContent = card.dataset.platform;
  viewer.querySelector('.viewer-icon').src = card.querySelector('.work-mark').src;
  viewer.querySelector('.viewer-intro').textContent = card.querySelector('h4').textContent;
  detail.open = false;
  detail.querySelector('p').textContent = current.dataset.info;
  site.href = card.querySelector('.work-link').href;
  site.textContent = `访问${name === 'glide' ? ' Glide ' : '搜买家'}官网`;
  switchButton.textContent = `试试${name === 'glide' ? '搜买家' : ' Glide'}`;
  closeButton.textContent = origin.id.startsWith('card-') ? '返回作品' : '返回桌面';
  delete body.dataset.enter;
  if (switching) {
    void body.offsetWidth;
    body.dataset.enter = '';
    title.focus({ preventScroll: true });
  } else {
    viewer.showModal();
    closeButton.focus({ preventScroll: true });
  }
  body.scrollTop = 0;
}

function hideProject() {
  if (!viewer.open || viewer.dataset.phase === 'closing') return;
  stopGesture();
  // A quick Back or Escape should reverse from the panel's current position.
  viewer.style.setProperty('--viewer-close-from', getComputedStyle(viewer).transform);
  viewer.style.setProperty('--backdrop-close-from', getComputedStyle(viewer, '::backdrop').opacity);
  viewer.dataset.phase = 'closing';
  function finish() {
    // Forward navigation can reopen a project while the exit is in progress.
    if (viewer.dataset.phase !== 'closing' || projectFromURL()) return;
    viewer.close();
    delete viewer.dataset.phase;
    activeProject = null;
    const returnTo = origin;
    const source = document.getElementById(returnTo.id);
    function restoreSource() {
      if (viewer.open || location.href !== returnTo.base) return;
      source.focus({ preventScroll: true });
      if (returnTo.direct) source.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      else window.scrollTo({ top: returnTo.y, behavior: 'instant' });
    }
    restoreSource();
    // Fragment traversal can restore focus and scroll after popstate, especially
    // when reduced motion removes the exit animation.
    requestAnimationFrame(restoreSource);
  }
  const exit = viewer.getAnimations().find(animation => animation.animationName === 'viewer-close');
  if (exit) exit.finished.then(finish, finish);
  else finish();
}

function syncLocation() {
  awaitingBack = false;
  const name = projectFromURL();
  if (!name) { hideProject(); return; }
  const state = history.state?.studioViewer;
  if (state) origin = state;
  else if (!viewer.open) origin = { id: `launch-${name}`, y: window.scrollY, base: location.href.split('#')[0], direct: true };
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

if (typeof viewer.showModal === 'function') {
  for (const link of document.querySelectorAll('a[data-open]')) {
    link.href = `#desk-${link.dataset.open}`;
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', viewer.id);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const source = { id: link.id, y: window.scrollY, base: location.href, direct: false };
      history.pushState({ ...history.state, studioViewer: source }, '', link.hash);
      syncLocation();
    });
  }
  closeButton.addEventListener('click', closeViewer);
  switchButton.addEventListener('click', () => {
    if (awaitingBack || viewer.dataset.phase === 'closing') return;
    history.replaceState({ ...history.state, studioViewer: origin }, '', `#desk-${otherProject(activeProject)}`);
    syncLocation();
  });
  viewer.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
  let pressedBackdrop = false;
  viewer.addEventListener('pointerdown', event => { pressedBackdrop = event.target === viewer; });
  viewer.addEventListener('click', event => {
    if (pressedBackdrop && event.target === viewer) closeViewer();
    pressedBackdrop = false;
  });
  window.addEventListener('popstate', syncLocation);
  window.addEventListener('hashchange', syncLocation);
  syncLocation();
}
