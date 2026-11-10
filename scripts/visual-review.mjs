import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'],
});
const dir = 'docs/qa';
await mkdir(dir,{recursive:true});
try {
  const scenes = [
    { name:'hero-desktop', width:1440,height:900, section:'origin', extra:0 },
    { name:'passage-desktop', width:1440,height:900, section:'passage', extra:.35 },
    { name:'worlds-desktop', width:1440,height:900, section:'worlds', extra:.03 },
    { name:'hero-mobile', width:390,height:844, section:'origin', extra:0 },
    { name:'passage-mobile', width:390,height:844, section:'passage', extra:.2 },
  ];
  for (const item of scenes) {
    const page=await browser.newPage({viewport:{width:item.width,height:item.height}, deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.sceneAsset==='scanned',null,{timeout:30000});
    await page.evaluate(({section,extra})=>{
      const el=document.getElementById(section);
      scrollTo({top: el.offsetTop + innerHeight*extra, behavior:'instant'});
    },item);
    await page.waitForFunction(() => document.documentElement.dataset.webgl === 'ready',null,{timeout:15000});
    await page.waitForTimeout(item.width > 800 ? 3800 : 1700);
    if(errors.length)throw Error(item.name+': '+errors.join('; '));
    await page.screenshot({path:`${dir}/${item.name}.jpg`,type:'jpeg',quality:72,animations:'disabled'});
    console.log(item.name+' captured with CC0 PBR mesh');
    await page.close();
  }
}finally{await browser.close();}
