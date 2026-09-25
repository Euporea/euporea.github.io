// ---------------------------------------------------------------------------
// Section paging (desktop) / scroll-to-section (mobile)
// ---------------------------------------------------------------------------

const sections = [...document.querySelectorAll('main section')];
const navButtons = [...document.querySelectorAll('.side-nav button')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let current = 0;

// Below 48rem the CSS shows every section and the page scrolls normally.
const isMobile = () => window.matchMedia('(max-width: 48rem)').matches;

function show(index) {
  current = index;
  sections.forEach((s, i) => s.classList.toggle('active', i === index));
  navButtons.forEach((b, i) => b.classList.toggle('active', i === index));
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === sections.length - 1;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Cross-fade between sections with the browser's View Transitions API;
// browsers without it just swap instantly.
function go(index) {
  index = Math.max(0, Math.min(sections.length - 1, index));
  if (index === current) return;
  if (document.startViewTransition) document.startViewTransition(() => show(index));
  else show(index);
}

prevBtn.addEventListener('click', () => go(current - 1));
nextBtn.addEventListener('click', () => go(current + 1));

navButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (isMobile()) sections[index].scrollIntoView({ behavior: 'smooth' });
    else go(index);
  });
});

// On mobile, highlight whichever section is centred in the viewport while scrolling.
const scrollObserver = new IntersectionObserver(
  (entries) => {
    if (!isMobile()) return;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navButtons.forEach((b, i) => b.classList.toggle('active', sections[i] === entry.target));
    });
  },
  { rootMargin: '-45% 0px -45% 0px' }
);
sections.forEach((s) => scrollObserver.observe(s));

show(0);

document.getElementById('year').textContent = new Date().getFullYear();


// ---------------------------------------------------------------------------
// Card tilt: rotate toward the cursor, like tilting a physical card
// ---------------------------------------------------------------------------

function attachTilt(el, strength = 10) {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateY(-3px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
}

document.querySelectorAll('.card').forEach((card) => attachTilt(card));
attachTilt(document.querySelector('.about-grid'), 3);


// ---------------------------------------------------------------------------
// Project popup
//
// Each .proj-card holds its own <template> with the extra detail (screenshot,
// chips, link). The popup is built from the card's title and blurb plus that
// template. <dialog> handles Esc and focus for us.
// ---------------------------------------------------------------------------

const lightbox = document.getElementById('lightbox');
const lightboxContent = lightbox.querySelector('.lightbox-content');

function openLightbox(card) {
  const details = card.querySelector('template').content.cloneNode(true);
  lightboxContent.replaceChildren(
    details.querySelector('.shot'),
    card.querySelector('h3').cloneNode(true),
    card.querySelector('p').cloneNode(true),
    details // whatever is left: extra text, chips, link
  );
  lightbox.showModal();
  lightboxContent.querySelector('video')?.play();
}

document.querySelectorAll('.proj-card').forEach((card) => {
  card.addEventListener('click', () => openLightbox(card));
});

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
// the <dialog> has no padding, so a click whose target is the dialog itself hit the backdrop
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});
// stop any video when the popup closes
lightbox.addEventListener('close', () => lightboxContent.replaceChildren());
