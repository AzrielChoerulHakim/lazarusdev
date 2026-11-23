/** R12: the Work Clearing remains native and the paper journey resolves on native chapter jumps.
 * The retired Atrium must never block the Paperkeeper's five-chapter story.
 * Browser-checks both published routes at mobile, desktop and short landscape.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
try{
 for(const route of ['/lazarusdev/','/lazarusdev/storybook/']){
  for(const [width,height] of [[390,844],[1440,900],[844,390]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   assert.equal(await page.locator('#atrium-room, #atrium-room-template, [data-atrium-enter], [data-open-concept="atrium"]').count(),0,
     'Retired Atrium must be absent from the shipped experience');
   assert.equal(await page.locator('.work-hanging[data-open-concept="paperkeeper"]').count(),1);
   await page.locator('#entrance .button-primary[href="#work-clearing"]').click();
   await page.locator('.work-hanging[data-open-concept="paperkeeper"]').click();
   await page.waitForFunction(()=>document.querySelector('#folio-paperkeeper')?.open===true);
   assert.ok((await page.locator('#folio-paperkeeper .folio-status').textContent()).includes('not a client commission'));
   // Jumping directly to the last chapter is deliberate; the director
   // reconciles the missing river act without a fast catch-up puppet.
   await page.locator('#house-on-the-hill').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
   await page.waitForFunction(()=>document.body.dataset.pageOwner==='window',{timeout:8000});
   assert.equal(await page.locator('.kept-page-window').isVisible(),true);
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>document.querySelector('.river-scene')?.dataset.rescue==='still');
   assert.equal(await page.locator('.living-guide').isVisible(),false,'reduced motion restores painted fallback');
   assert.deepEqual(errors,[],'runtime errors');
   console.log('PASS PAPERKEEPER / WORK CLEARING / NO ATRIUM',route,width,height);
   await page.close();
  }
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.goto(origin+route);
  assert.equal(await page.locator('#folio-paperkeeper').count(),1);
  await page.locator('#folio-paperkeeper summary').click();
  assert.equal(await page.locator('#folio-paperkeeper').evaluate(el=>el.open),true);
  assert.equal(await page.locator('.river-scene .rescue-page .kept-page-art').count(),1);
  assert.equal(await page.locator('.house-scene .kept-page-window .kept-page-art').count(),1);
  assert.equal(await page.locator('#atrium-room-template').count(),0);
  await context.close();
 }
}finally{await browser.close();}
