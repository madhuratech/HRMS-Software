const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressFill = document.getElementById('progress');
const currentSlideEl = document.getElementById('current-slide');
const totalSlidesEl = document.getElementById('total-slides');
const thumbnailStrip = document.getElementById('thumbnails');

const TOTAL = slides.length;
totalSlidesEl.textContent = TOTAL;
let current = 0;

// ─── Generate Thumbnails ───
const thumbLabels = [
  'Title', 'Problem', 'Architecture', 'Recruitment',
  'Onboarding', 'Attendance', 'Payroll', 'Performance',
  'Documents', 'Separation', 'Summary'
];

thumbLabels.forEach((label, i) => {
  const thumb = document.createElement('div');
  thumb.className = `thumb ${i === 0 ? 'active-thumb' : ''}`;
  thumb.innerHTML = `<span>${i + 1}<br><span style="font-size:8px; font-weight:500; opacity:0.6">${label}</span></span>`;
  thumb.style.width = '72px';
  thumb.addEventListener('click', () => goTo(i));
  thumbnailStrip.appendChild(thumb);
});

function updateUI() {
  // Slides
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
  });

  // Thumbnails
  document.querySelectorAll('.thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active-thumb', i === current);
  });

  // Scroll active thumb into view
  const activeThumb = document.querySelectorAll('.thumb')[current];
  if (activeThumb) {
    activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Counter
  currentSlideEl.textContent = current + 1;

  // Progress
  const pct = ((current + 1) / TOTAL) * 100;
  progressFill.style.width = pct + '%';

  // Nav buttons
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === TOTAL - 1;
}

function goTo(index) {
  if (index < 0 || index >= TOTAL) return;
  current = index;
  updateUI();
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

// ─── Event Listeners ───
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  if (e.key === 'End') { e.preventDefault(); goTo(TOTAL - 1); }
  // Number keys 1-9
  const num = parseInt(e.key);
  if (!isNaN(num) && num >= 1 && num <= TOTAL) goTo(num - 1);
});

// ─── Touch/Swipe Support ───
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
});

// Init
updateUI();
