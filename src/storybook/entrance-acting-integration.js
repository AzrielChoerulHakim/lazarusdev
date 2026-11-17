/** R04: Native Field Atlas integration of R03's finite, authored acting. */
import { createEntranceActing } from './entrance-acting.js';

const keeper = document.querySelector('#entrance .entrance-paperkeeper');
const atlas = document.querySelector('details#field-atlas[data-field-atlas]');
if (keeper && atlas) {
  const acting = createEntranceActing(keeper);
  let loaded = document.readyState === 'complete';
  let nearby = false;
  let warming = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const warm = () => {
    if (warming || !loaded || !nearby || document.hidden || reduced.matches) return;
    warming = true;
    observer?.disconnect();
    document.removeEventListener('visibilitychange', warm);
    void acting.prepare();
  };

  // Wait for the R02 critical painting to finish loading. R03 URLs remain
  // lazy and only decode near the character; no new autoplay behavior.
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
      nearby = Boolean(entry?.isIntersecting);
      warm();
    }, { rootMargin: '160px 0px', threshold: 0 })
    : null;
  if (observer) observer.observe(keeper);
  else { nearby = true; warm(); }
  if (!loaded) window.addEventListener('load', () => {
    loaded = true;
    warm();
  }, { once: true });
  document.addEventListener('visibilitychange', warm);
  reduced.addEventListener('change', warm);

  // Do not prevent/await the native toggle, move focus, or force scroll.
  // Closing the atlas does not reverse or restart a gesture.
  atlas.addEventListener('toggle', () => {
    if (atlas.open) void acting.play();
  });
  // R03 itself handles hidden/offscreen/pagehide and reduced-motion changes.
}
