// ---------------------------------------------------------------------------
// Section paging (desktop) / scroll-to-section (mobile). Home page only.
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
