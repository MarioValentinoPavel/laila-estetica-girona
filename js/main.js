// Laila · «Vaho»: la foto de portada está tras un cristal empañado (una copia desenfocada y lechosa en un canvas).
// Al cargar, una mano limpia la cara y «Laila» se escribe sobre el vaho; el cursor (o el dedo) escribe en el cristal y el vaho vuelve poco a poco.
// Después: pestañas de precios y la semana dibujada en barras con la hora de ahora.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const L = () => document.documentElement.lang;
  const T = (es, ca, en) => (L() === 'ca' ? ca : L() === 'en' ? en : es);

  // ---------- vaho ----------
  function fog() {
    const hero = document.getElementById('glass'), img = hero.querySelector('.hero-img'), cv = document.getElementById('fog');
    const lit = () => hero.classList.add('lit');
    if (reduce || !cv.getContext) { lit(); return; }
    const g = cv.getContext('2d'), M = document.createElement('canvas'), m = M.getContext('2d'), F = document.createElement('canvas'), f = F.getContext('2d');
    const K = 3; // la máscara va a 1/3 de resolución: bordes suaves, como un dedo sobre el vaho
    let W = 0, H = 0, cw = 0, ch = 0, dpr = 1, vis = true, ready = false, queue = [], last = null, idle = 0, nm = null, pen = -1;

    // object-fit: cover con object-position 50% 62%, igual que el <img>
    const cover = (c, w, h) => { const s = Math.max(w / img.naturalWidth, h / img.naturalHeight), iw = img.naturalWidth * s, ih = img.naturalHeight * s; c.drawImage(img, (w - iw) * .5, (h - ih) * .62, iw, ih); };
    const build = () => {
      const r = hero.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 1.5);
      cw = r.width; ch = r.height; W = cv.width = Math.round(cw * dpr); H = cv.height = Math.round(ch * dpr);
      F.width = W; F.height = H;
      // desenfoque barato: reducir mucho y volver a ampliar (dos pasos para que no se vean bloques)
      const a = document.createElement('canvas'), b = document.createElement('canvas');
      a.width = Math.max(8, Math.round(cw / 18)); a.height = Math.max(8, Math.round(ch / 18)); cover(a.getContext('2d'), a.width, a.height);
      b.width = a.width * 4; b.height = a.height * 4; const bg = b.getContext('2d'); bg.imageSmoothingQuality = 'high'; bg.drawImage(a, 0, 0, b.width, b.height);
      f.imageSmoothingQuality = 'high'; f.drawImage(b, 0, 0, W, H);
      const gr = f.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(239,230,218,.3)'); gr.addColorStop(.55, 'rgba(239,230,218,.5)'); gr.addColorStop(1, 'rgba(239,230,218,.88)');
      f.fillStyle = gr; f.fillRect(0, 0, W, H);
      M.width = Math.ceil(cw / K); M.height = Math.ceil(ch / K); m.fillStyle = '#000'; m.fillRect(0, 0, M.width, M.height);
      // el nombre se escribe centrado en la parte de arriba del cristal
      const fs = Math.min(cw * .34, ch * .3, 300);
      nm = { x: cw * .5, y: ch * .36, font: '300 ' + (fs / K) + 'px Hahmlet, Georgia, serif', ls: -fs * .03 };
      ready = true; draw();
    };
    const R = () => Math.max(24, Math.min(cw, ch) * .055); // radio del dedo en px CSS
    const wipe = (x, y, k = 1) => {
      const r = R() / K, gx = m.createRadialGradient(x / K, y / K, 0, x / K, y / K, r);
      gx.addColorStop(0, `rgba(0,0,0,${.9 * k})`); gx.addColorStop(.6, `rgba(0,0,0,${.6 * k})`); gx.addColorStop(1, 'rgba(0,0,0,0)');
      m.globalCompositeOperation = 'destination-out'; m.fillStyle = gx; m.beginPath(); m.arc(x / K, y / K, r, 0, 7); m.fill(); m.globalCompositeOperation = 'source-over';
    };
    const stroke = (x, y, k) => { // interpola entre puntos para que el trazo sea continuo
      if (last) { const dx = x - last[0], dy = y - last[1], n = Math.min(40, Math.ceil(Math.hypot(dx, dy) / (R() * .3))); for (let i = 1; i <= n; i++) queue.push([last[0] + dx * i / n, last[1] + dy * i / n, k]); }
      else queue.push([x, y, k]);
      last = [x, y];
    };
    // escribe «Laila» de izquierda a derecha, como un dedo sobre el cristal
    const ink = () => {
      m.save(); m.font = nm.font; m.textBaseline = 'middle';
      if ('letterSpacing' in m) m.letterSpacing = `${nm.ls / K}px`;
      const tw = m.measureText('Laila').width, x0 = nm.x / K - tw / 2;
      m.beginPath(); m.rect(0, 0, x0 + tw * 1.06 * pen, M.height); m.clip();
      m.globalCompositeOperation = 'destination-out'; m.fillStyle = 'rgba(0,0,0,.35)';
      m.fillText('Laila', x0, nm.y / K); m.restore();
    };
    const draw = () => {
      m.fillStyle = 'rgba(0,0,0,.0028)'; m.fillRect(0, 0, M.width, M.height); // el vaho vuelve despacio
      queue.splice(0).forEach(([x, y, k]) => wipe(x, y, k));
      if (pen >= 0 && nm) ink();
      g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.drawImage(F, 0, 0);
      g.globalCompositeOperation = 'destination-in'; g.imageSmoothingQuality = 'high'; g.drawImage(M, 0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    };
    const loop = () => { if (vis && ready) draw(); requestAnimationFrame(loop); };
    const write = (delay = 0) => {
      if (typeof gsap === 'undefined') { pen = 1; return; }
      const o = { t: 0 };
      gsap.to(o, { t: 1, duration: 2.2, delay, ease: 'power1.inOut', onUpdate: () => (pen = o.t), onComplete: () => gsap.delayedCall(.4, () => (pen = -1)) });
    };
    // una pasada de la mano sobre la cara al cargar
    const swipe = (y0, y1, delay = 0) => {
      if (typeof gsap === 'undefined') return;
      const o = { t: 0 };
      gsap.to(o, { t: 1, duration: 1.4, delay, ease: 'power2.inOut', onStart: () => (last = null), onUpdate: () => { const x = cw * (.22 + .56 * o.t), y = ch * (y0 + (y1 - y0) * o.t); stroke(x, y, .9); }, onComplete: () => (last = null) });
    };
    const start = () => {
      build(); hero.classList.add('fogged'); lit();
      swipe(.62, .66, .3);
      (document.fonts ? document.fonts.load(nm.font).catch(() => {}) : Promise.resolve()).then(() => write(1.2));
      requestAnimationFrame(loop);
      // si nadie toca nada, el nombre se vuelve a escribir
      setInterval(() => { if (vis && pen < 0 && Date.now() - idle > (fine ? 10000 : 7000)) { idle = Date.now(); write(); } }, 1500);
    };
    hero.addEventListener('pointermove', (e) => {
      if (!ready) return; const r = hero.getBoundingClientRect(); idle = Date.now(); hero.classList.add('touched');
      stroke(e.clientX - r.left, e.clientY - r.top, 1);
    });
    hero.addEventListener('pointerleave', () => (last = null));
    hero.addEventListener('pointerdown', () => (last = null));
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(hero);
    let rt; new ResizeObserver(() => { if (!ready) return; clearTimeout(rt); rt = setTimeout(() => { const r = hero.getBoundingClientRect(); if (Math.abs(r.width - cw) > 2 || Math.abs(r.height - ch) > 80) build(); }, 150); }).observe(hero);
    idle = Date.now();
    if (img.complete && img.naturalWidth) start(); else { img.addEventListener('load', start, { once: true }); img.addEventListener('error', lit, { once: true }); }
  }

  function intro() {
    if (reduce || typeof gsap === 'undefined') return;
  }

  // ---------- precios en pestañas ----------
  function tabs() {
    const tb = [...document.querySelectorAll('[role="tab"]')], pics = [...document.querySelectorAll('.p-img img')];
    const sel = (i, focus) => {
      tb.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; document.getElementById(b.getAttribute('aria-controls')).hidden = k !== i; });
      pics.forEach((p, k) => p.classList.toggle('on', k === i));
      if (focus) tb[i].focus();
      if (!reduce && typeof gsap !== 'undefined') gsap.fromTo(`#pn${i} li`, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .05 });
    };
    tb.forEach((b, i) => {
      b.addEventListener('click', () => sel(i));
      b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); sel((i + d + tb.length) % tb.length, true); } });
    });
  }

  // ---------- horario: la semana en barras ----------
  const HRS = [null, [10, 19], [10, 16], [10, 19], [10, 19], null, null]; // lunes → domingo
  const DAYS = [['Lunes', 'Dilluns', 'Monday'], ['Martes', 'Dimarts', 'Tuesday'], ['Miércoles', 'Dimecres', 'Wednesday'], ['Jueves', 'Dijous', 'Thursday'], ['Viernes', 'Divendres', 'Friday'], ['Sábado', 'Dissabte', 'Saturday'], ['Domingo', 'Diumenge', 'Sunday']];
  const S0 = 9, SPAN = 11; // escala de 9:00 a 20:00
  const pos = (h) => ((h - S0) / SPAN) * 100;
  function nowMadrid() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { d: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday), h: +p.hour + +p.minute / 60 };
  }
  function week(animate) {
    const box = document.getElementById('week'), now = document.getElementById('now'), li = { es: 0, ca: 1, en: 2 }[L()] || 0, n = nowMadrid();
    const sc = [10, 13, 16, 19].map((h) => `<b style="left:${pos(h)}%">${h}:00</b>`).join('');
    box.innerHTML = `<div class="d sc" aria-hidden="true"><span></span><div class="tr">${sc}</div></div>` + HRS.map((o, i) => {
      const today = i === n.d, line = today && n.h > S0 && n.h < S0 + SPAN ? `<i class="nowline" style="left:${pos(n.h)}%" aria-hidden="true"></i>` : '';
      const body = o ? `<span class="bar" style="left:${pos(o[0])}%;width:${pos(o[1]) - pos(o[0])}%">${o[0]}:00 – ${o[1]}:00</span>` : `<em>${T('Cerrado', 'Tancat', 'Closed')}</em>`;
      return `<div class="d${today ? ' today' : ''}"><span class="dn">${DAYS[i][li]}</span><div class="tr">${body}${line}</div></div>`;
    }).join('');
    const o = HRS[n.d], open = o && n.h >= o[0] && n.h < o[1];
    let msg;
    if (open) msg = T(`Abierto ahora · hasta las ${o[1]}:00`, `Obert ara · fins a les ${o[1]}:00`, `Open now · until ${o[1]}:00`);
    else {
      let k = o && n.h < o[0] ? 0 : 1; while (!HRS[(n.d + k) % 7]) k++;
      const nd = (n.d + k) % 7, h = HRS[nd][0];
      const when = k === 0 ? T('hoy', 'avui', 'today') : k === 1 ? T('mañana', 'demà', 'tomorrow') : T(`el ${DAYS[nd][0].toLowerCase()}`, `${DAYS[nd][1].toLowerCase()}`, `on ${DAYS[nd][2]}`);
      msg = T(`Cerrado ahora · abrimos ${when} a las ${h}:00`, `Tancat ara · obrim ${when} a les ${h}:00`, `Closed now · we open ${when} at ${h}:00`);
    }
    now.textContent = msg; now.classList.toggle('open', !!open);
    if (animate && !reduce && typeof gsap !== 'undefined') gsap.fromTo('#week .bar', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#week', start: 'top 85%' } });
  }

  function init() {
    fog(); intro(); tabs(); week(true);
    document.addEventListener('langchange', () => week(false));
    setInterval(() => week(false), 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
