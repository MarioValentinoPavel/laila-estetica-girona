// Kit premium común (lote Girona 2): scroll suave (Lenis) sincronizado con GSAP, títulos que suben palabra a palabra
// tras una máscara, imágenes que se destapan, parallax, botones magnéticos, marquesinas y cabecera que se esconde.
// Marcado: [data-split] título · [data-hero] entra al cargar (data-d = retraso) · [data-up] sube al aparecer
// [data-img] marco que se destapa · [data-par="0.15"] parallax · [data-mag] magnético · .mq > .mq-t marquesina
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const P = (window.P = { reduce, fine, lenis: null });
  const has = () => typeof gsap !== 'undefined' && !reduce;

  // parte en palabras con máscara, respetando <em>, <b>, <a> y <br>
  P.split = (el) => {
    if (el.dataset.splitHtml === el.innerHTML) return el.querySelectorAll('.w-i');
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'), i = document.createElement('span');
          w.className = 'w'; i.className = 'w-i'; i.textContent = p; w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el); el.dataset.splitHtml = el.innerHTML; el.classList.add('is-split');
    return el.querySelectorAll('.w-i');
  };
  P.reveal = (el, o = {}) => gsap.fromTo(P.split(el), { yPercent: 115, rotate: o.rot ?? 4 }, { yPercent: 0, rotate: 0, duration: o.d || 1.25, ease: 'expo.out', stagger: o.s ?? .05, delay: o.delay || 0, scrollTrigger: o.st });

  function lenis() {
    if (reduce || typeof Lenis === 'undefined') return;
    const l = (P.lenis = new Lenis({ lerp: .1, wheelMultiplier: 1, smoothWheel: true }));
    if (typeof ScrollTrigger !== 'undefined') { l.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => l.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { l.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
      const t = document.querySelector(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); l.scrollTo(t, { offset: -70, duration: 1.4 });
    });
  }

  function header() {
    const top = document.querySelector('.top'); if (!top) return; let last = 0;
    const on = () => { const y = scrollY; top.classList.toggle('solid', y > 40); if (y > 700 && y > last + 4) top.classList.add('hide'); else if (y < last - 4) top.classList.remove('hide'); last = y; };
    addEventListener('scroll', on, { passive: true }); on();
  }

  function magnetic() {
    if (!fine || reduce) return;
    document.querySelectorAll('[data-mag]').forEach((el) => {
      const s = +el.dataset.mag || .3;
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * s}px ${(e.clientY - r.top - r.height / 2) * s}px`; });
      el.addEventListener('pointerleave', () => { el.style.translate = '0 0'; });
    });
  }

  function marquees() {
    document.querySelectorAll('.mq').forEach((m) => {
      const t = m.querySelector('.mq-t'); if (!t || t.dataset.dup) return;
      t.dataset.dup = 1; t.innerHTML += t.innerHTML; t.setAttribute('aria-hidden', 'false');
    });
  }

  function motion() {
    gsap.registerPlugin(ScrollTrigger);
    // portada: todo entra en el primer segundo
    document.querySelectorAll('[data-hero]').forEach((el) => {
      const d = +(el.dataset.d || 0);
      if (el.hasAttribute('data-split')) P.reveal(el, { delay: d, s: .06 });
      else gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', delay: d });
    });
    document.querySelectorAll('[data-split]:not([data-hero])').forEach((el) => P.reveal(el, { st: { trigger: el, start: 'top 86%' } }));
    gsap.utils.toArray('[data-up]').forEach((el) => gsap.fromTo(el, { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: +(el.dataset.up || 0), scrollTrigger: { trigger: el, start: 'top 90%' } }));
    gsap.utils.toArray('[data-img]').forEach((el) => {
      const img = el.querySelector('img, video');
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 88%' } });
      if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.utils.toArray('[data-par]').forEach((el) => gsap.to(el, { yPercent: -100 * (+el.dataset.par || .15), ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }

  P.init = () => {
    document.documentElement.classList.add('ready');
    marquees(); header(); magnetic();
    if (has()) { lenis(); motion(); }
    document.fonts && document.fonts.ready.then(() => typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh());
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', P.init); else P.init();
})();
