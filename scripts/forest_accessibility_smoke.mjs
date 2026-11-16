/** Stage 15 — WCAG browser audit. Strictly text logs; NEVER screenshots. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {resolve} from 'node:path';
const base=process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const sizes=[{w:320,h:720},{w:390,h:844},{w:768,h:860},{w:1440,h:900}];
const axePath=resolve('node_modules/axe-core/axe.min.js');
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let count=0,violations=0;
try {
  for(const route of routes)for(const profile of sizes){
    const ctx=await browser.newContext({viewport:{width:profile.w,height:profile.h},reducedMotion:'reduce'});
    const page=await ctx.newPage(),issues=[];
    const label=route+' '+profile.w+'x'+profile.h;
    page.on('pageerror',e=>issues.push(e.message));
    try {
      const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
      assert.equal(response.status(),200,label+' HTTP');
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true');
      await page.addScriptTag({path:axePath});
      const results=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}));
      for(const v of results.violations){
        violations++;
        console.log('AXE '+label+' '+v.id+' ('+v.impact+'): '+v.nodes.slice(0,5).map(x=>x.target.join(',')).join(' | '));
      }
      const structural=await page.evaluate(()=>{
        const main=document.querySelector('main');
        return {main:!!main,chapters:document.querySelectorAll('section[data-chapter]').length,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,labels:[...document.querySelectorAll('[data-house-save],[data-house-copy],.menu-toggle')].map(x=>({name:x.textContent.trim(),w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height}))};
      });
      assert.deepEqual(issues,[],label+' no JS errors');
      assert.ok(structural.main&&structural.h1===1&&structural.chapters===5,label+' landmarks');
      assert.equal(structural.overflow,false,label+' no horizontal overflow');
      await page.keyboard.press('Tab');
      const first=await page.evaluate(()=>({href:document.activeElement.getAttribute('href'),text:document.activeElement.textContent.trim()}));
      assert.equal(first.href,'#page-content',label+' skip link first keyboard stop');
      await page.keyboard.press('Enter');
      const anchor=await page.evaluate(()=>({hash:location.hash,focus:document.activeElement.id}));
      assert.equal(anchor.hash,'#page-content',label+' native skip link target');
      if(profile.w<=768){
        const toggle=page.locator('.menu-toggle');
        await toggle.focus();
        await page.keyboard.press('Enter');
        assert.equal(await toggle.getAttribute('aria-expanded'),'true',label+' open menu keyboard');
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'),'false',label+' Escape menu');
        assert.equal(await toggle.evaluate(e=>e===document.activeElement),true,label+' focus restored to menu');
      }
      console.log('AUDIT '+label+' axe='+results.violations.length+' '+results.incomplete.length+' manual-review items');
      count++;
    }finally{await ctx.close();}
  }
  for(const route of routes){
    const ctx=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
    const page=await ctx.newPage();
    try{
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('main').count(),1,route+' static main');
      assert.equal(await page.locator('#house-brief').isVisible(),true,route+' offline note');
      assert.equal(await page.locator('.site-nav a').first().isVisible(),true,route+' no-JS nav');
    }finally{await ctx.close();}
  }
  assert.equal(violations,0,'WCAG/axe violations found: '+violations);
  console.log('STAGE 15 PASS '+count+' route/viewport accessibility sweeps + 2 no-JS checks. No screenshots.');
}finally{await browser.close();}
