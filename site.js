/* Xpressions microsite | Group 4
   Fill these in before launch. Everything else works without them. */
const settings = {
  measurementId: '',          // GA4 web stream ID, e.g. 'G-ABC123XYZ'
  interestFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf5POAwJ4CLLn8W-3zHFE43xcd8k7fnvtP2oKUTKCsqTIRgaw/viewform',
  googleForm: {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSf5POAwJ4CLLn8W-3zHFE43xcd8k7fnvtP2oKUTKCsqTIRgaw/formResponse',
    fields: { name: 'entry.1784363011', email: 'entry.1298956331', college: 'entry.1885792002', interests: 'entry.391021467', sides: 'entry.1806788598' },
  },
  festStart: '2027-01-17T09:00:00+05:30', // DUMMY date for now. Replace with the confirmed start.
  festDays: 3,
  visitCounter: 'https://abacus.jasoncameron.dev/hit/ximb-xpressions/microsite-visits', // free public counter
};

document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Analytics ---------- */
if (/^G-[A-Z0-9]+$/.test(settings.measurementId)) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', settings.measurementId);
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + settings.measurementId;
  document.head.append(tag);
}
const track = (name, params = {}) => window.gtag?.('event', name, params);

/* ---------- Toast ---------- */
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ---------- Header, progress, nav ---------- */
const bar = $('#top-bar'), prog = $('.progress span');
const stickyCta = $('.sticky-cta');
const hero = $('#home'), interestSec = $('#interest');
let interestVisible = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.classList.toggle('scrolled', y > 20);
  prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  stickyCta.classList.toggle('show', y > hero.offsetHeight * .7 && !interestVisible);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const toggle = $('.menu-toggle'), nav = $('#site-nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', open);
  nav.classList.toggle('open', open);
});
$$('a', nav).forEach(a => a.addEventListener('click', () => { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }));

const navLinks = $$('nav a[href^="#"]:not(.btn)');
const spy = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
['explore', 'highlights', 'programme', 'interest', 'faq'].forEach(id => spy.observe(document.getElementById(id)));
new IntersectionObserver(([e]) => { interestVisible = e.isIntersecting; onScroll(); }, { threshold: .15 }).observe(interestSec);

$$('a[href="#interest"]').forEach(l => l.addEventListener('click', () => track('interest_section_click', { location: l.closest('section,header,div')?.id || 'page' })));

/* ---------- Reveal on scroll ---------- */
const rev = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } });
}, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; rev.observe(el); });
setTimeout(() => $$('.reveal').forEach(el => el.classList.add('in')), 4000);

/* ---------- Hero slideshow: each image breaks along its X seam into the next ---------- */
// Add your own images here. The caption (top + bottom) and label change with each image.
// fit: 'full' = wide image across the whole hero (keep the left side calm, the text sits there)
//      'right' = image fills the right half only
// position: CSS background-position. seam: where the "\" break runs, as fractions of the
// image width at its top and bottom edge (only for 'full' images; leave out to use a default).
const heroSlides = [
  { image: 'assets/hero-main.webp', fit: 'full', position: '100% 50%', seam: [0.608, 0.826],
    top: 'Good with numbers.', bottom: 'Better with a chorus.', label: 'One person. Different sides.' },
  { image: 'assets/hero-dance.webp', fit: 'full', position: '100% 40%',
    top: 'Classical at heart.', bottom: 'Freestyle on stage.', label: 'My stage side' },
  { image: 'assets/hero-runway.webp', fit: 'right', position: '50% 50%',
    top: 'Boardroom ready.', bottom: 'Runway ready.', label: 'My spotlight side' },
];
const SLIDE_MS = 4000;

const art = $('#hero-art'), mover = $('.art-move', art);
const underBox = $('.under', art), under = $('.layer', underBox);
const curBox = $('.cur', art), halfA = $('.half-a', art), halfB = $('.half-b', art), rift = $('.rift', art);
const swap = $('#hero-caption'), dotsWrap = $('#slide-dots');
const natural = {};
let cur = 0, busy = false, timer = null, paused = false, seamNow = [30, 62];

const preload = src => natural[src] ? Promise.resolve() : new Promise(r => {
  const i = new Image();
  i.onload = () => { natural[src] = [i.naturalWidth, i.naturalHeight]; r(); };
  i.onerror = () => r();
  i.src = src;
});
const paint = (el, s) => { el.style.backgroundImage = `url("${s.image}")`; el.style.backgroundPosition = s.position || '50% 50%'; };

