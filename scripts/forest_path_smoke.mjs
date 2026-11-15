/** Stage 07 browser QA. Validates real rendered geometry, not screenshot capture. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes = ['/lazarusdev/', '/lazarusdev/storybook/'];
const profiles = [
  {id:'320',w:320,h:720},{id:'375',w:375,h:812},
  {id:'390',w:390,h:844},{id:'430',w:430,h:932},
  {id:'768',w:768,h:860},{id:'1024',w:1024,h:768},
  {id:'1440',w:1440,h:900},{id:'short',w:844,h:390},
];
const browser = await chromium.launch({...(process.env.CI ? {channel:'chrome'} : {}),headless:true,args:['--no-sandbox']});
let pass=0;
try {
  for (const route of routes) for(const p of profiles) {
    const page=await browser.newPage({viewport:{width:p.w,height:p.h},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    const tag=`${route}${p.id}`;
    try {
      const response=await page.goto(origin+route,{waitUntil:'networkidle',timeout:35000});
      assert.equal(response?.status(),200,tag+' HTTP');
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
      const check=await page.evaluate(async()=>{
        const section=document.getElementById('winding-path');
        const map=section.querySelector('[data-path-map]');
        const img=section.querySelector('.path-map-backdrop');
        img.loading='eager';
        if (!img.complete) await new Promise((ok,fail)=>{img.addEventListener('load',ok,{once:true});img.addEventListener('error',fail,{once:true});});
        await img.decode();
        const rect=el=>{let x=el.getBoundingClientRect();return{x:x.x,y:x.y,right:x.right,bottom:x.bottom,w:x.width,h:x.height};};
        const b=section.querySelector('[data-path-trace-toggle]');
        const paper=section.querySelector('.path-map-paperkeeper');
        const moth=section.querySelector('.path-map-moth');
        for(const asset of [paper,moth]){asset.loading='eager';await asset.decode();}
        const art=rect(section.querySelector('.path-map-art'));
        return {
          chapters:document.querySelectorAll('section[data-chapter]').length,
          h1:document.querySelectorAll('h1').length,
          src:img.currentSrc,
          iw:img.naturalWidth,ih:img.naturalHeight,
          paper:paper.naturalWidth,moth:moth.naturalWidth,
          map:art,button:rect(b),buttonHidden:b.hidden,
          hint:rect(section.querySelector('#path-trace-status')),
          overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
          hasWork:!!section.querySelector('a[href="#work-clearing"]'),
          routeCount:section.querySelectorAll('svg.path-ink').length,
          textIntersect: (()=>{
            const t=rect(section.querySelector('.section-intro'));
            return Math.max(0,Math.min(t.right,art.right)-Math.max(t.x,art.x))*Math.max(0,Math.min(t.bottom,art.bottom)-Math.max(t.y,art.y));
          })(),
        };
      });
      assert.deepEqual(errors,[],tag+' errors '+errors.join(', '));
      assert.equal(check.chapters,5,tag+' chapters');
      assert.equal(check.h1,1,tag+' heading');
      assert.ok(check.iw>0&&check.ih>0&&check.paper>0&&check.moth>0,tag+' images');
      assert.equal(check.src.includes('winding-path-mobile'),p.w<=670,tag+' art-directed source');
      assert.equal(check.iw,p.w<=670?768:1536,tag+' asset width');
      assert.equal(check.ih,p.w<=670?1248:1024,tag+' asset height');
      assert.ok(!check.overflow,tag+' horizontal overflow');
      assert.ok(check.map.w>200&&check.map.h>280,tag+' art visible');
      assert.ok(check.button.w>=44&&check.button.h>=44&&!check.buttonHidden,tag+' path button');
      assert.ok(check.hasWork&&check.routeCount===2,tag+' chapter route preserved');
      assert.ok(check.textIntersect<2,tag+' illustration overlays heading');
      // Native scrolling is never locked: tracing is passive and optional.
      const style=await page.locator('body').evaluate(el=>getComputedStyle(el));
      assert.notEqual(style.overflow,'hidden',tag+' body scroll lock');
      const toggle=page.locator('#winding-path [data-path-trace-toggle]');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-pressed'),'true',tag+' trace toggle on');
      const offset=await page.locator('#winding-path svg.path-ink--desktop [data-path-stroke]').first().evaluate(el=>parseFloat(el.style.strokeDashoffset));
      assert.ok(Math.abs(offset)<0.01,tag+' drawn route');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-pressed'),'false',tag+' trace toggle off');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForTimeout(75);
      const reduced=await page.locator('#winding-path svg.path-ink--portrait [data-path-stroke]').first().evaluate(el=>parseFloat(el.style.strokeDashoffset));
      assert.ok(Math.abs(reduced)<.01,tag+' reduced motion static route');
      await page.locator('#winding-path .path-note a[href="#work-clearing"]').click();
      assert.equal(new URL(page.url()).hash,'#work-clearing',tag+' native CTA');
      console.log(`PASS STAGE07 ${tag} source=${check.iw}x${check.ih}, button=${check.button.w}x${check.button.h}, overflow=false`);
      pass++;
    } finally { await page.close(); }
  }
  // With images blocked, real text and native links remain functional.
  const noImg=await browser.newPage({viewport:{width:390,height:844}});
  await noImg.route(/\.(webp|png|avif)(?:\?|$)/i,r=>r.abort());
  await noImg.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
  assert.equal(await noImg.locator('#winding-path h2').count(),1);
  await noImg.locator('#winding-path .path-note a[href="#work-clearing"]').click();
  assert.equal(new URL(noImg.url()).hash,'#work-clearing');
  await noImg.close();
  console.log('STAGE07 no-image content and link fallback PASS');
} finally { await browser.close(); }
console.log(`STAGE07 QA PASS ${pass}/16 viewports/routes; screenshots disabled.`);