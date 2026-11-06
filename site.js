/* Xpressions microsite | Group 4
   Fill these in before launch. Everything else works without them. */
const settings = {
  measurementId: '',          // GA4 web stream ID, e.g. 'G-ABC123XYZ'
  interestFormUrl: '',        // Optional public Google Form link (forms.gle/... or docs.google.com/forms/...)
  googleForm: {               // Optional: send the on-page form straight into Google Forms
    action: '',               // https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
    fields: { name: '', email: '', college: '', interests: '' }, // entry.123456 IDs from a prefilled link
  },
  festStart: '',              // Confirmed start, e.g. '2026-12-12T09:00:00+05:30'. Starts the countdown.
  festDays: 3,
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

/* ---------- Hero slideshow: each image breaks along the X seam into the next ---------- */
// Add your own images here. Each slide's caption (top + bottom) and label change with the image.
// position = CSS background-position to keep the face in frame, e.g. '50% 30%'.
const heroSlides = [
  { image: 'assets/hero.webp',   position: '50% 30%', top: 'Good with numbers.',      bottom: 'Better with a chorus.',   label: 'ONE PERSON. DIFFERENT SIDES.' },
  { image: 'assets/singer.webp', position: '55% 35%', top: 'Sharp in the case room.', bottom: 'Louder on the stage.',    label: 'MY STAGE SIDE' },
  { image: 'assets/crowd.webp',  position: '50% 50%', top: 'Calm at the buzzer.',     bottom: 'Wild in the crowd.',      label: 'MY CROWD SIDE' },
];
const SLIDE_MS = 6000;

const art = $('#hero-art'), mover = $('.art-move', art);
const under = $('.under', art), halfA = $('.half-a', art), halfB = $('.half-b', art), rift = $('.rift', art);
const swap = $('#hero-caption'), dotsWrap = $('#slide-dots');
const countEl = $('#slide-count'), labelEl = $('#slide-label');
let cur = 0, busy = false, timer = null, paused = false;

const paint = (el, s) => { el.style.backgroundImage = `url("${s.image}")`; el.style.backgroundPosition = s.position || '50% 30%'; };
const preload = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = src; });
heroSlides.forEach(s => preload(s.image));
[under, halfA, halfB].forEach(el => paint(el, heroSlides[0]));

dotsWrap.innerHTML = heroSlides.map((s, i) => `<button role="tab" aria-label="Show image ${i + 1}: ${s.label}" aria-selected="${i === 0}"></button>`).join('');
const dots = $$('button', dotsWrap);
dotsWrap.style.setProperty('--dur', SLIDE_MS + 'ms');
if (heroSlides.length < 2) $('#slide-ui').hidden = true;

