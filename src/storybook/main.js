/**
 * Stage 02 — browser bootstrap only.
 * No global dependency on the legacy Three.js scene or CSS.
 * Replaced by the semantic shell in Stage 03, not by generic placeholder art.
 */
import { storybookContent } from './data/content.js';

const root = document.querySelector('.storybook-scaffold');
const index = document.querySelector('[data-chapter-preview]');
const status = document.querySelector('[data-content-status]');
const count = document.querySelector('[data-mapped-count]');
const chapters = storybookContent.chapters;

if (!root || !index || !status || !count) {
  throw new Error('Forest scaffold cannot find its expected HTML landmarks.');
}
if (!Array.isArray(chapters) || chapters.length !== 5) {
  throw new Error('Storybook narrative contract requires exactly five chapters.');
}

const expectedIds = [
  'entrance',
  'winding-path',
  'work-clearing',
  'river-stories',
  'house-on-the-hill',
];
if (chapters.some((chapter, index) => chapter.id !== expectedIds[index])) {
  throw new Error('Forest chapter IDs diverge from the locked content map.');
}

// Use DOM text nodes rather than parsing content strings as HTML.
const items = chapters.map((chapter, chapterIndex) => {
  const li = document.createElement('li');
  const number = document.createElement('span');
  const name = document.createElement('span');
  number.textContent = String(chapterIndex + 1).padStart(2, '0');
  name.textContent = chapter.name;
  li.append(number, name);
  return li;
});
index.replaceChildren(...items);
count.textContent = String(chapters.length).padStart(2, '0');
status.textContent = 'Content source connected. Illustration and semantic chapter UI are deliberately pending.';
root.dataset.storybookReady = 'true';
root.dataset.storybookStage = '02';
root.dataset.chapterCount = String(chapters.length);
