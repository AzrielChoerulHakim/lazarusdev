/** R12: The chapter seams draw automatically when encountered. No motion switch. */
const seams = [...document.querySelectorAll('[data-chapter-seam]')];
if (seams.length === 4 && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('forest-seam-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.ink = 'drawn';
      observer.unobserve(entry.target);
    }
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  for (const seam of seams) observer.observe(seam);
}
