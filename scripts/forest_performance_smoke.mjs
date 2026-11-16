/** Stage 16 — reproducible text-only resource and rendering audit; NO screenshots. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const profiles=[{w:390,h:844},{w:670,h:880},{w:1024,h:768},{w:1440,h:900}];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passes=0;
try {
  for(const route of routes) for(const {w,h} of profiles){
    const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
    await ctx.addInitScript(()=>{
      window.__forestLCP=0;window.__forestCLS=0;
      try {
        new PerformanceObserver(list=>{
          for(const entry of list.getEntries())window.__forestLCP=entry.startTime;
        }).observe({type:'largest-contentful-paint',buffered:true});
        new PerformanceObserver(list=>{
          for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__forestCLS+=entry.value;
        }).observe({type:'layout-shift',buffered:true});
      }catch(_){/* performance observer support varies by browser */}
    });
    const page=await ctx.newPage(),issues=[],requests=[];
    const tag=route+' '+w+'x'+h;
    page.on('pageerror',e=>issues.push(e.message));
    page.on('request',r=>{if(r.url().startsWith(base))requests.push({url:r.url(),type:r.resourceType()});});
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)issues.push(r.status()+' '+r.url());});
    try{
      const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
      assert.equal(response.status(),200,tag+' response');
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true',{timeout:20000});
      const pageData=await page.evaluate(async()=>{
        const hero=document.querySelector('.entrance-backdrop');
        const paperkeeper=document.querySelector('.entrance-paperkeeper');
        await Promise.all([hero.decode(),paperkeeper.decode()]);
        const preloads=[...document.querySelectorAll('link[rel="preload"][as="image"]')];
        const mobile=matchMedia('(max-width: 670px)').matches;
        const matching=preloads.filter(x=>matchMedia(x.media).matches);
        const illustrations=[...document.querySelectorAll('#winding-path img,#work-clearing img,#river-stories img,#house-on-the-hill img')];
        const canvases=[...document.querySelectorAll('.path-map-art,.work-clearing-world,.river-scene,.house-scene-canvas')];
        return {
          chapters:document.querySelectorAll('section[data-chapter]').length,
          heading:document.querySelectorAll('h1').length,
          overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
          imageNatural:[hero.naturalWidth,hero.naturalHeight,paperkeeper.naturalWidth],
          imageSource:hero.currentSrc,
          heroPriority:hero.fetchPriority,
          keeperPriority:paperkeeper.fetchPriority,
          preloads:preloads.length,matching:matching.length,
          preloadHref:matching[0]?.href,
          allLowPriority:illustrations.every(img=>img.fetchPriority==='low'),
          allLazy:illustrations.filter(img=>!img.hasAttribute('hidden')).every(img=>img.loading==='lazy'),
          artContain:canvases.every(node=>getComputedStyle(node).contentVisibility==='auto'),
          mobile
        };
      });
      assert.equal(pageData.chapters,5,tag+' chapter count');
      assert.equal(pageData.heading,1,tag+' one H1');
      assert.equal(pageData.overflow,false,tag+' no overflow');
      assert.ok(pageData.imageNatural.every(x=>x>0),tag+' hero decoded');
      assert.equal(pageData.heroPriority,'high',tag+' critical art priority');
      assert.equal(pageData.keeperPriority,'high',tag+' canonical guide priority');
      assert.equal(pageData.preloads,2,tag+' two disjoint responsive preloads');
      assert.equal(pageData.matching,1,tag+' exactly one matching responsive preload');
      assert.equal(pageData.preloadHref,pageData.imageSource,tag+' preload reused by responsive <picture>');
      assert.equal(pageData.imageSource.includes(pageData.mobile?'entrance-mobile':'entrance-desktop'),true,tag+' correct visual source');
      assert.equal(pageData.allLowPriority,true,tag+' only below-the-fold images low priority');
      assert.equal(pageData.allLazy,true,tag+' below-the-fold images lazy');
      assert.equal(pageData.artContain,true,tag+' offscreen scene render containment');
      await page.waitForTimeout(700);
      const performanceData=await page.evaluate(()=>{
        const timing=performance.getEntriesByType('navigation')[0];
        const res=performance.getEntriesByType('resource');
        const local=res.filter(x=>x.name.startsWith(location.origin));
        return {
          lcp:Math.round(window.__forestLCP),
          cls:Math.round(window.__forestCLS*1000)/1000,
          domContentLoaded:Math.round(timing.domContentLoadedEventEnd),
          localResources:local.length,
          localTransferBytes:Math.round(local.reduce((sum,r)=>sum+r.transferSize,0)),
          localImageBytes:Math.round(local.filter(x=>x.initiatorType==='img'||/\.(webp|svg)(\?|$)/.test(x.name)).reduce((sum,r)=>sum+r.transferSize,0)),
          imageNames:local.filter(x=>/\.(webp|svg)(\?|$)/.test(x.name)).map(x=>x.name.split('/').slice(-1)[0]),
          navTransfer:Math.round(timing.transferSize)
        };
      });
      // This generous ceiling guards catastrophic eager loads; LCP/CLS numbers are
      // diagnostics only, not fabricated field Core Web Vitals.
      assert.ok(performanceData.localTransferBytes<=2500000,tag+' unexpectedly high first-view transfer '+performanceData.localTransferBytes);
      assert.ok(performanceData.cls<0.3,tag+' unexpected layout shift '+performanceData.cls);
      assert.deepEqual(issues,[],tag+' console/runtime and HTTP errors');
      console.log('STAGE16 '+tag+' '+JSON.stringify(performanceData));
      passes++;
    }finally{await ctx.close();}
  }

  for(const route of routes){
    const ctx=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
    const page=await ctx.newPage();
    try{
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('section[data-chapter]').count(),5,route+' no JS five chapters');
      assert.equal(await page.locator('#house-brief').isVisible(),true,route+' local note available');
      assert.equal(await page.locator('.portrait-native-art--river-stories').isVisible(),true,route+' portrait art present');
      assert.equal(await page.locator('.entrance-backdrop').isVisible(),true,route+' static hero');
      console.log('STAGE16 NO-JS PASS '+route);
    }finally{await ctx.close();}
  }
  console.log('STAGE 16 FINISHED: '+passes+' route/viewport passes, two no-JS passes. NO SCREENSHOTS.');
}finally{await browser.close();}
