import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4186/lazarusdev/';
mkdirSync('artifacts/commercial',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
try {
 for(const [width,height] of [[320,720],[390,844],[640,900],[768,1024],[844,390],[1024,768],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(origin);assert.equal(response.status(),200);
  await page.locator('#hero-title').waitFor();
  assert.equal(await page.locator('[data-addon]').count(),10);
  assert.equal(await page.locator('.steps li').count(),7);
  assert.equal(await page.locator('.terms details').count(),12);
  await page.locator('.hero-art img').evaluate(img=>img.decode());
  assert.ok(await page.locator('.hero-art img').evaluate(i=>i.naturalWidth>0));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
  const nav=page.locator('#site-nav'), toggle=page.locator('#menu-toggle');
  assert.equal(await page.locator('nav').count(),1);
  if(width<=950){
   assert.equal(await nav.isVisible(),false);
   await toggle.click();assert.equal(await nav.isVisible(),true);
   assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   await page.keyboard.press('Escape');assert.equal(await nav.isVisible(),false);
   await toggle.click();await nav.locator('a[href="#kontak"]').click();assert.equal(await nav.isVisible(),false);
   assert.ok(await page.evaluate(()=>location.hash==='#kontak'));
  }else{assert.equal(await nav.isVisible(),true);assert.equal(await toggle.isVisible(),false);}
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'artifacts/commercial/'+width+'-hero.png'});
  await page.locator('#addon-0').fill('2');
  await page.locator('#addon-1').fill('1');
  await page.locator('#addon-2').check();
  assert.match(await page.locator('#total').innerText(),/1[.]149[.]000/);
  assert.match(await page.locator('#dp').innerText(),/574[.]500/);
  await page.locator('.estimate [data-plan]').click();
  assert.match(await page.locator('#order-output').inputValue(),/Business \/ UMKM/);
  assert.match(await page.locator('#order-output').inputValue(),/1[.]149[.]000/);
  const contact=new URL(await page.locator('#whatsapp-order').getAttribute('href'));
  assert.equal(contact.origin,'https://wa.me');
  assert.equal(contact.pathname,'/6285111507037');
  assert.match(contact.searchParams.get('text'),/1[.]149[.]000/);
  assert.equal(await page.locator('.contact-directory a').count(),3);
  assert.equal(await page.locator('.contact-directory a').nth(1).getAttribute('href'),'https://www.instagram.com/lazarus_dev/');
  assert.equal(await page.locator('.contact-directory a').nth(2).getAttribute('href'),'https://www.tiktok.com/@lazarus.dev');
  await page.locator('[data-plan="Premium"]').click();
  assert.match(await page.locator('#order-output').inputValue(),/249[.]000/);
  assert.doesNotMatch(await page.locator('#order-output').inputValue(),/Katalog produk tambahan/);
  await page.locator('.estimate [data-plan]').click();
  assert.match(await page.locator('#order-output').inputValue(),/1[.]149[.]000/);
  await page.locator('#design-finder summary').click();
  await page.locator('#finder-purpose').selectOption('business');
  await page.locator('#finder-style').selectOption('object');
  assert.equal(await page.locator('[data-choose-design]').count(),2);
  await page.locator('[data-choose-design="object-gallery"]').click();
  assert.equal(await page.locator('#order-design').inputValue(),'object-gallery');
  assert.match(await page.locator('#order-output').inputValue(),/Object Gallery/);
  assert.match(await page.locator('#order-output').inputValue(),/1[.]149[.]000/);
  assert.match(new URL(await page.locator('#whatsapp-order').getAttribute('href')).searchParams.get('text'),/Object Gallery/);
  await page.locator('#order-plan').selectOption('Standard');
  assert.match(await page.locator('#order-output').inputValue(),/Object Gallery/);
  assert.doesNotMatch(await page.locator('#order-output').inputValue(),/Katalog produk tambahan/);
  await page.locator('#order-plan').selectOption('Business / UMKM');
  assert.match(await page.locator('#order-output').inputValue(),/1[.]149[.]000/);
  assert.equal(await page.locator('#edit-addons').isVisible(),true);
  await page.locator('#order-note').fill('catatan sementara');
  await page.locator('.design-preview[href="./desain/monograph.html"]').click();
  await page.locator('.choose').click();
  assert.equal(await page.locator('#order-plan').inputValue(),'Business / UMKM');
  assert.equal(await page.locator('#order-design').inputValue(),'monograph');
  assert.match(await page.locator('#order-output').inputValue(),/1[.]149[.]000/);
  assert.equal(await page.locator('#order-note').inputValue(),'');
  assert.ok(await page.evaluate(()=>!new URL(location.href).searchParams.has('design')));
  await page.locator('#kontak').scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/commercial/'+width+'-contact.png'});
  await page.locator('#ketentuan details').last().locator('summary').click();
  assert.equal(await page.locator('#ketentuan details').last().getAttribute('open'),'');
  await page.locator('#personal').scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/commercial/'+width+'-pricing.png'});
  assert.equal(await page.locator('svg').count(),0);
  for(const id of ['personal','desain','business','alur','ketentuan','kontak']){
   const section=page.locator('#'+id);
   await section.scrollIntoViewIfNeeded();
   assert.ok(await section.evaluate(el=>el.getBoundingClientRect().width<=innerWidth+1),'section width '+id);
   if(width===320||width===390)await section.screenshot({path:'artifacts/commercial/'+width+'-'+id+'.png'});
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto(origin);assert.equal(await nojs.locator('.steps li').count(),7);assert.equal(await nojs.locator('.terms details').count(),12);assert.equal(await nojs.locator('#site-nav').isVisible(),true);assert.equal(await nojs.locator('.contact-directory a').count(),3);assert.equal(await nojs.locator('#copy-order').isVisible(),false);assert.equal(await nojs.locator('#design-finder').isVisible(),false);assert.equal(await nojs.locator('#order-design').isVisible(),false);await nojs.close();
 const scroll=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
 const scrollErrors=[];scroll.on('pageerror',e=>scrollErrors.push(e.message));
 await scroll.goto(origin+'#alur');
 await scroll.waitForFunction(()=>document.querySelector('#site-nav [aria-current="location"]')?.hash==='#alur');
 assert.equal(await scroll.locator('#process-evidence').isVisible(),true);
 const visitStep=async index=>{
   await scroll.evaluate(i=>{const h=document.querySelector('.mast').getBoundingClientRect().height,line=h+(innerHeight-h)*.42,step=document.querySelectorAll('#alur .steps li')[i];window.scrollTo(0,scrollY+step.getBoundingClientRect().top-line+10)},index);
   await scroll.waitForFunction(i=>document.querySelectorAll('#alur .steps li')[i].dataset.active==='true',index);
   assert.equal(await scroll.locator('#process-count').innerText(),'Tahap '+(index+1)+' dari 7');
 };
 for(const i of [0,3,6,2,0]){await visitStep(i);await scroll.screenshot({path:'artifacts/commercial/scroll-stage-'+i+'.png'});}
 await scroll.locator('#site-nav a[href="#business"]').click();
 await scroll.waitForFunction(()=>document.querySelector('#site-nav [aria-current="location"]')?.hash==='#business');
 await scroll.locator('#site-nav a[href="#ketentuan"]').click();
 await scroll.waitForFunction(()=>document.querySelector('#site-nav [aria-current="location"]')?.hash==='#ketentuan');
 await scroll.goBack();
 await scroll.waitForFunction(()=>document.querySelector('#site-nav [aria-current="location"]')?.hash==='#business');
 await scroll.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await scroll.locator('#process-evidence').isVisible(),false);
 assert.equal(await scroll.locator('.mast').evaluate(el=>getComputedStyle(el).position),'static');
 await scroll.emulateMedia({reducedMotion:'no-preference'});
 await scroll.setViewportSize({width:390,height:844});
 assert.equal(await scroll.locator('#process-evidence').isVisible(),false);
 assert.equal(await scroll.locator('.steps li').count(),7);
 assert.deepEqual(scrollErrors,[]);
 await scroll.close();
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
 await touch.goto(origin+'#desain');await touch.locator('#design-finder summary').tap();await touch.locator('#finder-style').selectOption('film');assert.equal(await touch.locator('#keeper').getAttribute('src'),'./storybook/assets/characters/paperkeeper.read.webp');await touch.locator('#keeper').evaluate(i=>i.decode());await touch.locator('[data-choose-design="film-sequence"]').tap();assert.equal(await touch.locator('#order-design').inputValue(),'film-sequence');assert.equal(await touch.locator('#process-evidence').isVisible(),false);assert.ok(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await touch.locator('#alur .steps li').nth(3).evaluate(el=>window.scrollTo(0,scrollY+el.getBoundingClientRect().top-innerHeight*.42+5));await touch.waitForFunction(()=>document.querySelectorAll('#alur .steps li')[3].dataset.active==='true');await touch.screenshot({path:'artifacts/commercial/touch-journey.png'});await touch.close();
 const designs=["monograph","cartography","film-sequence","blueprint","public-index","object-gallery","material-journal"];
 for(const width of [320,390,1440]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(origin+'#desain');assert.equal(await p.locator('.design-preview').count(),7);
  for(const slug of designs){
   const tile=p.locator('.design-preview[href="./desain/'+slug+'.html"]');
   await tile.scrollIntoViewIfNeeded();await tile.locator('img').evaluate(img=>img.decode());
   assert.ok(await tile.locator('img').evaluate(img=>img.naturalWidth===959));
   const link=await tile.getAttribute('href');
   const response=await p.goto(new URL(link,origin).href);assert.equal(response.status(),200);
   assert.equal(await p.locator('main figure img').count(),1);
   await p.locator('main figure img').evaluate(img=>img.decode());
   assert.ok(await p.locator('main figure img').evaluate(img=>img.naturalWidth===959&&img.naturalHeight===600));
   assert.equal(await p.locator('svg, iframe, script').count(),0);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'preview overflow '+slug+' '+width);
   assert.equal(await p.locator('main figure img').getAttribute('src'),'./assets/'+slug+'.webp');
   await p.screenshot({path:'artifacts/commercial/preview-'+slug+'-'+width+'.png',fullPage:true});
   await p.locator('.preview-top a[href="../#desain"]').click();await p.locator('#desain').waitFor();
   await p.goto(new URL(link,origin).href);
   await p.locator('.choose').click();await p.locator('#order-design').waitFor();assert.equal(await p.locator('#order-design').inputValue(),slug);
   assert.equal(await p.locator('#pesan').count(),1);
   await p.goto(origin+'#desain');await p.locator('#desain').waitFor();
  }
  assert.deepEqual(errs,[]);await p.close();
 }
 // Typography robustness and complete evidence for the atelier release.
 const proof=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await proof.goto(origin);
 for(const [width,height] of [[320,720],[390,844],[640,900],[768,1024],[1024,768],[1440,900],[844,390]]){
  await proof.setViewportSize({width,height});
  await proof.evaluate(()=>window.scrollTo(0,0));
  await proof.screenshot({path:`artifacts/commercial/full-${width}.png`,fullPage:true});
 }
 for(const width of [320,390]){
  await proof.setViewportSize({width,height:844});
  for(const section of ['hero','desain','personal','business','alur','ketentuan','kontak'])await proof.locator('#'+section).screenshot({path:`artifacts/commercial/atelier-${width}-${section}.png`});
 }
 for(const [name,css] of [['text-200','html{font-size:200%}'],['spacing','*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}']]){
  await proof.setViewportSize({width:390,height:844});
  const style=await proof.addStyleTag({content:css});
  assert.ok(await proof.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' horizontal overflow');
  await proof.screenshot({path:`artifacts/commercial/${name}.png`,fullPage:true});
  await style.evaluate(el=>el.remove());
 }
 await proof.close();
 console.log('Commercial browser QA passed');
}finally{await browser.close();}