// Map the slide's seam from image coordinates to percentages of the visible box (background-size: cover).
function seamFor(s) {
  const nat = natural[s.image], bw = curBox.clientWidth, bh = curBox.clientHeight;
  if (!s.seam || !nat || !bw || !bh) return [30, 62];
  const [iw, ih] = nat, sc = Math.max(bw / iw, bh / ih), sw = iw * sc, sh = ih * sc;
  const [px, py] = (s.position || '50% 50%').split(/\s+/).map(v => parseFloat(v) / 100);
  const ox = (bw - sw) * px, oy = (bh - sh) * py;
  const xTop = ox + s.seam[0] * sw, xBot = ox + s.seam[1] * sw, slope = (xBot - xTop) / sh;
  const at = y => xTop + (y - oy) * slope;
  return [at(0) / bw * 100, at(bh) / bw * 100];
}
function applySeam(s) {
  seamNow = seamFor(s);
  curBox.style.setProperty('--s1', seamNow[0] + '%');
  curBox.style.setProperty('--s2', seamNow[1] + '%');
}
function setFit(box, s) { box.dataset.fit = s.fit || 'full'; }

dotsWrap.innerHTML = heroSlides.map((s, i) => `<button role="tab" aria-label="Show image ${i + 1}: ${s.label}" aria-selected="${i === 0}"></button>`).join('');
const dots = $$('button', dotsWrap);
dotsWrap.style.setProperty('--dur', SLIDE_MS + 'ms');
if (heroSlides.length < 2) $('#slide-ui').hidden = true;

function setCaption(s, i) {
  swap.classList.add('out');
  setTimeout(() => {
    $('.swap-a', swap).textContent = s.top;
    $('.swap-b', swap).textContent = s.bottom;
    swap.classList.remove('out');
  }, 380);
}
function setDots(i) {
  dots.forEach((d, k) => {
    d.setAttribute('aria-selected', String(k === i));
    d.classList.toggle('done', k < i);
    if (k === i) { d.style.animation = 'none'; d.offsetWidth; d.style.animation = ''; }
  });
}
function schedule() {
  clearTimeout(timer);
  if (!reduced && !paused && heroSlides.length > 1) timer = setTimeout(() => go(cur + 1), SLIDE_MS);
}

function show(i) {
  const s = heroSlides[i];
  [under, halfA, halfB].forEach(el => paint(el, s));
  setFit(underBox, s); setFit(curBox, s); art.dataset.fit = s.fit || 'full';
  applySeam(s);
}

async function go(n) {
  if (busy || heroSlides.length < 2) return;
  n = (n + heroSlides.length) % heroSlides.length;
  if (n === cur) return;
  busy = true;
  const next = heroSlides[n];
  await preload(next.image);
  paint(under, next); setFit(underBox, next); art.dataset.fit = next.fit || 'full';
  setCaption(next, n);
  setDots(n);

  if (!reduced) {
    const ease = 'cubic-bezier(.7,0,.2,1)';
    const k = seamNow[1] >= seamNow[0] ? 1 : -1; // left side falls down-left for a "\" seam
    under.animate([{ transform: 'scale(1.14)', filter: 'brightness(1.6) saturate(1.3)' }, { transform: 'scale(1)', filter: 'none' }], { duration: 1500, easing: 'cubic-bezier(.2,.8,.2,1)' });
    rift.animate([{ '--w': '0%', opacity: 0 }, { '--w': '1%', opacity: 1, offset: .15 }, { '--w': '9%', opacity: .9, offset: .55 }, { '--w': '16%', opacity: 0 }], { duration: 1300, easing: 'ease-out' });
    const tear = d => [{ transform: 'none', opacity: 1 }, { transform: `translate(${d * -.4}%,${d * k * .2}%)`, opacity: 1, offset: .12 },
      { transform: `translate(${d * -.2}%,${d * k * .1}%)`, opacity: 1, offset: .2 }, { transform: `translate(${d * -22}%,${d * k * 9}%) rotate(${d * -2}deg)`, opacity: 0 }];
    setTimeout(() => window.heroBurst?.(), 180);
    await Promise.all([
      halfA.animate(tear(1), { duration: 1200, easing: ease, fill: 'forwards' }).finished,
      halfB.animate(tear(-1), { duration: 1200, easing: ease, fill: 'forwards' }).finished,
    ]);
  }
  [halfA, halfB].forEach(el => paint(el, next));
  setFit(curBox, next); applySeam(next);
  [halfA, halfB].forEach(el => el.getAnimations().forEach(a => a.cancel()));
  cur = n;
  busy = false;
  schedule();
}
dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
dotsWrap.addEventListener('pointerenter', () => { paused = true; dotsWrap.classList.add('paused'); clearTimeout(timer); });
dotsWrap.addEventListener('pointerleave', () => { paused = false; dotsWrap.classList.remove('paused'); schedule(); });
document.addEventListener('visibilitychange', () => { document.hidden ? clearTimeout(timer) : schedule(); });
addEventListener('resize', () => { if (!busy) applySeam(heroSlides[cur]); });
heroSlides.forEach(s => preload(s.image));
show(0);
preload(heroSlides[0].image).then(() => applySeam(heroSlides[0]));
setCaption(heroSlides[0], 0);
setTimeout(schedule, 1800);

