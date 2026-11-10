import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--enable-webgl', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
await mkdir('screenshots', { recursive: true });
try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    const warnings = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); if (m.type() === 'warning') warnings.push(m.text()); });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => {
      const el = document.querySelector('#world');
      return el && el.width > 0 && el.height > 0;
    }, { timeout: 18000 });
    const state = await page.evaluate(() => {
      const canvas = document.querySelector('#world');
      const gl = canvas.getContext('webgl2');
      return { gl: !!gl, pixels: canvas.width * canvas.height, webglVersion: gl?.getParameter(gl.VERSION) };
    });
    if (!state.gl || state.pixels < width * height * .6) throw new Error(`${name}: Three.js renderer did not initialize: ${JSON.stringify(state)}; warnings=${warnings.join(' | ')}; errors=${errors.join(' | ')}`);
    await page.screenshot({ path: `screenshots/${name}-hero.png`, animations: 'disabled' });
    await page.locator('#worlds').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `screenshots/${name}-worlds.png`, animations: 'disabled' });
    await page.locator('[data-project="0"]').click();
    if (!(await page.locator('#project-dialog').evaluate(el => el.open))) throw new Error(`${name}: project detail did not open`);
    await page.locator('#project-dialog [data-close-dialog]').first().click();
    if (name === 'mobile') {
      await page.locator('#menu-toggle').click();
      if ((await page.locator('#menu-toggle').getAttribute('aria-expanded')) !== 'true') throw new Error('mobile menu did not open');
      await page.locator('#mobile-nav a[href="#practice"]').click();
    }
    if (errors.length) throw new Error(`${name}: browser errors: ${errors.join(' | ')}`);
    console.log(`${name} PASS — ${state.webglVersion} — ${state.pixels} pixels, navigation + dialogs operational`);
    await page.close();
  }
} finally {
  await browser.close();
}
