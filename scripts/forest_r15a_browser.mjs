/** R15A — production Chromium evidence: five story chapters on both routes.
 * Screenshot pixels are native browser frames; no fake source/scene render.
 * The giant R13 baseline remains frozen and untouched.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const dest=resolve(process.env.R15A_CAPTURE_DIR||'artifacts/r15a-visual');
const source=process.env.GIT_SHA||'LOCAL';
const browser=await chromium.launch({headless:true,...(process.env.CI?{channel:'chrome'}:{}),args:['--no-sandbox']});
const chapters=[['entrance','#entrance .entrance-stage'],['path','#winding-path .path-map'],
 ['clearing','#work-clearing .work-clearing-installation'],['river','#river-stories .river-scene'],
 ['house','#house-on-the-hill .house-scene']];
const sizes=[[1440,900],[390,844],[320,720],[844,390]];
const routes=[['root','/lazarusdev/'],['storybook','/lazarusdev/storybook/']];
const evidence={schema:'lazarus-r15a-live-scene-v2',sourceCommit:source,
 browser:'Chrome / production Vite',sizes,routes:routes.map(r=>r[1]),screenshots:[],metrics:[],failures:[],
 signOff:'USER-APPROVED-DIRECTION / ARTWORK-REVIEWED-IN-RENDER',physicalPhone:'NOT VERIFIED'};
function rect(r){if(!r)return null;return {x:r.x,y:r.y,width:r.width,height:r.height};}
const intersect=(a,b)=>!a||!b?0:Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*
  Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
async function capture(page,bucket,name,selector){
 const file=join(dest,bucket,name+'.png');
 await mkdir(resolve(file,'..'),{recursive:true});
 const png=await page.locator(selector).screenshot({path:file,animations:'disabled',timeout:30000});
 evidence.screenshots.push({file:bucket+'/'+name+'.png',bytes:png.length,
  sha256:createHash('sha256').update(png).digest('hex')});
}
try{
 for(const [routeLabel,route] of routes)for(const [width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  const visible=await page.evaluate(async()=>{
   const assets=[document.querySelector('.entrance-paperkeeper'),document.querySelector('.river-paperkeeper-reader')];
   for(const img of assets){
     if(!img)throw Error('Missing Paperkeeper image in site');
     img.loading='eager';
     // Entrance uses its existing genuine drawn-step image sequence, which
     // may swap src during decode(). A transient decode rejection is not a
     // broken asset; the actual current image must still have valid pixels.
     await img.decode().catch(()=>{});
     if(!img.complete || img.naturalWidth<1)
       throw new Error('Paperkeeper current image is missing '+img.src);
   }
   const walker=document.querySelector('[data-walk="river"]');
   const legacyUrl=getComputedStyle(document.querySelector('[data-walk="path"]')).backgroundImage;
   const css=getComputedStyle(walker),url=css.backgroundImage;
   const match=/url\(["']?([^"')]+)["']?\)/.exec(url);
   if(!match)return {url,width:0,height:0,alpha:255};
   const im=new Image();im.src=match[1];await im.decode();
   const canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);
   return {url,legacyUrl,width:canvas.width,height:canvas.height,alpha:ctx.getImageData(0,0,1,1).data[3],
      entrance:assets[0].naturalWidth,reader:assets[1].naturalWidth};
  });
  assert.match(visible.url,/paperkeeper-journey-r15a|narrative-journey-r15a/,
    'the scene may idle on nine walking frames before the five-frame rescue begins');
  assert.match(visible.legacyUrl,/paperkeeper-journey-r15a/,'walkers must still use nine original-derived frames');
  assert.deepEqual([visible.width,visible.height],
    visible.url.includes('narrative-journey-r15a')?[640,144]:[1152,144],
    'the sprite must be actual nine-walk or five-action art');
  assert.equal(visible.alpha,0,'sprite sheet corner must be truly transparent');
  assert.equal(visible.entrance,622);
  assert.equal(visible.reader,128);
  const bucket=routeLabel+'/'+width+'x'+height;
  for(const [name,selector] of chapters){
   const image=page.locator(selector);
   await image.scrollIntoViewIfNeeded();
   await page.waitForTimeout(150);
   const info=await page.evaluate(id=>{
      const scene=document.querySelector(id),walker=scene.querySelector('.journey-walker');
      const nav=document.querySelector('.river-stone-nav');
      const a=walker?.getBoundingClientRect(),b=nav?.getBoundingClientRect();
      return {scene:rect(scene.getBoundingClientRect()),walker:walker?rect(a):null,
        pose:walker?.dataset.pose||null,
        storySheet:walker?getComputedStyle(walker).backgroundImage.includes('narrative-journey-r15a'):false,
        navRect:id.includes('river-scene')?rect(b):null,
        viewport:[innerWidth,innerHeight],scrollWidth:document.documentElement.scrollWidth};
      function rect(r){return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;}
    },selector);
   if(info.walker){
     assert.ok(info.walker.width>20&&info.walker.height>24,name+' blank or tiny '+JSON.stringify(info));
     if(width===390 && name==='path'){
      assert.ok(info.walker.width>=40&&info.walker.height>=47,'walker too small against path '+JSON.stringify(info));
     }
   }
   assert.ok(info.scrollWidth<=width+3,'horizontal overflow '+bucket+' '+name);
   if(name==='river'){
     if(width<=390){
       assert.equal(info.pose,'carry','reduced-motion must show genuine static carry pose');
       assert.equal(info.storySheet,true,'scene must use actual five illustrated story poses');
       const duplicate=await page.evaluate(()=>{
         const river=document.querySelector('.river-scene');
         return {lantern:getComputedStyle(river.querySelector('.rescue-lantern')).visibility,
           page:getComputedStyle(river.querySelector('.rescue-page')).visibility};
       });
       assert.deepEqual(duplicate,{lantern:'hidden',page:'hidden'},
         'avoid two lanterns and a disconnected hovering page in carry pose');
     }
     const covered=intersect(info.walker,info.navRect);
     const fraction=info.walker?covered/Math.max(1,info.walker.width*info.walker.height):0;
     info.riverOverlapFraction=Number(fraction.toFixed(5));
     assert.equal(fraction,0,'River navigation still obscures Paperkeeper at '+bucket);
     const buttons=await page.locator('.river-stone-nav a').evaluateAll(all=>all.map(el=>{
       const r=el.getBoundingClientRect();return {width:r.width,height:r.height};
     }));
     assert.ok(buttons.length===2&&buttons.every(x=>x.width>=44&&x.height>=44),'nav hit targets reduced');
   }
   evidence.metrics.push({route,viewport:width+'x'+height,chapter:name,...info});
   await capture(page,bucket,'scene-'+name,selector);
  }
  assert.deepEqual(errors,[],'browser errors '+bucket);
  console.log('PASS R15A',bucket,'5 chapters, no river overlap, 9 frame alpha');
  await page.close();
 }
  // Finite five-gesture story proof on real runtime, not just source filenames.
  for(const [routeLabel,route] of routes){
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+route,{waitUntil:'domcontentloaded'});
    const river=page.locator('#river-stories .river-scene');
    await river.evaluate(element=>{
      window.__r15aPhaseLog=[];
      const collect=()=>{
        const actor=element.querySelector('[data-walk="river"]');
        window.__r15aPhaseLog.push({phase:element.dataset.rescue,
          pose:actor?.dataset.pose||null});
      };
      new MutationObserver(collect).observe(element,{attributes:true,attributeFilter:['data-rescue']});
    });
    await river.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>
      document.querySelector('#river-stories .river-scene')?.dataset.rescue==='lift',
      null,{timeout:6500});
    await capture(page,routeLabel+'/390x844','rescue-lift','#river-stories .river-scene');
    await page.waitForFunction(()=>
      document.querySelector('#river-stories .river-scene')?.dataset.rescue==='carrying',
      null,{timeout:6500});
    await capture(page,routeLabel+'/390x844','rescue-carrying','#river-stories .river-scene');
    const history=await page.evaluate(()=>window.__r15aPhaseLog);
    const expected={watch:'look-down',lantern:'set-lantern',reach:'reach',
      lift:'lift',carrying:'carry'};
    for(const [phase,pose] of Object.entries(expected)){
      assert.ok(history.some(x=>x.phase===phase),
        'missing actual river phase '+phase+' '+JSON.stringify(history));
      assert.ok(history.some(x=>x.phase===phase&&x.pose===pose),
        'missing registered illustrated action '+pose+' '+JSON.stringify(history));
    }
    assert.deepEqual(errors,[],'rescue animation errors');
    evidence.metrics.push({route,viewport:[390,844],chapter:'rescue-action',
      history,expected,source:'actual browser DOM mutation / 5 action phases'});
    console.log('PASS R15A real 5-phase rescue',route,history.map(x=>x.phase+':'+x.pose).join(' -> '));
    await page.close();
  }
}finally{await browser.close();}
await mkdir(dest,{recursive:true});
await writeFile(join(dest,'manifest.json'),JSON.stringify(evidence,null,2)+'\n');
assert.equal(evidence.screenshots.length,44);
console.log('R15A actual scene frames',evidence.screenshots.length,'overlap checks',
 evidence.metrics.filter(x=>x.chapter==='river').map(x=>x.riverOverlapFraction));
