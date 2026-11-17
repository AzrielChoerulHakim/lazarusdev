/** Stage 11: actual hand-drawn Paperkeeper walk automatically on view; text-only. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const profiles=[[320,720],[375,812],[390,844],[430,932],[768,860],[1024,768],[1440,900],[844,390]];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let checks=0;
try{
 for(const route of routes)for(const [width,height] of profiles){
  const ctx=await browser.newContext({viewport:{width,height}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   assert.equal((await page.goto(origin+route,{waitUntil:'domcontentloaded'})).status(),200);
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
   assert.equal(await page.locator('[data-paperkeeper-step]').count(),0,'No Watch/Play control');
   if(width===390||width===1440){
    await page.evaluate(()=>{
     window.__walkFrames=[document.querySelector('[data-paperkeeper-walk]').src];
     const image=document.querySelector('[data-paperkeeper-walk]');
     window.__walkObserver=new MutationObserver(()=>window.__walkFrames.push(image.src));
     window.__walkObserver.observe(image,{attributes:true,attributeFilter:['src']});
    });
   }
   await page.locator('[data-paperkeeper-walk]').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-paperkeeper-walk]')?.dataset.motionState==='complete',null,{timeout:18000});
   const state=await page.evaluate(()=>{
    const reel=document.querySelector('[data-paperkeeper-walk]');
    return {frames:document.querySelectorAll('[data-paperkeeper-pose]').length,
     imageLoaded:reel.complete&&reel.naturalWidth>0,
     auto:reel.dataset.autoPlayed,
     over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
     chapters:document.querySelectorAll('[data-chapter]').length,
     status:document.getElementById('paperkeeper-step-status')?.textContent};
   });
   assert.equal(state.frames,2);
   assert.equal(state.imageLoaded,true);
   assert.equal(state.auto,'true');
   assert.equal(state.over,false);
   assert.equal(state.chapters,5);
   assert.ok(state.status.includes('Paperkeeper'),'Narrative caption survives');
   if(width===390||width===1440){
    const seen=await page.evaluate(()=>{
     window.__walkObserver.disconnect();
     const expected=[document.querySelector('[data-paperkeeper-walk]'),...document.querySelectorAll('[data-paperkeeper-pose]')]
       .map(img=>new URL(img.getAttribute('src'),document.baseURI).href);
     const seen=new Set(window.__walkFrames);
     return expected.map(url=>seen.has(url));
    });
    assert.deepEqual(seen,[true,true,true],route+' '+width+' shows three real drawings');
    await page.locator('[data-house-light-toggle]').click();
    assert.equal(await page.locator('[data-house-scene]').getAttribute('data-lit'),'true','House functional light retained');
   }
   assert.deepEqual(errors,[]);
   checks++;
   console.log('PASS Stage11 '+route+' '+width+' automatic canonical 3-pose step');
  }finally{await ctx.close();}
 }
 for(const route of routes){
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  try{
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   await page.locator('[data-paperkeeper-walk]').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-paperkeeper-walk]')?.dataset.motionState==='complete',null,{timeout:18000});
   assert.equal(await page.locator('[data-paperkeeper-walk]').getAttribute('data-auto-played'),'true');
   assert.equal(await page.locator('[data-paperkeeper-step]').count(),0);
   console.log('PASS Stage11 '+route+' no opt-in even under reduced OS motion');
  }finally{await ctx.close();}
  const ctx2=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
  const nojs=await ctx2.newPage();
  try{
   await nojs.goto(origin+route,{waitUntil:'domcontentloaded'});
   assert.equal(await nojs.locator('[data-paperkeeper-step]').count(),0);
   assert.equal(await nojs.locator('[data-paperkeeper-walk]').count(),1);
   assert.equal(await nojs.locator('#winding-path h2').isVisible(),true);
   await nojs.locator('#winding-path .path-note a[href="#work-clearing"]').click();
   assert.equal(new URL(nojs.url()).hash,'#work-clearing');
   console.log('PASS Stage11 '+route+' no-JS readable source');
  }finally{await ctx2.close();}
 }
 console.log('STAGE11 AUTO WALK COMPLETE '+checks+'/16 profiles; no media captures.');
}finally{await browser.close();}
