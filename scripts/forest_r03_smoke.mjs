/** Compiled acting module + real Chromium. Ephemeral fixture, no preview files/capture. */
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { build } from 'vite';
import { chromium } from 'playwright';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=await mkdtemp(path.join(tmpdir(),'forest-r03-'));
await build({configFile:false,root,base:'/lazarusdev/',logLevel:'warn',build:{outDir:output,emptyOutDir:true,rollupOptions:{input:path.join(root,'src/storybook/entrance-acting.js'),preserveEntrySignatures:'strict',output:{entryFileNames:'acting.js'}}}});
const fallback=await readFile(path.join(root,'storybook/assets/entrance/r02/exports/paperkeeper.three-quarter.webp'));
const fixture=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Acting test fixture</title><style>body{margin:20px;color:#273829;background:#f7e9d6}#keeper{display:block;height:280px;width:auto}summary,a{display:block;min-height:48px;line-height:48px}#work{margin-top:1800px;min-height:100vh}@media(max-width:670px){#keeper{height:167px}}@media(max-width:360px){#keeper{height:136px}}</style><img id="keeper" src="/fallback.webp" width="622" height="960" alt="Paperkeeper"><details id="atlas"><summary>Open atlas</summary><a href="#work">Work</a></details><a id="leave" href="#work">Go to work</a><section id="work"><h1>Work</h1></section></html>`;
const server=createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/') {res.setHeader('Content-Type','text/html');res.end(fixture);return;}
    if(url.pathname==='/fallback.webp') {res.setHeader('Content-Type','image/webp');res.end(fallback);return;}
    const relative=url.pathname.replace(/^\/lazarusdev\//,'');
    const filename=path.resolve(output,relative);
    if(!filename.startsWith(output+path.sep)) {res.writeHead(403).end();return;}
    res.setHeader('Content-Type',filename.endsWith('.webp')?'image/webp':'text/javascript');
    res.end(await readFile(filename));
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let checks=0;

async function setup(options={}) {
  const context=await browser.newContext({viewport:{width:390,height:844},...options});
  const page=await context.newPage(),requests=[],errors=[];
  page.on('request',r=>{if(r.url().includes('/assets/'))requests.push(r.url());});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    const keeper=document.getElementById('keeper');
    await keeper.decode();
    window.trace=[];
    window.liveTimers=new Set();
    const timeout=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window);
    window.setTimeout=(fn,delay,...args)=>{
      const id=timeout(()=>{liveTimers.delete(id);fn(...args);},delay);
      liveTimers.add(id);return id;
    };
    window.clearTimeout=id=>{liveTimers.delete(id);clear(id);};
    window.factory=(await import('/lazarusdev/acting.js')).createEntranceActing;
    window.control=factory(keeper);
    new MutationObserver(()=>{
      const id=keeper.dataset.actingFrame||'fallback',state=keeper.dataset.actingState;
      if(trace.at(-1)?.id!==id||trace.at(-1)?.state!==state)trace.push({id,state,time:performance.now(),transform:getComputedStyle(keeper).transform,rect:keeper.getBoundingClientRect().toJSON()});
    }).observe(keeper,{attributes:true});
    document.getElementById('atlas').addEventListener('toggle',()=>{
      if(document.getElementById('atlas').open)void control.play();
    });
  });
  return {context,page,requests,errors};
}
async function settled(page) {await page.waitForFunction(()=>control.state==='settled');}
async function idleTimerCheck(page) {assert.equal(await page.evaluate(()=>liveTimers.size),0,'No scheduler/decode timer remains while idle');}
function passed(name){checks++;console.log('PASS R03 '+name);}

