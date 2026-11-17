/** R04/R12: real authored Paperkeeper scenes perform on sight, atlas stays native. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let cases=0;
async function visit(route,{width=390,height=844,reducedMotion='no-preference',javaScriptEnabled=true,blockFrame=false}={}){
 const ctx=await browser.newContext({viewport:{width,height},reducedMotion,javaScriptEnabled});
 if(blockFrame) await ctx.route('**/*lift-mid*.webp',r=>r.abort());
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await page.goto(origin+route,{waitUntil:'domcontentloaded'})).status(),200);
 return {ctx,page,errors};
}
async function settled(page,selector){
 await page.waitForFunction(selector=>{
  const image=document.querySelector(selector);
  return image?.dataset.autoPlayed==='true'&&image.dataset.actingState==='settled';
 },selector,{timeout:24000});
}
try{
 for(const route of routes)for(const width of [320,390,1440]){
  const {ctx,page,errors}=await visit(route,{width,height:width===320?720:width===390?844:900});
  try{
   await page.locator('.entrance-paperkeeper').scrollIntoViewIfNeeded();
   await settled(page,'.entrance-paperkeeper');
   const hero=await page.locator('.entrance-paperkeeper').getAttribute('data-acting-frame');
   assert.equal(hero,'settled','Gateway plays on viewport, never on a demo click');
   await page.locator('.field-atlas-paperkeeper').scrollIntoViewIfNeeded();
   await settled(page,'.field-atlas-paperkeeper');
   assert.equal(await page.locator('#field-atlas').evaluate(x=>x.open),false,'Atlas native closed until explicitly read');
   await page.evaluate(()=>{
    window.r04Replay=[];
    const img=document.querySelector('.field-atlas-paperkeeper');
    window.r04Observer=new MutationObserver(()=>{
      const frame=img.dataset.actingFrame;
      if(frame&&window.r04Replay.at(-1)!==frame)window.r04Replay.push(frame);
    });
    window.r04Observer.observe(img,{attributes:true,attributeFilter:['data-acting-frame']});
   });
   await page.locator('.hero-atlas-cue').click();
   await page.waitForURL('**/#field-atlas');
   assert.equal(await page.locator('#field-atlas').evaluate(x=>x.open),true,'Cue opens atlas immediately');
   await page.waitForFunction(()=>document.querySelector('.field-atlas-paperkeeper')?.dataset.actingState==='settled',null,{timeout:10000});
   const seen=await page.evaluate(()=>{window.r04Observer.disconnect();return window.r04Replay;});
   assert.ok(seen.includes('acknowledge')||seen.length===0,'Native atlas acknowledgment is finite');
   assert.equal(await page.locator('.field-atlas-paperkeeper').evaluate(x=>getComputedStyle(x).transform),'none');
   assert.deepEqual(errors,[]);
   cases++;
   console.log('PASS R04 '+route+' '+width+' automatic authored frames and native atlas');
  }finally{await ctx.close();}
 }
 for(const route of routes){
  const {ctx,page,errors}=await visit(route,{reducedMotion:'reduce'});
  try{
   await page.locator('.field-atlas-paperkeeper').scrollIntoViewIfNeeded();
   await settled(page,'.field-atlas-paperkeeper');
   await page.locator('#field-atlas summary').focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#field-atlas').evaluate(x=>x.open),true);
   assert.deepEqual(errors,[]);
   cases++;
   console.log('PASS R04 '+route+' automatic authored motion with OS reduced preference');
  }finally{await ctx.close();}
  const nojs=await visit(route,{javaScriptEnabled:false});
  try{
   assert.equal(await nojs.page.locator('.field-atlas-paperkeeper').getAttribute('data-acting-state'),null);
   await nojs.page.locator('#field-atlas summary').click();
   assert.equal(await nojs.page.locator('#field-atlas').evaluate(x=>x.open),true);
   cases++;
   console.log('PASS R04 '+route+' no-JS static image and native atlas');
  }finally{await nojs.ctx.close();}
  const blocked=await visit(route,{blockFrame:true});
  try{
   await blocked.page.locator('.field-atlas-paperkeeper').scrollIntoViewIfNeeded();
   await blocked.page.waitForFunction(()=>document.querySelector('.field-atlas-paperkeeper')?.dataset.actingState==='unavailable',null,{timeout:16000});
   assert.ok((await blocked.page.locator('.field-atlas-paperkeeper').getAttribute('src')).includes('paperkeeper.three-quarter'));
   await blocked.page.locator('#field-atlas summary').click();
   assert.equal(await blocked.page.locator('#field-atlas').evaluate(x=>x.open),true);
   cases++;
   console.log('PASS R04 '+route+' missing frame keeps original still and native navigation');
  }finally{await blocked.ctx.close();}
 }
 console.log('R04/R12 COMPLETE '+cases+' real-browser flows; zero media captures.');
}finally{await browser.close();}
