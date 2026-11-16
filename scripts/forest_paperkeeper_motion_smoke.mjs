/** Stage 11 — browser behavioral test: no screenshots, 8 sizes x 2 real routes. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes = ['/lazarusdev/', '/lazarusdev/storybook/'];
const profiles = [
  {w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},
  {w:768,h:860},{w:1024,h:768},{w:1440,h:900},{w:844,h:390}
];
const browser = await chromium.launch({
  ...(process.env.CI ? {channel:'chrome'} : {}),
  headless:true, args:['--no-sandbox']
});
let passed = 0;
try {
  for (const route of routes) for (const p of profiles) {
    const context = await browser.newContext({viewport:{width:p.w,height:p.h},reducedMotion:'no-preference'});
    const page = await context.newPage();
    const faults = [];
    page.on('pageerror',err=>faults.push(err.message));
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)faults.push(r.status()+' '+r.url());});
    const tag = route+' '+p.w+'x'+p.h;
    try {
      const response = await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
      assert.equal(response?.status(),200,tag+' response');
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true',{timeout:12000});
      await page.waitForFunction(()=>!document.querySelector('[data-paperkeeper-step]').hidden,{timeout:12000});
      // The small drawing is deliberately lazy-loaded below the fold.
      // Exercise its real viewport load rather than assuming an offscreen image is decoded.
      await page.locator('[data-paperkeeper-walk]').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{
        const image=document.querySelector('[data-paperkeeper-walk]');
        return image.complete && image.naturalWidth > 0;
      },{timeout:10000});
      const metrics = await page.evaluate(()=>{
        const reel = document.querySelector('[data-paperkeeper-walk]');
        const button = document.querySelector('[data-paperkeeper-step]');
        const box = button.getBoundingClientRect();
        return {
          chapters:document.querySelectorAll('[data-chapter]').length,
          h1:document.querySelectorAll('h1').length,
          overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
          poses:document.querySelectorAll('[data-paperkeeper-walk]').length,
          reading:document.querySelectorAll('.river-paperkeeper-reader').length,
          size:{width:box.width,height:box.height},
          reelLoaded:reel.complete&&reel.naturalWidth>0,
          state:reel.dataset.motionState,
          hasNativeLinks:!!document.querySelector('a[href="#winding-path"]'),
          caption:document.querySelector('.keeper-motion-status')?.textContent
        };
      });
      assert.equal(metrics.chapters,5,tag+' chapter count');
      assert.equal(metrics.h1,1,tag+' h1 count');
      assert.equal(metrics.overflow,false,tag+' horizontal overflow');
      assert.equal(metrics.poses,1,tag+' motion study');
      assert.equal(metrics.reading,1,tag+' reading pose');
      assert.ok(metrics.size.width>=44 && metrics.size.height>=44,tag+' touch target');
      assert.equal(metrics.reelLoaded,true,tag+' frame decoded');
      assert.equal(metrics.state,'idle',tag+' starts static');
      assert.ok(metrics.hasNativeLinks,tag+' navigation');
      assert.match(metrics.caption,/only when invited/,tag+' non-autoplay notice');

      // Exercise real hand-drawn pose switching at one desktop and one mobile width per route.
      if(p.w===390 || p.w===1440){
        await page.evaluate(()=>{
          window.__keeperSeen = [document.querySelector('[data-paperkeeper-walk]').getAttribute('src')];
          const reel=document.querySelector('[data-paperkeeper-walk]');
          const observer=new MutationObserver(()=>window.__keeperSeen.push(reel.getAttribute('src')));
          observer.observe(reel,{attributes:true,attributeFilter:['src']});
          window.__keeperObserver=observer;
        });
        await page.locator('[data-paperkeeper-step]').click();
        await page.waitForFunction(()=>document.querySelector('[data-paperkeeper-walk]').dataset.motionState==='complete',{timeout:6000});
        const frames=await page.evaluate(()=>{
          window.__keeperObserver.disconnect();
          // Vite may inline tiny canonical WebPs as data: URLs instead of naming files.
          // Compare the actual compiled image sources, not human-readable basenames.
          const expected=[document.querySelector('[data-paperkeeper-walk]'),
            ...document.querySelectorAll('[data-paperkeeper-pose]')]
            .map(image=>image.getAttribute('src'));
          const observed=new Set(window.__keeperSeen);
          return {
            posesSeen:expected.map(source=>observed.has(source)),
            distinctFrames:new Set(expected).size,
            disabled:document.querySelector('[data-paperkeeper-step]').disabled,
            status:document.getElementById('paperkeeper-step-status').textContent
          };
        });
        assert.equal(frames.distinctFrames,3,tag+' three independently compiled poses');
        assert.deepEqual(frames.posesSeen,[true,true,true],tag+' each actual canonical pose must appear');
        assert.equal(frames.disabled,false,tag+' replay enabled');
        assert.match(frames.status,/Replay/,tag+' accessible completion');
        // The original on-canvas full-sized figure remains unchanged.
        const original=await page.locator('.path-map-paperkeeper').getAttribute('src');
        assert.match(original,/paperkeeper\.three-quarter(?:-[^/]+)?\.webp/,tag+' canonical figure');
        const light=page.locator('[data-house-light-toggle]');
        await light.click();
        assert.equal(await page.locator('[data-house-scene]').getAttribute('data-lit'),'true',tag+' house action retained');
      }
      assert.deepEqual(faults,[],tag+' page errors');
      passed++;
      console.log('PASS',tag);
    } finally { await context.close(); }
  }
  // A reduced-motion user never receives an enabled action that would animate,
  // and the CSS acknowledgements are disabled too.
  for(const route of routes) {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await context.newPage();
    try {
      await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
      await page.waitForFunction(()=>document.querySelector('[data-paperkeeper-walk]').dataset.motionState==='idle');
      const reduced=await page.evaluate(()=>{
        const leaf=document.querySelector('.entrance-leaf-link');
        leaf.focus();
        const paperkeeper=document.querySelector('.entrance-paperkeeper');
        return {
          hidden:getComputedStyle(document.querySelector('[data-paperkeeper-step]')).display==='none',
          state:document.querySelector('[data-paperkeeper-walk]').dataset.motionState,
          animation:getComputedStyle(paperkeeper).animationName,
          message:document.getElementById('paperkeeper-step-status').textContent
        };
      });
      assert.equal(reduced.hidden,true,route+' reduced control hidden');
      assert.equal(reduced.state,'idle',route+' reduced stays still');
      assert.equal(reduced.animation,'none',route+' reduced CSS');
      assert.match(reduced.message,/disabled/,route+' reduced notice');
    } finally {await context.close();}
    // HTML, native anchors and fallback content must survive scripts disabled.
    const nojs=await browser.newContext({viewport:{width:320,height:720},javascriptEnabled:false});
    const p=await nojs.newPage();
    try {
      await p.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
      const fallback=await p.evaluate(()=>({
        chapters:document.querySelectorAll('[data-chapter]').length,
        hidden:document.querySelector('[data-paperkeeper-step]').hidden,
        text:document.querySelector('#winding-path-title').textContent,
        nav:!!document.querySelector('a[href="#winding-path"]'),
      }));
      assert.equal(fallback.chapters,5,route+' no-JS chapter fallback');
      assert.equal(fallback.hidden,true,route+' no-JS control hidden');
      assert.ok(fallback.text.includes('Every detail'),route+' no-JS text');
      assert.ok(fallback.nav,route+' no-JS anchors');
    } finally {await nojs.close();}
    console.log('PASS reduced-motion and no-JS',route);
  }
  console.log('STAGE 11 COMPLETE:',passed,'route/viewport checks plus reduced-motion and no-JS.');
} finally {await browser.close();}
