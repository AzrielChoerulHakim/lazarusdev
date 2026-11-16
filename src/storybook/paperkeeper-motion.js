/** Stage 11 — small, finite Paperkeeper acting beats, built from canonical Stage 05 art.
 * No artificial rig, no autoplay, no infinite loop, no scroll interception.
 * Three real distinct drawing keys at a deliberately modest 10 updates/second.
 */
const reel = document.querySelector('[data-paperkeeper-walk]');
const trigger = document.querySelector('[data-paperkeeper-step]');
const status = document.getElementById('paperkeeper-step-status');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const poseNames = ['paperkeeper.walk-a.webp', 'paperkeeper.walk-b.webp', 'paperkeeper.walk-c.webp'];
const sequence = [0,1,2,1,0,1,2,1,0,0];
let timer = 0;
let index = 0;
let ready = false;
let houseTimer = 0;

if (reel && trigger && status) {
  const base = new URL(reel.getAttribute('src'), document.baseURI).href.replace(/[^/]+$/, '');
  const urls = poseNames.map(name => base + name);
  const updateAvailability = () => {
    trigger.hidden = !ready || reduced.matches;
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