/* Parallax moves the whole panel together, so the seam never opens at rest. */
if (!reduced && matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    mover.style.transform = `translate(${x * -14}px, ${y * -10}px)`;
  });
  hero.addEventListener('pointerleave', () => { mover.style.transform = ''; });
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('pointerleave', () => (b.style.transform = ''));
  });
  $$('.tilt').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
    });
    c.addEventListener('pointerleave', () => (c.style.transform = ''));
  });
}

(function sparks() {
  const cv = $('.sparks');
  if (!cv || reduced) return;
  const ctx = cv.getContext('2d');
  let w, h, parts = [], burst = [], running = true;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function size() {
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = Array.from({ length: Math.round(Math.min(70, w / 18)) }, () => spawn(true));
  }
  function spawn(any) {
    return { x: Math.random() * w, y: any ? Math.random() * h : h + 10, r: Math.random() * 1.8 + .4,
      vy: Math.random() * .45 + .15, vx: (Math.random() - .5) * .2, a: Math.random() * .6 + .2,
      c: Math.random() < .7 ? '255,91,85' : '244,239,230' };
  }
  // Sparks thrown off along the seam when an image breaks.
  window.heroBurst = () => {
    const hr = hero.getBoundingClientRect(), ar = art.getBoundingClientRect(), mr = curBox.getBoundingClientRect();
    const x1 = mr.left - hr.left + mr.width * seamNow[0] / 100, y1 = mr.top - hr.top;
    const x2 = mr.left - hr.left + mr.width * seamNow[1] / 100, y2 = mr.top - hr.top + mr.height;
    const nx = (y2 - y1), ny = -(x2 - x1), len = Math.hypot(nx, ny);
    for (let i = 0; i < 160; i++) {
      const t = Math.random(), side = Math.random() < .5 ? -1 : 1, sp = Math.random() * 5 + 1.5;
      burst.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t,
        vx: side * nx / len * sp + (Math.random() - .5) * 2, vy: side * ny / len * sp + (Math.random() - .5) * 2 - 1,
        life: 1, decay: Math.random() * .02 + .012, r: Math.random() * 2.2 + .6, c: Math.random() < .75 ? '255,91,85' : '255,226,210',
        minX: ar.left - hr.left });
    }
    if (!running) { running = true; tick(); }
  };
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.vy; p.x += p.vx + Math.sin(p.y / 40) * .15;
      if (p.y < -10) Object.assign(p, spawn(false));
      const fade = Math.min(1, p.y / (h * .6));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = `rgba(${p.c},${p.a * fade})`; ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    burst = burst.filter(p => p.life > 0);
    for (const p of burst) {
      p.x += p.vx; p.y += p.vy; p.vy += .06; p.vx *= .985; p.life -= p.decay;
      ctx.strokeStyle = `rgba(${p.c},${Math.max(0, p.life)})`; ctx.lineWidth = p.r;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(tick);
  }
  size(); addEventListener('resize', size);
  new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) tick(); }).observe(hero);
  tick();
})();

