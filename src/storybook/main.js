/**
 * Lazarus Dev — The Forest Between Pages
 * Stage 03: connect the approved content map to an accessible semantic shell.
 * Deliberately NO synthetic scene artwork, scroll hijacking or character animation.
 */
import { storybookContent } from './data/content.js';

document.documentElement.classList.remove('no-js');

const chapterIds = [
  'entrance',
  'winding-path',
  'work-clearing',
  'river-stories',
  'house-on-the-hill',
];
const { chapters, services, projects } = storybookContent;
const el = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];

if (chapters.length !== 5 || chapterIds.some((id, i) => chapters[i]?.id !== id)) {
  throw new Error('Storybook content no longer matches the approved five-chapter narrative.');
}
if (services.length !== 4 || projects.length !== 3) {
  throw new Error('Stage 03 content contract unexpectedly changed.');
}
if (chapterIds.some(id => !document.getElementById(id))) {
  throw new Error('Stage 03 semantic HTML is missing a required chapter.');
}
if (all('h1').length !== 1) {
  throw new Error('Stage 03 must have precisely one accessible H1.');
}

// Semantic HTML ships complete, readable source content even without JavaScript.
// Hydrate plain-text fields using textContent: no innerHTML from the data module.
for (const chapter of chapters) {
  for (const field of ['eyebrow', 'lead', 'manifesto']) {
    const target = el('[data-copy="' + chapter.id + '.' + field + '"]');
    if (target && typeof chapter[field] === 'string') target.textContent = chapter[field];
  }
  // Preserve deliberate editorial line breaks and italics in authored headings.
  const heading = el('[data-copy="' + chapter.id + '.heading"]');
  if (!heading || heading.textContent.replace(/\s/g, '') !== chapter.heading.replace(/\s/g, '')) {
    throw new Error('Authored heading diverged from approved narrative: ' + chapter.id);
  }
}
for (const service of services) {
  const title = el('[data-service-name="' + service.id + '"]');
  const description = el('[data-service-desc="' + service.id + '"]');
  if (!title || !description) throw new Error('Missing service markup: ' + service.id);
  title.textContent = service.name;
  description.textContent = service.description;
}
for (const project of projects) {
  if (project.status !== 'concept-not-client-commission') {
    throw new Error('An unverified portfolio item is not labeled as a concept: ' + project.id);
  }
  const root = el('[data-concept="' + project.id + '"]');
  if (!root) throw new Error('Missing concept detail: ' + project.id);
  const labels = {
    '[data-project-label]': project.label,
    '[data-project-caption]': project.caption,
    '[data-project-description]': project.description,
  };
  for (const [selector, value] of Object.entries(labels)) {
    const target = root.querySelector(selector);
    if (!target) throw new Error('Incomplete project detail: ' + project.id);
    target.textContent = value;
  }
}
const date = el('[data-year]');
if (date) date.textContent = String(new Date().getFullYear());

// Every destination is a native anchor. Mobile navigation is the sole
// enhanced interaction at Stage 03; it is not a modal or an animated gate.
const toggle = el('.menu-toggle');
const nav = el('#site-nav');
const mobileQuery = window.matchMedia('(max-width: 920px)');
if (!toggle || !nav) throw new Error('Navigation controls missing.');

function setMenuOpen(open, { restoreFocus = false } = {}) {
  const allowed = Boolean(open && mobileQuery.matches);
  toggle.setAttribute('aria-expanded', String(allowed));
  toggle.setAttribute('aria-label', allowed ? 'Close navigation' : 'Open navigation');
  const label = toggle.querySelector('.menu-toggle-word');
  if (label) label.textContent = allowed ? 'Close' : 'Menu';
  nav.dataset.open = String(allowed);
  if (restoreFocus && mobileQuery.matches) toggle.focus();
}
toggle.addEventListener('click', () => {
  setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
});
nav.addEventListener('click', event => {
  if (event.target.closest('a[href^="#"]')) setMenuOpen(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false, { restoreFocus: true });
  }
});
document.addEventListener('pointerdown', event => {
  if (mobileQuery.matches && nav.dataset.open === 'true' &&
      !nav.contains(event.target) && !toggle.contains(event.target)) {
    setMenuOpen(false);
  }
});
const header = toggle.closest('.header-inner');
header.addEventListener('focusout', event => {
  if (nav.dataset.open === 'true' && !header.contains(event.relatedTarget)) setMenuOpen(false);
});
header.dataset.menuReady = 'true';
mobileQuery.addEventListener?.('change', () => setMenuOpen(false));

// Mark the visible chapter in the navigation without overriding scroll or
// stealing focus. CSS styles current nav links; all links remain actionable.
const navLinks = all('.site-nav a[href^="#"]');
const sections = chapterIds.map(id => document.getElementById(id));
let scrollQueued = false;
function updateLocation() {
  scrollQueued = false;
  const cursor = Math.max(100, window.innerHeight * .38);
  let currentId = sections[0].id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= cursor) currentId = section.id;
  }
  for (const link of navLinks) {
    if (link.hash === '#' + currentId) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  document.body.dataset.visibleChapter = currentId;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    scrollQueued = true;
    window.requestAnimationFrame(updateLocation);
  }
}, { passive: true });
window.addEventListener('resize', updateLocation, { passive: true });
window.addEventListener('hashchange', updateLocation);
updateLocation();

// Readable static content exists without this ready flag. It solely informs QA.
document.body.dataset.storybookReady = 'true';
document.body.dataset.storybookStage = '03';
document.body.dataset.chapterCount = String(chapters.length);

/* Stage 16: keep raster paintings as a genuine failure fallback, not an
   unnecessary second mobile download beneath already-rendered SVG art.
   No viewport/scroll event, network call or synthetic frame is introduced. */
for (const portrait of document.querySelectorAll('.portrait-native-art')) {
  const canvas = portrait.closest('.path-map-art, .work-clearing-world, .river-scene, .house-scene-canvas');
  if (!canvas) continue;
  const restoreRaster = () => { canvas.dataset.nativeFailed = 'true'; };
  portrait.addEventListener('error', restoreRaster, {once:true});
  if (portrait.complete && portrait.naturalWidth === 0) restoreRaster();
}
