/** R12: automatically perform the original three-frame Paperkeeper step.
 * No visitor-facing motion toggle. Native still survives no-JS/failed assets.
 */
const reel=document.querySelector('[data-paperkeeper-walk]');
const status=document.getElementById('paperkeeper-step-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const images=reel?[reel,...document.querySelectorAll('[data-paperkeeper-pose]')]:[];
const sequence=[0,1,2,1,0,1,2,1,0,0];
let timer=0,played=false;
if(reel&&images.length===3){
  const urls=images.map(image=>new URL(image.getAttribute('src'),document.baseURI).href);
  const stop=()=>{
    if(timer)clearInterval(timer);
    timer=0;
    reel.src=urls[0];
    reel.dataset.motionState='settled';
  };
  const play=async()=>{
    if(played||reduced.matches||document.hidden)return;
    played=true;
    try{
      await Promise.all(urls.map(src=>new Promise((resolve,reject)=>{
        const img=new Image();img.onload=resolve;img.onerror=reject;img.src=src;
      })));
    }catch{
      reel.dataset.motionState='unavailable';
      if(status)status.textContent='Paperkeeper remains in its original drawing.';
      return;
    }
    if(reduced.matches||document.hidden)return;
    let i=0;
    reel.dataset.motionState='playing';
    if(status)status.textContent='Paperkeeper is taking a short illustrated step.';
    timer=setInterval(()=>{
      reel.src=urls[sequence[i++]];
      if(i>=sequence.length){
        stop();
        if(status)status.textContent='Paperkeeper has completed the illustrated step.';
      }
    },100);
  };
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){observer.disconnect();void play();}
    },{threshold:.3});
    observer.observe(reel);
  }else addEventListener('load',()=>void play(),{once:true});
  reduced.addEventListener?.('change',()=>{if(reduced.matches)stop();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
}
