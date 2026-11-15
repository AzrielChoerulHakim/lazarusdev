/** Stage 08 — real browser functional/responsive checks on compiled Pages paths.
 * No screenshot API, no pixel capture, no background screenshot job. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const sizes=[{w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},{w:768,h:860},{w:1024,h:768},{w:1440,h:900},{w:844,h:390}];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let count=0;
try{
 for(const route of routes) for(const sz of sizes){
  const page=await browser.newPage({viewport:{width:sz.w,height:sz.h}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
  const tag=route+sz.w+'×'+sz.h;
  try{
   const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:40000});
   assert.equal(response?.status(),200,tag+' HTTP');
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
   const check=await page.evaluate(async()=>{
    const stage=document.querySelector('#work-clearing .work-clearing-world');
    const woods=stage.querySelector('.work-clearing-woods');
    const paper=stage.querySelector('.work-clearing-paperkeeper');
    const prints=[...stage.querySelectorAll('a.work-hanging')];
    for(const img of [woods,paper,...prints.map(a=>a.querySelector('img'))]){
      img.loading='eager';
      if(!img.complete)await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});});
      await img.decode();
    }
    const b=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    const before=b(document.querySelector('#work-clearing .work-intro'));
    const image=b(stage);
    return {
      h1:document.querySelectorAll('h1').length,chapters:document.querySelectorAll('section[data-chapter]').length,
      noOver:document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,
      stage:image,intro:before,
      printCount:prints.length,
      linkSizes:prints.map(b),
      linkLabels:prints.map(a=>a.getAttribute('aria-label')),
      srcs:prints.map(a=>a.querySelector('img').currentSrc),
      woods:woods.naturalWidth+'x'+woods.naturalHeight,
      page:paper.naturalWidth+'x'+paper.naturalHeight,
      nativeDetails:[...document.querySelectorAll('#work-clearing details.work-folio')].map(d=>d.id),
      disclosure:document.querySelector('#work-clearing .disclosure')?.textContent,
      horizontalGallery:getComputedStyle(stage.querySelector('.work-hangings')).overflowX,
      captures:document.querySelectorAll('canvas').length,
      imageOnly:!!document.querySelector('#work-clearing .work-clearing-caption'),
    };
   });
   assert.deepEqual(errors,[],tag+' JS/HTTP '+errors.join(';'));
   assert.equal(check.h1,1,tag);assert.equal(check.chapters,5,tag);
   assert.equal(check.noOver,true,tag+' horizontal overflow');
   assert.ok(check.stage.w>260&&check.stage.h>350,tag+' scene size');
   assert.ok(check.intro.bottom<=check.stage.y+3,tag+' no heading/art overlap');
   assert.equal(check.woods,'1536x1024');assert.equal(check.page,'426x656');
   assert.equal(check.printCount,3,tag);
   assert.deepEqual(check.nativeDetails,['folio-atrium','folio-oracle','folio-archive']);
   assert.ok(check.disclosure.includes('not client commissions'),tag+' truthful status');
   assert.ok(check.linkLabels.every(Boolean),tag+' descriptive link names');
   assert.ok(check.linkSizes.every(r=>r.w>=44&&r.h>=44),tag+' 44px hit targets');
   assert.ok(check.srcs[0].includes('folio-atrium.webp')&&check.srcs[1].includes('folio-oracle.webp')&&check.srcs[2].includes('folio-archive.webp'),tag+' separate art');
   assert.equal(check.horizontalGallery,sz.w<=920?'auto':'visible',tag+' mobile art-directed scroll');
   assert.equal(check.captures,0,tag+' no canvas');
   assert.equal(check.imageOnly,true,tag+' meaningful figcaption');
   // Direct project-sheet link opens a REAL native details destination.
   await page.locator('#work-clearing a[href="#folio-atrium"]').click();
   assert.equal(new URL(page.url()).hash,'#folio-atrium',tag+' anchor destination');
   assert.equal(await page.locator('#folio-atrium').evaluate(e=>e.open),true,tag+' notes open');
   assert.equal(await page.locator('#folio-atrium').isVisible(),true,tag+' notes visible');
   const desc=await page.locator('#folio-atrium .folio-body p').first().textContent();
   assert.ok(desc.includes('conceptual destination'),tag+' meaningful content');
   await page.locator('#work-clearing a[href="#folio-oracle"]').focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#folio-oracle').evaluate(e=>e.open),true,tag+' keyboard project opens');
   assert.equal(new URL(page.url()).hash,'#folio-oracle',tag+' keyboard destination');
   await page.emulateMedia({reducedMotion:'reduce'});
   const trans=await page.locator('#work-clearing .work-hanging').first().evaluate(e=>getComputedStyle(e).transitionDuration);
   assert.ok(parseFloat(trans)<=.01,tag+' reduced motion');
   console.log('PASS STAGE08 '+tag+' native work links and actual 3 concept details, no document overflow');
   count++;
  }finally{await page.close();}
 }
 // No Javascript, no images: title, concepts, native summary remain usable.
 const fallback=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await fallback.route(/\.(webp|png|avif)(?:\?|$)/i,r=>r.abort());
 await fallback.goto(base+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 assert.equal(await fallback.locator('#work-clearing a[data-open-concept]').count(),3);
 assert.equal(await fallback.locator('#folio-archive summary').isVisible(),true);
 await fallback.locator('#folio-archive summary').click();
 assert.equal(await fallback.locator('#folio-archive').getAttribute('open'),'');
 await fallback.locator('#work-clearing a[href="#folio-atrium"]').click();
 assert.equal(new URL(fallback.url()).hash,'#folio-atrium');
 await fallback.close();
 console.log('PASS STAGE08 no-JS/no-images native summary and links');
}finally{await browser.close();}
console.log('PASS STAGE08 '+count+' compiled route × viewport checks; zero screenshots');