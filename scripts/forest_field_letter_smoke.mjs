/** Stage 13 — real browser QA, both compiled routes, NO SCREENSHOTS. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const sizes=[{w:320,h:720},{w:375,h:812},{w:390,h:844},{w:430,h:932},{w:768,h:860},{w:1024,h:768},{w:1440,h:900},{w:844,h:390}];
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passed=0;
try {
  for (const route of routes) for (const {w,h} of sizes) {
    const ctx=await browser.newContext({viewport:{width:w,height:h},acceptDownloads:true});
    await ctx.addInitScript(()=>{
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__letterCopied=text;}}});
    });
    const page=await ctx.newPage();const errors=[];const transfers=[];
    page.on('pageerror',err=>errors.push(err.message));
    page.on('request',req=>{if(req.method()!=='GET')transfers.push(req.method()+' '+req.url());});
    page.on('response',resp=>{if(resp.url().startsWith(base)&&resp.status()>=400)errors.push('HTTP '+resp.status()+' '+resp.url());});
    const tag=route+' '+w+'x'+h;
    try {
      const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
      assert.equal(response.status(),200,tag+' status');
      const basics=await page.evaluate(()=>{
        const b=document.querySelector('[data-letter-builder]');
        const r=document.querySelector('[data-letter-review]');
        const c=document.querySelector('[data-house-copy]');
        const d=document.querySelector('[data-house-save]');
        const rect=x=>x.getBoundingClientRect();
        return {
          chapters:document.querySelectorAll('section[data-chapter]').length,
          h1:document.querySelectorAll('h1').length,
          overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
          builder:!b.hidden,review:!r.hidden,copy:!c.hidden,save:!d.hidden,
          size:[rect(c).width,rect(c).height,rect(d).width,rect(d).height],
          href:document.querySelector('.header-quick').getAttribute('href'),
          disclosure:document.querySelector('#house-copy-note').textContent,
          note:document.querySelector('.house-status').textContent
        };
      });
      assert.deepEqual(errors,[],tag+' initial errors');
      assert.equal(basics.chapters,5,tag+' five chapters');
      assert.equal(basics.h1,1,tag+' one H1');
      assert.equal(basics.overflow,false,tag+' no overflow');
      assert.ok(basics.builder&&basics.review&&basics.copy&&basics.save,tag+' controls active');
      assert.ok(basics.size.every(x=>x>=44),tag+' touch targets');
      assert.equal(basics.href,'#studio-inquiry',tag+' direct conversion anchor');
      assert.match(basics.disclosure,/Nothing is sent/,tag+' truthful disclosure');
      assert.match(basics.note,/NOT YET CONNECTED/,tag+' delivery disclosure');

      const copy=page.locator('[data-house-copy]');
      const save=page.locator('[data-house-save]');
      await copy.click();
      assert.match(await page.locator('#house-copy-status').textContent(),/Write a short note/,tag+' empty guard');
      await page.locator('.house-letter-path').nth(1).click();
      await page.locator('#house-letter-goal').fill('Help visitors discover new ideas');
      await page.locator('#house-letter-timing').selectOption('Within a few months');
      await page.locator('#house-brief').fill('An original woodland experience that never feels generic.');
      await page.locator('.house-letter-review summary').click();
      const preview=await page.locator('[data-letter-output]').textContent();
      for(const phrase of ['DIRECTION / An interactive experience','PURPOSE / Help visitors discover new ideas','TIMING / Within a few months','PROJECT NOTE','original woodland experience','Not submitted to Lazarus Dev']) assert.ok(preview.includes(phrase),tag+' review includes '+phrase);
      await copy.click();
      const copied=await page.evaluate(()=>window.__letterCopied||'');
      assert.equal(copied,preview,tag+' clipboard equals review');
      assert.match(await page.locator('#house-copy-status').textContent(),/Nothing has been sent/,tag+' honest copy status');

      const dlPromise=page.waitForEvent('download',{timeout:15000});
      await save.click();
      const dl=await dlPromise;
      assert.equal(dl.suggestedFilename(),'lazarus-project-brief.txt',tag+' download filename');
      const saved=await readFile(await dl.path(),'utf8');
      assert.equal(saved.trim(),preview.trim(),tag+' local download content equals review');
      assert.deepEqual(transfers,[],tag+' no POST/PUT/submit network traffic');
      assert.deepEqual(errors,[],tag+' zero runtime errors');

      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await page.locator('.house-letter-path-face').first().evaluate(x=>getComputedStyle(x).transitionDuration),'0s',tag+' reduced motion');
      const after=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
      assert.equal(after,false,tag+' no overflow after interactions');
      console.log('PASS STAGE13 '+tag);passed++;
    } finally {await ctx.close();}
  }

  for (const route of routes) {
    const context=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
    const page=await context.newPage();
    try {
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('[data-letter-builder]').isVisible(),false,route+' builder no-JS hidden');
      assert.equal(await page.locator('[data-letter-review]').isVisible(),false,route+' review no-JS hidden');
      assert.equal(await page.locator('[data-house-copy]').isVisible(),false,route+' copy no-JS hidden');
      assert.equal(await page.locator('[data-house-save]').isVisible(),false,route+' save no-JS hidden');
      assert.equal(await page.locator('#house-brief').isVisible(),true,route+' native textarea visible');
      await page.locator('#house-brief').fill('My offline handwritten note.');
      assert.equal(await page.locator('#house-brief').inputValue(),'My offline handwritten note.',route+' no-JS content kept');
      console.log('PASS NO-JS '+route);
    }finally{await context.close();}
  }
  console.log('STAGE 13 COMPLETE: '+passed+' viewport/route passes, two no-JS passes, no screenshots.');
}finally{await browser.close();}
