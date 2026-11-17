/** R02 user-visible contracts; text diagnostics only. No screenshots/video. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const require = createRequire(import.meta.url);
const origin = process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes = ['/lazarusdev/', '/lazarusdev/storybook/'];
const profiles = [[320,720],[375,812],[390,844],[430,932],[670,850],[671,850],[768,860],[1024,768],[1440,900],[844,390],[720,450]];
const manifest = JSON.parse(await readFile(new URL('../storybook/assets/entrance/r02/manifest.json', import.meta.url)));
const footBaseline = manifest.assets.find(x => x.name === 'paperkeeper.three-quarter').export.alpha.footBaseline;
const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : process.env.CI ? { channel: 'chrome' } : {}), headless: true, args: ['--no-sandbox'] });
const report = { revision: 'R02', capturedAt: new Date().toISOString(), profiles: [], fallbacks: [], screenshots: 0 };

async function layout(page) {
  return page.evaluate(() => {
    const bounds = selector => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom };
    };
    const keeper = document.querySelector('.entrance-paperkeeper');
    const backdrop = document.querySelector('.entrance-backdrop');
    return {
      keeper:bounds('.entrance-paperkeeper'), stage:bounds('.entrance-stage'),
      copy:bounds('.hero-copy'), heading:bounds('#entrance h1'), cta:bounds('#entrance .button-primary'),
      shadow:bounds('.entrance-grounding'), chapter:bounds('#entrance'),
      documentHeight:document.documentElement.scrollHeight,
      overflow:document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      characterDecoded:keeper.complete && keeper.naturalWidth > 0,
      environmentDecoded:backdrop.complete && backdrop.naturalWidth > 0,
      environment:backdrop.currentSrc, environmentFit:getComputedStyle(backdrop).objectFit,
      characterAnimation:getComputedStyle(keeper).animationName,
      characterTransform:getComputedStyle(keeper).transform,
      preloads:[...document.querySelectorAll('link[rel="preload"][as="image"]')].filter(x => matchMedia(x.media).matches).map(x => x.href),
      transfer:performance.getEntriesByType('resource').filter(x => /entrance-(mobile|desktop)|paperkeeper.three-quarter/.test(x.name)).map(x => ({ url:x.name, encodedBytes:x.encodedBodySize })),
      cls:window.__r02CLS || 0,
    };
  });
}

try {
  for (const route of routes) for (const [width,height] of profiles) {
    const context = await browser.newContext({ viewport:{width,height} });
    await context.addInitScript(() => {
      window.__r02CLS = 0;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__r02CLS += entry.value;
      }).observe({type:'layout-shift',buffered:true});
    });
    const page = await context.newPage(), errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
    page.on('request', r => { if (/entrance-(mobile|desktop).*\.webp/.test(r.url())) requests.push(r.url()); });
    const tag = `${route} ${width}×${height}`;
    try {
      assert.equal((await page.goto(origin+route,{waitUntil:'networkidle'})).status(),200,tag);
      await page.waitForFunction(() => document.body.dataset.storybookReady === 'true');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.querySelectorAll('.entrance-stage img')].map(x => x.decode()));
      });
      const state = await layout(page);
      assert.deepEqual(errors,[],tag+' load errors');
      assert.equal(state.overflow,false,tag+' horizontal overflow');
      assert.ok(state.characterDecoded && state.environmentDecoded,tag+' both layers decoded');
      assert.equal(state.environmentFit,'contain',tag+' full illustration remains visible');
      assert.equal(state.environment.includes('entrance-mobile'),width<=670,tag+' responsive source');
      assert.equal(requests.length,1,tag+' only one environment download');
      assert.deepEqual(state.preloads,[state.environment],tag+' correct preload');
      assert.ok(state.cta.width>=44 && state.cta.height>=44,tag+' primary touch target');
      const overlapX = Math.max(0,Math.min(state.copy.right,state.keeper.right)-Math.max(state.copy.x,state.keeper.x));
      const overlapY = Math.max(0,Math.min(state.copy.bottom,state.keeper.bottom)-Math.max(state.copy.y,state.keeper.y));
      assert.equal(overlapX*overlapY,0,tag+' no character over copy');
      assert.ok(state.keeper.y>=state.stage.y && state.keeper.bottom<=state.stage.bottom && state.keeper.right<=state.stage.right,tag+' intact character within scene');
      const feetY = state.keeper.y + state.keeper.height*footBaseline;
      const groundY = state.shadow.y + state.shadow.height/2;
      assert.ok(Math.abs(feetY-groundY)<=3,tag+' alpha feet on contact shadow: '+(feetY-groundY));
      if (width===390) {
        assert.ok(state.keeper.y>=500 && state.keeper.y<=700 && state.keeper.bottom<height,tag+' character visible in first screen');
        assert.ok(state.keeper.height>=150 && state.keeper.height<=190,tag+' readable mobile character scale');
        assert.ok(state.cta.bottom<state.stage.y,tag+' message and CTA precede scene');
      }
      if (width===1440) assert.ok(state.keeper.height>=240 && state.keeper.height<=300,tag+' desktop reference scale');
      await page.locator('.entrance-leaf-link').focus();
      assert.equal(await page.locator('.entrance-paperkeeper').evaluate(x=>getComputedStyle(x).animationName),'none',tag+' static even when old tilt trigger is focused');
      await page.locator('.hero-atlas-cue').click();
      await page.waitForURL('**/#field-atlas');
      assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),true,tag+' cue opens the real atlas in one action');
      await page.locator('[data-field-atlas] summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),false,tag+' keyboard closes native atlas');
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),true,tag+' keyboard reopens native atlas');
      assert.ok(Math.abs((await layout(page)).stage.height-state.stage.height)<1,tag+' atlas does not stretch scene');
      await page.locator('.field-atlas-index a[href="#work-clearing"]').click();
      await page.waitForURL('**/#work-clearing');
      await page.locator('#entrance .text-link').click();
      await page.waitForURL('**/#winding-path');
      if ([390,1440].includes(width)) {
        await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
        const violations = await page.evaluate(async () => (await axe.run({include:['#entrance','#site-header']},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(x => ({id:x.id,nodes:x.nodes.map(n=>n.target)})));
        assert.deepEqual(violations,[],tag+' Entrance WCAG automated audit');
        state.axeViolations = violations;
      }
      report.profiles.push({ route,width,height,...state,footGroundDifference:feetY-groundY });
      console.log('PASS R02 '+tag+' geometry, source, keyboard, native navigation');
    } finally { await context.close(); }
  }

  for (const route of routes) for (const mode of ['no-js','images-blocked','reduced-motion','text-200']) {
    const context = await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced-motion'?'reduce':'no-preference'});
    if (mode==='images-blocked') await context.route('**/*', r => r.request().resourceType()==='image'?r.abort():r.continue());
    const page = await context.newPage();
    try {
      await page.goto(origin+route,{waitUntil:'networkidle'});
      if (mode==='text-200') await page.addStyleTag({content:':root { font-size:200% !important; }'});
      assert.equal(await page.locator('#entrance h1').isVisible(),true,route+' '+mode+' live heading');
      const overflow = await page.evaluate(() => {
        const entrance = document.querySelector('#entrance');
        return { entrance:entrance.scrollWidth>entrance.clientWidth+1, document:document.documentElement.scrollWidth>document.documentElement.clientWidth+1 };
      });
      assert.equal(mode==='text-200'?overflow.entrance:overflow.document,false,route+' '+mode+' no overflow in tested scope');
      if (mode==='reduced-motion') {
        await page.locator('.entrance-leaf-link').focus();
        assert.equal(await page.locator('.entrance-paperkeeper').evaluate(x=>getComputedStyle(x).animationName),'none',route+' reduced motion static');
      }
      await page.locator('#entrance .button-primary').click();
      await page.waitForURL('**/#work-clearing');
      await page.locator('.hero-atlas-cue').click();
      await page.waitForURL('**/#field-atlas');
      assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),mode!=='no-js',route+' '+mode+' cue fallback');
      await page.locator('[data-field-atlas] summary').click();
      if(mode!=='no-js'){
        assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),false,route+' '+mode+' native close');
        await page.locator('[data-field-atlas] summary').click();
      }
      assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),true,route+' '+mode+' native atlas');
      report.fallbacks.push({route,mode,passed:true,scope:mode==='text-200'?'Entrance text reflow; global baseline overflow recorded for R06/R08':'document',overflow});
      console.log('PASS R02 '+route+' '+mode);
    } finally { await context.close(); }
  }
  if (process.env.R02_REPORT_PATH) await writeFile(process.env.R02_REPORT_PATH,JSON.stringify(report,null,2)+'\n');
  console.log(`R02 COMPLETE: ${report.profiles.length} layout profiles, ${report.fallbacks.length} fallback flows, zero screenshots.`);
} finally { await browser.close(); }
