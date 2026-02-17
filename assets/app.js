const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const lockScroll = (locked) => document.body.classList.toggle('no-scroll', locked);

function setupLanguageMenu(scope = document) {
  const wrap = qs('.lang-wrap', scope);
  if (!wrap) return;
  const btn = qs('.lang-toggle', wrap);
  const menu = qs('.lang-menu', wrap);
  btn?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      menu.classList.remove('open');
      btn?.setAttribute('aria-expanded', 'false');
    }
  });
}

function trapFocus(container, closeFn) {
  const selectors = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';
  const nodes = qsa(selectors, container);
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const handler = (e) => {
    if (e.key === 'Escape') closeFn();
    if (e.key !== 'Tab' || nodes.length < 2) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', handler);
  first?.focus();
  return () => container.removeEventListener('keydown', handler);
}

function setupDrawer() {
  const burger = qs('.burger');
  const drawer = qs('.mobile-drawer');
  const overlay = qs('.drawer-overlay');
  if (!burger || !drawer || !overlay) return;
  let cleanTrap = null;

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    burger.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    cleanTrap?.();
    cleanTrap = null;
  };
  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('show');
    burger.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    cleanTrap = trapFocus(drawer, closeDrawer);
  };

  burger.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
  qs('.drawer-close', drawer)?.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
  qsa('a', drawer).forEach((a) => a.addEventListener('click', closeDrawer));
  setupLanguageMenu(drawer);
}

function setupFaq() {
  qsa('.faq-item').forEach((item) => {
    const btn = qs('.faq-q', item);
    btn?.addEventListener('click', () => {
      qsa('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open');
    });
  });
}

function setupModal() {
  const modal = qs('.modal');
  const openers = qsa('[data-open-privacy]');
  if (!modal || !openers.length) return;
  let cleanTrap = null;
  const close = () => {
    modal.classList.remove('open');
    lockScroll(false);
    cleanTrap?.();
    cleanTrap = null;
  };
  const open = () => {
    modal.classList.add('open');
    lockScroll(true);
    cleanTrap = trapFocus(qs('.modal-box', modal), close);
  };
  openers.forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  qsa('[data-close-modal]', modal).forEach((el) => el.addEventListener('click', close));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function setupReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, { threshold: 0.2 });
  qsa('.reveal').forEach((el) => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  setupLanguageMenu(document);
  setupDrawer();
  setupFaq();
  setupModal();
  setupReveal();
});
