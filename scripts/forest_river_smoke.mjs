/** Stage 09 — browser interaction QA, no screenshot capture. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const sizes=[
 {w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},
 {w:768,h:860},{w:1024,h:768},{w:1440,h:900},{w:844,h:390},
];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let count=0;
try{
 for(const route of routes) for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size.w,height:size.h}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
  const tag=route+size.w+'x'+size.h;
  try{
   const response=await page.goto(origin+route,{waitUntil:'networkidle',timeout:40000});
   assert.equal(response?.status(),200,tag+' http');
   await page.waitForFunction(()=>document.body.dataset.storybookReady==='true',{timeout:15000});
   const check=await page.evaluate(async()=>{
    const root=document.querySelector('#river-stories');
    const scene=root.querySelector('figure.river-scene');
    const picture=scene.querySelector('.river-scene-art');
    const bird=scene.querySelector('.river-roundbird');
    for(const img of [picture,bird]){
      img.loading='eager';
      if(!img.complete)await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});});
      await img.decode();
    }
    const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right};};
    const links=[...root.querySelectorAll('[data-river-jump]')];
    const summaries=[...root.querySelectorAll('.river-note summary')];
    return{
      chapters:document.querySelectorAll('section[data-chapter]').length,
      h1:document.querySelectorAll('h1').length,
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
      imageSize:[picture.naturalWidth,picture.naturalHeight],
      imageSrc:picture.currentSrc,
      birdSize:[bird.naturalWidth,bird.naturalHeight],
      linkSizes:links.map(rect),
      linkHref:links.map(a=>a.getAttribute('href')),
      linkNames:links.map(a=>a.innerText.trim()),
      summaries:summaries.map(x=>x.textContent.trim()),
      notes:[...root.querySelectorAll('.river-note')].map(x=>x.id),
      introRect:rect(root.querySelector('.river-prologue')),
      sceneRect:rect(scene),
      captions:root.querySelectorAll('figcaption').length,
      publication:root.querySelector('.river-bottom')?.textContent||'',
    };
   });
   assert.deepEqual(errors,[],tag+' page errors');
   assert.equal(check.chapters,5,tag+' chapters');
   assert.equal(check.h1,1,tag+' single H1');
   assert.equal(check.overflow,false,tag+' horizontal overflow');
   assert.ok(check.sceneRect.w>=265&&check.sceneRect.h>=370,tag+' illustration bounds');
   assert.ok(check.introRect.bottom<=check.sceneRect.y+3,tag+' heading/scene overlap');
   assert.deepEqual(check.imageSize,size.w<=670?[768,1024]:[1536,1024],tag+' responsive artwork');
   assert.ok(check.imageSrc.includes(size.w<=670?'river-mobile.webp':'river-desktop.webp'),tag+' actual responsive source');
   assert.ok(check.birdSize[0]>0&&check.birdSize[1]>0,tag+' character image decoded');
   assert.deepEqual(check.linkHref,['#river-note-a','#river-note-b'],tag+' destinations');
   assert.deepEqual(check.notes,['river-note-a','river-note-b'],tag+' native notes');
   assert.equal(check.summaries.length,2,tag+' summaries');
   assert.ok(check.linkSizes.every(x=>x.w>=44&&x.h>=44),tag+' 44px+ links');
   assert.ok(check.linkNames.every(Boolean),tag+' descriptive links');
   assert.equal(check.captions,1,tag+' semantic caption');
   assert.ok(check.publication.includes('No article is available'),tag+' truthful status');
   const first=page.locator('#river-stories a[data-river-jump="river-note-a"]');
   await first.click();
   assert.equal(new URL(page.url()).hash,'#river-note-a',tag+' actual deep link A');
   assert.equal(await page.locator('#river-note-a details').evaluate(e=>e.open),true,tag+' A opened');
   assert.ok((await page.locator('#river-note-a .river-note-body').textContent()).includes('QUESTIONS FOR A FUTURE ESSAY'),tag+' meaningful draft questions');
   const second=page.locator('#river-stories a[data-river-jump="river-note-b"]');
   await second.focus();await page.keyboard.press('Enter');
   assert.equal(new URL(page.url()).hash,'#river-note-b',tag+' keyboard deep link B');
   assert.equal(await page.locator('#river-note-b details').evaluate(e=>e.open),true,tag+' B opened');
   await page.emulateMedia({reducedMotion:'reduce'});
   const duration=await page.locator('#river-stories .river-stone-nav a').first().evaluate(e=>getComputedStyle(e).transitionDuration);
   assert.ok(parseFloat(duration)<=.01,tag+' reduced motion');
   console.log('PASS STAGE09 '+tag+' 2 native journal outlines, genuine image, clickable/keyboard deep links');
   count++;
  }finally{await page.close();}
 }
 const fallback=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
 await fallback.route(/\.(webp|png|avif)(?:\?|$)/i,r=>r.abort());
 await fallback.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 assert.equal(await fallback.locator('#river-note-a summary').isVisible(),true);
 assert.equal(await fallback.locator('#river-note-b summary').isVisible(),true);
 await fallback.locator('#river-note-b summary').click();
 assert.equal(await fallback.locator('#river-note-b details').getAttribute('open'),'');
 await fallback.locator('#river-stories [data-river-jump="river-note-a"]').click();
 assert.equal(new URL(fallback.url()).hash,'#river-note-a');
 await fallback.close();
 console.log('PASS STAGE09 no-script/no-image two native semantic editorial notes');
}finally{await browser.close();}
console.log('PASS STAGE09 '+count+' compiled route x viewport checks; no screenshots captured');
