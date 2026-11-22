/** Browser evidence for actual chapter movement and one causal torn page.
 * Runs against built Pages-equivalent URLs; screenshots are real live frames. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const folder=resolve(process.env.V3_CAPTURE_DIR||'artifacts/v3');
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CI?{channel:'chrome'}:{}),args:['--no-sandbox']});
const result={schema:'lazarus-living-story-browser-v1',source:process.env.GIT_SHA||'LOCAL',checks:[],screenshots:[]};
async function at(page,selector,progress){
 await page.evaluate(([selector,progress])=>{
   const host=document.querySelector(selector);
   if(!host)throw Error('Missing stage '+selector);
   const docTop=host.getBoundingClientRect().top+scrollY;
   const travel=Math.max(1,host.offsetHeight-innerHeight);
   scrollTo({top:docTop+progress*travel,behavior:'instant'});
 },[selector,progress]);
 await page.waitForTimeout(180);
}
async function capture(page,label) {
 const name=label+'.png';
 await page.screenshot({path:join(folder,name)});
 result.screenshots.push(name);
}
try{
 for(const [routeName,route] of [['root','/lazarusdev/'],['storybook','/lazarusdev/storybook/']]){
   const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   await page.waitForFunction(()=>document.documentElement.classList.contains('living-guide-ready'),{timeout:20000});
   assert.equal(await page.locator('.living-guide').count(),1,'one persistent enhanced guide');
   await at(page,'.v3-path-scroll',.3828);
   const first=await page.evaluate(()=>{
     const walker=document.querySelector('[data-walk="path"]');
     const guide=document.querySelector('.living-guide');
     return {p:Number(document.querySelector('.v3-path-scroll').style.getPropertyValue('--v3-progress')),
       old:walker.style.transform,render:guide.style.transform,position:guide.getBoundingClientRect().x,
       oldHidden:getComputedStyle(walker).visibility==='hidden',
       active:getComputedStyle(guide).opacity};
   });
   await capture(page,routeName+'-path-38');
   await at(page,'.v3-path-scroll',.7559);
   const second=await page.evaluate(()=>{
     const walker=document.querySelector('[data-walk="path"]'),guide=document.querySelector('.living-guide');
     return {p:Number(document.querySelector('.v3-path-scroll').style.getPropertyValue('--v3-progress')),
       old:walker.style.transform,render:guide.style.transform,position:guide.getBoundingClientRect().x,
       active:getComputedStyle(guide).opacity};
   });
   await capture(page,routeName+'-path-76');
   assert.ok(first.p>.33&&first.p<.44&&second.p>.70&&second.p<.82,JSON.stringify({first,second}));
   // The source walkers are purposefully frozen once the external guide takes over.
   assert.notEqual(first.render,second.render,'the one external Paperkeeper must travel');
   assert.ok(first.oldHidden,'old scene walkers should not form multiple active protagonists');
   await page.waitForTimeout(220);
   const settled=await page.locator('.living-guide').getAttribute('data-pose');
   assert.ok(!['step-a','step-b','step-c'].includes(settled),'paused guide keeps walking');
   await at(page,'.v3-river-scroll',.60);
   await page.waitForTimeout(300);
   const started=await page.evaluate(()=>({phase:document.querySelector('.river-scene').dataset.rescue,
     owner:document.body.dataset.pageOwner}));
   await capture(page,routeName+'-river-reach');
   await page.waitForTimeout(2050);
   const lifted=await page.evaluate(()=>({phase:document.querySelector('.river-scene').dataset.rescue,
     owner:document.body.dataset.pageOwner,pageId:document.querySelector('.river-scene').dataset.pageId}));
   assert.equal(lifted.phase,'carrying','committed rescue must finish after scroll stops');
   assert.equal(lifted.owner,'keeper');
   assert.equal(lifted.pageId,'forest-torn-page-01');
   assert.equal(started.owner,'river','water must own the page before lift');
   await capture(page,routeName+'-river-carry');
   await page.evaluate(()=>{
      const el=document.querySelector('.house-scene');
      scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*.18,behavior:'instant'});
   });
   await page.waitForTimeout(260);
   const house=await page.evaluate(()=>({owner:document.body.dataset.pageOwner,
      pageId:document.querySelector('.house-scene').dataset.pageId,
      visibility:getComputedStyle(document.querySelector('.kept-page-window')).visibility,
      pagePosition:(()=>{
        const c=document.querySelector('.house-scene-canvas').getBoundingClientRect();
        const p=document.querySelector('.kept-page-window').getBoundingClientRect();
        return {x:(p.left-c.left)/c.width,y:(p.top-c.top)/c.height};
      })()}));
   assert.equal(house.owner,'window');
   assert.equal(house.pageId,lifted.pageId);
   assert.equal(house.visibility,'visible','window page needs actual rescue completion');
   assert.ok(house.pagePosition.x>.77&&house.pagePosition.x<.86&&house.pagePosition.y>.18&&house.pagePosition.y<.29,'desktop page must hang in attic window: '+JSON.stringify(house));
   await capture(page,routeName+'-house-page');
   await page.evaluate(()=>{
      const host=document.querySelector('.v3-river-scroll');
      scrollTo({top:scrollY+host.getBoundingClientRect().top-innerHeight*1.5,behavior:'instant'});
   });
   await page.waitForTimeout(240);
   assert.equal(await page.evaluate(()=>document.body.dataset.pageOwner),'river','deliberate upstream revisit re-arms the page');
   assert.deepEqual(errors,[],'uncaught browser errors: '+errors.join('; '));
   result.checks.push({route:routeName,pathProgress:[first.p,second.p],positionChanged:true,settled,
     rescueStarted:started,rescueFinished:lifted,house,upstreamReset:true});
   await page.close();
   // Portrait uses a different real painting crop; validate the page reaches
   // the actual upper window and keep a real mobile screenshot for art review.
   const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});
   await mobile.goto(origin+route,{waitUntil:'domcontentloaded'});
   await mobile.waitForFunction(()=>document.body.dataset.narrativeVersion==='3');
   await mobile.evaluate(()=>{
     const river=document.querySelector('.river-scene');
     scrollTo({top:scrollY+river.getBoundingClientRect().top-innerHeight*.12,behavior:'instant'});
   });
   await mobile.waitForTimeout(2400);
   await mobile.evaluate(()=>{
     const house=document.querySelector('.house-scene');
     scrollTo({top:scrollY+house.getBoundingClientRect().top-innerHeight*.12,behavior:'instant'});
   });
   await mobile.waitForTimeout(280);
   const portrait=await mobile.evaluate(()=>{
     const canvas=document.querySelector('.house-scene-canvas').getBoundingClientRect();
     const page=document.querySelector('.kept-page-window').getBoundingClientRect();
     return {owner:document.body.dataset.pageOwner,
       x:(page.left-canvas.left)/canvas.width,
       y:(page.top-canvas.top)/canvas.height};
   });
   assert.equal(portrait.owner,'window','portrait must carry river page to the cottage');
   assert.ok(portrait.x>.67&&portrait.x<.77&&portrait.y>.18&&portrait.y<.29,'portrait attic window: '+JSON.stringify(portrait));
   await capture(mobile,routeName+'-mobile-kept-page');
   result.checks.push({route:routeName,mobileDelivery:portrait});
   await mobile.close();
   for(const width of [670,671,760,761]){
      const compactPage=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
      await compactPage.goto(origin+route,{waitUntil:'domcontentloaded'});
      await compactPage.waitForFunction(()=>document.body.dataset.narrativeVersion==='3');
      const state=await compactPage.evaluate(()=>({
        sticky:getComputedStyle(document.querySelector('.v3-path-scroll .path-map')).position,
        mode:document.documentElement.dataset.v3Motion,
        overflow:document.documentElement.scrollWidth-innerWidth
      }));
      assert.equal(state.sticky,width===670?'relative':'sticky',route+' '+width+' sticky breakpoint: '+JSON.stringify(state));
      assert.equal(state.mode,width===670?'compact':'full',route+' '+width+' JS breakpoint');
      assert.ok(state.overflow<=2,'unexpected horizontal overflow '+width+' '+state.overflow);
      result.checks.push({route:routeName,width,state});
      await compactPage.close();
   }
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await reduced.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 await reduced.waitForFunction(()=>document.body.dataset.narrativeVersion==='3');
 assert.equal(await reduced.locator('.v3-story-sentence').count(),5);
 assert.equal(await reduced.locator('.living-guide').isVisible(),false,'reduced motion must keep native painted fallback');
 assert.equal(await reduced.locator('main [data-chapter]').count(),5);
 await reduced.close();
 const fallback=await browser.newPage({viewport:{width:1440,height:900}});
 await fallback.route('**/*paperkeeper-journey-r15a*.webp',request=>request.abort());
 await fallback.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 await fallback.waitForFunction(()=>document.body.dataset.narrativeVersion==='3');
 await at(fallback,'.v3-path-scroll',.3828);
 const sourceBefore=await fallback.locator('[data-walk="path"]').evaluate(node=>node.style.transform);
 await at(fallback,'.v3-path-scroll',.7559);
 const sourceAfter=await fallback.locator('[data-walk="path"]').evaluate(node=>node.style.transform);
 assert.notEqual(sourceBefore,sourceAfter,'fallback Paperkeeper must advance during sticky scroll');
 assert.equal(await fallback.evaluate(()=>document.documentElement.classList.contains('living-guide-ready')),false);
 await fallback.close();
 const blocked=await browser.newPage({viewport:{width:390,height:844}});
 await blocked.route('**/*paperkeeper-journey-r15a*.webp',route=>route.abort());
 await blocked.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
 await blocked.waitForFunction(()=>document.body.dataset.narrativeVersion==='3');
 await blocked.waitForTimeout(300);
 assert.equal(await blocked.evaluate(()=>document.documentElement.classList.contains('living-guide-ready')),false,
    'missing art must preserve the original story rather than hiding it');
 assert.equal(await blocked.locator('main [data-chapter]').count(),5);
 await blocked.close();
 await writeFile(join(folder,'living-story-manifest.json'),JSON.stringify(result,null,2));
 console.log('PASS Living Story: two routes, sticky travel, rescue ownership, upstream reset, breakpoints, reduced motion, art failure');
}finally{await browser.close();}
