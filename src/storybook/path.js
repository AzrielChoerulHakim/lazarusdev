/** Stage 07: one meaningful native-scroll pencil trace. Never prevents scrolling. */
const map = document.querySelector('[data-path-map]');
const toggle = document.querySelector('[data-path-trace-toggle]');
const readout = document.getElementById('path-trace-status');

if (map && toggle && readout) {
  const paths = [...map.querySelectorAll('[data-path-stroke]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manual = false;
  let raf = 0;
  for (const path of paths) {
    const length = path.getTotalLength();
    path.dataset.length = `${length}`;
    path.style.strokeDasharray = `${length} ${length}`;
    path.style.strokeDashoffset = `${length}`;
  }
  const paint = () => {
    raf = 0;
    const box = map.getBoundingClientRect();
    // Reveal only as the reader naturally advances across the illustration.
    const numerator = window.innerHeight * .86 - box.top;
    const denominator = box.height + window.innerHeight * .34;
    const scrollProgress = Math.max(0, Math.min(1, numerator / denominator));
    const progress = motion.matches || manual ? 1 : scrollProgress;
    paths.forEach(path => { path.style.strokeDashoffset = `${Number(path.dataset.length) * (1 - progress)}`; });
    map.dataset.progress = String(Math.round(progress * 100));
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    manual = !manual;
    toggle.setAttribute('aria-pressed', String(manual));
    toggle.textContent = manual ? 'Return to natural tracing' : 'Reveal the whole route';
    readout.textContent = manual
      ? 'The entire illustrated path is visible. The journey does not restrict scrolling.'
      : 'The pencil route follows your natural scroll. You can still jump to any chapter.';
    schedule();
  });
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule, {passive: true});
  motion.addEventListener?.('change', schedule);
  schedule();
}