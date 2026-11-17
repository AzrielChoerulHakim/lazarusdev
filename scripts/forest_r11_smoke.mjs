/** R11 user-visible ink, route and pacing QA. No screenshots, video or trace. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
let cases=0;
try{
  for(const route of routes)for(const width of [390,1440]){
    const ctx=await browser.newContext({viewport:{width,height:width===390?844:900}});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      assert.equal((await page.goto(origin+route,{waitUntil:'networkidle'})).status(),200);
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
      const button=page.locator('[data-path-trace-toggle]');
      await button.scrollIntoViewIfNeeded();
      const geometry=await page.evaluate(()=>{
        const map=document.querySelector('.path-map-art').getBoundingClientRect();
        const control=document.querySelector('[data-path-trace-toggle]').getBoundingClientRect();
        return {inArt:control.left>=map.left-1&&control.right<=map.right+1&&control.top>=map.top-1&&control.bottom<=map.bottom+1,
          seams:[...document.querySelectorAll('[data-chapter-seam]')].map(x=>Math.round(x.getBoundingClientRect().height)),
          over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};
      });
      assert.equal(geometry.inArt,true,'Pencil action should stay inside the illustrated viewport');
      assert.equal(geometry.over,false,'No horizontal overflow');
      assert.ok(geometry.seams.every(h=>h<=200),'No oversized chapter transition spacer: '+geometry.seams);
      await button.click();
      assert.equal(await button.getAttribute('aria-pressed'),'true');
      await page.waitForFunction(()=>document.querySelector('[data-path-map]').dataset.tracePhase==='drawing',null,{timeout:5000});
      await page.waitForFunction(()=>document.querySelector('[data-path-map]').dataset.tracePhase==='settled',null,{timeout:5000});
      assert.equal(await page.locator('[data-path-map]').getAttribute('data-progress'),'100','Real drawn route reaches target');
      await button.click();
      assert.equal(await button.getAttribute('aria-pressed'),'false');
      await page.waitForFunction(()=>document.querySelector('[data-path-map]').dataset.tracePhase==='settled',null,{timeout:5000});
      await page.locator('#folio-atrium summary').click();
      assert.equal(await page.locator('#folio-atrium').evaluate(x=>x.open),true);
      assert.equal(await page.locator('#folio-atrium .folio-main').evaluate(x=>getComputedStyle(x,'::after').backgroundImage.includes('image/svg+xml')),true,'Folio opened with real hand-drawn underline');
      await page.locator('#river-note-a summary').click();
      assert.equal(await page.locator('#river-note-a details').evaluate(x=>x.open),true);
      assert.equal(await page.locator('#river-note-a h3').evaluate(x=>getComputedStyle(x,'::after').backgroundImage.includes('image/svg+xml')),true,'Opened river note has waterline drawing');
      assert.deepEqual(errors,[],route+' browser errors');
      console.log('PASS R11 '+route+' '+width+' on-scene route, ink folds, pacing');
      cases++;
    }finally{await ctx.close();}
  }
  for(const route of routes){
    const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await ctx.newPage();
    try{
      await page.goto(origin+route,{waitUntil:'networkidle'});
      await page.locator('[data-path-trace-toggle]').click();
      assert.equal(await page.locator('[data-path-map]').getAttribute('data-progress'),'100');
      assert.equal(await page.locator('[data-path-map]').getAttribute('data-trace-phase'),'settled');
      await page.locator('#folio-oracle summary').click();
      assert.equal(await page.locator('#folio-oracle').evaluate(x=>x.open),true);
      assert.equal(await page.locator('#folio-oracle .folio-main').evaluate(x=>getComputedStyle(x,'::after').transitionDuration),'0s');
      console.log('PASS R11 '+route+' reduced motion');
      cases++;
    }finally{await ctx.close();}
    const nojs=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
    const nojsPage=await nojs.newPage();
    try{
      await nojsPage.goto(origin+route,{waitUntil:'domcontentloaded'});
      assert.equal(await nojsPage.locator('[data-path-trace-toggle]').isVisible(),false);
      await nojsPage.locator('#folio-atrium summary').click();
      await nojsPage.locator('#river-note-a summary').click();
      assert.equal(await nojsPage.locator('#folio-atrium').evaluate(x=>x.open),true);
      assert.equal(await nojsPage.locator('#river-note-a details').evaluate(x=>x.open),true);
      console.log('PASS R11 '+route+' native no-JS notes');
      cases++;
    }finally{await nojs.close();}
  }
  console.log('R11 COMPLETE '+cases+' real-browser flows; no screenshots/video.');
}finally{await browser.close();}
