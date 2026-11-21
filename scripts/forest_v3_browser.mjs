/**
 * V3 real browser QA: two canonical routes, four viewports, full/reduced motion.
 * All screenshots are native Chromium frames, never synthesized.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const folder=resolve(process.env.V3_CAPTURE_DIR||'artifacts/v3');
const browser=await chromium.launch({headless:true,...(process.env.CI?{channel:'chrome'}:{}),args:['--no-sandbox']});
const routes=[['root','/lazarusdev/'],['storybook','/lazarusdev/storybook/']];
const sizes=[[1440,900],[390,844],[320,720],[844,390]];
const manifest={schema:'lazarus-v3-browser-qa-v1',source:process.env.GIT_SHA||'LOCAL',checks:[],errors:[],screenshots:[]};
await mkdir(folder,{recursive:true});
try{
 for(const [routeName,route] of routes)for(const [width,height] of sizes)for(const mode of ['no-preference','reduce']){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:mode});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const response=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response.status(),200,route+' returned non-200');
  await page.waitForFunction(()=>document.body.dataset.narrativeVersion==='3',{timeout:12000});
  const initial=await page.evaluate(()=>{
   const ids=[...document.querySelectorAll('main [data-chapter]')].map(x=>x.id);
   return {
    ids,h1:document.querySelectorAll('h1').length,
    wrappers:['.v3-entrance-scroll','.v3-path-scroll','.v3-river-scroll'].map(s=>Boolean(document.querySelector(s))),
    marker:Boolean(document.querySelector('.v3-reading-marker')),
    scrollOverhang:(document.scrollingElement?.scrollWidth||0)-innerWidth,
    sticky:getComputedStyle(document.querySelector('.v3-entrance-scroll .hero-layout')).position,
    reduced:matchMedia('(prefers-reduced-motion: reduce)').matches
   };
  });
  assert.deepEqual(initial.ids,['entrance','winding-path','work-clearing','river-stories','house-on-the-hill']);
  assert.equal(initial.h1,1);
  assert.ok(initial.wrappers.every(Boolean)&&initial.marker,'V3 scene wrappers missing');
  assert.equal(initial.reduced,mode==='reduce');
  assert.ok(initial.scrollOverhang<=2,'horizontal overflow '+routeName+' '+width+' '+height+' '+initial.scrollOverhang);
  if(mode==='reduce'||height<=650||width<=670)assert.notEqual(initial.sticky,'sticky','static, narrow or short viewport should not pin');
  else assert.equal(initial.sticky,'sticky','cinematic scene should pin');
  const visual=mode==='no-preference'&&[1440,390].includes(width);
  const snap=async suffix=>{
    const name=routeName+'-'+width+'x'+height+'-'+suffix+'.png';
    await page.screenshot({path:join(folder,name),animations:'disabled'});
    manifest.screenshots.push(name);
  };
  if(visual)await snap('entrance-start');
  if(mode==='no-preference'&&height>650){
   await page.evaluate(()=>{
    const item=document.querySelector('.v3-entrance-scroll');
    const travel=item.getBoundingClientRect().height-innerHeight;
    const offset=travel>0 ? travel*.45 : item.getBoundingClientRect().height*.56;
    scrollTo({top:item.getBoundingClientRect().top+scrollY+offset,behavior:'instant'});
   });
   await page.waitForTimeout(140);
   const state=await page.evaluate(()=>{
    const stage=document.querySelector('.v3-entrance-scroll');
    const hero=document.querySelector('.v3-entrance-scroll .hero-layout').getBoundingClientRect();
    return {progress:Number.parseFloat(stage.style.getPropertyValue('--v3-progress')||'0'),
      beat:document.querySelector('#entrance').dataset.v3Beat,
      label:document.querySelector('#entrance .v3-beat-text')?.textContent,
      stickyTop:hero.top};
   });
   assert.ok(state.progress>.05,'scene progress never advanced '+JSON.stringify(state));
   assert.ok(state.beat!==undefined&&Boolean(state.label),'story annotation not updated');
   if(width>670)assert.ok(Math.abs(state.stickyTop)<8,'actual sticky geometry failed '+JSON.stringify(state));
  }
  if(visual){
   await snap('entrance-progress');
   for(const [name,selector] of [
    ['path','.path-map-art'],
    ['clearing','.work-clearing-world'],
    ['river','.river-scene'],
    ['house','.house-scene']]){
    await page.evaluate(target=>{
      const el=document.querySelector(target);
      scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.12,behavior:'instant'});
    },selector);
    await page.waitForTimeout(110);
    await snap(name);
   }
  }
  if(errors.length)manifest.errors.push({route,width,height,mode,errors});
  manifest.checks.push({route:routeName,width,height,mode,initial});
  await page.close();
 }
 const noScript=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await noScript.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 assert.equal(await noScript.locator('main [data-chapter]').count(),5);
 assert.equal(await noScript.locator('h1').count(),1);
 await noScript.close();
 assert.equal(manifest.errors.length,0,'runtime errors '+JSON.stringify(manifest.errors));
 await writeFile(join(folder,'manifest.json'),JSON.stringify(manifest,null,2));
 console.log('PASS V3: 16 browser states, static reading, scene progress, genuine screenshots');
}finally{ await browser.close(); }
