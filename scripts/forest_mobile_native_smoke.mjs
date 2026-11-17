/** Stage 14 mobile-native artwork/browser QA. NEVER take screenshots. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const host=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const sizes=[{w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},{w:670,h:880},{w:768,h:900},{w:1024,h:768},{w:1440,h:900},{w:844,h:390}];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passed=0;
try {
for(const route of routes) for(const {w,h} of sizes) {
 const context=await browser.newContext({viewport:{width:w,height:h}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(host)&&r.status()>=400)errors.push('HTTP '+r.status()+': '+r.url())});
 const tag=route+' '+w+'x'+h;
 try {
  const response=await page.goto(host+route,{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response.status(),200,tag+' HTTP');
  await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
  const outcome=await page.evaluate(async()=>{
   const paintings=[...document.querySelectorAll('.portrait-native-art')];
   const glow=document.querySelector('.portrait-native-glow');
   const decode=async(img)=>{img.loading='eager';await img.decode();return [img.naturalWidth,img.naturalHeight];};
   const data=[];
   for(const x of [...paintings,glow]) data.push({natural:await decode(x),visible:getComputedStyle(x).display!=='none',src:x.currentSrc});
   const rect=e=>{const a=e.getBoundingClientRect();return {width:a.width,height:a.height,top:a.top,bottom:a.bottom};};
   const buttons=['.menu-toggle','.house-light-toggle','[data-house-copy]','[data-house-save]'].map(sel=>{const e=document.querySelector(sel);return {sel,display:getComputedStyle(e).display,bounds:rect(e)};});
   return {
     chapters:document.querySelectorAll('section[data-chapter]').length,
     heads:document.querySelectorAll('h1').length,
     overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
     pictures:data,
     bounds:{
       path:rect(document.querySelector('.path-map-art')),
       clearing:rect(document.querySelector('.work-clearing-world')),
       river:rect(document.querySelector('.river-scene')),
       house:rect(document.querySelector('.house-scene-canvas'))
     },
     stacks:{
       folios:getComputedStyle(document.querySelector('.work-hangings')).zIndex,
       pathInk:getComputedStyle(document.querySelector('.path-ink--portrait')).zIndex,
       houseKeeper:getComputedStyle(document.querySelector('.house-paperkeeper')).zIndex
     },
     copy:document.querySelector('#house-copy-note').textContent,
     nav:document.querySelector('.site-nav a[href="#house-on-the-hill"]').textContent,
     buttons
   };
  });
  assert.equal(outcome.chapters,5,tag+' five chapters');
  assert.equal(outcome.heads,1,tag+' H1');
  assert.equal(outcome.overflow,false,tag+' no horizontal overflow');
  assert.equal(outcome.pictures.length,5,tag+' images exist');
  for(const [idx,img] of outcome.pictures.entries()){
   assert.deepEqual(img.natural,[768,1152],tag+' native portrait asset '+idx);
   assert.equal(img.visible,false,tag+' archived simplified SVG must not mask painting '+idx);
   assert.ok(img.src.includes('/mobile-native/'),tag+' original portrait URL');
  }
  if(w<=670){
    const raster=await page.evaluate(async()=>{
      const image=sel=>document.querySelector(sel);
      const targets=['.path-map-backdrop','.river-scene-art','.house-scene-image','.work-clearing-woods'];
      for(const sel of targets){const img=image(sel);img.loading='eager';await img.decode();}
      return {
        path:image('.path-map-backdrop').currentSrc,
        river:image('.river-scene-art').currentSrc,
        house:image('.house-scene-image').currentSrc,
        workVisible:getComputedStyle(image('.work-clearing-woods')).display!=='none',
        houseVisible:getComputedStyle(document.querySelector('.house-scene-canvas > picture:not(.house-glow-layer)')).display!=='none'
      };
    });
    assert.ok(raster.path.includes('winding-path-mobile'),tag+' original painted path');
    assert.ok(raster.river.includes('river-mobile'),tag+' original painted river');
    assert.ok(raster.house.includes('house-mobile'),tag+' original painted house');
    assert.equal(raster.workVisible&&raster.houseVisible,true,tag+' paintings not hidden');
    assert.equal(outcome.stacks.folios,'3',tag+' folio stacking');
    assert.equal(outcome.stacks.pathInk,'4',tag+' traced path over art');
    assert.equal(outcome.stacks.houseKeeper,'4',tag+' keeper over art');
    for(const [key,rect] of Object.entries(outcome.bounds))assert.ok(rect.width>260&&rect.height>300,tag+' '+key+' visible image region');
  }
  for(const b of outcome.buttons) if(b.display!=='none')assert.ok(b.bounds.width>=44&&b.bounds.height>=44,tag+' '+b.sel+' tap target');
  assert.match(outcome.copy,/Nothing is sent/,tag+' inquiry truthful');
  assert.match(outcome.nav,/Studio/,tag+' nav');
  assert.deepEqual(errors,[],tag+' runtime errors');
  if(w<=670) {
   const light=page.locator('[data-house-light-toggle]');
   await light.click();
   assert.equal(await light.getAttribute('aria-pressed'),'true',tag+' house click');
   await page.waitForTimeout(330);
   const opacity=await page.locator('.house-glow-layer').evaluate(e=>Number(getComputedStyle(e).opacity));
   assert.ok(opacity>.95,tag+' matching raster window glow');
   await page.emulateMedia({reducedMotion:'reduce'});
   const duration=await page.locator('.house-glow-layer').evaluate(e=>getComputedStyle(e).transitionDuration);
   assert.ok(parseFloat(duration)===0,tag+' reduced motion glow');
  }
  console.log('PASS MOBILE NATIVE '+tag);passed++;
 }finally{await context.close()}
}
for(const route of routes){
 const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
 const page=await context.newPage();
 try {
  await page.goto(host+route,{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('section[data-chapter]').count(),5,route+' no JS all chapters');
  assert.ok(await page.locator('.river-scene-art').isVisible(),route+' no JS illustration visible');
  assert.ok(await page.locator('#house-brief').isVisible(),route+' no JS contact note visible');
  assert.equal(await page.locator('[data-house-save]').isVisible(),false,route+' no JS enhancement hidden');
  console.log('PASS MOBILE NATIVE NO JS '+route);
 }finally{await context.close()}
}
console.log('STAGE14 FINISHED: '+passed+' responsive checks; no screenshot/video recorded');
}finally{await browser.close()}
