/** Stage 07: automatic pencil route, original painting, native links; text-only QA. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const widths=[[320,720],[375,812],[390,844],[430,932],[768,860],[1024,768],[1440,900],[844,390]];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passes=0;
try {
 for(const route of routes)for(const [width,height] of widths){
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
   assert.equal((await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:45000})).status(),200);
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
   const scene=page.locator('.path-map-art');
   assert.equal(await page.locator('[data-path-trace-toggle]').count(),0,'No trace enable/disable choice');
   await scene.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:10000});
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.tracePhase==='settled',null,{timeout:10000});
   const state=await page.evaluate(async()=>{
    const img=document.querySelector('.path-map-backdrop');
    await img.decode();
    const paper=document.querySelector('.path-map-paperkeeper');
    const moth=document.querySelector('.path-map-moth');
    await Promise.all([paper.decode(),moth.decode()]);
    const art=document.querySelector('.path-map-art').getBoundingClientRect();
    const heading=document.querySelector('#winding-path .section-intro').getBoundingClientRect();
    return {source:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight,
     paper:paper.naturalWidth,moth:moth.naturalWidth,artWidth:art.width,artHeight:art.height,
     overlapX:Math.max(0,Math.min(art.right,heading.right)-Math.max(art.left,heading.left)),
     overlapY:Math.max(0,Math.min(art.bottom,heading.bottom)-Math.max(art.top,heading.top)),
     motion:document.querySelector('[data-path-map]').dataset.motionMode,
     phase:document.querySelector('[data-path-map]').dataset.tracePhase,
     drawn:document.querySelector('[data-path-map]').dataset.autoPlayed,
     over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};
   });
   assert.equal(state.width,width<=670?768:1536);
   assert.equal(state.height,width<=670?1248:1024);
   assert.equal(state.source.includes('winding-path-mobile'),width<=670);
   assert.ok(state.paper>0&&state.moth>0,'Canonical characters decode');
   assert.ok(state.artWidth>200&&state.artHeight>280);
   assert.equal(state.over,false,'No horizontal overflow');
   assert.ok(state.overlapX*state.overlapY<2,'Painting does not cover editorial intro');
   assert.equal(state.motion,'automatic');
   assert.equal(state.phase,'settled');
   assert.equal(state.drawn,'true');
   assert.deepEqual(errors,[],route+' '+width+' errors');
   await page.locator('#winding-path .path-note a[href="#work-clearing"]').click();
   assert.equal(new URL(page.url()).hash,'#work-clearing','Native chapter link');
   console.log('PASS Stage07 '+route+' '+width+' painterly art and automatic pencil draw');
   passes++;
  } finally { await context.close(); }
 }
 for(const route of routes){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  try{
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   await page.locator('.path-map-art').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:10000});
   await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.tracePhase==='settled',null,{timeout:10000});
   assert.equal(await page.locator('[data-path-trace-toggle]').count(),0);
   console.log('PASS Stage07 '+route+' softer but automatic drawing under reduced OS preference');
  }finally{await context.close();}
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route(/\.(webp|png|avif)(?:\?|$)/i,r=>r.abort());
 await page.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('#winding-path h2').count(),1);
 await page.locator('#winding-path .path-note a[href="#work-clearing"]').click();
 assert.equal(new URL(page.url()).hash,'#work-clearing');
 await page.close();
 console.log('STAGE07 AUTO ROUTE PASS '+passes+'/16 routes/viewports; no screenshots.');
} finally { await browser.close(); }
