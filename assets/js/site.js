/* GaliCrisp site behaviour: nav, entrance, category selector, 3D pack stands, form. No dependencies. */
{
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // entrance (once, on load)
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));

  // header + nav
  const head = d.querySelector('[data-head]');
  const nav = d.querySelector('[data-nav]');
  const menuBtn = d.querySelector('[data-menu]');
  const subBtn = d.querySelector('[data-sub]');
  const outside = [d.querySelector('main'), d.querySelector('.site-foot'), d.querySelector('.skip')];
  const setMenu = open => { nav.classList.toggle('is-open', open); menuBtn.setAttribute('aria-expanded', open); d.body.style.overflow = open ? 'hidden' : ''; outside.forEach(el => { if (el) el.inert = open; }); };
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  subBtn?.addEventListener('click', e => { e.stopPropagation(); subBtn.setAttribute('aria-expanded', subBtn.getAttribute('aria-expanded') !== 'true'); });
  d.addEventListener('click', e => { if (subBtn && !e.target.closest('.has-sub')) subBtn.setAttribute('aria-expanded', 'false'); });
  d.querySelector('.has-sub')?.addEventListener('focusout', e => { if (!e.currentTarget.contains(e.relatedTarget)) subBtn.setAttribute('aria-expanded', 'false'); });
  addEventListener('resize', () => { if (innerWidth > 1080 && nav?.classList.contains('is-open')) setMenu(false); });
  d.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (subBtn?.getAttribute('aria-expanded') === 'true') { subBtn.setAttribute('aria-expanded', 'false'); subBtn.focus(); }
    if (nav?.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // scroll work in one rAF
  const hero = d.querySelector('[data-hero]');
  const stage = d.querySelector('[data-hero3d]');
  let ticking = false;
  const progress = el => { const r = el.getBoundingClientRect(); const span = r.height - innerHeight; return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0; };
  function onScroll() {
    ticking = false;
    if (head && root.dataset.page === 'home') head.classList.toggle('is-solid', scrollY > innerHeight * .6);
    if (hero && stage) stage.heroP = progress(hero);
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  onScroll();
  // category selector: cards rise in once, a spotlight follows the card under the pointer or focus
  const cats = d.querySelector('[data-cats]');
  if (cats) {
    if (reduce || !('IntersectionObserver' in window)) cats.classList.add('in');
    else new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { cats.classList.add('in'); io.disconnect(); } }), { threshold: 0.2 }).observe(cats);
    const light = a => {
      const r = cats.getBoundingClientRect(), c = a.getBoundingClientRect();
      cats.style.setProperty('--sx', `${((c.left + c.width / 2 - r.left) / r.width * 100).toFixed(1)}%`);
      cats.style.setProperty('--sc', a.closest('.cat-card').style.getPropertyValue('--c'));
      cats.classList.add('lit');
    };
    cats.querySelectorAll('.cat-card a').forEach(a => {
      a.addEventListener('pointerenter', () => light(a));
      a.addEventListener('focus', () => light(a));
      a.addEventListener('pointerleave', () => cats.classList.remove('lit'));
      a.addEventListener('blur', () => cats.classList.remove('lit'));
    });
  }

  // product fans load their packshots shortly before they scroll into view
  const fans = d.querySelectorAll('[data-fan]');
  const loadFan = f => f.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  if ('IntersectionObserver' in window) {
    const fio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { loadFan(e.target); fio.unobserve(e.target); } }), { rootMargin: '400px 0px' });
    fans.forEach(f => fio.observe(f));
  } else fans.forEach(loadFan);

  // 3D pack stands: pointer tilt + moving light
  if (fine && !reduce) {
    d.querySelectorAll('[data-tilt]').forEach(s => {
      s.addEventListener('pointermove', e => {
        const r = s.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        s.style.setProperty('--ry', `${((x - .5) * 18).toFixed(2)}deg`);
        s.style.setProperty('--rx', `${((.5 - y) * 12).toFixed(2)}deg`);
        s.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        s.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      });
      s.addEventListener('pointerleave', () => { s.style.setProperty('--ry', '0deg'); s.style.setProperty('--rx', '0deg'); });
    });
    const screen = d.querySelector('[data-screen]');
    const catHero = screen?.closest('section');
    catHero?.addEventListener('pointermove', e => {
      const r = catHero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      screen.style.setProperty('--sy', `${(-16 + x * 14).toFixed(2)}deg`);
      screen.style.setProperty('--sx', `${(-y * 8).toFixed(2)}deg`);
    });
  }

  // table labels for stacked rows on phones
  d.querySelectorAll('table.stack').forEach(t => {
    const hs = [...t.querySelectorAll('thead th')].map(th => th.textContent);
    t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => { td.dataset.l = hs[i] || ''; }));
  });

  // contact form: validates, then opens the visitor's email app (no server on a static host)
  const form = d.querySelector('[data-form]');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    let first = null;
    form.querySelectorAll('[required]').forEach(f => {
      const err = d.getElementById('e-' + f.name);
      let msg = '';
      if (!f.value.trim()) msg = form.dataset.req;
      else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) msg = form.dataset.bad;
      f.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.textContent = msg; f.setAttribute('aria-describedby', err.id); }
      if (msg && !first) first = f;
    });
    if (first) { first.focus(); return; }
    const v = n => form.elements[n].value.trim();
    const subject = `${v('topic')}: ${v('company')}`;
    const body = `${v('msg')}\n\n${v('name')}\n${v('company')}\n${v('country')}\n${v('email')}`;
    location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.querySelector('.form-ok').textContent = form.dataset.ok;
  });

  // cinematic hero: load the WebGL scene only where it can run
  // the photo of the catalogue cover stays as the still frame for reduced motion, data saver or no WebGL
  if (stage && !reduce && !navigator.connection?.saveData) {
    const boot = () => {
      const c = d.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
      import(new URL(stage.dataset.assets + 'js/hero3d.js', document.baseURI).href).then(m => m.start(stage, { reduce })).catch(() => {});
    };
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(boot, { timeout: 1200 }) : setTimeout(boot, 200));
    d.readyState === 'complete' ? idle() : addEventListener('load', idle, { once: true });
  }
}
