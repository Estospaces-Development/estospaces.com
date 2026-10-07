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

// Click-to-play video facades: swap the link for a privacy-enhanced YouTube iframe.
(() => {
  document.querySelectorAll('a[data-video-id]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(link.dataset.videoId)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      iframe.title = link.dataset.videoTitle || 'EstoSpaces video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      link.replaceWith(iframe);
      iframe.focus();

      window.dispatchEvent(
        new CustomEvent('estospaces:video-play', {
          detail: { placement: link.dataset.videoPlacement },
        }),
      );
    });
  });
})();
