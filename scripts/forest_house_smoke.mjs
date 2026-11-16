/** Chapter 05: real Chrome QA in 8 viewports on 2 built routes. No screenshots. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const profiles=[{w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},{w:768,h:860},{w:1024,h:768},{w:1440,h:900},{w:844,h:390}];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passes=0;
try {
 for(const route of routes)for(const profile of profiles){
  const ctx=await browser.newContext({viewport:{width:profile.w,height:profile.h}});
  await ctx.addInitScript(()=>{
   Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__houseCopiedText=text;}}});
  });
  const page=await ctx.newPage();
  const errs=[];
  page.on('pageerror',e=>errs.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errs.push(r.status()+' '+r.url());});
  const tag=route+profile.w+'x'+profile.h;
  try {
   const resp=await page.goto(base+route,{waitUntil:'networkidle',timeout:40000});
   assert.equal(resp?.status(),200,tag+' HTTP');
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true',{timeout:15000});
   const audit=await page.evaluate(async()=>{
    const house=document.querySelector('#house-on-the-hill');
    const image=house.querySelector('.house-scene-image');
    const glow=house.querySelector('.house-window-glow');
    const keeper=house.querySelector('.house-paperkeeper');
    for(const img of [image,glow,keeper]){
      img.loading='eager';
      if(!img.complete) await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});});
      await img.decode();
    }
    const rect=(el)=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,right:r.right,bottom:r.bottom,y:r.y};};
    return {
      chapters:document.querySelectorAll('section[data-chapter]').length,
      h1:document.querySelectorAll('h1').length,
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
      scene:rect(house.querySelector('.house-scene-canvas')),
      imgDims:[image.naturalWidth,image.naturalHeight],
      imgSource:image.currentSrc,
      glowDims:[glow.naturalWidth,glow.naturalHeight],
      glowSource:glow.currentSrc,
      keeperDims:[keeper.naturalWidth,keeper.naturalHeight],
      windowControl:rect(house.querySelector('[data-house-light-toggle]')),
      copyControl:rect(house.querySelector('[data-house-copy]')),
      contact:rect(house.querySelector('#studio-inquiry')),
      intro:rect(house.querySelector('.house-preface')),
      imageContrast:window.getComputedStyle(house.querySelector('.house-glow-layer')).opacity,
      note:house.querySelector('.house-privacy-note').textContent,
      heading:house.querySelector('#house-on-the-hill-title').textContent,
      manifesto:house.querySelector('blockquote').textContent,
    };
   });
   assert.deepEqual(errs,[],tag+' errors');
   assert.equal(audit.chapters,5,tag+' chapter count');
   assert.equal(audit.h1,1,tag+' one H1');
   assert.equal(audit.overflow,false,tag+' no document overflow');
   assert.ok(audit.heading.includes('Small by choice.')&&audit.heading.includes('Wide in imagination.'),tag+' heading');
   assert.ok(audit.manifesto.includes('We build with intention'),tag+' manifesto');
   assert.ok(audit.note.includes('Nothing is sent'),tag+' honest contact');
   assert.ok(audit.scene.w>=265&&audit.scene.h>=300,tag+' illustration bounds');
   assert.ok(audit.intro.bottom<=audit.scene.y+3,tag+' intro cannot cover art');
   assert.deepEqual(audit.imgDims,profile.w<=670?[768,1152]:[1536,1024],tag+' image size');
   assert.deepEqual(audit.glowDims,audit.imgDims,tag+' overlay size');
   assert.ok(audit.imgSource.includes(profile.w<=670?'house-mobile':'house-desktop'),tag+' actual responsive art');
   assert.ok(audit.glowSource.includes(profile.w<=670?'window-glow-mobile':'window-glow-desktop'),tag+' matching overlay');
   assert.ok(audit.keeperDims[0]>0&&audit.keeperDims[1]>0,tag+' approved Paperkeeper decoded');
   assert.equal(Number(audit.imageContrast),0,tag+' baseline effect dormant');
   assert.ok(audit.windowControl.w>=44&&audit.windowControl.h>=44,tag+' light target');
   assert.ok(audit.copyControl.w>=44&&audit.copyControl.h>=44,tag+' brief target');
   assert.ok(audit.contact.w>=265,tag+' brief readable');
   const toggle=page.locator('#house-on-the-hill [data-house-light-toggle]');
   await toggle.click();
   assert.equal(await toggle.getAttribute('aria-pressed'),'true',tag+' turn on light');
   assert.ok((await page.locator('#house-light-status').textContent()).includes('brighter'),tag+' live status on');
   await page.waitForTimeout(350);
   assert.ok(Number(await page.locator('.house-glow-layer').evaluate(x=>getComputedStyle(x).opacity))>.95,tag+' glow effect visible');
   await toggle.focus();await page.keyboard.press('Enter');
   assert.equal(await toggle.getAttribute('aria-pressed'),'false',tag+' keyboard off');
   const brief=page.locator('#house-brief');
   const copy=page.locator('[data-house-copy]');
   await copy.click();
   assert.ok((await page.locator('#house-copy-status').textContent()).includes('Write a short note'),tag+' empty guard');
   await brief.fill('I want a storybook-style portfolio with accessible navigation.');
   await copy.click();
   const clipboard=await page.evaluate(()=>window.__houseCopiedText||'');
   assert.ok(clipboard.startsWith('LAZARUS DEV / PROJECT BRIEF'),tag+' clipboard mock');
   assert.ok(clipboard.includes('storybook-style portfolio'),tag+' copied content');
   assert.ok(clipboard.includes('Not submitted to Lazarus Dev'),tag+' honest export');
   assert.ok((await page.locator('#house-copy-status').textContent()).includes('Nothing has been sent'),tag+' status truthful');
   await page.emulateMedia({reducedMotion:'reduce'});
   const transition=await page.locator('.house-glow-layer').evaluate(el=>getComputedStyle(el).transitionDuration);
   assert.ok(parseFloat(transition)<=.01,tag+' no reduced-motion transition');
   console.log('PASS STAGE10 '+tag+' house + interaction + copy-only inquiry + reduced motion');passes++;
  } finally { await ctx.close(); }
 }
 const page=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await page.route(/\.(webp|png|avif)(?:\?|$)/i,route=>route.abort());
 await page.goto(base+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('#studio-inquiry textarea').isVisible(),true,'no JS/image editable textarea');
 assert.equal(await page.locator('[data-house-copy]').isVisible(),false,'no JS copy button hidden');
 await page.locator('#studio-inquiry textarea').fill('Local note without JavaScript.');
 assert.equal(await page.locator('#studio-inquiry textarea').inputValue(),'Local note without JavaScript.');
 await page.locator('#house-on-the-hill .house-inline-link').click();
 assert.equal(new URL(page.url()).hash,'#studio-inquiry');
 await page.close();
 console.log('PASS STAGE10 no JS/no image readable studio and addressable local contact');
}finally{await browser.close();}
console.log('PASS STAGE10 '+passes+' responsive route checks; no screenshots captured');
