/**
 * R12: Each illustrated chapter moves when the visitor reaches it.
 * Native controls may add further finite responses; none unlock the animation.
 */
const controllers = [];
function finite(scene, kind, ms = 700) {
  if (!scene) return null;
  let timer = 0;
  const set = value => { if (scene.isConnected) scene.dataset.motionCue = value; };
  const cue = () => {
    if (timer) clearTimeout(timer);
    scene.dataset.autoSeen = 'true';
    set(kind);
    timer = setTimeout(() => { timer = 0; set('settled'); }, ms);
  };
  const stop = () => { if (timer) clearTimeout(timer); timer = 0; set('settled'); };
  controllers.push({ scene, cue, stop });
  return cue;
}
const path = document.querySelector('[data-path-map] .path-map-art');
const clearing = document.querySelector('#work-clearing .work-clearing-world');
const river = document.querySelector('#river-stories .river-scene');
const house = document.querySelector('[data-house-scene]');
const trace = finite(path, 'route', 700);
const folioCue = finite(clearing, 'folio', 650);
const noteCue = finite(river, 'note', 850);
const houseCue = finite(house, 'lantern', 750);

for (const folio of document.querySelectorAll('#work-clearing details.work-folio')) {
  folio.addEventListener('toggle', () => {
    if (!folio.open) return;
    clearing.dataset.activeFolio = folio.id;
    folioCue?.();
  });
}
for (const link of document.querySelectorAll('#work-clearing [data-open-concept]')) {
  link.addEventListener('click', () => {
    clearing.dataset.activeFolio = link.hash.slice(1);
    folioCue?.();
  });
}
for (const fold of document.querySelectorAll('#river-stories .river-note-fold')) {
  fold.addEventListener('toggle', () => {
    if (!fold.open) return;
    river.dataset.activeNote = fold.closest('.river-note')?.id || '';
    noteCue?.();
  });
}
document.querySelector('[data-house-light-toggle]')?.addEventListener('click', () => houseCue?.());

// Once-per-chapter story beats, and light ambient movement only in view.
const visited = new WeakSet();
const updateVisible = scene => {
  const rect = scene.getBoundingClientRect();
  const overlap = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
  const isVisible = !document.hidden && rect.width > 0 && overlap >= Math.min(rect.height * .16, 120);
  scene.dataset.autoVisible = String(isVisible);
  if (isVisible && !visited.has(scene)) {
    visited.add(scene);
    const controller = controllers.find(item => item.scene === scene);
    controller?.cue();
  }
};
const scenes = controllers.map(item => item.scene);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) updateVisible(entry.target);
  }, { threshold: [0, .16, .3, .6] });
  scenes.forEach(scene => observer.observe(scene));
}
window.addEventListener('scroll', () => scenes.forEach(updateVisible), { passive: true });
window.addEventListener('resize', () => scenes.forEach(updateVisible), { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) for (const item of controllers) item.stop();
  scenes.forEach(updateVisible);
});
window.addEventListener('pagehide', () => controllers.forEach(item => item.stop()), { once: true });
scenes.forEach(updateVisible);
