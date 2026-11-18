import { projectAtriumLight } from './atrium-lighting.mjs';

/** The Atrium / a second scene reached from an honest concept sheet.
 * Scroll, gallery offset, URL history and triggering focus belong to the visitor.
 * Illustrated masonry is authored SVG; the light is a single local state.
 */
let atrium = null;
let scene = null;
let slider = null;
let readout = null;
let description = null;
const gallery = document.querySelector('#work-clearing .work-hangings');
const lowMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = false;
let saved = null;
let pointer = null;
let entranceTimer = 0;
let oldBodyOverflow = '';
let oldHtmlOverflow = '';
let inertBefore = [];
function moveLight(number) {
  if (!scene || !slider) return;
  const light = projectAtriumLight(number);
  slider.value = String(light.value);
  readout.value = String(Math.round(light.value)) + '%';
  readout.textContent = readout.value;
  scene.dataset.lightZone = light.value < 34 ? 'left' : light.value > 66 ? 'right' : 'center';
  scene.style.setProperty('--lamp-x', light.lampPercent + '%');
  scene.style.setProperty('--relief-opacity', String(light.reliefOpacity));
  scene.style.setProperty('--relief-raking', String(light.reliefRaking));
  scene.style.setProperty('--left-column-light', String(light.leftColumnLight));
  scene.style.setProperty('--right-column-light', String(light.rightColumnLight));
  for (const [side, geometry] of [['left',light.left],['right',light.right]]) {
    for (const kind of ['core','penumbra']) {
      const shadow = scene.querySelector('[data-atrium-shadow="' + side + '-' + kind + '"]');
      if (shadow) shadow.setAttribute('d', geometry[kind]);
    }
  }
  const beam = scene.querySelector('#atrium-relief-beam');
  if (beam) {
    beam.setAttribute('x1', String(light.reliefBeamFrom));
    beam.setAttribute('x2', String(light.reliefBeamTo));
  }
  const message = light.value >= 62 ? 'The engraved leaves fade into the stone as the light moves on.' :
    light.value >= 35 ? 'There are traces of a carved garden.' : 'A shape waits behind the dim stone.';
  slider.setAttribute('aria-valuetext', Math.round(light.value) + '% — ' + message);
  description.textContent = message;
}
function remember(trigger) {
  const offset = gallery ? gallery.scrollLeft : 0;
  saved = { scroll: window.scrollY, gallery: offset, trigger: trigger || document.querySelector('[data-atrium-enter]') };
}
function ensureRoom() {
  if (atrium) return;
  const source = document.getElementById('atrium-room-template');
  if (!source) return;
  document.body.append(source.content.cloneNode(true));
  atrium = document.getElementById('atrium-room');
  scene = atrium && atrium.querySelector('#atrium-scene');
  slider = atrium && atrium.querySelector('#atrium-light');
  readout = atrium && atrium.querySelector('#atrium-light-value');
  description = atrium && atrium.querySelector('#atrium-light-message');
  if (atrium && slider && scene) bindAtriumControls();
}
function showRoom(trigger) {
  ensureRoom();
  if (!atrium || active) return;
  if (!saved) remember(trigger);
  active = true;
  atrium.hidden = false;
  oldBodyOverflow = document.body.style.overflow;
  oldHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  // The entrance originates at the visible portal ON the folio, not the
  // midpoint of its paper border or an offscreen sheet in the carousel.
  // Clip the source to the horizontal gallery and viewport before using it.
  const poster = document.querySelector('.work-hanging[data-open-concept="atrium"] > img');
  const activateBox = trigger?.getBoundingClientRect();
  const posterBox = poster?.getBoundingClientRect();
  const galleryBox = gallery?.getBoundingClientRect();
  const viewport = {left: 0, top: 0, right: innerWidth, bottom: innerHeight};
  let entryPoint = activateBox && {
    x: activateBox.left + activateBox.width / 2,
    y: activateBox.top + activateBox.height / 2
  };
  if (posterBox && galleryBox) {
    const clipped = {
      left: Math.max(0, posterBox.left, galleryBox.left),
      right: Math.min(viewport.right, posterBox.right, galleryBox.right),
      top: Math.max(0, posterBox.top, galleryBox.top),
      bottom: Math.min(viewport.bottom, posterBox.bottom, galleryBox.bottom)
    };
    const goldPortal = {
      x: posterBox.left + posterBox.width * .52,
      y: posterBox.top + posterBox.height * .28
    };
    // Skip a folio that is hidden by scrolling or clipped sideways.
    if (clipped.right - clipped.left >= 28 &&
        clipped.bottom - clipped.top >= 45 &&
        goldPortal.x >= clipped.left && goldPortal.x <= clipped.right &&
        goldPortal.y >= clipped.top && goldPortal.y <= clipped.bottom) {
      entryPoint = goldPortal;
    }
  }
  if (entryPoint) {
    const frame = atrium.querySelector('.atrium-frame').getBoundingClientRect();
    const x = Math.max(0, Math.min(frame.width, entryPoint.x - frame.left));
    const y = Math.max(0, Math.min(frame.height, entryPoint.y - frame.top));
    atrium.style.setProperty('--atrium-entry-x', x + 'px');
    atrium.style.setProperty('--atrium-entry-y', y + 'px');
  }
  // aria-modal alone does not remove underlying chapter controls from
  // the accessibility tree. Retain and restore each existing inert value.
  inertBefore = [...document.body.children].filter(node => node !== atrium)
    .map(node => [node, node.inert]);
  for (const [node] of inertBefore) node.inert = true;
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
  for (const [node, wasInert] of inertBefore) node.inert = wasInert;
  inertBefore = [];
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
function bindAtriumControls() {
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
    if ((event.button !== 0 && event.pointerType !== 'touch') || pointer) return;
    const touch = event.pointerType === 'touch';
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY,
      touch, axis: touch ? 'undecided' : 'horizontal' };
    // Touch is ambiguous until movement reveals intent. Do not commandeer
    // a normal vertical page scroll or flash the lamp when a finger lands.
    if (!touch) {
      scene.setPointerCapture(event.pointerId);
      drag(event);
    }
  });
  scene.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (pointer.touch && pointer.axis === 'undecided') {
      const dx = Math.abs(event.clientX - pointer.x);
      const dy = Math.abs(event.clientY - pointer.y);
      if (dy > 11 && dy > dx * 1.1) {
        pointer.axis = 'vertical';
        return;
      }
      if (dx < 12 || dx < dy * 1.3) return;
      pointer.axis = 'horizontal';
      if (!scene.hasPointerCapture(event.pointerId)) scene.setPointerCapture(event.pointerId);
    }
    if (pointer.axis === 'horizontal') drag(event);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    scene.addEventListener(name, event => {
      if (pointer && pointer.id === event.pointerId) pointer = null;
    });
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
