/**
 * R12: Storybook motion is part of the reading experience, not an opt-in UI.
 * Both canonical R03 Paperkeeper drawings perform once when physically visible:
 * at the gateway, and again inside the atlas. Opening the atlas still responds
 * with its natural acknowledgment, but never gates the first motion.
 */
import { createEntranceActing } from './entrance-acting.js';

function mountInView(image) {
  if (!image) return null;
  const acting = createEntranceActing(image, { alwaysAnimate: true });
  let played = false;
  let allowStart = false;
  let preparing = false;
  let scheduled = false;
  const hasView = () => {
    const box = image.getBoundingClientRect();
    const overlap = Math.max(0, Math.min(innerHeight, box.bottom) - Math.max(0, box.top));
    return box.width > 0 && box.height > 0 && overlap >= Math.min(box.height * .24, 60)
      && box.right > 0 && box.left < innerWidth;
  };
  function schedule() {
    if (!allowStart || scheduled || played || preparing || document.hidden || document.readyState !== 'complete' || !hasView()) return;
    scheduled = true;
    // Preserve the R02 critical painting's discovery/decoding before warming sprites.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scheduled = false;
      if (played || preparing || !hasView() || document.hidden) return;
      preparing = true;
      void acting.prepare().then(ok => {
        preparing = false;
        if (!ok || played || !hasView() || document.hidden) return;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!hasView() || document.hidden) return;
          void acting.play().then(accepted => {
            if (accepted) {
              played = true;
              image.dataset.autoPlayed = 'true';
            }
          });
        }));
      });
    }));
  }
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) schedule();
    }, { threshold: [0, .25, .5] })
    : null;
  observer?.observe(image);
  // The critical artwork must paint before the 1.48MB optional sprite sequence warms.
  // Motion still begins automatically, after the first-view transfer window.
  const loaded = () => window.setTimeout(() => { allowStart = true; schedule(); }, 1150);
  if (document.readyState === 'complete') loaded();
  else window.addEventListener('load', loaded, { once: true });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  window.addEventListener('pageshow', schedule);
  return { acting, schedule, get played() { return played; } };
}

const hero = mountInView(document.querySelector('#entrance .entrance-paperkeeper'));
const atlas = document.querySelector('details#field-atlas[data-field-atlas]');
const atlasActor = mountInView(atlas?.querySelector('.field-atlas-paperkeeper'));
const cue = document.querySelector('#entrance .hero-atlas-cue');

// The map link remains a genuine anchor. No separate "activate motion" control.
cue?.addEventListener('click', () => {
  if (atlas && !atlas.open) atlas.open = true;
});
atlas?.addEventListener('toggle', () => {
  if (!atlas.open || !atlasActor) return;
  atlasActor.schedule();
  if (atlasActor.played && atlasActor.acting.state === 'settled') {
    void atlasActor.acting.play();
  }
});
