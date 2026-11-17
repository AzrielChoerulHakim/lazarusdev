/** R08: release integration, native actions, independent scene marks; no capture. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let checks=0;
const art=['path-waymark','folio-thread','river-ripple','cottage-window'];
const chapters=['entrance','winding-path','work-clearing','river-stories','house-on-the-hill'];

async function pageFor(route,{width=390,height=844,reducedMotion='no-preference',javaScriptEnabled=true}={}){
 const context=await browser.newContext({viewport:{width,height},reducedMotion,javaScriptEnabled});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 assert.equal((await page.goto(origin+route,{waitUntil:'networkidle',timeout:45000})).status(),200,route+' HTTP');
 return {context,page,errors};
}
function pass(name){checks++;console.log('PASS R08 '+name);}
async function interaction(page,selector,expected){
 await page.locator(selector).click();
 await page.waitForFunction(expected=>document.querySelector(expected.selector)?.dataset[expected.field]===expected.value,expected,{timeout:6000});
}
try{
  for(const route of routes)for(const width of [320,390,768,1440]){
    const {context,page,errors}=await pageFor(route,{width,height:width===1440?900:width===768?860:width===320?720:844});
    const tag=route+' '+width;
    try{
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
      const initial=await page.evaluate(()=>({
       chapters:[...document.querySelectorAll('[data-chapter]')].map(el=>el.id),
       h1:document.querySelectorAll('h1').length,
       ink:[...document.querySelectorAll('img.forest-r05-ink')].map(el=>el.getAttribute('src')),
       over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
       source:document.querySelector('.entrance-paperkeeper')?.getAttribute('src')||'',
       noFakeClient:[...document.querySelectorAll('.work-folio .folio-status')].every(el=>el.textContent.includes('not a client commission'))
      }));
      assert.deepEqual(initial.chapters,chapters,tag+' chapters');
      assert.equal(initial.h1,1,tag+' h1');
      assert.equal(initial.ink.length,4,tag+' custom marks');
      assert.equal(new Set(initial.ink).size,4,tag+' unique marks');
      assert.equal(initial.over,false,tag+' no horizontal overflow');
      assert.ok(/paperkeeper\.three-quarter|notice|anticipate|lift-low|lift-mid|overshoot|follow|settled|acknowledge/.test(initial.source),tag+' real authored Paperkeeper');
      assert.equal(initial.noFakeClient,true,tag+' truthful folios');
      for(const name of art)assert.ok(initial.ink.some(src=>src.includes(name)),tag+' asset '+name);

      for(const img of await page.locator('img.forest-r05-ink').all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el=>el.decode());
        assert.ok(await img.evaluate(el=>el.naturalWidth>=200&&el.naturalHeight>=200),tag+' 240px original mark');
        assert.equal(await img.evaluate(el=>getComputedStyle(el).pointerEvents),'none',tag+' decorative mark cannot intercept UI');
      }

      await page.locator('.path-map-art').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:8000});
      assert.equal(await page.locator('[data-path-trace-toggle]').count(),0,tag+' no manual motion choice');
      await interaction(page,'#folio-atrium summary',{selector:'.work-clearing-world',field:'activeFolio',value:'folio-atrium'});
      await interaction(page,'#river-note-a summary',{selector:'.river-scene',field:'activeNote',value:'river-note-a'});
      await interaction(page,'[data-house-light-toggle]',{selector:'.house-scene',field:'motionCue',value:'lantern'});
      assert.equal(await page.locator('[data-house-scene]').getAttribute('data-lit'),'true',tag+' house window toggles');
      assert.deepEqual(errors,[],tag+' no uncaught exceptions or local image failures');
      pass(tag+' art decode, native controls, finite scene response');
    }finally{await context.close();}
  }
  for(const route of routes){
    const {context,page,errors}=await pageFor(route,{reducedMotion:'reduce'});
    try{
      await page.locator('.path-map-art').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('[data-path-map]')?.dataset.progress==='100',null,{timeout:8000});
      await page.locator('#river-note-b summary').click();
      assert.equal(await page.locator('#river-note-b details').evaluate(x=>x.open),true);
      assert.deepEqual(errors,[]);
      pass(route+' automatic path and native river note with reduced preference');
    }finally{await context.close();}
  }
  for(const route of routes){
    const {context,page,errors}=await pageFor(route,{javaScriptEnabled:false,width:320,height:720});
    try{
      await page.locator('#folio-oracle summary').click();
      assert.equal(await page.locator('#folio-oracle').evaluate(el=>el.open),true);
      await page.locator('#river-note-a summary').click();
      assert.equal(await page.locator('#river-note-a details').evaluate(el=>el.open),true);
      await page.locator('#field-atlas summary').click();
      assert.equal(await page.locator('#field-atlas').evaluate(el=>el.open),true);
      assert.deepEqual(errors,[]);
      pass(route+' no-JS native atlas, folio and river notebook');
    }finally{await context.close();}
  }
  for(const route of routes){
    const {context,page}=await pageFor(route,{width:390,height:844});
    try{
      await page.addStyleTag({content:':root{font-size:200%!important;}'});
      const geometry=await page.evaluate(()=>{
        const check=id=>{const el=document.querySelector(id);return{client:el.clientWidth,scroll:el.scrollWidth};};
        return {header:check('#site-header'),house:check('#house-on-the-hill'),entrance:check('#entrance')};
      });
      for(const [area,g] of Object.entries(geometry)){
        // Audit diagnostics stay visible in logs, but do not claim real browser zoom.
        console.log('R08 text-200 '+route+' '+area+' '+JSON.stringify(g));
      }
      assert.ok(geometry.entrance.scroll<=geometry.entrance.client+1,'200% Entrance remains readable');
      pass(route+' 200% root-font Entrance reflow; header/house diagnostics recorded');
    }finally{await context.close();}
  }
  console.log('R08 RELEASE INTEGRATION: '+checks+' real-browser cases; no screenshots or video.');
}finally{await browser.close();}