/* ---------- Countdown ---------- */
const start = settings.festStart ? new Date(settings.festStart) : null;
if (start && !isNaN(start)) {
  const cd = $('#countdown');
  cd.classList.add('on');
  const last = new Date(start.getTime() + (settings.festDays - 1) * 86400000);
  $('#date-label').textContent = `${start.getDate()} to ${last.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  $('#eyebrow-date').textContent = `${start.getDate()} TO ${last.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()} (TENTATIVE)`;
  const pad = n => String(n).padStart(2, '0');
  const tickCd = () => {
    let s = Math.max(0, Math.floor((start - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const vals = { d, h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    for (const k in vals) $(`[data-cd="${k}"]`, cd).textContent = k === 'd' ? vals[k] : pad(vals[k]);
  };
  tickCd(); setInterval(tickCd, 1000);
}

/* ---------- Events ---------- */
// "Before you commit" details. All values are tentative estimates until the organising team confirms them.
const checklists = {
  compete: { 'Team size': '2 to 3 members', 'Format & rounds': 'Online prelims, on-campus finals', 'Judging': 'Analysis, creativity and presentation', 'Registration closes': '10 Jan 2027' },
  perform: { 'Format': 'Solo or team', 'Selection': 'Online video round by 5 Jan 2027', 'Slot length': '8 to 12 minutes', 'Equipment': 'Sound system and basic backline provided', 'Reporting time': '1 hour before your slot' },
  watch: { 'Lineup reveal': 'Late December 2026', 'Timings': '8 pm onwards', 'Passes': 'From 5 Jan 2027', 'Entry': 'Valid college ID, single entry' },
  'give-back': { 'Time commitment': 'Half a day', 'How to join': 'Tick it in the interest form below', 'Registration closes': '10 Jan 2027' },
};
const sideLabel = { compete: 'Compete', perform: 'Perform', watch: 'Watch', 'give-back': 'Give back' };
// The 11 Xpressions events the team chose to feature, with photos from past editions. `when` and `facts` are tentative.
const events = [
  // COMPETE
  { side: 'compete', cat: 'Presentation', name: 'Board Room', when: 'Day 1 · 17 Jan, 2 pm', facts: { 'Team size': '3 members' },  blurb: 'Pitch your analysis to a panel of judges.', img: 'assets/ev-boardroom.webp', tag: 'PAST EDITION', desc: 'Teams present their strategy and competitor analysis to a panel of judges in a boardroom-style round. This edition: three-member teams, finals on 17 January 2027 (tentative).' },
  { side: 'compete', cat: 'Case & simulation', name: 'J.O.A.T.', when: 'Day 1 to 3 · finals 19 Jan', facts: { 'Prize pool': '₹1 lakh (2023 edition)' },  blurb: 'Jack of All Trades. Enter the nexus of business brilliance.', img: 'assets/ev-joat.webp', pos: '50% 45%', tag: 'FLAGSHIP', desc: 'Jack of All Trades is X-STEC\'s flagship national-level case study and simulation game. The 2023 edition had a prize pool of ₹1 lakh.' },
  { side: 'compete', cat: 'Model UN', name: 'XIMB MUN', when: 'Day 1 to 3 · 17 to 19 Jan', facts: { 'Team size': 'Individual delegates', 'Format & rounds': 'Three committee sessions' },  blurb: 'Represent a country. Debate, negotiate, resolve.', img: 'assets/ev-mun.webp', tag: 'RETURNING', desc: 'XIMB\'s Model United Nations, run by Speak Up, the oratory club. Delegates represent countries in committee sessions over the three days of the fest.' },
  { side: 'compete', cat: 'Gaming', name: 'Xigabytes', when: 'Day 2 · 18 Jan, 10 am', facts: { 'Team size': 'Solo or squads of 5', 'Format & rounds': 'Knockout brackets, Exam Hall' },  blurb: 'Tournaments and walk-in gaming by X-Sys.', img: 'assets/ev-xigabytes.webp', tag: 'RETURNING', desc: 'The gaming event by X-Sys, the systems association, with tournaments and walk-in play in the Exam Hall. Past titles included FIFA, CS:GO, Mortal Kombat 11 and WWE.' },
  { side: 'compete', cat: 'Marketing', name: 'Maxim Mela', when: 'Day 2 · 18 Jan, 11 am', facts: { 'Team size': '2 members', 'Format & rounds': 'Themed stalls and marketing games' },  blurb: 'A themed marketing fair by MAXIM.', img: 'assets/ev-maximmela.webp', tag: 'RETURNING', desc: 'The marketing fair run by MAXIM, XIMB\'s marketing association. A past edition was themed on Game of Thrones, complete with an Iron Throne.' },
  // PERFORM
  { side: 'perform', cat: 'Rap battle', name: 'Rap It Up', when: 'Day 2 · 18 Jan, 5 pm', facts: { 'Format': 'Solo or duo', 'Slot length': '3 to 4 minutes' },  blurb: 'Grab the mic. Go bar for bar.', img: 'assets/ev-rapitup.webp', pos: '50% 40%', tag: 'STAGE', desc: 'A rap battle where performers from colleges across the region compete.' },
  { side: 'perform', cat: 'Battle of bands', name: 'Decibelz', when: 'Day 1 · 17 Jan, 7:30 pm', facts: { 'Format': 'Bands of 4 to 8', 'Slot length': '15 minutes' },  blurb: 'The band hunt on the main stage.', img: 'assets/ev-decibelz.webp', tag: 'STAGE', desc: 'The battle of the bands, organised by the Cultural Committee. In 2016 it was won by Hidden Identity, a band from Kolkata.' },
  { side: 'perform', cat: 'Street play', name: 'Nukkad Natak', when: 'Day 1 · 17 Jan, 4 pm', facts: { 'Format': 'Teams of 8 to 20', 'Slot length': '10 to 12 minutes', 'Equipment': 'Open-air, no mics' },  blurb: 'Aaghaz. Street theatre with a message.', img: 'assets/ev-nukkad.webp', tag: 'STAGE', desc: 'Aaghaz, the street play competition, performed in the open outside the auditorium. Teams take on social themes; KIIT and IBS teams have won in past editions.' },
  // WATCH
  { side: 'watch', cat: 'DJ night', name: 'Sunburn Campus', when: 'Day 2 · 18 Jan, 8 pm',  blurb: 'The EDM night, with DJs on the main stage.', img: 'assets/ev-sunburn.webp', tag: 'DAY 2 · 8 PM', hot: true, desc: 'The 2022 edition had a Sunburn Campus night with Olly Esse and Zephyrtone. This edition\'s lineup is expected to be revealed in late December 2026 (tentative).' },
  // GIVE BACK
  { side: 'give-back', cat: 'Run', name: 'X-Athon', when: 'Day 3 · 19 Jan, 6:30 am', facts: { 'Distance': '10 km, with a shorter fun run', 'Time commitment': 'Morning, about 3 hours' },  blurb: 'The XIMB 10K marathon, for a cause.', img: 'assets/ev-xathon.webp', tag: 'SRC', desc: 'The XIMB 10K marathon, held around the fest. The 2019 theme was "Run a mile, Spread a smile"; in 2021 it was a pan-India walk for disability rights with 459 participants.' },
  { side: 'give-back', cat: 'CSR case', name: 'Vriddhi', when: 'Day 2 · 18 Jan, 2 pm', facts: { 'Team size': '2 to 3 members', 'Format': 'CSR action plan, presented to a jury' },  blurb: 'A national-level CSR action plan competition.', img: 'assets/ev-vriddhi.webp', tag: 'SRC', desc: 'A national-level case competition on CSR action plans, run by the Social Responsibility Cell.' },
];
const grid = $('#event-grid'), note = $('#tab-note');
function media(ev) {
  return ev.img ? `<img src="${ev.img}" alt="" loading="lazy"${ev.pos ? ` style="object-position:${ev.pos}"` : ''}${ev.fb ? ` data-fallback="${ev.fb}" referrerpolicy="no-referrer"` : ''}>` : `<div class="ph-art">${ev.ph || 'X'}<small>IMAGE PLACEHOLDER</small></div>`;
}
grid.innerHTML = events.map((ev, i) => `
  <article class="ev" data-i="${i}" data-side="${ev.side}" aria-roledescription="slide" aria-label="${i + 1} of ${events.length}: ${ev.name}">
    <div class="ev-media">${media(ev)}<span class="tag${ev.hot ? ' hot' : ''}">${ev.tag}</span></div>
    <div class="ev-body"><small>${sideLabel[ev.side]} · ${ev.cat}</small><h3>${ev.name}</h3><p>${ev.blurb}</p><span class="ev-when">${ev.when} · tentative</span>
      <div class="ev-actions"><button class="btn" type="button" data-open>Before you commit</button></div>
    </div>
  </article>`).join('');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Interest form: one checkbox per event, grouped by side
$('#interest-chips').innerHTML = ['compete', 'perform', 'watch', 'give-back'].map(side => `
  <div class="pick-group"><p>${sideLabel[side]}</p><div class="chips">${events.filter(e => e.side === side).map(e =>
    `<label><input type="checkbox" name="interests" value="${e.name}" data-side="${sideLabel[side]}" id="i-${slug(e.name)}"><span>${e.name}</span></label>`).join('')}</div></div>`).join('');
const cflow = $('#cflow'), cards = $$('.ev', grid), tabs = $$('.tabs [role=tab]');
const dotsEl = $('#cflow-dots'), countEl2 = $('#cflow-count');
dotsEl.innerHTML = cards.map(() => '<span></span>').join('');
const dotEls = $$('span', dotsEl);
let active = 0, dragX = 0, autoTimer;
const N = cards.length;
const on0 = i => i === active;
const wrapOff = i => { let o = i - active; if (o > N / 2) o -= N; if (o < -N / 2) o += N; return o; };
function layout() {
  const cw = cards[0].offsetWidth;
  const gap = innerWidth < 760 ? cw * .86 : cw * .82;
  const h = Math.max(...cards.map(c => c.offsetHeight));
  grid.style.setProperty('--stage-h', (h + 40) + 'px');
  cards.forEach((c, i) => {
    const o = wrapOff(i) + dragX / gap, a = Math.abs(o);
    const scale = Math.max(.62, 1 - a * .17);
    c.style.transform = `translateX(${o * gap}px) scale(${scale})`;
    c.style.opacity = a <= 2.1 ? '1' : String(Math.max(0, 1 - (a - 2.1) * 2));
    c.style.filter = on0(i) ? 'none' : `brightness(${1 - Math.min(a, 2) * .14}) saturate(.8)`;
    c.style.zIndex = String(10 - Math.round(a));
    c.style.pointerEvents = a > 2.5 ? 'none' : '';
    const on = i === active;
    c.classList.toggle('active', on);
    c.setAttribute('aria-hidden', String(!on));
    $$('button', c).forEach(b => (b.tabIndex = on ? 0 : -1));
  });
  dotEls.forEach((d, i) => d.classList.toggle('on', i === active));
  countEl2.textContent = `${String(active + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.side === cards[active].dataset.side)));
}
function goTo(i) { active = (i + N) % N; layout(); restartAuto(); }
function restartAuto() {
  clearInterval(autoTimer);
  if (!reduced) autoTimer = setInterval(() => { if (!cflow.matches(':hover') && !cflow.contains(document.activeElement)) goTo(active + 1); }, 5000);
}
$('#sl-prev').addEventListener('click', () => goTo(active - 1));
$('#sl-next').addEventListener('click', () => goTo(active + 1));
cflow.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
});
// Clicking a side card brings it to the centre instead of opening it.
grid.addEventListener('click', e => {
  const c = e.target.closest('.ev');
  if (c && !c.classList.contains('active')) { e.stopImmediatePropagation(); e.preventDefault(); goTo(+c.dataset.i); }
}, true);
// Swipe / drag
(() => {
  let down = false, sx = 0, moved = false, cw = 1;
  cflow.addEventListener('pointerdown', e => {
    if (e.target.closest('button,a')) return;
    down = true; moved = false; sx = e.clientX; cw = cards[0].offsetWidth; cflow.classList.add('dragging');
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    dragX = e.clientX - sx;
    if (Math.abs(dragX) > 6) moved = true;
    layout();
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false; cflow.classList.remove('dragging');
    const steps = Math.round(-dragX / (cw * .6));
    dragX = 0;
    if (steps) goTo(active + Math.max(-3, Math.min(3, steps))); else layout();
  });
  cflow.addEventListener('click', e => { if (moved) { e.stopImmediatePropagation(); e.preventDefault(); moved = false; } }, true);
})();
tabs.forEach(tab => tab.addEventListener('click', () => {
  const side = tab.dataset.side;
  goTo(cards.findIndex(c => c.dataset.side === side));
  const n = events.filter(e => e.side === side).length;
  note.textContent = `${n} ${sideLabel[side].toLowerCase()} ${n === 1 ? 'experience' : 'experiences'}. Details are tentative until confirmed.`;
  track('experience_select', { experience: side });
}));
addEventListener('resize', layout);
document.fonts?.ready.then(layout);
window.addEventListener('load', layout);
layout();
restartAuto();

