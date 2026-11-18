/** R13 — production Chromium visual baseline. Non-invasive: no art or UI changes. */
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname, relative } from 'node:path';

const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const output=process.env.R13_CAPTURE_DIR||'artifacts/r13-visual';
const sha=process.env.GIT_SHA||process.env.GITHUB_SHA||'unknown';
const sizes=[[1440,900],[390,844],[320,720],[844,390]];
const routes=[['root','/lazarusdev/'],['storybook','/lazarusdev/storybook/']];
const chapters=[
 ['entrance','#entrance .entrance-stage'],
 ['path','#winding-path .path-map'],
 ['clearing','#work-clearing .work-clearing-installation'],
 ['river','#river-stories .river-scene'],
 ['house','#house-on-the-hill .house-scene']
];
const evidence={version:1,sourceCommit:sha,createdAt:new Date().toISOString(),origin,
  browser:'Chromium',routes:routes.map(x=>x[1]),sizes,signOff:'NOT SIGNED OFF',
  physicalDevice:'NOT VERIFIED',screenshots:[],checks:[],warnings:[],failures:[]};

const dims=el=>{if(!el)return null;const r=el.getBoundingClientRect();return{
 x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)};};

async function loadVisible(page,selector){
  if(selector)await page.locator(selector).scrollIntoViewIfNeeded({timeout:15000});
  await page.evaluate(async sel=>{
    const root=sel?document.querySelector(sel):document;
    if(!root)return;
    const imgs=[...root.querySelectorAll('img')].filter(el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&
        r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;
    });
    await Promise.race([Promise.all(imgs.map(x=>x.decode().catch(()=>{}))),
      new Promise(resolve=>setTimeout(resolve,7500))]);
  },selector);
  await page.waitForTimeout(100);
}
async function metrics(page,selector){
  return page.evaluate(sel=>{
    const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return{
      x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)};};
    const el=sel?document.querySelector(sel):null;
    const images=el?[...el.querySelectorAll('img')].map(img=>{
      const r=img.getBoundingClientRect(),s=getComputedStyle(img);
      const visible=s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&
        r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight;
      return {src:img.currentSrc||img.src,visible,complete:img.complete,naturalWidth:img.naturalWidth,
        naturalHeight:img.naturalHeight,fit:s.objectFit,position:s.objectPosition,rect:box(img)};
    }):[];
    const walker=el?.querySelector('.journey-walker');
    const gallery=document.querySelector('.work-hangings');
    return {viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,
      rect:box(el),images,walker:walker?{rect:box(walker),pose:walker.dataset.pose||null}:null,
      pageProp:box(document.querySelector('.rescue-page')),
      lantern:box(document.querySelector('.rescue-lantern')),
      stoneNav:box(document.querySelector('.river-stone-nav')),
      dryingPage:box(document.querySelector('.kept-page-window')),
      rescueState:document.querySelector('.river-scene')?.dataset.rescue||null,
      houseLight:document.querySelector('.house-scene')?.dataset.lit||null,
      gallery:gallery?{left:gallery.scrollLeft,scrollWidth:gallery.scrollWidth,clientWidth:gallery.clientWidth}:null,
      samePageCut:document.querySelector('.rescue-page .kept-page-art path')?.getAttribute('d')===
        document.querySelector('.kept-page-window .kept-page-art path')?.getAttribute('d'),
      lightValue:document.querySelector('#atrium-light-value')?.textContent||null};
  },selector);
}
async function shot(page,bucket,name,selector){
  const file=join(output,bucket,name+'.png');
  await mkdir(dirname(file),{recursive:true});
  if(selector){
    await loadVisible(page,selector);
    await page.locator(selector).screenshot({path:file,animations:'disabled',caret:'hide',timeout:35000});
  }else{
    await page.screenshot({path:file,animations:'disabled',caret:'hide',timeout:35000});
  }
  const png=await readFile(file);
  const data=await metrics(page,selector||null);
  const entry={file:relative(output,file).replaceAll('\\','/'),bytes:png.length,
    sha256:createHash('sha256').update(png).digest('hex'),selector:selector||null,...data};
  evidence.screenshots.push(entry);
  if(data.documentWidth>data.viewport.width+2){
    evidence.warnings.push({file:entry.file,code:'HORIZONTAL_OVERFLOW',by:data.documentWidth-data.viewport.width});
  }
  if(data.images.some(x=>x.visible&&x.complete&&!x.naturalWidth)){
    evidence.failures.push({file:entry.file,code:'BROKEN_VISIBLE_IMAGE'});
  }
  if(selector&&(!data.rect||data.rect.width<2||data.rect.height<2)){
    evidence.failures.push({file:entry.file,code:'EMPTY_CAPTURE_TARGET'});
  }
  console.log('R13 image',entry.file,'bytes',entry.bytes);
}
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),
  headless:true,args:['--no-sandbox']});
