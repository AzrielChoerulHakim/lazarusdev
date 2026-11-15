/**
 * The Forest Between Pages — Stage 03 browser quality gate.
 * Tests the real built root and secondary route, not an image mockup.
 * Optical originality and production artwork require human review later.
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes = ['/lazarusdev/', '/lazarusdev/storybook/'];
const chapters = ['entrance', 'winding-path', 'work-clearing', 'river-stories', 'house-on-the-hill'];
const widths = [
  { name: 'small-320', width: 320, height: 720 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 860 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'short-landscape', width: 844, height: 390 },
];

const browser = await chromium.launch({
  ...(process.env.CI ? { channel: 'chrome' } : {}),
  headless: true,
  args: ['--no-sandbox'],
});
// No screenshot directory or capture: functional QA only.

const failures = [];
let passed = 0;
function check(condition, message) {
  if (!condition) failures.push(message);
}

try {
  for (const route of routes) {
    for (const profile of widths) {
      const page = await browser.newPage({
        viewport: { width: profile.width, height: profile.height },
        deviceScaleFactor: 1,
      });
      const errorMessages = [];
      page.on('pageerror', err => errorMessages.push(err.message));
      page.on('response', res => {
        if (res.url().startsWith(origin) && res.status() >= 400) {
          errorMessages.push('HTTP ' + res.status() + ' on ' + res.url());
        }
      });
      const prefix = route + ' @' + profile.width + 'x' + profile.height + ': ';
      try {
        const response = await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 30000 });
        check(response?.status() === 200, prefix + 'root HTTP status not 200');
        await page.evaluate(() => document.fonts?.ready);
        const audit = await page.evaluate(() => {
          const selectors = ['.hero-lead', '.chapter-path .lead', '.disclosure', '.folio-status',
            '.river-notebook-head .eyebrow', '.house-statement .lead', '.house-contact .house-status'];
          const parseRGB = css => {
            const m = css.match(/rgba?\(([^)]+)\)/);
            if (!m) return null;
            return m[1].split(',').slice(0, 3).map(v => Number.parseFloat(v.trim()));
          };
          const bgFor = element => {
            let node = element;
            while (node) {
              const bg = getComputedStyle(node).backgroundColor;
              if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
                return parseRGB(bg);
              }
              node = node.parentElement;
            }
            return [247, 233, 214];
          };
          const luminosity = values => {
            const c = values.map(x => x / 255).map(c => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4));
            return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
          };
          const contrast = (a, b) => {
            const pair = [luminosity(a), luminosity(b)].sort((x, y) => y - x);
            return (pair[0] + .05) / (pair[1] + .05);
          };
          const samples = selectors.map(sel => {
            const node = document.querySelector(sel);
            if (!node) return { sel, ratio: 0 };
            const style = getComputedStyle(node);
            const ink = parseRGB(style.color);
            return { sel, ratio: ink ? contrast(ink, bgFor(node)) : 0 };
          });
          const links = [...document.querySelectorAll('a[href^="#"]')];
          const brokenAnchors = links.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.getAttribute('href'));
          const targetExceptions = [];
          for (const node of [...document.querySelectorAll('a, button, summary')]) {
            const style = getComputedStyle(node);
            if (style.display === 'none' || style.visibility === 'hidden' || node.getClientRects().length === 0) continue;
            // Skip link is offscreen until focused, tested separately below.
            if (node.classList.contains('skip-link')) continue;
            const rect = node.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
              targetExceptions.push({ tag: node.tagName, text: node.textContent.trim().slice(0, 30), width: rect.width, height: rect.height });
            }
          }
          const headingCount = [...document.querySelectorAll('h1')].length;
          const sections = [...document.querySelectorAll('section[data-chapter]')];
          const labels = sections.map(section => ({
            id: section.id,
            hasH: Boolean(section.querySelector('#' + CSS.escape(section.id) + '-title')),
          }));
          return {
            ready: document.body.dataset.storybookReady,
            stage: document.body.dataset.storybookStage,
            chapterCount: document.body.dataset.chapterCount,
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            headingCount,
            labels,
            brokenAnchors,
            targetExceptions,
            samples,
            hasCanvas: Boolean(document.querySelector('canvas, #world, #webgl-wrap')),
            navLinks: document.querySelectorAll('nav.site-nav a').length,
            detailsCount: document.querySelectorAll('.work-folio').length,
            detailsAllExplicitConcepts: [...document.querySelectorAll('.work-folio')].every(n => n.textContent.includes('not a client commission')),
            bodyFontSize: getComputedStyle(document.body).fontSize,
            hasSkip: Boolean(document.querySelector('a.skip-link[href="#page-content"]')),
          };
        });
        check(errorMessages.length === 0, prefix + 'JS/local HTTP errors: ' + errorMessages.join('; '));
        check(audit.ready === 'true' && audit.stage === '03', prefix + 'client bootstrap not ready');
        check(audit.chapterCount === '5', prefix + 'chapter data count incorrect');
        check(audit.headingCount === 1, prefix + 'expected one H1');
        check(audit.labels.map(x => x.id).join(',') === chapters.join(','), prefix + 'section order incorrect');
        check(audit.labels.every(x => x.hasH), prefix + 'section missing accessible title');
        check(audit.brokenAnchors.length === 0, prefix + 'broken anchors ' + audit.brokenAnchors);
        check(audit.targetExceptions.length === 0, prefix + 'targets below 44px ' + JSON.stringify(audit.targetExceptions));
        check(!audit.overflow, prefix + 'horizontal overflow');
        check(!audit.hasCanvas, prefix + 'legacy WebGL included');
        check(audit.navLinks === 5 && audit.detailsCount === 3, prefix + 'navigation/portfolio count incorrect');
        check(audit.detailsAllExplicitConcepts, prefix + 'unlabeled concept');
        check(audit.hasSkip, prefix + 'no skip link');
        check(audit.samples.every(x => x.ratio >= 4.5), prefix + 'text contrast failure ' + JSON.stringify(audit.samples));

        // Visual screenshots are intentionally not captured (studio policy).

        // Native interactive folios and anchored navigation must be usable.
        const concept = page.locator('.work-folio').first();
        await concept.locator('summary').click();
        check(await concept.getAttribute('open') !== null, prefix + 'concept detail failed to expand');

        if (profile.width <= 920) {
          const menu = page.locator('.menu-toggle');
          await menu.click();
          check(await menu.getAttribute('aria-expanded') === 'true', prefix + 'mobile menu did not open');
          check(await page.locator('#site-nav').getAttribute('data-open') === 'true', prefix + 'mobile links hidden');
          await page.keyboard.press('Escape');
          check(await menu.getAttribute('aria-expanded') === 'false', prefix + 'Escape failed to close menu');
          await menu.click();
          await page.locator('#site-nav a[href="#work-clearing"]').click();
          check(new URL(page.url()).hash === '#work-clearing', prefix + 'Work anchor not navigable');
          check(await menu.getAttribute('aria-expanded') === 'false', prefix + 'menu did not close after anchor');
        } else {
          await page.locator('.site-nav a[href="#work-clearing"]').click();
          check(new URL(page.url()).hash === '#work-clearing', prefix + 'desktop Work anchor not navigable');
        }

        await page.emulateMedia({ reducedMotion: 'reduce' });
        const reduced = await page.locator('.button-primary').evaluate(node => Number.parseFloat(getComputedStyle(node).transitionDuration));
        check(reduced <= .005, prefix + 'reduced-motion still uses long transitions: ' + reduced);
        console.log('PASS CHECKED ' + prefix + JSON.stringify({
          chapters: audit.labels.length, contrastRatios: audit.samples.map(s => Number(s.ratio.toFixed(2))),
          interactive: true, overflow: audit.overflow,
        }));
        passed++;
      } finally {
        await page.close();
      }
    }
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(origin + '/lazarusdev/', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  const skipVisible = await page.evaluate(() => {
    const n = document.activeElement;
    return n?.classList.contains('skip-link') && n.getBoundingClientRect().top >= 0;
  });
  check(skipVisible, 'Skip link is not the first focusable control');
  await page.keyboard.press('Enter');
  check(new URL(page.url()).hash === '#page-content', 'Skip link does not reach main content');
  await page.close();
} finally {
  await browser.close();
}

if (failures.length) {
  console.error('\nSTAGE 03 QA FAILED (' + failures.length + '):\n' + failures.map(x => ' - ' + x).join('\n'));
  process.exitCode = 1;
} else {
  console.log('\nSTAGE 03 QA PASS: ' + passed + ' route/viewport combinations, native navigation, no broken anchors, contrast, touch targets and reduced motion.');
}
