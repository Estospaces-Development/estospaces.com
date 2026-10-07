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

// Click-to-play videos: load a privacy-enhanced YouTube iframe only when the visitor asks for it.
(() => {
  const facades = new WeakMap();

  const mountVideo = (frame, source, start) => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(source.id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1${start > 0 ? `&start=${start}` : ''}`;
    iframe.title = source.title || 'EstoSpaces video';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    const facade = frame.querySelector('a[data-video-id]');
    if (facade) facades.set(frame, facade);
    frame.replaceChildren(iframe);
    iframe.focus();

    window.dispatchEvent(
      new CustomEvent('estospaces:video-play', { detail: { placement: source.placement } }),
    );
  };

  const isPlainClick = (event) =>
    !(event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0);

  document.querySelectorAll('a[data-video-id]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      mountVideo(
        link.closest('[data-video-frame]') || link.parentElement,
        {
          id: link.dataset.videoId,
          title: link.dataset.videoTitle,
          placement: link.dataset.videoPlacement,
        },
        0,
      );
    });
  });

  // Role tutorial: tabs choose the video, chapters jump to a moment inside it.
  document.querySelectorAll('[data-tutorial]').forEach((root) => {
    const tablist = root.querySelector('[data-tutorial-tabs]');
    const tabs = [...root.querySelectorAll('[data-tutorial-tab]')];
    const panels = [...root.querySelectorAll('[data-tutorial-panel]')];
    if (!tablist || tabs.length === 0) return;

    const select = (key, moveFocus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.tutorialTab === key;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && moveFocus) tab.focus();
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.tutorialPanel !== key;
        if (!panel.hidden) return;
        // Stop a playing video in a panel that is no longer shown: put its start button back.
        const frame = panel.querySelector('[data-video-frame]');
        if (frame && facades.has(frame)) {
          frame.replaceChildren(facades.get(frame));
          panel
            .querySelectorAll('[data-chapter-start]')
            .forEach((chapter) => chapter.removeAttribute('aria-current'));
        }
      });
    };

    const keyFromHash = () => {
      const key = window.location.hash.replace('#tutorial-', '');
      return tabs.some((tab) => tab.dataset.tutorialTab === key) ? key : null;
    };

    tablist.hidden = false;
    const initialKey = keyFromHash();
    select(initialKey || tabs[0].dataset.tutorialTab);
    // The browser tried to scroll to the anchor before the other tab was hidden, and later layout
    // shifts can cancel a smooth scroll, so jump instantly now and again once the page has loaded.
    if (initialKey) {
      const jumpToTabs = () => tablist.scrollIntoView({ block: 'start', behavior: 'instant' });
      jumpToTabs();
      window.addEventListener('load', jumpToTabs, { once: true });
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.tutorialTab));
      tab.addEventListener('keydown', (event) => {
        const last = tabs.length - 1;
        const next = {
          ArrowRight: index === last ? 0 : index + 1,
          ArrowLeft: index === 0 ? last : index - 1,
          Home: 0,
          End: last,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(tabs[next].dataset.tutorialTab, true);
      });
    });

    // A link to the tab that is already in the address bar fires no hashchange; handle the click.
    document.querySelectorAll('a[href^="#tutorial-"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const key = link.getAttribute('href').replace('#tutorial-', '');
        if (!tabs.some((tab) => tab.dataset.tutorialTab === key)) return;
        event.preventDefault();
        select(key);
        tablist.scrollIntoView({ block: 'start' });
        window.history.replaceState(null, '', link.getAttribute('href'));
      });
    });

    window.addEventListener('hashchange', () => {
      const key = keyFromHash();
      if (!key) return;
      select(key);
      tablist.scrollIntoView({ block: 'start' });
    });

    panels.forEach((panel) => {
      panel.querySelectorAll('[data-chapter-start]').forEach((chapter) => {
        chapter.addEventListener('click', (event) => {
          if (!isPlainClick(event)) return;
          event.preventDefault();
          mountVideo(
            panel.querySelector('[data-video-frame]'),
            {
              id: panel.dataset.videoId,
              title: panel.dataset.videoTitle,
              placement: panel.dataset.videoPlacement,
            },
            Number(chapter.dataset.chapterStart),
          );
          panel
            .querySelectorAll('[data-chapter-start]')
            .forEach((other) => other.removeAttribute('aria-current'));
          chapter.setAttribute('aria-current', 'true');
        });
      });
    });
  });
})();
