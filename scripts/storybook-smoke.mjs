/**
 * Stage 02 scaffold E2E: static-built preview, nested base-path mirror,
 * portrait and desktop screenshots. Playwright provided by CI.
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.STORYBOOK_PREVIEW_URL || 'http://127.0.0.1:4186/lazarusdev/storybook/';
const expected = ['Entrance', 'Winding Path', 'Work Clearing', 'River Stories', 'House on the Hill'];
const browser = await chromium.launch({
  ...(process.env.CI ? { channel: 'chrome' } : {}),
  headless: true,
  args: ['--no-sandbox'],
});

await mkdir('screenshots/storybook', { recursive: true });
try {
  for (const profile of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({
      viewport: { width: profile.width, height: profile.height },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('response', res => { if (res.status() >= 400) errors.push('HTTP ' + res.status() + ': ' + res.url()); });
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    assert.equal(response?.status(), 200, 'Nested preview path does not respond with HTTP 200');

    const result = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('[data-chapter-preview] li')];
      return {
        title: document.title,
        heading: document.querySelector('h1')?.textContent?.trim(),
        ready: document.body.dataset.storybookReady,
        stage: document.body.dataset.storybookStage,
        count: document.body.dataset.chapterCount,
        names: elements.map(li => li.lastElementChild?.textContent),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        legacyCanvas: Boolean(document.querySelector('#world, #webgl-wrap')),
        stylesheetLoaded: getComputedStyle(document.body).fontFamily.includes('Georgia'),
        main: Boolean(document.querySelector('main')),
        noindex: document.querySelector('meta[name="robots"]')?.content,
      };
    });

    assert.equal(errors.length, 0, profile.name + ' errors: ' + errors.join(' | '));
    assert.equal(result.ready, 'true', 'Storybook ESM did not connect the content module');
    assert.equal(result.stage, '02');
    assert.equal(result.count, '5');
    assert.deepEqual(result.names, expected);
    assert.equal(result.horizontalOverflow, false, 'Horizontal page overflow');
    assert.equal(result.legacyCanvas, false, 'Legacy WebGL leaked into the isolated page');
    assert.equal(result.stylesheetLoaded, true, 'Namespaced scaffold stylesheet unavailable');
    assert.equal(result.main, true);
    assert.equal(result.noindex, 'noindex,nofollow');
    assert.ok(result.heading?.includes('taking root'), 'Scaffold H1 missing');

    await page.screenshot({
      path: 'screenshots/storybook/scaffold-' + profile.name + '.png',
      fullPage: true,
      animations: 'disabled',
    });
    console.log('PASS ' + profile.name + ' ' + JSON.stringify(result));
    await page.close();
  }
} finally {
  await browser.close();
}
