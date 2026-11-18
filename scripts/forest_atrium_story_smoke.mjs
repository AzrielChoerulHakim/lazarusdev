/** R12 native browser smoke: the second world and a non-blocking paper rescue.
 * No screenshots. Tests compiled Pages-like root and nested routes.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
try {
 for(const route of ['/lazarusdev/','/lazarusdev/storybook/']){
  for(const [width,height] of [[390,844],[1440,900],[844,390]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   // Follow the actual native Explore the work anchor before the room CTA.
   await page.locator('#entrance .button-primary[href="#work-clearing"]').click();
   const button=page.locator('.atrium-clearing-shortcut');
   await button.scrollIntoViewIfNeeded();
   console.log('ATRIUM CTA geometry',JSON.stringify(await button.evaluate(el=>{
     const box=el.getBoundingClientRect();
     const hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
     return {y:scrollY,top:box.top,left:box.left,height:box.height,hit:hit?.className||hit?.tagName};
   })));
   const before=await page.evaluate(()=>({y:scrollY, x:document.querySelector('.work-hangings').scrollLeft}));
   await button.click();
   await page.waitForFunction(()=>!document.querySelector('#atrium-room').hidden);
   assert.equal(new URL(page.url()).hash,'#atrium');
   assert.equal(await page.locator('#atrium-room[role="dialog"]').isVisible(),true);
   await page.locator('#atrium-light').evaluate(el=>{el.value='89';el.dispatchEvent(new Event('input',{bubbles:true}));});
   assert.equal(await page.locator('#atrium-light-value').textContent(),'89%');
   assert.match(await page.locator('#atrium-light-message').textContent(),/engraved leaves/);
   await page.goBack();
   await page.waitForFunction(()=>document.querySelector('#atrium-room').hidden);
   const after=await page.evaluate(()=>({y:scrollY,x:document.querySelector('.work-hangings').scrollLeft,focus:document.activeElement?.matches('[data-atrium-enter]')}));
   assert.ok(Math.abs(before.y-after.y)<5,'restore chapter offset');
   assert.equal(before.x,after.x,'restore gallery');
   assert.equal(after.focus,true,'restore triggering focus');
   await page.locator('.river-scene').scrollIntoViewIfNeeded();
   await page.waitForTimeout(2400);
   assert.equal(await page.locator('.river-scene').getAttribute('data-rescue'),'carrying');
   assert.equal(await page.locator('.kept-page-window .kept-page-art').count(),1);
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>document.querySelector('.river-scene').dataset.rescue==='still');
   assert.equal(await page.locator('.river-scene').getAttribute('data-rescue'),'still');
   await page.goto(origin+route+'#atrium');
   assert.equal(await page.locator('#atrium-room').isVisible(),true);
   await page.locator('[data-atrium-close]').click();
   await page.waitForFunction(()=>document.querySelector('#atrium-room').hidden);
   assert.deepEqual(errors,[],'runtime errors');
   console.log('PASS ATRIUM / RESCUE',route,width,height);
   await page.close();
  }
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const p=await noJS.newPage();
  await p.goto(origin+route);
  assert.equal(await p.locator('#folio-atrium .atrium-note-entry').count(),1);
  assert.equal(await p.locator('.work-hanging[data-open-concept="atrium"]').count(),1);
  assert.equal(await p.locator('.river-scene .rescue-page .kept-page-art').count(),1);
  assert.equal(await p.locator('.house-scene .kept-page-window .kept-page-art').count(),1);
  await noJS.close();
 }
}finally{await browser.close();}