try{
  evidence.chromiumVersion=browser.version();
  for(const [routeId,route] of routes){
    for(const [width,height] of sizes){
      const bucket=routeId+'/'+width+'x'+height;
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,
        isMobile:width<=670,hasTouch:width<=670,reducedMotion:'no-preference',colorScheme:'light'});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',err=>errors.push(err.message));
      page.setDefaultTimeout(15000);
      console.log('R13 viewport',route,width,height);
      try{
        await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:45000});
        await page.evaluate(()=>Promise.race([document.fonts.ready.catch(()=>{}),
          new Promise(resolve=>setTimeout(resolve,5500))]));
        for(const [name,selector] of chapters){
          await shot(page,bucket,'scene-'+name,selector);
          if(width===1440||width===390)await shot(page,bucket,'viewport-'+name,null);
        }
        for(const name of ['atrium','oracle','archive']){
          await shot(page,bucket,'poster-'+name,'[data-open-concept="'+name+'"]');
        }
        // Preserve a non-zero horizontal gallery offset for the return-path audit.
        await page.locator('.work-hangings').evaluate(el=>{
          if(el.scrollWidth>el.clientWidth+10)el.scrollLeft=Math.min(90,el.scrollWidth-el.clientWidth);
        });
        const enter=page.locator('.atrium-clearing-shortcut');
        await enter.scrollIntoViewIfNeeded();
        const before=await page.evaluate(()=>({y:scrollY,x:document.querySelector('.work-hangings').scrollLeft}));
        await enter.click();
        await page.waitForFunction(()=>document.querySelector('#atrium-room')?.hidden===false,null,{timeout:12000});
        for(const n of [0,50,100]){
          await page.locator('#atrium-light').evaluate((el,value)=>{
            el.value=String(value);
            el.dispatchEvent(new Event('input',{bubbles:true}));
          },n);
          await page.waitForTimeout(280);
          await shot(page,bucket,'atrium-light-'+n,'#atrium-room .atrium-frame');
        }
        await page.goBack({waitUntil:'domcontentloaded',timeout:12000});
        await page.waitForFunction(()=>document.querySelector('#atrium-room')?.hidden===true,null,{timeout:12000});
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const after=await page.evaluate(()=>({
          y:scrollY,x:document.querySelector('.work-hangings').scrollLeft,
          focus:document.activeElement?.matches('[data-atrium-enter]')||false
        }));
        const pass=Math.abs(before.y-after.y)<5&&Math.abs(before.x-after.x)<2&&after.focus;
        evidence.checks.push({route,viewport:width+'x'+height,
          name:'atrium-return',before,after,pass});
        if(!pass)evidence.failures.push({route,viewport:width+'x'+height,code:'ATRIUM_RETURN'});
        await shot(page,bucket,'gallery-return','#work-clearing .work-clearing-installation');
        await shot(page,bucket,'river-after-entry','#river-stories .river-scene');
        try{
          await page.waitForFunction(()=>document.querySelector('.river-scene')?.dataset.rescue==='carrying',
            null,{timeout:5000});
          await shot(page,bucket,'river-rescue-carrying','#river-stories .river-scene');
        }catch{
          evidence.warnings.push({route,viewport:width+'x'+height,code:'RIVER_CARRY_NOT_CAPTURED'});
        }
        const light=page.locator('[data-house-light-toggle]');
        if(await light.isVisible()){
          await light.click();
          await shot(page,bucket,'house-lit','#house-on-the-hill .house-scene');
          evidence.checks.push({route,viewport:width+'x'+height,name:'house-light',
            state:await page.locator('.house-scene').getAttribute('data-lit')});
        }else{
          evidence.warnings.push({route,viewport:width+'x'+height,code:'HOUSE_LIGHT_TOGGLE_HIDDEN'});
        }
        if(routeId==='root'&&width===390){
          await page.emulateMedia({reducedMotion:'reduce'});
          await page.waitForFunction(()=>document.querySelector('.river-scene')?.dataset.rescue==='still',
            null,{timeout:4000});
          await shot(page,bucket,'river-reduced-motion','#river-stories .river-scene');
        }
      }catch(error){
        evidence.failures.push({route,viewport:width+'x'+height,code:'CAPTURE_ERROR',detail:String(error)});
        console.error('R13 capture error',route,width,height,error);
      }finally{
        if(errors.length)evidence.failures.push({route,viewport:width+'x'+height,
          code:'PAGE_ERRORS',details:errors});
        await context.close();
      }
    }
  }
}finally{
  await browser.close();
}
evidence.finishedAt=new Date().toISOString();
await mkdir(output,{recursive:true});
await writeFile(join(output,'manifest.json'),JSON.stringify(evidence,null,2)+'\n');
const report=[
 '# R13 — Real Chromium screenshot baseline','',
 '- Source commit: '+evidence.sourceCommit,
 '- Browser: '+evidence.browser+' '+evidence.chromiumVersion,
 '- 2 routes, 4 viewports each: '+sizes.map(x=>x.join('×')).join(', '),
 '- Actual PNG captures: '+evidence.screenshots.length,
 '- Automated warnings: '+evidence.warnings.length,
 '- Automated failures: '+evidence.failures.length,
 '- Human visual sign-off: **NOT SIGNED OFF**',
 '- One-hand physical device: **NOT VERIFIED**','',
 '## Machine observations',
 ...evidence.warnings.map(x=>'- '+JSON.stringify(x)),
 ...(evidence.warnings.length?[]:['- None detected.']),
 '','## Pending human inspection of actual screenshots',
 '- Figure and text cropping, focus hierarchy, control overlap, and Paperkeeper foot contact.',
 '- Gallery should privilege Atrium and show the edge of its next poster on mobile.',
 '- Source river paintings contain multiple paper illustrations plus an interactive page overlay.',
 '- House still requires genuine twilight lighting and a physically aligned drying page.',
 '- Atrium thresholds, relief and cast-shadow physical plausibility must be reviewed at 0/50/100.',
 '- Manual scores per chapter cannot be generated by DOM measurements or green CI.','',
 '## Automated errors',
 ...evidence.failures.map(x=>'- '+JSON.stringify(x)),
 ...(evidence.failures.length?[]:['- None detected.']),
 '','The complete manifest lists image SHA-256, loaded assets, object-fit, geometry, prop positions,',
 'same-torn-corner check, gallery offsets and return-focus evidence.'
].join('\n');
await writeFile(join(output,'AUDIT.md'),report+'\n');
console.log('R13 result',evidence.screenshots.length,'PNGs',evidence.failures.length,'failures');
if(evidence.failures.length)process.exitCode=1;
