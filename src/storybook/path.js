/**
 * R12: The pencil route draws itself on arrival. No motion toggle.
 * Native scrolling and chapter links remain immediately available.
 */
const map = document.querySelector('[data-path-map]');
if (map) {
  const art = map.querySelector('.path-map-art');
  const paths = [...map.querySelectorAll('[data-path-stroke]')];
  const shortMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = shortMotion ? 530 : 950;
  let begun = false, raf = 0;
  const lines = paths.map(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length + ' ' + length;
    path.style.strokeDashoffset = String(length);
    return { path, length };
  });
  const paint = progress => {
    const value = Math.max(0, Math.min(1, progress));
    for (const { path, length } of lines) path.style.strokeDashoffset = String(length * (1 - value));
    map.dataset.progress = String(Math.round(value * 100));
  };
  map.dataset.motionMode = 'automatic';
  map.dataset.tracePhase = 'awaiting';
  paint(0);
  const visible = () => {
    const rect = art.getBoundingClientRect();
    const overlap = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
    return rect.width > 0 && overlap >= Math.min(rect.height * .2, 140);
  };
  function draw() {
    if (begun || document.hidden || !visible()) return;
    begun = true;
    map.dataset.tracePhase = 'drawing';
    map.dataset.autoPlayed = 'true';
    const start = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      paint(1 - Math.pow(1 - progress, 2.5));
      if (progress >= 1) {
        raf = 0;
        paint(1);
        map.dataset.tracePhase = 'settled';
      } else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) draw();
      if (begun) observer.disconnect();
    }, { threshold: [0, .2, .4] });
    observer.observe(art);
  }
  addEventListener('scroll', draw, { passive: true });
  addEventListener('resize', draw, { passive: true });
  addEventListener('pageshow', draw);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) draw(); });
  requestAnimationFrame(draw);
  addEventListener('pagehide', () => { if (raf) cancelAnimationFrame(raf); }, { once: true });
}
