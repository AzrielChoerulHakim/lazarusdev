import { chromium } from 'playwright';

// GitHub Pages serves repository source, not the Vite bundle. This test
// catches bad import-map aliases, missing assets and incorrect subpath URLs.
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--enable-webgl', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://127.0.0.1:4174/lazarusdev/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() =>
    document.documentElement.dataset.webgl === 'ready'
    && document.documentElement.dataset.sceneAsset === 'scanned'
    && document.documentElement.dataset.sceneMaterial === 'photographic'
    && document.documentElement.dataset.photoSky === 'photographic'
  , null, { timeout: 45000 });
  const state = await page.evaluate(() => ({
    canvasSize: document.querySelector('#world').width * document.querySelector('#world').height,
    scanned: document.documentElement.dataset.sceneAsset,
    sky: document.documentElement.dataset.photoSky,
    stone: document.documentElement.dataset.sceneMaterial,
  }));
  if (errors.length || state.canvasSize < 100000) {
    throw new Error('Static GitHub Pages failed: ' + JSON.stringify({ errors, state }));
  }
  console.log('GITHUB PAGES STATIC SOURCE PASS', JSON.stringify(state));
  await page.close();
} finally {
  await browser.close();
}