try {
  for(const profile of [
    {name:'desktop pointer',viewport:{width:1440,height:900},input:'click'},
    {name:'mobile keyboard',viewport:{width:390,height:844},input:'keyboard'},
    {name:'narrow touch',viewport:{width:320,height:720},input:'tap',hasTouch:true},
  ]) {
    const {page,context,requests,errors}=await setup({viewport:profile.viewport,hasTouch:profile.hasTouch||false});
    try {
      assert.equal(requests.length,0,'Mounting is lazy and does not autoplay/download frames');
      assert.equal(await page.evaluate(()=>control.prepare()),true);
      assert.equal(requests.length,9,'Each required drawing loads once');
      await page.evaluate(()=>{trace.length=0;});
      if(profile.input==='keyboard'){await page.locator('summary').focus();await page.keyboard.press('Enter');}
      else if(profile.input==='tap')await page.locator('summary').tap();
      else await page.locator('summary').click();
      assert.equal(await page.locator('#atlas').evaluate(x=>x.open),true,'Native control responds immediately');
      await page.waitForFunction(()=>control.state==='playing');
      assert.equal(await page.evaluate(()=>control.play()),false,'Repeated activation cannot queue another action');
      await settled(page);
      const trace=await page.evaluate(()=>window.trace);
      const acting=trace.filter(x=>x.state==='playing');
      assert.deepEqual(acting.map(x=>x.id),['neutral','notice','anticipate','lift-low','lift-mid','overshoot','follow','settled']);
      assert.ok(trace.at(-1).time-acting[0].time>=1180&&trace.at(-1).time-acting[0].time<2200,'Native-speed 1200ms invitation');
      assert.ok(acting.every(x=>x.transform==='none'),'No whole-body transform acting');
      assert.ok(acting.every(x=>x.rect.width===acting[0].rect.width&&x.rect.height===acting[0].rect.height),'Canvas scale does not jump');
      await idleTimerCheck(page);
      await page.evaluate(()=>{trace.length=0;});
      assert.equal(await page.evaluate(()=>control.play()),true);
      await settled(page);
      const replay=await page.evaluate(()=>trace.filter(x=>x.state==='playing').map(x=>x.id));
      assert.deepEqual(replay,['settled','acknowledge','settled'],'Replay acknowledges from the raised pose');
      await idleTimerCheck(page);
      assert.equal(requests.length,9,'Replay reuses decoded frames');
      assert.deepEqual(errors,[]);
      passed(profile.name+' / invitation, grounded canvas, 560ms replay, lazy loading');
    }finally{await context.close();}
  }

  {
    const {page,context,requests,errors}=await setup({reducedMotion:'reduce'});
    try {
      assert.equal(await page.evaluate(()=>control.prepare()),true);
      assert.equal(requests.length,1,'Reduced motion loads only the settled frame');
      assert.ok(requests[0].includes('settled-'));
      assert.equal(await page.evaluate(()=>control.play()),true);
      await settled(page);
      assert.equal(await page.locator('#keeper').getAttribute('data-acting-frame'),'settled');
      await idleTimerCheck(page);
      await page.emulateMedia({reducedMotion:'no-preference'});
      assert.equal(await page.evaluate(()=>control.play()),true);
      await settled(page);
      assert.equal(requests.length,9,'Opting into motion decodes the remaining drawings');
      assert.deepEqual(errors,[]);
      passed('reduced motion final still and preference change');
    }finally{await context.close();}
  }

  for(const mode of ['cancel','offscreen','background','reduce-during-play','destroy']) {
    const {page,context,errors}=await setup();
    try {
      await page.evaluate(async()=>{await control.prepare();await control.play();});
      await page.waitForFunction(()=>document.getElementById('keeper').dataset.actingFrame==='lift-low');
      if(mode==='cancel')await page.evaluate(()=>control.cancel());
      if(mode==='offscreen') {await page.locator('#leave').click();await page.waitForURL('**/#work');}
      if(mode==='background')await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
      if(mode==='reduce-during-play')await page.emulateMedia({reducedMotion:'reduce'});
      if(mode==='destroy')await page.evaluate(()=>control.destroy());
      await page.waitForFunction(()=>['settled','disposed'].includes(control.state));
      assert.equal(await page.locator('#keeper').getAttribute('data-acting-frame'),'settled');
      await idleTimerCheck(page);
      const before=await page.evaluate(()=>trace.length);
      if(mode==='background')await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      if(mode==='offscreen')await page.evaluate(()=>scrollTo(0,0));
      await page.waitForTimeout(240);
      assert.equal(await page.evaluate(()=>trace.length),before,'No automatic resume or queued replay');
      assert.deepEqual(errors,[]);
      passed(mode+' / settled endpoint, no timers or automatic resume');
    }finally{await context.close();}
  }

  {
    const {page,context,errors}=await setup();
    try {
      await page.route('**/assets/lift-mid-*.webp',route=>route.abort());
      const before=await page.locator('#keeper').getAttribute('src');
      assert.equal(await page.evaluate(()=>control.play()),false);
      assert.equal(await page.locator('#keeper').getAttribute('src'),before,'Decode failure keeps the working fallback');
      assert.equal(await page.evaluate(()=>control.state),'unavailable');
      await page.waitForFunction(()=>liveTimers.size===0);
      await page.locator('#leave').click();
      await page.waitForURL('**/#work');
      assert.deepEqual(errors,[]);
      passed('failed frame / original still and native navigation remain usable');
    }finally{await context.close();}
  }

  {
    const {page,context,errors}=await setup();
    try {
      await page.route('**/assets/*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,300));await route.continue().catch(()=>{});});
      const before=await page.locator('#keeper').getAttribute('src');
      await page.evaluate(()=>{window.pendingPlay=control.play();control.destroy();});
      assert.equal(await page.evaluate(()=>pendingPlay),false);
      await page.waitForTimeout(400);
      assert.equal(await page.locator('#keeper').getAttribute('src'),before,'Disposed preload cannot commit a late frame');
      await idleTimerCheck(page);
      assert.deepEqual(errors,[]);
      passed('destroy during decode / no stale frame writes or unhandled rejection');
    }finally{await context.close();}
  }
  console.log(`R03 COMPLETE: ${checks} compiled-browser cases; no screenshots, videos or preview artifacts.`);
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
  await rm(output,{recursive:true,force:true});
}
