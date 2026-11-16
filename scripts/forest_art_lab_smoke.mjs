import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Stage 04: WebP/alpha test, NOT a human art score. Never take screenshots or recordings.
const origin=process.env.FOREST_LAB_ORIGIN || 'http://127.0.0.1:4186';
const url=origin+'/lazarusdev/storybook/art-lab/';
const browser=await chromium.launch({...(process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
try{
  for(const profile of [
    {id:'desktop',width:1440,height:900},
    {id:'mobile',width:390,height:844},
    {id:'narrow',width:320,height:700},
  ]){
    const page=await browser.newPage({viewport:{width:profile.width,height:profile.height}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',response=>{
      if(response.url().startsWith(origin) && response.status()>=400)
        errors.push(response.status()+': '+response.url());
    });
    const response=await page.goto(url,{waitUntil:'networkidle',timeout:30000});
    assert.equal(response?.status(),200);
    const result=await page.evaluate(async ()=>{
      const image=document.querySelector('.layer-canopy img');
      const cutout=document.querySelector('#wayfinder img');
      await Promise.all([image.decode(),cutout.decode()]);
      const c=document.createElement('canvas');
      c.width=c.height=1;
      const ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(cutout,0,0);
      const button=document.querySelector('#wayfinder');
      const box=button.getBoundingClientRect();
      return {
        ready:document.body.dataset.assetLabReady,
        imgsLoaded: image.naturalWidth>0 && cutout.naturalWidth>0,
        mobileAsset:image.currentSrc.includes('forest-canopy.mobile.webp'),
        cutoutTransparent:ctx.getImageData(0,0,1,1).data[3]===0,
        cutoutTapTarget:[box.width,box.height],
        overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
        oneHeading:document.querySelectorAll('h1').length===1,
      };
    });
    assert.deepEqual(errors,[],'Errors for '+profile.id+': '+errors.join('; '));
    assert.equal(result.ready,'true');
    assert.equal(result.imgsLoaded,true);
    assert.equal(result.mobileAsset,profile.width<=700);
    assert.equal(result.cutoutTransparent,true);
    assert.ok(result.cutoutTapTarget[0]>=44 && result.cutoutTapTarget[1]>=44);
    assert.equal(result.overflow,false,'Horizontal overflow for '+profile.id);
    assert.equal(result.oneHeading,true);
    const button=page.locator('#wayfinder');
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.ok((await page.locator('#wayfinder-readout').textContent()).includes('Selected.'));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>scrollTo(0,400));
    const transform=await page.locator('.layer-canopy').evaluate(n=>getComputedStyle(n).transform);
    assert.equal(transform,'none','Reduced motion should disable parallax');
    console.log('STAGE04 LAB '+profile.id+' PASS',JSON.stringify(result));
    await page.close();
  }
}finally{await browser.close();}
