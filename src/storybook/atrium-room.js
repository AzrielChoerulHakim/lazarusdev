/** The Atrium / a second scene reached from an honest concept sheet.
 * Scroll, gallery offset, URL history and triggering focus belong to the visitor.
 * Illustrated masonry is authored SVG; the light is a single local state.
 */
const atrium = document.getElementById('atrium-room');
const scene = atrium && atrium.querySelector('#atrium-scene');
const slider = atrium && atrium.querySelector('#atrium-light');
const readout = atrium && atrium.querySelector('#atrium-light-value');
const description = atrium && atrium.querySelector('#atrium-light-message');
const gallery = document.querySelector('#work-clearing .work-hangings');
const lowMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = false;
let saved = null;
let pointer = null;
let entranceTimer = 0;
let oldBodyOverflow = '';
let oldHtmlOverflow = '';
const clamp = number => Math.max(0, Math.min(100, number));

function moveLight(number) {
  if (!scene || !slider) return;
  const value = clamp(Number(number) || 0);
  slider.value = String(value);
  readout.value = String(Math.round(value)) + '%';
  readout.textContent = readout.value;
  scene.style.setProperty('--lamp-x', String(12 + value * .76) + '%');
  scene.style.setProperty('--relief-opacity', String(.15 + .84 * (value / 100)));
  scene.style.setProperty('--shadow-lean', String((50 - value) * 2.8) + 'px');
  scene.style.setProperty('--shadow-skew', String((50 - value) * .27) + 'deg');
  description.textContent = value >= 62 ? 'The engraved leaves have appeared in the stone.' :
    value >= 35 ? 'There are traces of a carved garden.' : 'A shape waits behind the dim stone.';
}
function remember(trigger) {
  const offset = gallery ? gallery.scrollLeft : 0;
  saved = { scroll: window.scrollY, gallery: offset, trigger: trigger || document.querySelector('[data-atrium-enter]') };
}
function showRoom(trigger) {
  if (!atrium || active) return;
  if (!saved) remember(trigger);
  active = true;
  atrium.hidden = false;
  oldBodyOverflow = document.body.style.overflow;
  oldHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  atrium.classList.remove('atrium-entering');
  if (!lowMotion.matches && trigger) {
    atrium.classList.add('atrium-entering');
    entranceTimer = window.setTimeout(() => atrium.classList.remove('atrium-entering'), 550);
  }
  moveLight(slider.value);
  atrium.querySelector('[data-atrium-close]').focus({ preventScroll: true });
}
function hideRoom() {
  if (!atrium || !active) return;
  active = false;
  pointer = null;
  clearTimeout(entranceTimer);
  atrium.hidden = true;
  atrium.classList.remove('atrium-entering');
  document.body.style.overflow = oldBodyOverflow;
  document.documentElement.style.overflow = oldHtmlOverflow;
  const restore = saved;
  saved = null;
  requestAnimationFrame(() => {
    if (restore) {
      if (gallery) gallery.scrollLeft = restore.gallery;
      window.scrollTo({ top: restore.scroll, behavior: 'instant' });
      if (restore.trigger && restore.trigger.isConnected) restore.trigger.focus({ preventScroll: true });
    } else {
      const clearing = document.getElementById('work-clearing');
      if (clearing) clearing.scrollIntoView({ behavior: 'instant', block: 'start' });
      const first = document.querySelector('[data-atrium-enter]');
      if (first) first.focus({ preventScroll: true });
    }
  });
}
function enterAtrium(trigger) {
  if (active) return;
  remember(trigger);
  if (location.hash !== '#atrium') {
    history.pushState({ lazarusAtrium: true }, '', '#atrium');
  }
  showRoom(trigger);
}
function leaveAtrium() {
  if (!active) return;
  if (history.state && history.state.lazarusAtrium) history.back();
  else {
    history.replaceState(null, '', '#work-clearing');
    hideRoom();
  }
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-atrium-enter]');
  if (trigger && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    enterAtrium(trigger);
    return;
  }
  if (active && event.target.closest('[data-atrium-close]')) leaveAtrium();
});
window.addEventListener('popstate', () => {
  if (location.hash === '#atrium') showRoom();
  else hideRoom();
});
window.addEventListener('hashchange', () => {
  if (location.hash === '#atrium') showRoom();
  else if (active) hideRoom();
});
if (location.hash === '#atrium') showRoom();
if (atrium && slider && scene) {
  slider.addEventListener('input', () => moveLight(slider.value));
  atrium.querySelectorAll('[data-light-step]').forEach(button => button.addEventListener('click', () => {
    moveLight(Number(slider.value) + Number(button.dataset.lightStep));
    slider.focus({ preventScroll: true });
  }));
  function drag(event) {
    const bounds = scene.getBoundingClientRect();
    moveLight((event.clientX - bounds.left) * 100 / Math.max(bounds.width, 1));
  }
  scene.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    pointer = event.pointerId;
    scene.setPointerCapture(event.pointerId);
    drag(event);
  });
  scene.addEventListener('pointermove', event => {
    if (pointer === event.pointerId) drag(event);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    scene.addEventListener(name, () => { pointer = null; });
  }
  atrium.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); leaveAtrium(); return; }
    if (event.key !== 'Tab') return;
    const eligible = [...atrium.querySelectorAll('button, input')].filter(node => !node.disabled);
    const first = eligible[0];
    const last = eligible[eligible.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  moveLight(slider.value);
}
