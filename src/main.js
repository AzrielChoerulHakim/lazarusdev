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
const portalButton = $('#portal-enter');
const portalLayer = $('#portal-transition');
const chapters = ['origin', 'passage', 'worlds', 'practice', 'manifesto', 'contact'].map(id => document.getElementById(id));
let world = null;
let motionEnabled = !prefersReduced.matches;
let tickQueued = false;

// Scroll is the single source of truth. The previous three smoothstep curves
// stopped the camera's velocity at EVERY section boundary; compounded with a
// second camera lerp and global CSS smooth scrolling, it felt like the page
// grabbed the wheel and then jolted forward.
let bounds = null;
let previousWidth = innerWidth;
let previousHeight = innerHeight;
function measureChapters() {
  bounds = {
    passage: chapters[1].offsetTop,
    worlds: chapters[2].offsetTop,
    practice: chapters[3].offsetTop,
    positions: chapters.map(el => el.offsetTop),
    pageHeight: Math.max(1,document.documentElement.scrollHeight),
    height: Math.max(1,innerHeight),
  };
}
measureChapters();
const clamp01 = x => Math.max(0, Math.min(1, x));
function worldProgressForScroll(y) {
  if (!bounds) measureChapters();
  // Linear, continuous travel; the Hermite camera spline provides its own
  // smooth change of direction, without repeated stop-start easing.
  if (y <= bounds.passage) return .46 * clamp01(y / Math.max(1,bounds.passage));
  if (y <= bounds.worlds) return .46 + .36 * clamp01((y-bounds.passage)/Math.max(1,bounds.worlds-bounds.passage));
  return .82 + .18 * clamp01((y-bounds.worlds)/Math.max(1,bounds.practice-bounds.worlds));
}
function updateScroll() {
  tickQueued = false;
  const y = Math.max(0,scrollY);
  const progress=clamp01(y/Math.max(1,bounds.pageHeight-bounds.height));
  progressEl.style.transform = `scaleX(${progress})`;
  world?.setProgress(prefersReduced.matches ? .04 : worldProgressForScroll(y));
  let current=0;
  for(let i=0;i<bounds.positions.length;i++) {
    if(y+bounds.height*.55>=bounds.positions[i])current=i;
  }
  const labels=['THE ARRIVAL','THE THRESHOLD','THE WORLDS','THE PRACTICE','THE MANIFESTO','BEGIN AGAIN'];
  sceneLabel.textContent=`${String(current).padStart(2,'0')} / 05`;
  sceneTitle.textContent=labels[current];
  document.querySelector('.scene-index').style.color=current===3?'#2c3f3b':'';
}
function onScroll() {
  // Update the camera target directly from the native scroll event. Only
  // DOM progress furniture waits for RAF; no extra frame of perceived lag.
  world?.setProgress(prefersReduced.matches ? .04 : worldProgressForScroll(Math.max(0,scrollY)));
  if (!tickQueued) {
    tickQueued=true;
    requestAnimationFrame(updateScroll);
  }
}
function onLayoutChange() {
  // Mobile browser bars change innerHeight while the visitor scrolls. Treat
  // those small height-only "resizes" as browser chrome, not as a scene edit.
  // This prevents the scroll->camera mapping from oscillating mid-gesture.
  const changeWidth=Math.abs(innerWidth-previousWidth);
  const changeHeight=Math.abs(innerHeight-previousHeight);
  if(changeWidth<3 && innerWidth<700 && changeHeight<155)return;
  previousWidth=innerWidth;previousHeight=innerHeight;
  measureChapters();onScroll();
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onLayoutChange,{passive:true});
addEventListener('orientationchange',()=>{measureChapters();onScroll()},{passive:true});
addEventListener('load',()=>{measureChapters();onScroll()},{once:true});
document.fonts?.ready?.then(()=>{measureChapters();onScroll()});
window.__lazarusScrollDebug=()=>({y:scrollY,progress:worldProgressForScroll(Math.max(0,scrollY)),bounds});
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

// A guided, real camera passage, not a CSS zoom imitation. The destination
// is updated only after the camera crosses the modeled stone opening.
let portalBusy = false;
portalButton.addEventListener('click', () => {
  if (portalBusy) return;
  if (!world || prefersReduced.matches) {
    window.location.hash = 'worlds';
    return;
  }
  portalBusy = true;
  portalButton.disabled = true;
  portalButton.setAttribute('aria-busy', 'true');
  portalLayer.classList.add('is-active');
  portalLayer.classList.remove('is-exiting');
  portalLayer.style.opacity = '0';

  const finish = () => {
    // Reaching the threshold is the only point where navigation jumps. The
    // bone-colored light briefly hides the cut, then reveals Selected Worlds.
    portalLayer.style.opacity = '1';
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: chapters[2].offsetTop, behavior: 'instant' });
    history.replaceState(null, '', '#worlds');
    updateScroll();
    document.documentElement.style.scrollBehavior = '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      portalLayer.classList.add('is-exiting');
      portalLayer.style.opacity = '0';
    }));
    const restore = () => {
      portalLayer.classList.remove('is-active', 'is-exiting');
      portalButton.disabled = false;
      portalButton.removeAttribute('aria-busy');
      portalBusy = false;
    };
    // A browser can skip transitionend when frames are throttled or motion
    // preferences change. The button must always become usable again.
    let restored = false;
    const restoreOnce = () => {
      if (restored) return;
      restored = true;
      portalLayer.removeEventListener('transitionend', onTransitionEnd);
      restore();
    };
    const onTransitionEnd = e => {
      if (e.target === portalLayer && e.propertyName === 'opacity') restoreOnce();
    };
    portalLayer.addEventListener('transitionend', onTransitionEnd);
    setTimeout(restoreOnce, 1150);
  };
  const started = world.enterPortal(
    t => { portalLayer.style.opacity = String(Math.max(0, Math.min(1, (t - .69) / .30)) ** 1.5); },
    finish,
  );
  if (!started) {
    portalBusy = false;
    portalButton.disabled = false;
    portalButton.removeAttribute('aria-busy');
    portalLayer.classList.remove('is-active');
  }
});

const canvas = $('#world');
try {
  const { createWorld } = await import('./world.js');
  world = createWorld(canvas);
  if (!world) canvas.style.display = 'none';
  else {
    window.__lazarusDebug = () => world?.debug();
    setMotion(motionEnabled);
    updateScroll();
  }
} catch (error) {
  console.warn('3D enhancement unavailable; retaining the editorial experience.', error);
  canvas.style.display = 'none';
  motionButton.disabled = true;
  motionLabel.textContent = 'STATIC MODE';
}
