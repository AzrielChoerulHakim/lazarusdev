/** Stage 11 — small, finite Paperkeeper acting beats, built from canonical Stage 05 art.
 * No artificial rig, no autoplay, no infinite loop, no scroll interception.
 * Three real distinct drawing keys at a deliberately modest 10 updates/second.
 */
const reel = document.querySelector('[data-paperkeeper-walk]');
const trigger = document.querySelector('[data-paperkeeper-step]');
const status = document.getElementById('paperkeeper-step-status');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
// All three URLs originate in real <img src> markup so Vite can hash each asset.
const poseImages = reel ? [reel, ...document.querySelectorAll('[data-paperkeeper-pose]')] : [];
const sequence = [0,1,2,1,0,1,2,1,0,0];
let timer = 0;
let index = 0;
let ready = false;
let houseTimer = 0;

if (reel && trigger && status) {
  const urls = poseImages.map(image => new URL(image.getAttribute('src'), document.baseURI).href);
  if (urls.length !== 3) throw new Error('Paperkeeper motion requires exactly three canonical pose assets.');
  const updateAvailability = () => {
    trigger.hidden = !ready || reduced.matches;
    // Inline default is hidden for no-JS; only an actual ready script may reveal it.
    trigger.style.display = (!ready || reduced.matches) ? 'none' : '';
    if (reduced.matches) status.textContent = 'Still illustration shown. Motion is disabled by your device preferences.';
  };
  const end = (completed) => {
    if (timer) window.clearInterval(timer);
    timer = 0;
    index = 0;
    reel.src = urls[0];
    trigger.disabled = false;
    reel.dataset.motionState = completed ? 'complete' : 'idle';
    status.textContent = completed
      ? 'Paperkeeper took a small step. Replay it whenever you like.'
      : 'The Paperkeeper sketch is at rest.';
  };
  const preload = urls.map(url => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  }));
  reel.dataset.motionState = 'idle';
  Promise.all(preload).then(() => {
    ready = true;
    updateAvailability();
  }).catch(() => {
    trigger.hidden = true;
    trigger.style.display = 'none';
    status.textContent = 'The motion frames are unavailable; the still character remains visible.';
  });
  trigger.addEventListener('click', () => {
    if (!ready || reduced.matches || timer) return;
    index = 0;
    reel.dataset.motionState = 'playing';
    trigger.disabled = true;
    status.textContent = 'Paperkeeper is taking one small, hand-drawn-style step.';
    timer = window.setInterval(() => {
      reel.src = urls[sequence[index]];
      index += 1;
      if (index === sequence.length) end(true);
    }, 100);
  });
  reduced.addEventListener?.('change', () => {
    if (reduced.matches && timer) end(false);
    updateAvailability();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) end(false);
  });
}

/* One light-press = one quiet lantern acknowledgment; a still pose afterwards. */
const lanternButton = document.querySelector('[data-house-light-toggle]');
const houseKeeper = document.querySelector('.house-paperkeeper');
if (lanternButton && houseKeeper) {
  lanternButton.addEventListener('click', () => {
    if (reduced.matches) return;
    if (houseTimer) window.clearTimeout(houseTimer);
    houseKeeper.classList.remove('keeper-acknowledging');
    // Restart only from an explicit repeated click, not with a background loop.
    void houseKeeper.offsetWidth;
    houseKeeper.classList.add('keeper-acknowledging');
    houseTimer = window.setTimeout(() => {
      houseKeeper.classList.remove('keeper-acknowledging');
      houseTimer = 0;
    }, 480);
  });
  reduced.addEventListener?.('change', () => {
    if (reduced.matches) {
      if (houseTimer) window.clearTimeout(houseTimer);
      houseTimer = 0;
      houseKeeper.classList.remove('keeper-acknowledging');
    }
  });
}
