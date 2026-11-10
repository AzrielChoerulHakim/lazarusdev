const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)');
const progressEl = $('#progress-fill');
const sceneLabel = $('#scene-num');
const sceneTitle = $('.scene-index > span');
const menuToggle = $('#menu-toggle');
const mobileNav = $('#mobile-nav');
const motionButton = $('#motion-toggle');
const motionLabel = $('#motion-label');
const chapters = ['origin', 'passage', 'worlds', 'practice', 'manifesto', 'contact'].map(id => document.getElementById(id));
let world = null;
let motionEnabled = !prefersReduced.matches;
let tickQueued = false;

function updateScroll() {
  tickQueued = false;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scrollY / max));
  progressEl.style.width = `${progress * 100}%`;
  const passageTop = chapters[1].offsetTop;
  const galleryTop = chapters[2].offsetTop;
  const travel = Math.max(galleryTop + innerHeight * .22 - passageTop * .1, 1);
  const worldProgress = Math.max(0, Math.min(1, scrollY / travel));
  if (world) world.setProgress(prefersReduced.matches ? .04 : worldProgress);
  let current = 0;
  for (let i = 0; i < chapters.length; i++) if (scrollY + innerHeight * .55 >= chapters[i].offsetTop) current = i;
  const labels = ['THE ARRIVAL', 'THE THRESHOLD', 'THE WORLDS', 'THE PRACTICE', 'THE MANIFESTO', 'BEGIN AGAIN'];
  sceneLabel.textContent = `${String(current).padStart(2, '0')} / 05`;
  sceneTitle.textContent = labels[current];
  const showDark = current >= 3 && current <= 3;
  document.querySelector('.scene-index').style.color = showDark ? '#2c3f3b' : '';
}
function onScroll() { if (!tickQueued) { tickQueued = true; requestAnimationFrame(updateScroll); } }
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll, { passive: true });
updateScroll();

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}, { rootMargin: '0px 0px -9% 0px', threshold: .06 });
$$('.reveal').forEach(el => observer.observe(el));
if (prefersReduced.matches) $$('.reveal').forEach(el => el.classList.add('visible'));

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.classList.toggle('open', open);
  mobileNav.inert = !open;
  document.body.classList.toggle('dialog-open', open);
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
$$('a', mobileNav).forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && mobileNav.classList.contains('open')) setMenu(false); });

const projectDialog = $('#project-dialog');
const briefDialog = $('#brief-dialog');
const projects = [
  { title: 'THE ATRIUM', description: 'A conceptual destination for art and architecture. Monumental portals transform navigation into an act of discovery, while carefully staged light and typography make each interaction feel considered.' },
  { title: 'THE ORACLE', description: 'An experimental interface for human-centered intelligence. Information becomes a constellation of connected ideas, guiding people toward understanding without reducing complexity to a dashboard.' },
  { title: 'THE ARCHIVE', description: 'An editorial concept for culture, ideas, and memory. A digital library envisioned as a monumental place rather than an endless feed, where reading feels like exploration.' },
];
$$('[data-project]').forEach(btn => btn.addEventListener('click', () => {
  const i = Number(btn.dataset.project), item = projects[i];
  $('#detail-number').textContent = String(i + 1).padStart(2, '0');
  $('#detail-title').textContent = item.title;
  $('#detail-description').textContent = item.description;
  projectDialog.showModal();
}));
$$('[data-open-brief]').forEach(btn => btn.addEventListener('click', () => {
  if (mobileNav.classList.contains('open')) setMenu(false);
  briefDialog.showModal();
}));
$$('[data-close-dialog]').forEach(btn => btn.addEventListener('click', () => btn.closest('dialog').close()));
$$('dialog').forEach(dialog => {
  dialog.addEventListener('click', e => {
    const rect = dialog.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
  });
});
$('#brief-form').addEventListener('submit', async e => {
  e.preventDefault();
  const d = new FormData(e.currentTarget);
  const text = `LAZARUS DEV — PROJECT BRIEF\n\nName / Studio: ${d.get('name')}\nProject direction: ${d.get('type')}\n\nThe idea:\n${d.get('idea')}\n\nPrepared using the Lazarus Dev website. This has not been submitted.`;
  const feedback = $('#brief-feedback');
  try { await navigator.clipboard.writeText(text); feedback.textContent = 'PROJECT BRIEF COPIED. IT HAS NOT BEEN SENT — SHARE IT THROUGH YOUR CHOSEN CONTACT CHANNEL.'; }
  catch { feedback.textContent = 'CLIPBOARD ACCESS IS UNAVAILABLE. SELECT AND COPY YOUR DETAILS MANUALLY.'; const area = document.createElement('textarea'); area.value = text; area.readOnly = true; area.style.width = '100%'; area.rows = 8; feedback.replaceChildren(area); area.select(); }
});
$('#year').textContent = String(new Date().getFullYear());

function setMotion(enabled) {
  motionEnabled = enabled && !prefersReduced.matches;
  motionButton.setAttribute('aria-pressed', String(!motionEnabled));
  motionButton.setAttribute('aria-label', motionEnabled ? 'Pause environmental motion' : 'Resume environmental motion');
  motionLabel.textContent = motionEnabled ? 'MOTION ON' : 'MOTION PAUSED';
  world?.setMotion(motionEnabled);
}
motionButton.addEventListener('click', () => setMotion(!motionEnabled));
if (prefersReduced.matches) { setMotion(false); motionButton.disabled = true; }
prefersReduced.addEventListener('change', e => { setMotion(!e.matches); onScroll(); });

let pointerQueued = false;
let pointerX = 0, pointerY = 0;
addEventListener('pointermove', e => {
  if (!world || !motionEnabled) return;
  pointerX = (e.clientX / innerWidth - .5) * 2;
  pointerY = (e.clientY / innerHeight - .5) * 2;
  if (!pointerQueued) requestAnimationFrame(() => { pointerQueued = false; world?.setPointer(pointerX, -pointerY); });
  pointerQueued = true;
}, { passive: true });

const canvas = $('#world');
try {
  const { createWorld } = await import('./world.js');
  world = createWorld(canvas);
  if (!world) canvas.style.display = 'none';
  else { setMotion(motionEnabled); updateScroll(); }
} catch (error) {
  console.warn('3D enhancement unavailable; retaining the editorial experience.', error);
  canvas.style.display = 'none';
  motionButton.disabled = true;
  motionLabel.textContent = 'STATIC MODE';
}
