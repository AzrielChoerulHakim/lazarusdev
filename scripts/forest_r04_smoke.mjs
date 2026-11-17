/** R04: built-site Chromium verification; text only, no screenshots/video. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passed=0;
async function setup(route,opts={}) {
  const {width=390,height=844,reducedMotion='no-preference',javaScriptEnabled=true,blockFrame=false}=opts;
  const context=await browser.newContext({viewport:{width,height},reducedMotion,javaScriptEnabled});
  if(blockFrame)await context.route('**/*lift-mid*.webp',r=>r.abort());
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await page.goto(origin+route,{waitUntil:'networkidle'})).status(),200);
  return {context,page,errors};
}
async function ready(page,state='ready') {
  await page.locator('.entrance-paperkeeper').scrollIntoViewIfNeeded();
  await page.waitForFunction(state=>document.querySelector('.entrance-paperkeeper')?.dataset.actingState===state,state,{timeout:25000});
}
function pass(label){passed++;console.log('PASS R04 '+label);}
try {
  for(const route of routes)for(const width of [1440,390,320]){
    const {context,page,errors}=await setup(route,{width,height:width===1440?900:width===390?844:720});
    const label=route+' '+width;
    try{
      await ready(page);
      const still=await page.locator('.entrance-paperkeeper').getAttribute('src');
      assert.ok(still.includes('paperkeeper.three-quarter'),label+' R02 reference still');
      assert.equal(await page.locator('.entrance-paperkeeper').getAttribute('data-acting-frame'),null,'No autoplay');
      await page.evaluate(()=>{
        window.r04Trace=[];
        const img=document.querySelector('.entrance-paperkeeper');
        new MutationObserver(()=>{
          const id=img.dataset.actingFrame;
          if(id && r04Trace.at(-1)!==id)r04Trace.push(id);
        }).observe(img,{attributes:true,attributeFilter:['data-acting-frame']});
      });
      const scroll=await page.evaluate(()=>window.scrollY);
      await page.locator('#field-atlas').evaluate(el=>{el.open=true;});
      await page.waitForFunction(()=>document.querySelector('.entrance-paperkeeper').dataset.actingState==='playing',null,{timeout:5000});
      assert.equal(await page.locator('#field-atlas').evaluate(el=>el.open),true);
      assert.ok(Math.abs((await page.evaluate(()=>scrollY))-scroll)<2,label+' no forced scroll');
      await page.waitForFunction(()=>document.querySelector('.entrance-paperkeeper').dataset.actingState==='settled',null,{timeout:10000});
      const first=await page.evaluate(()=>r04Trace);
      for(const id of ['notice','anticipate','lift-low','lift-mid','overshoot','follow','settled'])assert.ok(first.includes(id),label+' missing '+id);
      assert.equal(await page.locator('.entrance-paperkeeper').evaluate(el=>getComputedStyle(el).transform),'none');
      await page.locator('#field-atlas').evaluate(el=>{el.open=false;});
      await page.waitForTimeout(100);
      await page.evaluate(()=>{r04Trace.length=0;});
      await page.locator('#field-atlas').evaluate(el=>{el.open=true;});
      await page.waitForFunction(()=>document.querySelector('.entrance-paperkeeper').dataset.actingState==='playing',null,{timeout:5000});
      await page.waitForFunction(()=>document.querySelector('.entrance-paperkeeper').dataset.actingState==='settled',null,{timeout:10000});
      assert.ok((await page.evaluate(()=>r04Trace)).includes('acknowledge'),label+' replay pose');
      assert.deepEqual(errors,[]);
      pass(label+' finite invitation + raised-lantern replay');
    }finally{await context.close();}
  }
  for(const route of routes){
    const {context,page,errors}=await setup(route,{reducedMotion:'reduce'});
    try{
      await ready(page,'idle');
      assert.ok((await page.locator('.entrance-paperkeeper').getAttribute('src')).includes('paperkeeper.three-quarter'),'Reduced motion preserves critical R02 image before action');
      assert.equal(await page.locator('.entrance-paperkeeper').getAttribute('data-acting-frame'),null,'No eager final frame swap');
      await page.locator('#field-atlas summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#field-atlas').evaluate(el=>el.open),true);
      await page.waitForFunction(()=>document.querySelector('.entrance-paperkeeper').dataset.actingState==='settled',null,{timeout:10000});
      assert.equal(await page.locator('.entrance-paperkeeper').getAttribute('data-acting-frame'),'settled');
      assert.deepEqual(errors,[]);
      pass(route+' reduced motion + native keyboard');
    }finally{await context.close();}
  }
  for(const route of routes){
    const {context,page,errors}=await setup(route,{javaScriptEnabled:false});
    try{
      assert.equal(await page.locator('.entrance-paperkeeper').getAttribute('data-acting-state'),null);
      await page.locator('#field-atlas summary').click();
      assert.equal(await page.locator('#field-atlas').evaluate(el=>el.open),true);
      assert.equal(await page.locator('#entrance h1').isVisible(),true);
      assert.deepEqual(errors,[]);
      pass(route+' no-JS fallback');
    }finally{await context.close();}
  }
  for(const route of routes){
    const {context,page,errors}=await setup(route,{blockFrame:true});
    try{
      await ready(page,'unavailable');
      assert.ok((await page.locator('.entrance-paperkeeper').getAttribute('src')).includes('paperkeeper.three-quarter'));
      await page.locator('#field-atlas summary').click();
      assert.equal(await page.locator('#field-atlas').evaluate(el=>el.open),true);
      await page.locator('.field-atlas-index a[href="#work-clearing"]').click();
      await page.waitForURL('**/#work-clearing');
      assert.deepEqual(errors,[]);
      pass(route+' missing-frame fallback + native navigation');
    }finally{await context.close();}
  }
  {
    const {context,page,errors}=await setup(routes[0]);
    try{
      await ready(page);
      await page.locator('#field-atlas').evaluate(el=>{el.open=true;});
      await page.waitForFunction(()=>document.querySelector('.entrance-paperkeeper').dataset.actingFrame==='lift-low',null,{timeout:5000});
      await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
      await page.waitForFunction(()=>document.querySelector('.entrance-paperkeeper').dataset.actingState==='settled');
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(400);
      assert.equal(await page.locator('.entrance-paperkeeper').getAttribute('data-acting-state'),'settled');
      assert.deepEqual(errors,[]);
      pass('offscreen cancel without automatic replay');
    }finally{await context.close();}
  }
  console.log('R04 COMPLETE: '+passed+' built-browser cases; zero screenshots/video.');
}finally{await browser.close();}
