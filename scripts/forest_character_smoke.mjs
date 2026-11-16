/** Character Bible Stage 05 — responsive browser audit, no screenshots or recordings. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin=process.env.FOREST_CHARACTER_ORIGIN||'http://127.0.0.1:4186';
const lab=origin+'/lazarusdev/storybook/character-lab/';
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
const widths=[{name:'320',w:320,h:720},{name:'390',w:390,h:844},{name:'768',w:768,h:860},{name:'1440',w:1440,h:900}];
try{
 for(const viewport of widths){
  const page=await browser.newPage({viewport:{width:viewport.w,height:viewport.h},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400) errors.push('HTTP '+r.status()+': '+r.url())});
  const response=await page.goto(lab,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(response?.status(),200,'Character lab must be reachable at the Pages subpath');
  await page.waitForFunction(()=>document.body.dataset.characterLabReady==='true',{timeout:20000});
  const status=await page.evaluate(async()=>{
   const all=[...document.images];
   // Force eager loading before decode; offscreen lazy images can otherwise
   // leave decode() pending indefinitely in headless Chromium.
   for (const img of all) img.loading = 'eager';
   await Promise.all(all.map(img=>img.decode().catch(() => null)));
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   const image=document.querySelector('#selected-pose');ctx.drawImage(image,0,0);
   const cornerAlpha=ctx.getImageData(0,0,1,1).data[3];
   const buttons=[...document.querySelectorAll('button[data-angle]')];
   return {
    ready:document.body.dataset.characterLabReady,
    h1:document.querySelectorAll('h1').length,
    view:document.body.dataset.characterView,
    buttons:buttons.map(b=>({key:b.dataset.angle,pressed:b.getAttribute('aria-pressed'),rect:b.getBoundingClientRect().toJSON()})),
    images:all.map(i=>({src:i.currentSrc,ok:i.complete&&i.naturalWidth>0})),
    support:[...document.querySelectorAll('.companion-row figure')].length,
    action:[...document.querySelectorAll('.action-strip figure')].length,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
    alpha:cornerAlpha,
    essentialText:document.querySelector('#identity-heading')?.textContent.trim(),
   };
  });
  assert.deepEqual(errors,[],'Local browser errors at '+viewport.name+': '+errors.join('; '));
  assert.equal(status.h1,1);
  assert.equal(status.view,'front');
  assert.equal(status.buttons.length,4);
  assert.equal(status.buttons.filter(b=>b.pressed==='true').length,1);
  assert.ok(status.buttons.every(b=>b.rect.width>=44&&b.rect.height>=44),'small buttons '+viewport.name);
  assert.ok(status.images.every(i=>i.ok),'broken character assets '+viewport.name);
  assert.equal(status.support,2,'Canon limits cast to moth + roundbird');
  assert.equal(status.action,5);
  assert.equal(status.overflow,false,'horizontal overflow '+viewport.name);
  assert.equal(status.alpha,0,'Character canvas missing transparent corner');
  assert.match(status.essentialText,/Paperkeeper/);
  for(const angle of ['three-quarter','profile','back','front']){
   const b=page.locator('button[data-angle="'+angle+'"]');
   await b.click();
   assert.equal(await b.getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('button[data-angle][aria-pressed="true"]').count(),1);
   assert.equal(await page.locator('body').getAttribute('data-character-view'),angle);
   assert.ok((await page.locator('#selected-pose').getAttribute('alt')).length>=50);
   await page.locator('#selected-pose').evaluate(img=>img.decode());
  }
  // Crucial controls remain reachable with keyboard, no animation locks.
  await page.locator('button[data-angle="front"]').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('button[data-angle="three-quarter"]').evaluate(n=>n===document.activeElement),true);
  await page.emulateMedia({reducedMotion:'reduce'});
  const duration=await page.locator('.pose-buttons button').first().evaluate(n=>parseFloat(getComputedStyle(n).transitionDuration));
  assert.ok(duration<=.005,'reduced-motion transitions are active');
  console.log('PASS Character Lab '+viewport.name,JSON.stringify({images:status.images.length,support:status.support,action:status.action,views:status.buttons.length,overflow:status.overflow}));
  await page.close();
 }
 // Stage05 must not disturb the original Stage03 semantic homepage.
 const home=await browser.newPage({viewport:{width:390,height:844}});
 const response=await home.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200);
 assert.match(await home.locator('h1').innerText(),/Different worlds/);
 assert.equal(await home.locator('section[data-chapter]').count(),5);
 assert.equal(await home.locator('canvas').count(),0);
 await home.close();
 console.log('STAGE 05 BROWSER QA PASS: four viewport sizes, four character poses, alt text, alpha, action/support scope, keyboard and unchanged 5-chapter homepage.');
}finally{await browser.close()}