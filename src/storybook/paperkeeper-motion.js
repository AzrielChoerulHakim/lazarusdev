/**
 * R12: Canonical Paperkeeper walking studies play upon entering the page.
 * Three genuinely drawn frames; no opt-in button, CSS puppet or infinite loop.
 */
const reel = document.querySelector('[data-paperkeeper-walk]');
const poses = reel ? [reel, ...document.querySelectorAll('[data-paperkeeper-pose]')] : [];
const status = document.getElementById('paperkeeper-step-status');
if (reel && poses.length === 3) {
  const urls = poses.map(el => new URL(el.getAttribute('src'), document.baseURI).href);
  let preparing = false, played = false, timer = 0;
  let progress = 0;
  const sequence = [0, 1, 2, 1, 0, 1, 2, 1, 0, 0];
  const withinView = () => {
    const r = reel.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0;
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = 0;
    reel.src = urls[0];
    reel.dataset.motionState = 'complete';
    played = true;
  };
  async function playWhenVisible() {
    if (played || preparing || timer || document.hidden || !withinView()) return;
    preparing = true;
    try {
      await Promise.all(urls.map(async src => {
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
        await image.decode();
      }));
    } catch {
      reel.dataset.motionState = 'unavailable';
      preparing = false;
      played = true;
      return;
    }
    preparing = false;
    if (!withinView() || document.hidden || played) return;
    reel.dataset.motionState = 'playing';
    reel.dataset.autoPlayed = 'true';
    if (status) status.textContent = 'Paperkeeper is following the winding path.';
    progress = 0;
    timer = setInterval(() => {
      reel.src = urls[sequence[progress++]];
      if (progress >= sequence.length) stop();
    }, 100);
  }
  reel.dataset.motionState = 'idle';
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) void playWhenVisible();
      if (played) observer.disconnect();
    }, { threshold: [0, .25] })
    : null;
  observer?.observe(reel);
  addEventListener('scroll', playWhenVisible, { passive: true });
  addEventListener('pageshow', playWhenVisible);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) stop();
    else if (!document.hidden) void playWhenVisible();
  });
  addEventListener('pagehide', () => { if (timer) stop(); }, { once: true });
  requestAnimationFrame(playWhenVisible);
}
