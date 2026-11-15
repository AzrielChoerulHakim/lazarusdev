/**
 * Stage 04 asset test harness, not Stage 11 character motion.
 * Restrained max 16 px depth response; native scroll stays in control.
 */
const layer = document.querySelector('.layer-canopy');
const button = document.querySelector('#wayfinder');
const readout = document.querySelector('#wayfinder-readout');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let pending = false;
function tick() {
  pending = false;
  if (!layer) return;
  const depth = motion.matches ? 0 : Math.max(-16, Math.min(16, window.scrollY * -.025));
  layer.style.setProperty('--parallax-y', depth + 'px');
}
window.addEventListener('scroll', () => {
  if (!pending) { pending = true; requestAnimationFrame(tick); }
}, { passive: true });
motion.addEventListener?.('change', tick);
tick();
button?.addEventListener('click', () => {
  const next = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(next));
  readout.textContent = next
    ? 'Selected. The object has real transparent edges and an accessible HTML hit area; its text stays outside the image.'
    : 'The wooden signpost is an independent transparent image. Select it to test a real hit target.';
});
document.body.dataset.assetLabReady = 'true';
