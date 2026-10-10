// Home page motion layer (progressive enhancement; loaded with `defer` like navigation.js).
//
// Contract with the markup/CSS (Home.module.css):
//  - Without this script, or with prefers-reduced-motion: reduce, nothing here changes the page: every
//    section renders in its final state.
//  - With motion allowed it sets [data-motion="on"] on [data-home]. Only then do the CSS "from" states apply.
//  - It only writes attributes and CSS custom properties (data-in, data-live, data-play, --p, path d), never
//    text or elements, so it cannot cause a React hydration text mismatch.
(() => {
  const root = document.querySelector('[data-home]');
  if (!root) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = root.querySelector('[data-hero]');

  // ---- Hero thread: one orange line from the "Private beta" dot to the case card. ----
  // Geometry depends on the responsive layout, so the path is measured here and re-measured on resize.
  const layer = hero?.querySelector('[data-thread]');
  const path = layer?.querySelector('[data-thread-path]');
  const bead = layer?.querySelector('[data-thread-bead]');
  const startEl = hero?.querySelector('[data-thread-start]');
  const endEl = hero?.querySelector('[data-thread-end]');

  const layoutThread = () => {
    if (!hero || !path || !startEl || !endEl) return;
    const h = hero.getBoundingClientRect();
    const s = startEl.getBoundingClientRect();
    const e = endEl.getBoundingClientRect();
    const S = { x: s.left + s.width / 2 - h.left, y: s.top + s.height / 2 - h.top };
    const E = { x: e.left - 5 - h.left, y: e.top + e.height / 2 - h.top };
    const r = (n) => Math.round(n * 10) / 10;
    let d;
    if (E.x - S.x > 300) {
      // Two columns: a long S-curve through the headline, arriving horizontally at the card.
      const dx = E.x - S.x;
      d = `M${r(S.x)} ${r(S.y)} C${r(S.x + dx * 0.55)} ${r(S.y)} ${r(E.x - dx * 0.55)} ${r(E.y)} ${r(E.x)} ${r(E.y)}`;
    } else {
      // One column: slide down the left gutter, then step into the card from its left edge.
      const g = 4;
      d = `M${r(S.x)} ${r(S.y)} C${r(S.x - 28)} ${r(S.y + 50)} ${g} ${r(E.y - 180)} ${g} ${r(E.y - 30)} C${g} ${r(E.y - 6)} ${g + 8} ${r(E.y)} ${g + 20} ${r(E.y)} L${r(E.x)} ${r(E.y)}`;
    }
    path.setAttribute('d', d);
    if (bead) bead.style.offsetPath = `path('${d}')`;
    layer.dataset.ready = '1';
  };

  // ---- Reveal / live observers ----
  // data-in   : set once when a [data-reveal] element first enters the viewport (entrance plays).
  // data-live : true only while the element is on screen, so looping animations pause off screen.
  const groups = [...root.querySelectorAll('[data-reveal],[data-live-only]')];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (entry.isIntersecting && el.hasAttribute('data-reveal')) el.dataset.in = '1';
        el.dataset.live = String(entry.isIntersecting);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );

  // ---- Journey: scroll-linked progress for the five-step thread (no scroll hijacking). ----
  const journey = root.querySelector('[data-journey]');
  const startJourney = () => {
    if (!journey) return;
    const update = () => {
      const rect = journey.getBoundingClientRect();
      const p = (window.innerHeight * 0.78 - rect.top) / (rect.height * 0.85 + 1);
      journey.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
    };
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    new IntersectionObserver(
      ([entry]) => {
        const fn = entry.isIntersecting ? 'addEventListener' : 'removeEventListener';
        window[fn]('scroll', onScroll, { passive: true });
        window[fn]('resize', onScroll);
        update();
      },
      { rootMargin: '30% 0px 30% 0px' },
    ).observe(journey);
    update();
  };

  const start = () => {
    try {
      layoutThread();
    } catch (_) {
      /* the thread is decoration; the rest of the page must still work */
    }
    if (reduce) return;

    // Anything already on screen enters now; the rest enters on scroll.
    for (const el of groups) {
      const rect = el.getBoundingClientRect();
      if (
        el.hasAttribute('data-reveal') &&
        rect.top < window.innerHeight * 0.94 &&
        rect.bottom > 0
      ) {
        el.dataset.in = '1';
      }
    }
    root.dataset.motion = 'on';
    if (hero) hero.dataset.play = '1';
    for (const el of groups) observer.observe(el);
    startJourney();
  };

  // Wait for the web fonts (headline metrics move the thread's start), but never for long.
  const fontsReady = document.fonts?.ready
    ? Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1200))])
    : Promise.resolve();
  fontsReady.then(start);

  if (hero && typeof ResizeObserver === 'function') {
    let frame = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        try {
          layoutThread();
        } catch (_) {
          /* decoration only */
        }
      });
    }).observe(hero);
  }
})();
