(() => {
  const toggle = document.querySelector('[data-mobile-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const closedIcon = toggle.querySelector('[data-menu-closed-icon]');
  const openIcon = toggle.querySelector('[data-menu-open-icon]');
  const pageMain = document.querySelector('main');
  const pageFooter = document.querySelector('footer');

  const setOpen = (open, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menu.classList.toggle('hidden', !open);
    closedIcon?.classList.toggle('hidden', open);
    openIcon?.classList.toggle('hidden', !open);
    document.body.classList.toggle('mobile-navigation-open', open);
    pageMain?.toggleAttribute('inert', open);
    pageFooter?.toggleAttribute('inert', open);

    if (open) {
      menu.querySelector('[data-mobile-menu-first]')?.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.querySelectorAll('[data-mobile-menu-link]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });

  document.querySelector('[data-cookie-preferences]')?.addEventListener('click', () => {
    window.dispatchEvent(new Event('estospaces:open-cookie-preferences'));
  });

  setOpen(false);
})();
