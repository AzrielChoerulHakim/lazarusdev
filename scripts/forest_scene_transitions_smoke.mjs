/** Stage 12 smoke: real native navigation, four passive seams, no screenshots. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const origin=process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const sizes=[{w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},
  {w:768,h:860},{w:1024,h:768},{w:1440,h:900},{w:844,h:390}];
const targets=['winding-path','work-clearing','river-stories','house-on-the-hill'];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let verified=0;
try {
 for(const route of routes) for(const s of sizes){
  const context=await browser.newContext({viewport:{width:s.w,height:s.h},reducedMotion:'no-preference'});
  const page=await context.newPage();
  const issues=[];
  page.on('pageerror',err=>issues.push(err.message));
  page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)issues.push(r.status()+' '+r.url());});
  try{
   const response=await page.goto(origin+route,{waitUntil:'networkidle',timeout:45000});
   const tag=route+' '+s.w+'x'+s.h;
   assert.equal(response?.status(),200,tag+' HTTP');
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
   const check=await page.evaluate(()=>{
     const seams=[...document.querySelectorAll('[data-chapter-seam]')];
     return {chapters:document.querySelectorAll('[data-chapter]').length,h1:document.querySelectorAll('h1').length,
       count:seams.length,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
       links:seams.map(el=>el.querySelector('a.forest-seam-link')?.getAttribute('href')),
       minTargets:seams.map(el=>{const b=el.querySelector('a.forest-seam-link').getBoundingClientRect();return [b.width,b.height];}),
       seamsReady:document.documentElement.classList.contains('forest-seam-ready'),
       notHidden:seams.every(el=>getComputedStyle(el).display!=='none'),
       mainNav:!!document.querySelector('a[href="#house-on-the-hill"]')};
   });
   assert.equal(check.chapters,5,tag+' chapters');
   assert.equal(check.h1,1,tag+' h1');
   assert.equal(check.count,4,tag+' seams');
   assert.equal(check.overflow,false,tag+' overflow');
   assert.deepEqual(check.links,targets.map(t=>'#'+t),tag+' anchors');
   assert.equal(check.notHidden,true,tag+' displayed');
   assert.equal(check.mainNav,true,tag+' navigation');
   for(const size of check.minTargets)assert.ok(size[0]>=44&&size[1]>=44,tag+' 44px seam link '+size);
   // Scroll naturally to each independent seam and verify the ink's one-way reveal.
   for(let i=0;i<targets.length;i++){
     const seam=page.locator('[data-chapter-seam]').nth(i);
     await seam.scrollIntoViewIfNeeded();
     await page.waitForFunction(i=>document.querySelectorAll('[data-chapter-seam]')[i].dataset.ink==='drawn',i,{timeout:8000});
   }
   // Native link changes fragment; no custom scrolling or focus hijack.
   const finalLink=page.locator('.forest-seam--house a.forest-seam-link');
   await finalLink.click();
   assert.equal(new URL(page.url()).hash,'#house-on-the-hill',tag+' native route');
   assert.deepEqual(issues,[],tag+' errors');
   verified++;
   console.log('PASS',tag);
  } finally {await context.close();}
 }
 for(const route of routes) {
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  try {
   const page=await ctx.newPage();
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   const reduce=await page.evaluate(()=>{
     const seam=document.querySelector('[data-chapter-seam]');
     const path=seam.querySelector('.seam-trail');
     return {line: getComputedStyle(path).strokeDashoffset,links:document.querySelectorAll('.forest-seam-link').length};
   });
   assert.equal(reduce.line,'0',route+' reduced motion no ink draw');
   assert.equal(reduce.links,4);
  } finally {await ctx.close();}
  const nojs=await browser.newContext({viewport:{width:320,height:720},javascriptEnabled:false});
  try {
   const page=await nojs.newPage();
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   const fallback=await page.evaluate(()=>({
     scenes:document.querySelectorAll('[data-chapter]').length,
     seams:document.querySelectorAll('[data-chapter-seam]').length,
     ready:document.documentElement.classList.contains('forest-seam-ready'),
     anchors:[...document.querySelectorAll('a.forest-seam-link')].map(el=>el.hash),
     line:getComputedStyle(document.querySelector('.seam-trail')).strokeDashoffset
   }));
   assert.equal(fallback.scenes,5,route+' static scenes');
   assert.equal(fallback.seams,4,route+' static seams');
   assert.equal(fallback.ready,false,route+' no JS gating');
   assert.deepEqual(fallback.anchors,targets.map(t=>'#'+t),route+' static anchors');
   assert.equal(fallback.line,'0',route+' illustrated stroke visible without JS');
  } finally {await nojs.close();}
  console.log('PASS reduced motion and no-JS',route);
 }
 console.log('STAGE 12 COMPLETE',verified,'route/viewport checks; no browser captures.');
}finally{await browser.close();}
