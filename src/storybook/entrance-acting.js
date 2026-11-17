/** R03 finite acting engine. R04 owns mounting it to the native atlas. */
import { entranceActing } from './entrance-acting-assets.js';

const mounted = new WeakMap();
let active = null;

export function createEntranceActing(image, { assets = entranceActing } = {}) {
  if (image?.tagName !== 'IMG') throw new TypeError('Entrance acting needs an existing image fallback.');
  mounted.get(image)?.destroy();
  const document = image.ownerDocument;
  const window = document.defaultView;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frames = new Map(assets.frames.map(frame => [frame.id, frame]));
  const decoded = new Map();
  const loads = new Map();
  let timer = 0, epoch = 0, disposed = false, failed = false;
  let pending = false, engaged = false, played = false, wantSettle = false;
  let state = 'idle';
  let visible = intersectsViewport();

  function intersectsViewport() {
    const rect = image.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  }
  function setState(next) {
    if (disposed) return;
    state = next;
    image.dataset.actingState = next;
  }
  function show(id) {
    if (disposed || !decoded.has(id)) return;
    const src = frames.get(id).src;
    if (image.src !== src) image.src = src;
    image.dataset.actingFrame = id;
  }
  function clearTimer() {
    if (timer) window.clearTimeout(timer);
    timer = 0;
    if (active === api) active = null;
  }
  function load(id) {
    if (loads.has(id)) return loads.get(id).promise;
    const record = { image: new window.Image(), timeout: 0, promise: null };
    record.image.decoding = 'async';
    record.image.src = frames.get(id).src;
    record.promise = Promise.race([
      record.image.decode(),
      new Promise((_, reject) => {
        record.timeout = window.setTimeout(() => reject(new Error('Acting frame decode timed out.')), 8000);
      }),
    ]).then(() => {
      if (record.image.naturalWidth !== assets.canvas.width || record.image.naturalHeight !== assets.canvas.height) throw new Error('Acting frame dimensions do not match the registered canvas.');
      if (!disposed) decoded.set(id, record.image);
    }).finally(() => window.clearTimeout(record.timeout));
    loads.set(id, record);
    return record.promise;
  }

  async function prepare() {
    if (disposed || failed) return false;
    const ids = reduced.matches ? [assets.settled] : [...frames.keys()];
    if (ids.every(id => decoded.has(id))) return true;
    if (state !== 'playing') setState('loading');
    try {
      await Promise.all(ids.map(load));
      if (disposed) return false;
      if (wantSettle || reduced.matches) {
        show(assets.settled);
        played = true;
        setState('settled');
      } else if (state === 'loading') setState('ready');
      return true;
    } catch {
      if (!disposed) {
        failed = true;
        clearTimer();
        setState('unavailable');
      }
      return false;
    }
  }

  function cancel() {
    epoch++;
    pending = false;
    clearTimer();
    if (disposed || !engaged) return;
    wantSettle = true;
    // Never replace a working fallback with an undecoded or failed URL.
    if (decoded.has(assets.settled)) {
      show(assets.settled);
      played = true;
      setState('settled');
    } else if (!failed) setState('idle');
  }

  async function play() {
    if (disposed || failed || pending || timer || document.hidden || !visible) return false;
    pending = true;
    engaged = true;
    wantSettle = false;
    const request = ++epoch;
    const ready = await prepare();
    if (disposed || request !== epoch) return false;
    pending = false;
    if (!ready) return false;
    if (reduced.matches || document.hidden || !visible) {
      cancel();
      return true;
    }
    // Reduced motion may have changed while its single final frame decoded.
    if (![...frames.keys()].every(id => decoded.has(id))) return play();
    if (active && active !== api) active.cancel();
    active = api;
    const steps = assets.clips[played ? 'acknowledge' : 'invite'];
    played = true;
    const start = window.performance.now();
    const total = steps.reduce((sum, step) => sum + step.duration, 0);
    setState('playing');
    function tick() {
      timer = 0;
      if (disposed || request !== epoch) return;
      if (document.hidden || !visible || reduced.matches) return cancel();
      const elapsed = window.performance.now() - start;
      if (elapsed >= total) {
        show(assets.settled);
        setState('settled');
        if (active === api) active = null;
        return;
      }
      let end = 0;
      for (const step of steps) {
        end += step.duration;
        if (elapsed < end) {
          show(step.frame);
          // One deadline timer; a busy tab skips stale drawings, never catches up.
          timer = window.setTimeout(tick, Math.max(1, end - elapsed));
          return;
        }
      }
    }
    tick();
    return true;
  }

  function onVisibility() { if (document.hidden) cancel(); }
  async function onReducedMotion() {
    if (!reduced.matches) return;
    cancel();
    // No network until preparation/interaction has actually begun.
    if (!loads.size) return;
    const request = epoch;
    try {
      await load(assets.settled);
      if (!disposed && request === epoch && reduced.matches) {
        show(assets.settled);
        played = true;
        setState('settled');
      }
    } catch { /* Retain the existing decoded still. */ }
  }
  const observer = window.IntersectionObserver ? new window.IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) cancel();
  }) : null;

  function destroy() {
    if (disposed) return;
    cancel();
    disposed = true;
    state = 'disposed';
    image.dataset.actingState = state;
    observer?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', cancel);
    reduced.removeEventListener('change', onReducedMotion);
    for (const record of loads.values()) {
      window.clearTimeout(record.timeout);
      if (!record.image.complete) record.image.src = '';
    }
    if (mounted.get(image) === api) mounted.delete(image);
  }

  const api = Object.freeze({ prepare, play, cancel, destroy, get state() { return state; } });
  mounted.set(image, api);
  setState('idle');
  observer?.observe(image);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', cancel);
  reduced.addEventListener('change', onReducedMotion);
  return api;
}
