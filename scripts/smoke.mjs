import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  // GitHub-hosted Ubuntu already ships Google Chrome. Using it avoids a
  // second 300 MB Playwright-browser download that can stall visual CI.
  ...(process.env.CI ? {channel:'chrome'} : {}),
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
    try {
      await page.waitForFunction(
        ({ width, height }) => {
          const el = document.querySelector('#world');
          return el && (el.width >= width * .8 && el.height >= height * .8 || getComputedStyle(el).display === 'none');
        },
        { width, height },
        { timeout: 30000 },
      );
    } catch (err) {
      throw new Error(`${name}: timed out waiting for Three.js: ${warnings.join(' | ')} | ${errors.join(' | ')} | ${err.message}`);
    }
    try {
      await page.waitForFunction(
        () => ['scanned', 'unavailable'].includes(document.documentElement.dataset.sceneAsset),
        null,
        { timeout: 90000 }
      );
    } catch (err) {
      const state = await page.evaluate(() => ({
        sceneAsset: document.documentElement.dataset.sceneAsset,
        webgl: document.documentElement.dataset.webgl,
        material: document.documentElement.dataset.sceneMaterial,
        statueMode: document.documentElement.dataset.statueMode,
        version: navigator.userAgent,
      }));
      throw new Error(`${name}: marble scan load timeout: ${JSON.stringify(state)}; errors: ${errors.join(' | ')}; warnings: ${warnings.join(' | ')}; ${err.message}`);
    }
    const state = await page.evaluate(() => {
      const canvas = document.querySelector('#world');
      const gl = canvas.getContext('webgl2');
      return {
        gl: !!gl,
        pixels: canvas.width * canvas.height,
        webglVersion: gl?.getParameter(gl.VERSION),
        asset: document.documentElement.dataset.sceneAsset,
        fracture: document.documentElement.dataset.fracture,
        rendered: document.documentElement.dataset.webgl,
        dust: document.documentElement.dataset.atmosphericMotes,
        rig: window.__lazarusDebug?.(),
      };
    });
    if (state.asset !== 'scanned') throw new Error(`${name}: expected licensed scan, got ${state.asset}; warnings=${warnings.join(' | ')}; errors=${errors.join(' | ')}`);
    if (state.rendered !== 'ready') throw new Error(`${name}: WebGL did not finish drawing a frame`);
    if (state.dust !== 'ready' || !state.rig || state.rig.dustMotes < 200) throw new Error(`${name}: physical dust system did not initialize: ${JSON.stringify(state.rig)}`);
    if (state.rig.keyLight?.[0] >= 0) throw new Error(`${name}: upper-left physical key light is misaligned`);
    // Regression for the overlaid statue: the licensed asset MUST be the
    // scene's sole bust; no hidden primitive or second scan is permissible.
    if (state.rig.statueMode !== 'impossible-marble'
       || state.rig.statueFragments !== 3
       || state.rig.scanRootCount !== 1
       || state.rig.syntheticBustCount !== 0
       || state.rig.statueMeshCount < 1
       || !Array.isArray(state.rig.statueMeshes)
       || state.rig.statueMeshes.length !== state.rig.statueMeshCount
       || !Number.isInteger(state.rig.statueDuplicatesRemoved)) {
      throw new Error(`${name}: overlapping statue geometry: ${JSON.stringify(state.rig)}`);
    }
    // One licensed scan is divided into EXCLUSIVE triangle bands to create
    // the surreal levitation. Three fragments are not three superposed busts.
    if (state.fracture !== 'three-levitating-sections'
      || state.rig.impossiblePortal?.otherWorldObjects < 20
      || state.rig.impossiblePortal?.desertResolution?.[0] < 128) {
      throw new Error(`${name}: portal/fracture stage not initialized: ${JSON.stringify(state.rig)}`);
    }
    await page.waitForFunction(
      () => ['photographic','procedural'].includes(document.documentElement.dataset.sceneMaterial),
      null, {timeout:30000}
    );
    const stoneState = await page.evaluate(() => document.documentElement.dataset.sceneMaterial);
    if (stoneState !== 'photographic') throw new Error(`${name}: verified sandstone maps did not load: ${stoneState}`);
    if (!state.gl || state.pixels < width * height * .6) throw new Error(`${name}: Three.js renderer did not initialize: ${JSON.stringify(state)}; warnings=${warnings.join(' | ')}; errors=${errors.join(' | ')}`);
    // Native scroll must drive the camera immediately, in one continuous
    // direction, without repeated easing plateaus at section boundaries.
    const scrollCheck=await page.evaluate(async () => {
      const y0=document.getElementById('passage').offsetTop;
      const samples=[];
      for(const part of [0,.06,.15,.28,.42,.64,.83]){
        scrollTo({top:y0*part,behavior:'instant'});
        // Scroll events and render callbacks can arrive on adjacent frames
        // under headless Chrome; inspect after both have had a chance to run.
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        const target=window.__lazarusScrollDebug().progress;
        const rig=window.__lazarusDebug();
        samples.push({part,target,worldTarget:rig.targetProgress});
      }
      scrollTo({top:0,behavior:'instant'});
      return samples;
    });
    for(let i=1;i<scrollCheck.length;i++){
      const before=scrollCheck[i-1],after=scrollCheck[i];
      if(after.target <= before.target + .008)
        throw new Error(`${name}: scroll transition stalls at ${JSON.stringify(scrollCheck)}`);
      if(Math.abs(after.target-after.worldTarget)>.005)
        throw new Error(`${name}: scroll/camera desynchronized at ${JSON.stringify(scrollCheck)}`);
    }
    // Sticky copy must remain stationary as the gate moves past it. Check
    // two different native scroll positions (not a forced CSS animation).
    const stickyDrift = await page.evaluate(async () => {
      const passage = document.querySelector('#passage');
      const copy = passage.querySelector('.passage-copy');
      const root = passage.offsetTop;
      scrollTo({ top: root + 190, behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(resolve));
      const first = copy.getBoundingClientRect().top;
      scrollTo({ top: root + 270, behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(resolve));
      const second = copy.getBoundingClientRect().top;
      scrollTo({ top: 0, behavior: 'instant' });
      return { first, second };
    });
    if (Math.abs(stickyDrift.first - stickyDrift.second) > 2) {
      throw new Error(`${name}: passage headline jitters with native scroll: ${JSON.stringify(stickyDrift)}`);
    }
    await page.waitForTimeout(240);
    await page.screenshot({ path: `screenshots/${name}-hero.png`, animations: 'disabled' });
    await page.locator('#passage').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/${name}-portal.png`, animations: 'disabled' });
    // Verify the visitor can actually cross the Three.js threshold and land
    // in the next semantic section, without a full page reload.
    await page.locator('#portal-enter').click();
    try {
      await page.waitForFunction(() =>
        location.hash === '#worlds'
        && !document.querySelector('#portal-enter').disabled
        && !window.__lazarusDebug?.().portalFlying,
        null, { timeout: 15000 }
      );
    } catch (error) {
      const failureState = await page.evaluate(() => ({
        hash: location.hash,
        buttonDisabled: document.querySelector('#portal-enter').disabled,
        overlayOpacity: getComputedStyle(document.querySelector('#portal-transition')).opacity,
        debug: window.__lazarusDebug?.(),
      }));
      throw new Error(`${name}: portal flight did not finish: ${JSON.stringify(failureState)}; ${error.message}`);
    }
    const landed = await page.evaluate(() => ({
      section: location.hash,
      scrollY: window.scrollY,
      top: document.querySelector('#worlds').offsetTop,
      depth: window.__lazarusDebug?.().camera?.[2],
    }));
    if (Math.abs(landed.scrollY - landed.top) > 4 || !Number.isFinite(landed.depth)) {
      throw new Error(`${name}: portal flight handoff missed section: ${JSON.stringify(landed)}`);
    }
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
    console.log(`${name} PASS — ${state.webglVersion} — scanned bust loaded, ${state.pixels} framebuffer pixels, portal, navigation + dialogs operational`);
    await page.close();
  }
} finally {
  await browser.close();
}
