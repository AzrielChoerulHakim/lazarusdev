/** R12 production-page motion. Built routes only; no screenshot/video/trace capture. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let checks=0;
async function settled(page,selector){
  await page.waitForFunction(selector=>{
    const img=document.querySelector(selector);
    return img?.dataset.autoPlayed==='true'&&img.dataset.actingState==='settled';
  },selector,{timeout:24000});
}
try {
 for(const route of routes)for(const width of [320,390,1440]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?720:width===390?844:900}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
   assert.equal((await page.goto(origin+route,{waitUntil:'domcontentloaded'})).status(),200);
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
   assert.equal(await page.locator('[data-path-trace-toggle],[data-paperkeeper-step]').count(),0,'No motion choice controls');
   await page.locator('.entrance-paperkeeper').scrollIntoViewIfNeeded();
   await settled(page,'.entrance-paperkeeper');
   await page.locator('.field-atlas-paperkeeper').scrollIntoViewIfNeeded();
   await settled(page,'.field-atlas-paperkeeper');
   assert.equal(await page.locator('#field-atlas').evaluate(x=>x.open),false,'Reading the atlas is an optional native disclosure, motion is not');
   await page.locator('.hero-atlas-cue').click();
   await page.waitForURL('**/#field-atlas');
   assert.equal(await page.locator('#field-atlas').evaluate(x=>x.open),true);
   await page.locator('.path-map-art').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:8500});
   assert.equal(await page.locator('[data-path-map]').getAttribute('data-motion-mode'),'automatic');
   await page.locator('[data-paperkeeper-walk]').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-paperkeeper-walk]')?.dataset.motionState==='complete',null,{timeout:18000});
   assert.equal(await page.locator('[data-paperkeeper-walk]').getAttribute('data-auto-played'),'true');
   for(const selector of ['.work-clearing-world','.river-scene','.house-scene']){
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForFunction(selector=>document.querySelector(selector)?.dataset.autoSeen==='true',selector,{timeout:8500});
    assert.equal(await page.locator(selector).getAttribute('data-auto-visible'),'true');
   }
   assert.ok((await page.locator('.house-glow-layer').evaluate(x=>getComputedStyle(x).animationName)).includes('r12-window-breath'),'House glows before user click');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false);
   assert.deepEqual(errors,[],route+' '+width+' browser errors');
   checks++;
   console.log('PASS R12 '+route+' '+width+' authored hero, atlas, route, walk and all chapters');
  }finally{await ctx.close();}
 }
 for(const route of routes){
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  try{
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   await page.locator('.entrance-paperkeeper').scrollIntoViewIfNeeded();
   await settled(page,'.entrance-paperkeeper');
   await page.locator('.path-map-art').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:8500});
   assert.equal(await page.locator('[data-path-trace-toggle],[data-paperkeeper-step]').count(),0);
   console.log('PASS R12 '+route+' automatic motion under OS reduced preference');
   checks++;
  }finally{await ctx.close();}
  const nojs=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
  const p=await nojs.newPage();
  try{
   await p.goto(origin+route,{waitUntil:'domcontentloaded'});
   assert.equal(await p.locator('[data-path-trace-toggle],[data-paperkeeper-step]').count(),0);
   await p.locator('#field-atlas summary').click();
   assert.equal(await p.locator('#field-atlas').evaluate(x=>x.open),true);
   await p.locator('#folio-atrium summary').click();
   assert.equal(await p.locator('#folio-atrium').evaluate(x=>x.open),true);
   console.log('PASS R12 '+route+' no-JS native reading');
   checks++;
  }finally{await nojs.close();}
 }
 console.log('R12 COMPLETE '+checks+' real-browser flows; zero screenshots/video.');
}finally{await browser.close();}
