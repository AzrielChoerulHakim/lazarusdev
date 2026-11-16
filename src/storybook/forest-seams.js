/** Stage 12: draw a single editorial ink thread as each chapter boundary enters.
 * Passive enhancement: no scrolling APIs, no hidden copy, no focus interception.
 * Under reduced motion or no JS, lines stay visible and every link still works.
 */
const seams = [...document.querySelectorAll('[data-chapter-seam]')];
const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)');
if (seams.length === 4 && 'IntersectionObserver' in window) {
  if (prefersStill.matches) {
    for (const seam of seams) seam.dataset.ink = 'drawn';
  } else {
    document.documentElement.classList.add('forest-seam-ready');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.dataset.ink = 'drawn';
        observer.unobserve(entry.target);
      }
    }, {threshold:0.12,rootMargin:'0px 0px -6% 0px'});
    for (const seam of seams) observer.observe(seam);
    prefersStill.addEventListener?.('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      for (const seam of seams) seam.dataset.ink = 'drawn';
      document.documentElement.classList.remove('forest-seam-ready');
    }, {once:true});
  }
}
