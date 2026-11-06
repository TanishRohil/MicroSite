// Fill in the confirmed Google Form URL and your GA4 measurement ID before launch.
const settings = {
  interestFormUrl: '',
  measurementId: '',
};

if (/^G-[A-Z0-9]+$/.test(settings.measurementId)) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', settings.measurementId);
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + settings.measurementId;
  document.head.append(tag);
}

const experiences = {
  compete: ['Put your ideas to the test.', 'Explore business challenges, quizzes and simulations. Eligibility, team size, fees and deadlines will be shared once confirmed.'],
  perform: ['Take your talent to the stage.', 'Explore performance opportunities. Solo and team formats, selection criteria and equipment details are TBA.'],
  watch: ['Come for the live experience.', 'Look out for performance announcements, timings and entry information once the programme is confirmed.'],
  'give-back': ['Find a way to contribute.', 'Volunteer and other ways to help will be listed here if confirmed by the organisers.'],
};
const choices = [...document.querySelectorAll('[data-side]')];
const detail = document.querySelector('#side-detail');
for (const choice of choices) {
  choice.addEventListener('click', () => {
    const side = choice.dataset.side;
    for (const button of choices) button.setAttribute('aria-pressed', String(button === choice));
    const [title, description] = experiences[side];
    detail.querySelector('h3').textContent = title;
    detail.querySelector('p').textContent = description;
    window.gtag?.('event', 'experience_select', { experience: side });
  });
}

if (/^https:\/\/(forms\.gle\/|docs\.google\.com\/forms\/)/.test(settings.interestFormUrl)) {
  const formLink = document.querySelector('#interest-form');
  formLink.href = settings.interestFormUrl;
  formLink.hidden = false;
  document.querySelector('#interest-status').textContent = 'Share your interest in attending or participating in Xpressions.';
  formLink.addEventListener('click', () => window.gtag?.('event', 'register_intent_click'));
}
for (const link of document.querySelectorAll('a[href="#interest"]')) {
  link.addEventListener('click', () => window.gtag?.('event', 'interest_section_click'));
}