function setCaption(s, i) {
  swap.classList.add('out');
  labelEl.style.opacity = 0;
  setTimeout(() => {
    $('.swap-a', swap).textContent = s.top;
    $('.swap-b', swap).textContent = s.bottom;
    labelEl.textContent = s.label;
    countEl.textContent = `${String(i + 1).padStart(2, '0')} / ${String(heroSlides.length).padStart(2, '0')}`;
    swap.classList.remove('out');
    labelEl.style.opacity = 1;
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

async function go(n) {
  if (busy || heroSlides.length < 2) return;
  n = (n + heroSlides.length) % heroSlides.length;
  if (n === cur) return;
  busy = true;
  const next = heroSlides[n];
  await preload(next.image);
  paint(under, next);
  setCaption(next, n);
  setDots(n);

  if (reduced) {
    [halfA, halfB].forEach(el => paint(el, next));
  } else {
    const ease = 'cubic-bezier(.7,0,.2,1)';
    under.animate([{ transform: 'scale(1.14)', filter: 'brightness(1.6) saturate(1.3)' }, { transform: 'scale(1)', filter: 'none' }], { duration: 1500, easing: 'cubic-bezier(.2,.8,.2,1)' });
    rift.animate([{ '--w': '0%', opacity: 0 }, { '--w': '1%', opacity: 1, offset: .15 }, { '--w': '9%', opacity: .9, offset: .55 }, { '--w': '16%', opacity: 0 }], { duration: 1300, easing: 'ease-out' });
    // Crack: a tiny shudder, then the two sides tear apart along the seam.
    const tearA = [{ transform: 'none', opacity: 1 }, { transform: 'translate(-.4%,.2%)', opacity: 1, offset: .12 }, { transform: 'translate(-.2%,.1%)', opacity: 1, offset: .2 }, { transform: 'translate(-22%,9%) rotate(-2deg)', opacity: 0 }];
    const tearB = [{ transform: 'none', opacity: 1 }, { transform: 'translate(.4%,-.2%)', opacity: 1, offset: .12 }, { transform: 'translate(.2%,-.1%)', opacity: 1, offset: .2 }, { transform: 'translate(22%,-9%) rotate(2deg)', opacity: 0 }];
    setTimeout(() => window.heroBurst?.(), 180);
    await Promise.all([
      halfA.animate(tearA, { duration: 1200, easing: ease, fill: 'forwards' }).finished,
      halfB.animate(tearB, { duration: 1200, easing: ease, fill: 'forwards' }).finished,
    ]);
    [halfA, halfB].forEach(el => { paint(el, next); el.getAnimations().forEach(a => a.cancel()); });
  }
  cur = n;
  busy = false;
  schedule();
}
dots.forEach((d, i) => d.addEventListener('click', () => { go(i); }));
dotsWrap.addEventListener('pointerenter', () => { paused = true; dotsWrap.classList.add('paused'); clearTimeout(timer); });
dotsWrap.addEventListener('pointerleave', () => { paused = false; dotsWrap.classList.remove('paused'); schedule(); });
document.addEventListener('visibilitychange', () => { document.hidden ? clearTimeout(timer) : schedule(); });
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
    const hr = hero.getBoundingClientRect(), ar = art.getBoundingClientRect(), mr = mover.getBoundingClientRect();
    const x1 = mr.left - hr.left + mr.width * .30, y1 = mr.top - hr.top;
    const x2 = mr.left - hr.left + mr.width * .62, y2 = mr.top - hr.top + mr.height;
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
  $('#date-label').textContent = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
const checklists = {
  compete: ['Eligibility', 'Team size', 'Format & rounds', 'Judging criteria', 'Fees & deadlines'],
  perform: ['Solo / team format', 'Selection process', 'Performance duration', 'Equipment', 'Reporting time'],
  watch: ['Confirmed lineup', 'Timings', 'Pass availability & price', 'ID & entry rules'],
  'give-back': ['Activity & cause', 'Eligibility', 'Time commitment', 'How to join'],
};
const sideLabel = { compete: 'Compete', perform: 'Perform', watch: 'Watch', 'give-back': 'Give back' };
const events = [
  { side: 'compete', cat: 'Case & simulation', name: 'J.O.A.T.', blurb: 'Think fast. Make your case.', img: 'assets/case.webp', tag: 'PREVIOUS EDITION', desc: 'A jack-of-all-trades challenge across business functions. Teams work through cases and simulations under time pressure.' },
  { side: 'compete', cat: 'Quiz', name: 'Inquizzitive', blurb: 'Bring your curiosity to the buzzer.', img: 'assets/quiz.webp', tag: 'PREVIOUS EDITION', desc: 'Business, brands and general knowledge across rapid rounds. Format for this edition is TBA.' },
  { side: 'compete', cat: 'Trading simulation', name: 'Trade Wars', blurb: 'Put your market instincts to work.', img: 'assets/trade.webp', tag: 'PREVIOUS EDITION', desc: 'A simulated market where teams build and manage a portfolio as news breaks.' },
  { side: 'compete', cat: 'More challenges', name: 'Functional Events', blurb: 'Marketing, finance and HR challenges.', tag: 'TBA', desc: 'Additional management competitions will be listed here once the organising team confirms them.' },
  { side: 'perform', cat: 'Music', name: 'Battle of Sound', blurb: 'Solo voices and full bands.', img: 'assets/singer.webp', tag: 'TENTATIVE', desc: 'An intercollege music stage for solo artists and bands. Event name and format are placeholders.' },
  { side: 'perform', cat: 'Dance', name: 'Dance Off', blurb: 'Solo, duet and crew formats.', img: 'assets/poster-stage.webp', tag: 'TENTATIVE', desc: 'Take the floor in solo or crew categories. Event name and format are placeholders.' },
  { side: 'perform', cat: 'Theatre', name: 'Stage & Street', blurb: 'Stage plays and street theatre.', tag: 'TENTATIVE', ph: '◐', desc: 'Short plays and nukkad natak performances. Event name and format are placeholders.' },
  { side: 'perform', cat: 'Open mic', name: 'Open Mic', blurb: 'Poetry, stand-up and storytelling.', tag: 'TENTATIVE', ph: '◎', desc: 'An open stage for spoken word, comedy and storytelling. Event name and format are placeholders.' },
  { side: 'watch', cat: 'Headline night', name: 'Pro Night', blurb: 'Live headline performance.', img: 'assets/crowd.webp', tag: 'ARTIST TBA', hot: true, desc: 'The headline act of the fest. Artist, timings and pass details will be announced.' },
  { side: 'watch', cat: 'Speakers', name: 'Speaker Sessions', blurb: 'Conversations with industry leaders.', tag: 'SPEAKERS TBA', ph: '“', desc: 'Talks and panels with leaders from business and the creative industry. Speakers will be announced after confirmation.' },
  { side: 'watch', cat: 'Attractions', name: 'Fest Zone', blurb: 'Food stalls, games and pop-ups.', ph: '✕', tag: 'TENTATIVE', desc: 'Stalls, games and hangout spaces across campus. Final attractions are TBA.' },
  { side: 'give-back', cat: 'Volunteer', name: 'Fest Crew', blurb: 'Help run the festival.', tag: 'TENTATIVE', ph: '+', desc: 'Volunteer with hospitality, events or operations. Roles will be listed if confirmed by the organisers.' },
  { side: 'give-back', cat: 'Social cause', name: 'Cause Drive', blurb: 'Give time to a cause.', tag: 'CAUSE TBA', ph: '♥', desc: 'A social initiative run alongside the fest. Partner cause and activity are TBA.' },
];
const grid = $('#event-grid'), note = $('#tab-note');
function media(ev) {
  return ev.img ? `<img src="${ev.img}" alt="" loading="lazy">` : `<div class="ph-art">${ev.ph || 'X'}<small>IMAGE PLACEHOLDER</small></div>`;
}
function render(side) {
  const list = side === 'all' ? events : events.filter(e => e.side === side);
  grid.innerHTML = list.map((ev, i) => `
    <button class="ev" data-i="${events.indexOf(ev)}" style="animation-delay:${i * 55}ms">
      <div class="ev-media">${media(ev)}<span class="tag${ev.hot ? ' hot' : ''}">${ev.tag}</span></div>
      <div class="ev-body"><small>${sideLabel[ev.side]} · ${ev.cat}</small><h3>${ev.name}</h3><p>${ev.blurb}</p>
      <div class="ev-more">Before you commit <span aria-hidden="true">+</span></div></div>
    </button>`).join('');
}
render('all');
$$('.tabs [role=tab]').forEach(tab => tab.addEventListener('click', () => {
  $$('.tabs [role=tab]').forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  const side = tab.dataset.side;
  render(side);
  const n = side === 'all' ? events.length : events.filter(e => e.side === side).length;
  note.textContent = side === 'all'
    ? 'Showing all experiences. Every listing is tentative until the organising team confirms it.'
    : `${n} ${sideLabel[side].toLowerCase()} experiences. Details are tentative until confirmed.`;
  if (side !== 'all') track('experience_select', { experience: side });
}));

/* Modal */
const modal = $('#modal');
let lastFocus, modalSide;
grid.addEventListener('click', e => {
  const card = e.target.closest('.ev');
  if (!card) return;
  const ev = events[card.dataset.i];
  modalSide = ev.side;
  lastFocus = card;
  $('#m-media').innerHTML = media(ev);
  $('#m-cat').textContent = `${sideLabel[ev.side]} · ${ev.cat}`;
  $('#m-title').textContent = ev.name;
  $('#m-desc').textContent = ev.desc;
  $('#m-list').innerHTML = checklists[ev.side].map(k => `<dt>${k}</dt><dd>TBA</dd>`).join('');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.modal-x', modal).focus();
  track('event_open', { event_name: ev.name, experience: ev.side });
});
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); }
$$('[data-close]', modal).forEach(b => b.addEventListener('click', closeModal));
$('#m-cta').addEventListener('click', () => {
  closeModal();
  const box = document.getElementById('i-' + modalSide);
  if (box) box.checked = true;
  setTimeout(() => $('#f-name').focus({ preventScroll: true }), 700);
});

/* ---------- Highlights ---------- */
const vid = $('.tile-video video'), vbtn = $('.vid-toggle');
if (reduced) { vid.pause(); vid.removeAttribute('autoplay'); vbtn.textContent = '▶'; vbtn.setAttribute('aria-label', 'Play video'); }
vbtn.addEventListener('click', () => {
  if (vid.paused) { vid.play(); vbtn.textContent = '❚❚'; vbtn.setAttribute('aria-label', 'Pause video'); }
  else { vid.pause(); vbtn.textContent = '▶'; vbtn.setAttribute('aria-label', 'Play video'); }
});
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
  [['Morning', 'Inauguration', 'Opening ceremony and welcome for visiting teams.'],
   ['Late morning', 'Competition preliminaries', 'Opening rounds for case, quiz and trading events.'],
   ['Afternoon', 'Speaker session', 'Talk or panel with industry guests (speakers TBA).'],
   ['Evening', 'Opening night', 'First cultural performances on the main stage.']],
  [['Morning', 'Competition semi-finals', 'Shortlisted teams move to the next round.'],
   ['Afternoon', 'Perform: music & dance', 'Intercollege music and dance events.'],
   ['All day', 'Fest Zone', 'Food stalls, games and pop-ups across campus.'],
   ['Evening', 'Cultural night', 'Theatre, open mic and performances.']],
  [['Morning', 'Competition finals', 'Final presentations and rounds.'],
   ['Afternoon', 'Prize distribution', 'Results and awards across events.'],
   ['Evening', 'Pro Night', 'Headline performance to close the fest (artist TBA).']],
];
const tl = $('#timeline');
function renderDay(d) {
  tl.style.setProperty('--fill', '0%');
  tl.innerHTML = days[d].map((s, i) => `<li style="animation-delay:${i * 80}ms"><time>${s[0]} · time TBA</time><h4>${s[1]}</h4><p>${s[2]}</p></li>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => tl.style.setProperty('--fill', '100%')));
}
renderDay(0);
$$('.day-tabs [role=tab]').forEach(b => b.addEventListener('click', () => {
  $$('.day-tabs [role=tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  renderDay(+b.dataset.day);
}));

const calBtn = $('#cal-btn');
if (start && !isNaN(start)) {
  calBtn.disabled = false;
  calBtn.nextElementSibling.hidden = true;
  calBtn.addEventListener('click', () => {
    const f = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(start.getTime() + settings.festDays * 86400000);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Xpressions//EN', 'BEGIN:VEVENT', 'UID:xpressions-' + start.getTime() + '@ximb',
      'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(start), 'DTEND:' + f(end), 'SUMMARY:Xpressions at XIMB', 'LOCATION:XIMB\\, Xavier Square\\, Bhubaneswar', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'xpressions.ics'; a.click();
    track('add_to_calendar');
  });
}

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
  else if (!interests.length) msg = 'Pick at least one experience you are interested in.';
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