/* Modal */
const modal = $('#modal');
let lastFocus, modalSide, modalEvent;
grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-open]');
  if (!btn) return;
  const card = btn.closest('.ev');
  const ev = events[card.dataset.i];
  modalSide = ev.side; modalEvent = ev;
  lastFocus = btn;
  $('#m-media').innerHTML = media(ev);
  $('#m-cat').textContent = `${sideLabel[ev.side]} · ${ev.cat}`;
  $('#m-title').textContent = ev.name;
  $('#m-desc').textContent = ev.desc;
  const facts = { When: ev.when, ...checklists[ev.side], ...(ev.facts || {}) };
  $('#m-list').innerHTML = Object.entries(facts).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('') + '<dt></dt><dd class="tent">All details are tentative.</dd>';
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.modal-x', modal).focus();
  track('event_open', { event_name: ev.name, experience: ev.side });
});
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); }
$$('[data-close]', modal).forEach(b => b.addEventListener('click', closeModal));
$('#m-cta').addEventListener('click', () => {
  closeModal();
  const box = document.getElementById('i-' + slug(modalEvent.name));
  if (box) box.checked = true;
  setTimeout(() => $('#f-name').focus({ preventScroll: true }), 700);
});

/* ---------- Blast from the past ---------- */
// Past-edition photos load from their source sites; if one fails, show the local illustration instead.
$$('img[data-fallback]').forEach(img => {
  const swapImg = () => {
    if (img.dataset.swapped) return;
    img.dataset.swapped = '1';
    img.src = img.dataset.fallback;
    const small = img.closest('figure')?.querySelector('figcaption small');
    if (small) small.textContent = 'ILLUSTRATIVE';
  };
  img.addEventListener('error', swapImg);
  if (img.complete && img.naturalWidth === 0) swapImg();
});
const vid = $('.tile-video video'), vbtn = $('.vid-toggle');
if (vid && vbtn) {
  if (reduced) { vid.pause(); vid.removeAttribute('autoplay'); vbtn.textContent = '▶'; vbtn.setAttribute('aria-label', 'Play video'); }
  vbtn.addEventListener('click', () => {
    if (vid.paused) { vid.play(); vbtn.textContent = '❚❚'; vbtn.setAttribute('aria-label', 'Pause video'); }
    else { vid.pause(); vbtn.textContent = '▶'; vbtn.setAttribute('aria-label', 'Play video'); }
  });
}
const lb = $('#lightbox');
$$('[data-lightbox]').forEach(t => t.addEventListener('click', () => {
  const img = $('img', t);
  $('img', lb).src = img.src; $('img', lb).alt = img.alt;
  $('p', lb).textContent = $('figcaption', t).lastChild.textContent;
  lb.hidden = false; $('.modal-x', lb).focus();
}));
lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.modal-x')) lb.hidden = true; });
addEventListener('keydown', e => { if (e.key === 'Escape') { if (!modal.hidden) closeModal(); lb.hidden = true; } });

