/** Stage 17 — atlas + honest studio specimen. Text-only browser audit. NO SCREENSHOTS. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const profiles=[{w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},{w:670,h:850},{w:768,h:860},{w:1024,h:768},{w:1440,h:900},{w:844,h:390}];
const ids=['entrance','winding-path','work-clearing','river-stories','house-on-the-hill'];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let checks=0;
try {
  for(const route of routes)for(const viewport of profiles){
    const context=await browser.newContext({viewport:{width:viewport.w,height:viewport.h}});
    const page=await context.newPage();
    const errors=[];const unexpectedWrites=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400) errors.push(r.status()+' '+r.url());});
    page.on('request',r=>{if(!['GET','HEAD'].includes(r.method())) unexpectedWrites.push(r.method()+' '+r.url());});
    const tag=route+' '+viewport.w+'x'+viewport.h;
    try{
      const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
      assert.equal(response?.status(),200,tag+' HTTP');
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true',{timeout:12000});
      let state=await page.evaluate(()=>{
        const atlas=document.querySelector('[data-field-atlas]');
        const specimen=document.querySelector('.work-specimen');
        const summary=atlas.querySelector('summary');
        const box=summary.getBoundingClientRect();
        return {
          chapters:[...document.querySelectorAll('section[data-chapter]')].map(x=>x.id),
          h1:document.querySelectorAll('h1').length,
          atlasCount:document.querySelectorAll('[data-field-atlas]').length,
          atlasOpen:atlas.open,
          index:[...document.querySelectorAll('.field-atlas-index nav a')].map(x=>x.getAttribute('href').slice(1)),
          specimenCount:document.querySelectorAll('.work-specimen').length,
          specimenHeading:specimen.querySelector('h3')?.textContent,
          specimenObservations:specimen.querySelectorAll('ol > li').length,
          honest:specimen.textContent.toLowerCase().includes('not a client commission')&&specimen.textContent.includes('No invented client'),
          summarySize:[box.width,box.height],
          overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
          injectedScripts:[...document.scripts].filter(x=>x.src.includes('editorial-reconstruction')).length,
        };
      });
      assert.deepEqual(state.chapters,ids,tag+' chapter order intact');
      assert.equal(state.h1,1,tag+' one H1');
      assert.equal(state.atlasCount,1,tag+' one atlas');
      assert.equal(state.atlasOpen,false,tag+' native folded state');
      assert.deepEqual(state.index,ids,tag+' real destinations');
      assert.equal(state.specimenCount,1,tag+' real specimen');
      assert.equal(state.specimenObservations,3,tag+' editorial observations');
      assert.match(state.specimenHeading,/forest is.*part of the work/s,tag+' actual case heading');
      assert.ok(state.honest,tag+' no fake client claim');
      assert.equal(state.overflow,false,tag+' no horizontal overflow');
      assert.ok(state.summarySize.every(x=>x>=48),tag+' atlas control target');
      assert.equal(state.injectedScripts,0,tag+' no extra JS needed');

      const cue=page.locator('.hero-atlas-cue');
      assert.equal(await cue.getAttribute('href'),'#field-atlas',tag+' first-screen atlas invitation');
      const cueSize=await cue.evaluate(x=>{const rect=x.getBoundingClientRect();return [rect.width,rect.height]});
      assert.ok(cueSize.every(v=>v>=44),tag+' hero atlas cue touch target');
      await cue.click();
      assert.equal(new URL(page.url()).hash,'#field-atlas',tag+' teaser leads to atlas');
      const summary=page.locator('[data-field-atlas] summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),true,tag+' Enter opens atlas');
      assert.equal(await page.locator('.field-atlas-spread').isVisible(),true,tag+' open spread visible');
      assert.equal(await page.locator('.field-atlas-cartography svg').count(),1,tag+' original annotated map');
      const atlasLink=page.locator('.field-atlas-index a[href="#river-stories"]');
      const linkSize=await atlasLink.evaluate(x=>{const b=x.getBoundingClientRect();return [b.width,b.height];});
      assert.ok(linkSize.every(x=>x>=44),tag+' atlas link target');
      await atlasLink.click();
      assert.equal(new URL(page.url()).hash,'#river-stories',tag+' native fragment works');
      const specimenLink=page.locator('.work-specimen-observations a[href="#winding-path"]');
      const specimenLinkSize=await specimenLink.evaluate(x=>{const b=x.getBoundingClientRect();return [b.width,b.height];});
      assert.ok(specimenLinkSize[1]>=44,tag+' specimen link touch target');
      await specimenLink.click();
      assert.equal(new URL(page.url()).hash,'#winding-path',tag+' specimen link works');
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await page.locator('.field-atlas-spread').evaluate(x=>getComputedStyle(x).animationName),'none',tag+' reduced-motion atlas');
      assert.equal(await page.locator('.field-atlas-trail').evaluate(x=>getComputedStyle(x).animationName),'none',tag+' reduced-motion ink');
      const spreadBounds=await page.evaluate(()=>{
        const a=document.querySelector('.field-atlas').getBoundingClientRect();
        const tail=document.querySelector('#entrance .chapter-tail').getBoundingClientRect();
        const backdrop=document.querySelector('.entrance-canvas').getBoundingClientRect();
        const hero=document.querySelector('#entrance .hero-layout').getBoundingClientRect();
        return {atlasBottom:a.bottom,tailTop:tail.top,backdropHeight:backdrop.height,heroTop:hero.top,heroBottom:hero.bottom};
      });
      assert.ok(spreadBounds.tailTop>=spreadBounds.atlasBottom-2,tag+' tail must not overlap unfolded atlas');
      assert.ok(spreadBounds.backdropHeight>=700&&spreadBounds.backdropHeight<=1111,tag+' hero painting must not stretch with the opened atlas');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false,tag+' no overflow when unfolded');
      assert.deepEqual(errors,[],tag+' browser errors');
      assert.deepEqual(unexpectedWrites,[],tag+' no outbound data writes');
      console.log('PASS STAGE17 '+tag+' index, map, physical spread, specimen, keyboard, reduced-motion');
      checks++;
    }finally{await context.close();}
  }
  for(const route of routes){
    const context=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
    const page=await context.newPage();
    try{
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('[data-field-atlas]').evaluate(x=>x.open),false,route+' no-JS atlas closed');
      await page.locator('[data-field-atlas] summary').click();
      assert.equal(await page.locator('.field-atlas-index nav a').count(),5,route+' no-JS native links');
      assert.equal(await page.locator('.work-specimen').isVisible(),true,route+' no-JS specimen readable');
      await page.locator('.field-atlas-index a[href="#work-clearing"]').click();
      assert.equal(new URL(page.url()).hash,'#work-clearing',route+' no-JS nav works');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false,route+' no-JS no overflow');
      console.log('PASS STAGE17 NO-JS '+route);
    }finally{await context.close();}
  }
  console.log('STAGE17 COMPLETE: '+checks+' viewport/route checks, two no-JS checks; zero screenshots.');
}finally{await browser.close();}
