/** R11 — the one living Paperkeeper walks only when the visitor scrolls.
 * Browser verification for published routes, pacing, light and fallback.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
const viewports=process.env.FOREST_ALL_VIEWPORTS?
 [[320,720],[375,812],[390,844],[430,932],[768,860],[1024,768],[1440,900],[844,390]]:
 [[390,844],[1440,900]];
try {
 for(const route of ['/lazarusdev/','/lazarusdev/storybook/']){
  for(const [width,height] of viewports){
   const page=await browser.newPage({viewport:{width,height}});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   await page.waitForFunction(()=>document.documentElement.classList.contains('living-guide-ready'),null,{timeout:18000});
   assert.equal(await page.locator('.living-guide').count(),1,'one external Paperkeeper, not a crowd of puppets');
   await page.evaluate(()=>{
     const stage=document.querySelector('.v3-path-scroll');
     const top=stage.getBoundingClientRect().top+scrollY;
     scrollTo({top:top+Math.max(1,stage.offsetHeight-innerHeight)*.38,behavior:'instant'});
   });
   await page.waitForTimeout(210);
   const position=()=>page.locator('.living-guide').evaluate(el=>{
     const rect=el.getBoundingClientRect();
     return {x:rect.x,y:rect.y,pose:el.dataset.pose};
   });
   const before=await position();
   await page.evaluate(()=>scrollBy({top:40,behavior:'instant'}));
   await page.waitForTimeout(120);
   const after=await position();
   const moved=Math.hypot(after.x-before.x,after.y-before.y);
   const max=40*(width<=670?.27:.34)+2.1;
   assert.ok(moved<=max,'40px scroll must not propel Paperkeeper '+moved+'px, limit '+max);
   await page.waitForTimeout(235);
   const settled=await position();
   assert.ok(Math.hypot(settled.x-after.x,settled.y-after.y)<1.8,
     'Paperkeeper cannot keep walking while the visitor pauses');
   await page.locator('#house-on-the-hill').evaluate(el=>el.scrollIntoView({behavior:'instant'}));
   await page.waitForFunction(()=>document.body.dataset.pageOwner==='window',null,{timeout:8000});
   await page.locator('[data-house-light-toggle]').click();
   assert.equal(await page.locator('[data-house-scene]').getAttribute('data-lit'),'true');
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>!document.documentElement.classList.contains('living-guide-ready'),null,{timeout:5000});
   assert.equal(await page.locator('.living-guide').isVisible(),false);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no horizontal overflow');
   assert.deepEqual(errors,[],'uncaught browser errors');
   console.log('PASS R11: scroll-paced Paperkeeper',route,width,height);
   await page.close();
  }
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await nojs.goto(origin+route);
  assert.equal(await nojs.locator('main [data-chapter]').count(),5);
  assert.ok(await nojs.locator('.journey-walker[data-walk]').count()>0);
  await nojs.close();
 }
} finally {await browser.close();}