const countObs = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, to = +el.dataset.count, t0 = performance.now();
  const step = t => { const p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  reduced ? (el.textContent = to) : requestAnimationFrame(step);
  countObs.unobserve(el);
}), { threshold: .6 });
$$('[data-count]').forEach(el => countObs.observe(el));

/* ---------- Programme ---------- */
const days = [
  [['9:30 am', 'Inauguration', 'Opening ceremony in the Auditorium.'],
   ['10:30 am', 'J.O.A.T. and XIMB MUN begin', 'Case and simulation prelims; MUN committee session 1.'],
   ['2:00 pm', 'Board Room', 'Teams pitch to the judging panel.'],
   ['4:00 pm', 'Nukkad Natak', 'Aaghaz street plays outside the Auditorium.'],
   ['7:30 pm', 'Decibelz', 'Battle of the bands on the main stage.']],
  [['10:00 am', 'Xigabytes and MUN session 2', 'Gaming brackets in the Exam Hall.'],
   ['11:00 am', 'Maxim Mela', 'The marketing fair on the campus grounds.'],
   ['2:00 pm', 'Vriddhi', 'CSR action plans presented to a jury.'],
   ['5:00 pm', 'Rap It Up', 'Rap battle on the main stage.'],
   ['8:00 pm', 'Sunburn Campus', 'The EDM night.']],
  [['6:30 am', 'X-Athon', 'The XIMB 10K run, flagged off at the main gate.'],
   ['10:00 am', 'J.O.A.T. finals and MUN closing', 'Final rounds and committee results.'],
   ['3:00 pm', 'Prize distribution', 'Results and awards across events.'],
   ['7:30 pm', 'Celebrity night', 'The headline concert to close the fest.']],
];
const tl = $('#timeline');
function renderDay(d) {
  tl.style.setProperty('--fill', '0%');
  tl.innerHTML = days[d].map((s, i) => `<li style="animation-delay:${i * 80}ms"><time>${s[0]} · tentative</time><h4>${s[1]}</h4><p>${s[2]}</p></li>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => tl.style.setProperty('--fill', '100%')));
}
renderDay(0);
$$('.day-tabs [role=tab]').forEach(b => b.addEventListener('click', () => {
  $$('.day-tabs [role=tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  renderDay(+b.dataset.day);
}));

/* Add to calendar: Google Calendar link + .ics file for Apple Calendar / Outlook */
(() => {
  const g = $('#cal-google'), ics = $('#cal-ics');
  if (!start || isNaN(start)) { g.hidden = ics.hidden = true; $('#cal-note').textContent = 'Calendar options appear once dates are confirmed.'; return; }
  const end = new Date(start.getTime() + settings.festDays * 86400000);
  const f = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const title = 'Xpressions at XIMB', where = 'XIMB, Xavier Square, Jayadev Vihar, Bhubaneswar, Odisha';
  const details = 'XIMB\'s management and cultural festival. Programme and timings: ' + location.href.split('#')[0] + '#programme';
  g.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) +
    '&dates=' + f(start) + '/' + f(end) + '&location=' + encodeURIComponent(where) + '&details=' + encodeURIComponent(details);
  g.addEventListener('click', () => track('add_to_calendar', { method: 'google' }));
  ics.addEventListener('click', () => {
    const esc = t => t.replace(/[,;\\]/g, m => '\\' + m);
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Xpressions XIMB//Microsite//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:xpressions-' + start.getTime() + '@ximb.ac.in', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(start), 'DTEND:' + f(end),
      'SUMMARY:' + esc(title), 'LOCATION:' + esc(where), 'DESCRIPTION:' + esc(details),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Xpressions starts tomorrow', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'xpressions-ximb.ics';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Calendar file downloaded. Open it to add the event.');
    track('add_to_calendar', { method: 'ics' });
  });
})();

/* Visitor counter: +1 on every page open */
(async () => {
  const el = $('#visit-count');
  try {
    const r = await fetch(settings.visitCounter, { cache: 'no-store' });
    const { value } = await r.json();
    if (typeof value !== 'number') throw 0;
    const t0 = performance.now(), from = Math.max(0, value - 40);
    const fmt = n => n.toLocaleString('en-IN');
    const anim = t => { const p = Math.min(1, (t - t0) / 900); el.textContent = fmt(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(anim); };
    reduced ? (el.textContent = fmt(value)) : requestAnimationFrame(anim);
    el.classList.add('on');
  } catch { el.textContent = 'Live soon'; }
})();

async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch { toast(text); }
}
$('#copy-address').addEventListener('click', () => copyText('XIMB, Xavier Square, Jayadev Vihar, Bhubaneswar, Odisha', 'Address copied'));
$$('[data-pending]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast('Official link coming soon'); }));

/* ---------- Interest form ---------- */
const form = $('#interest-form'), err = $('#form-error'), ack = $('#ack');
const gf = settings.googleForm;
const gfReady = /^https:\/\/docs\.google\.com\/forms\/.+\/formResponse$/.test(gf.action) && gf.fields.name && gf.fields.email;
if (/^https:\/\/(forms\.gle\/|docs\.google\.com\/forms\/)/.test(settings.interestFormUrl)) {
  const ext = $('#ext-form');
  ext.href = settings.interestFormUrl; ext.hidden = false;
  ext.addEventListener('click', () => track('register_intent_click', { method: 'google_form_link' }));
}
form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('#f-name'), email = $('#f-email'), college = $('#f-college');
  const interests = $$('input[name=interests]:checked').map(i => i.value);
  [name, email, college].forEach(i => i.classList.remove('bad'));
  let msg = '';
  if (!name.value.trim()) { msg = 'Add your name so we know who to update.'; name.classList.add('bad'); }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { msg = 'Enter a valid email, like you@college.edu.'; email.classList.add('bad'); }
  else if (!college.value.trim()) { msg = 'Add your college or organisation.'; college.classList.add('bad'); }
  else if (!interests.length) msg = 'Pick at least one event you are interested in.';
  err.hidden = !msg; err.textContent = msg;
  if (msg) return;

  track('register_intent_click', { method: 'onsite_form', experiences: interests.join(',') });
  let mode = 'Preview mode: this response is not stored yet. Connect the Google Form in site.js before launch.';
  if (gfReady) {
    const body = new URLSearchParams();
    body.append(gf.fields.name, name.value.trim());
    body.append(gf.fields.email, email.value.trim());
    if (gf.fields.college) body.append(gf.fields.college, college.value.trim());
    if (gf.fields.interests) interests.forEach(v => body.append(gf.fields.interests, v));
    if (gf.fields.sides) [...new Set($$('input[name=interests]:checked').map(i => i.dataset.side))].forEach(v => body.append(gf.fields.sides, v));
    try {
      await fetch(gf.action, { method: 'POST', mode: 'no-cors', body });
      mode = 'We will email updates for: ' + interests.join(', ') + '.';
      track('interest_submit', { experiences: interests.join(',') });
    } catch { mode = 'We could not reach the form. Check your connection and try again.'; }
  }
  $('#ack-name').textContent = name.value.trim().split(' ')[0];
  $('#ack-mode').textContent = mode;
  ack.hidden = false; ack.focus();
});
$('#ack-reset').addEventListener('click', () => { form.reset(); ack.hidden = true; $('#f-name').focus(); });
