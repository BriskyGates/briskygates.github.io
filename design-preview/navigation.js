(() => {
  const masthead = document.querySelector('.masthead');
  const menu = masthead.querySelector('.mobile-nav');
  const links = [...masthead.querySelectorAll('nav a[href^="#"], .contact-link')];
  const sections = [...new Set(links.map(link => document.querySelector(link.hash)))];
  let frame = 0;

  function updateCurrentSection() {
    frame = 0;
    const headerHeight = masthead.offsetHeight;
    document.documentElement.style.setProperty('--measured-nav-height', headerHeight + 'px');
    const readingLine = Math.max(headerHeight + 14, innerHeight * 0.3);
    const atEnd = Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1;
    let section = sections.filter(item => item.getBoundingClientRect().top <= readingLine).at(-1);

    if (atEnd) {
      // Short final sections can share the same scroll position in the two-column layout.
      const linkedSection = sections.find(item => '#' + item.id === location.hash);
      const linkedTop = linkedSection?.getBoundingClientRect().top;
      const aboutIntro = document.querySelector('.about-intro');
      const contact = document.getElementById('contact');
      const sharedRow = Math.abs(aboutIntro.getBoundingClientRect().top - contact.getBoundingClientRect().top) < 1;
      const footerSection = sharedRow ? document.getElementById('about') : contact;
      section = linkedTop >= headerHeight - 1 && linkedTop < innerHeight ? linkedSection : footerSection;
    }
    for (const link of links) {
      if (section && link.hash === '#' + section.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateCurrentSection);
  }

  menu.addEventListener('click', (event) => {
    if (event.target.closest('nav a')) menu.open = false;
  });
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  addEventListener('scroll', scheduleUpdate, { passive: true });
  addEventListener('hashchange', scheduleUpdate);
  addEventListener('resize', scheduleUpdate);
  const layoutChanges = new ResizeObserver(scheduleUpdate);
  layoutChanges.observe(masthead);
  layoutChanges.observe(document.body);
  updateCurrentSection();
})();
