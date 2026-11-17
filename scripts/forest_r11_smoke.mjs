/** R11/R12: the drawing appears where the reader arrives, without play toggles. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let checks=0;
try{
 for(const route of routes)for(const width of [390,1440]){
  const ctx=await browser.newContext({viewport:{width,height:width===390?844:900}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   assert.equal((await page.goto(origin+route,{waitUntil:'domcontentloaded'})).status(),200);
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
   assert.equal(await page.locator('[data-path-trace-toggle]').count(),0,'No manual motion control');
   await page.locator('.path-map-art').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:10000});
   const state=await page.evaluate(()=>({
    mode:document.querySelector('[data-path-map]').dataset.motionMode,
    phase:document.querySelector('[data-path-map]').dataset.tracePhase,
    over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    seams:[...document.querySelectorAll('[data-chapter-seam]')].map(x=>Math.round(x.getBoundingClientRect().height))
   }));
   assert.equal(state.mode,'automatic');
   assert.equal(state.phase,'settled');
   assert.equal(state.over,false);
   assert.ok(state.seams.every(x=>x<=200),'No oversized page seam');
   await page.locator('#folio-atrium summary').click();
   assert.equal(await page.locator('#folio-atrium').evaluate(x=>x.open),true);
   assert.equal(await page.locator('#folio-atrium .folio-main').evaluate(x=>getComputedStyle(x,'::after').backgroundImage.includes('image/svg+xml')),true,'Native folio has pencil underline');
   await page.locator('#river-note-a summary').click();
   assert.equal(await page.locator('#river-note-a details').evaluate(x=>x.open),true);
   assert.equal(await page.locator('#river-note-a h3').evaluate(x=>getComputedStyle(x,'::after').backgroundImage.includes('image/svg+xml')),true,'Native river note has waterline drawing');
   assert.deepEqual(errors,[]);
   checks++;
   console.log('PASS R11 '+route+' '+width+' automatic path and native ink readings');
  }finally{await ctx.close();}
 }
 for(const route of routes){
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  try{
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   await page.locator('.path-map-art').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:10000});
   await page.locator('#folio-oracle summary').click();
   assert.equal(await page.locator('#folio-oracle').evaluate(x=>x.open),true);
   checks++;
   console.log('PASS R11 '+route+' automatic trace and native folio with OS reduced preference');
  }finally{await ctx.close();}
  const ctx2=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
  const nojs=await ctx2.newPage();
  try{
   await nojs.goto(origin+route,{waitUntil:'domcontentloaded'});
   assert.equal(await nojs.locator('[data-path-trace-toggle]').count(),0);
   await nojs.locator('#folio-atrium summary').click();
   await nojs.locator('#river-note-a summary').click();
   assert.equal(await nojs.locator('#folio-atrium').evaluate(x=>x.open),true);
   assert.equal(await nojs.locator('#river-note-a details').evaluate(x=>x.open),true);
   checks++;
   console.log('PASS R11 '+route+' no-JS native folio and notebook');
  }finally{await ctx2.close();}
 }
 console.log('R11/R12 COMPLETE '+checks+' browser flows; no screenshots/video.');
}finally{await browser.close();}
