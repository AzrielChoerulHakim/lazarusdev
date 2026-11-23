/** Browser checks for complete Stage 06 Entrance on both built Pages routes.
 * Automated assertions cover behavior/integrity, not editorial artistry.
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin=process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const profiles=[
  {id:'narrow-320',w:320,h:720},
  {id:'mobile-375',w:375,h:812},
  {id:'mobile-390',w:390,h:844},
  {id:'mobile-430',w:430,h:932},
  {id:'tablet-768',w:768,h:860},
  {id:'desktop-1024',w:1024,h:768},
  {id:'desktop-1440',w:1440,h:900},
  {id:'short-landscape',w:844,h:390},
];
// No screenshot capture; browser assertions remain active.
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passed=0;
try{
  for(const route of routes){
    for(const p of profiles){
      const page=await browser.newPage({viewport:{width:p.w,height:p.h},deviceScaleFactor:1});
      const errs=[];
      page.on('pageerror',e=>errs.push(e.message));
      page.on('response',r=>{
        if(r.url().startsWith(origin)&&r.status()>=400) errs.push('HTTP '+r.status()+' '+r.url());
      });
      const context=route+' '+p.id;
      try{
        const response=await page.goto(origin+route,{waitUntil:'networkidle',timeout:35000});
        assert.equal(response?.status(),200,context+' page HTTP');
        const audit=await page.evaluate(async()=>{
          const hero=document.querySelector('#entrance');
          const pic=hero.querySelector('picture .entrance-backdrop');
          const person=hero.querySelector('.entrance-paperkeeper');
          const cue=hero.querySelector('.hero-atlas-cue');
          // eagerly ensure decode despite later browser scrolling
          for(const img of [pic,person]){
            img.loading='eager';
            if(!img.complete)await new Promise((ok,fail)=>{img.addEventListener('load',ok,{once:true});img.addEventListener('error',fail,{once:true});});
            await img.decode();
          }
          const role=selector=>Boolean(document.querySelector(selector));
          const bounds=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
          return {
            ready:document.body.dataset.storybookReady,
            stage03:document.body.dataset.storybookStage,
            chapterCount:document.querySelectorAll('section[data-chapter]').length,
            h1:document.querySelectorAll('h1').length,
            imageSizes:[pic.naturalWidth,pic.naturalHeight,person.naturalWidth,person.naturalHeight],
            background:pic.currentSrc,
            person:person.currentSrc,
            atlasCue:Boolean(cue),
            heroText:hero.querySelector('h1').textContent,
            hasLiveCta:role('#entrance .button-primary[href="#work-clearing"]'),
            hasPath:role('#entrance .text-link[href="#winding-path"]'),
            hasAtlasCue:role('#entrance .hero-atlas-cue[href="#field-atlas"]'),
            noCanvas:!role('canvas'),
            noPlaceholder:!role('.art-reserve-entrance'),
            overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
            text:bounds('.hero-copy'),
            character:bounds('.entrance-paperkeeper'),
            cta:bounds('#entrance .button-primary'),
            cueBox:bounds('.hero-atlas-cue'),
            pictureHidden:pic.getAttribute('alt')==='' && pic.parentElement.getAttribute('aria-hidden')==='true',
            personAlt:person.getAttribute('alt')||'',
          };
        });
        assert.deepEqual(errs,[],context+' JS/network errors: '+errs.join('; '));
        assert.equal(audit.ready,'true',context);
        assert.equal(audit.stage03,'03',context+' baseline stage');
        assert.equal(audit.chapterCount,5,context);
        assert.equal(audit.h1,1,context);
        assert.ok(audit.imageSizes.every(x=>x>0),context+' decoded assets '+audit.imageSizes);
        assert.equal(audit.background.includes('entrance-mobile'),p.w<=670,context+' correct art-directed composition: '+audit.background);
        assert.ok(audit.person.includes('/assets/') && audit.person.includes('.webp'),context+' decoded production Paperkeeper image '+audit.person);
        assert.ok(audit.atlasCue,context+' native illustrated field-atlas invitation');
        assert.ok(audit.heroText.includes('Different worlds.'),context);
        assert.ok(audit.hasLiveCta&&audit.hasPath&&audit.hasAtlasCue,context+' CTA must be native anchors');
        assert.ok(audit.noCanvas&&audit.noPlaceholder,context+' old placeholder or canvas');
        assert.equal(audit.overflow,false,context+' horizontal overflow');
        assert.ok(audit.pictureHidden,context+' decorative image must be screen-reader hidden');
        assert.ok(audit.personAlt.includes('Paperkeeper'),context+' meaningful hero alt');
        assert.ok(audit.cta.height>=44&&audit.cta.width>=44,context+' CTA touch target');
        assert.ok(audit.cueBox.height>=44&&audit.cueBox.width>=44,context+' atlas touch target');
        // Character and text are two independent layers; their visible bounding
        // boxes may touch, but must not overlap significantly at any breakpoint.
        const overlapX=Math.max(0,Math.min(audit.text.right,audit.character.right)-Math.max(audit.text.x,audit.character.x));
        const overlapY=Math.max(0,Math.min(audit.text.bottom,audit.character.bottom)-Math.max(audit.text.y,audit.character.y));
        assert.ok(overlapX*overlapY<800,context+' Paperkeeper obstructs text ('+(overlapX*overlapY)+')');
        // User preference: no automatic screenshots, regardless of viewport.
        // Skip anchor is a real link, not a simulated scroll scene.
        const primary=page.locator('#entrance .button-primary');
        await primary.click();
        assert.equal(new URL(page.url()).hash,'#work-clearing',context+' Work navigation');
        await page.locator('.brand').click();
        await page.locator('#entrance .hero-atlas-cue').click();
        assert.equal(new URL(page.url()).hash,'#field-atlas',context+' atlas cue navigation');
        await page.emulateMedia({reducedMotion:'reduce'});
        const motion=await page.locator('.hero-atlas-cue').evaluate(n=>({animation:getComputedStyle(n).animationDuration,transition:getComputedStyle(n).transitionDuration}));
        assert.ok(parseFloat(motion.transition)<=.005,context+' atlas cue motion must stop on reduced motion');
        console.log('PASS STAGE06 '+context+' assets '+audit.imageSizes.join('x')+' no overflow');
        passed++;
      }finally{await page.close();}
    }
  }
  // Deliberately block all images: content and CTA must remain usable and accessible.
  const noImages=await browser.newPage({viewport:{width:390,height:844}});
  await noImages.route(/\.(webp|png|avif)(?:\?|$)/i,route=>route.abort());
  await noImages.goto(origin+'/lazarusdev/',{waitUntil:'domcontentloaded'});
  assert.equal(await noImages.locator('#entrance h1').count(),1);
  assert.ok(await noImages.locator('#entrance .button-primary').isVisible());
  await noImages.locator('#entrance .button-primary').click();
  assert.equal(new URL(noImages.url()).hash,'#work-clearing');
  await noImages.close();
  console.log('STAGE06 PASS with images blocked: live HTML and anchor CTA remain functional');
}finally{await browser.close();}
console.log('STAGE06 ENTRANCE QA PASS '+passed+' route / viewport checks');
