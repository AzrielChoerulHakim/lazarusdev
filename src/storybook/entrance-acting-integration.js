/** R10 — The atlas character is an actor the reader can actually see. */
import { createEntranceActing } from './entrance-acting.js';

const atlas=document.querySelector('details#field-atlas[data-field-atlas]');
const cue=document.querySelector('#entrance .hero-atlas-cue');
const keeper=atlas?.querySelector('.field-atlas-paperkeeper');

if(atlas&&keeper){
  const acting=createEntranceActing(keeper);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let loaded=document.readyState==='complete',warmed=false,requested=false,queued=false;
  const inView=()=>{
    const r=keeper.getBoundingClientRect();
    return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
  };
  const warm=()=>{
    if(warmed||!loaded||document.hidden||reduced.matches||!inView())return;
    warmed=true;
    void acting.prepare();
  };
  const schedule=()=>{
    if(queued||!requested||!atlas.open||document.hidden)return;
    queued=true;
    // First let native fragment navigation place the open fold on screen.
    // R03's own IntersectionObserver has a chance to update its visibility.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      queued=false;
      if(!requested||!atlas.open||!inView())return;
      requested=false;
      void acting.play();
    }));
  };
  const request=()=>{if(!atlas.open)return;requested=true;schedule();};
  // Keep the real anchor and its native hash navigation. The first cue click
  // opens the genuine atlas and animates the companion beside its summary.
  cue?.addEventListener('click',()=>{if(!atlas.open)atlas.open=true;request();});
  atlas.addEventListener('toggle',()=>{if(atlas.open)request();else requested=false;});
  const near=window.IntersectionObserver?new IntersectionObserver(([entry])=>{
    if(entry?.isIntersecting){warm();schedule();}
  },{rootMargin:'160px 0px'}):null;
  near?.observe(keeper);
  if(!loaded)addEventListener('load',()=>{loaded=true;warm();},{once:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){warm();schedule();}});
  addEventListener('scroll',()=>{warm();schedule();},{passive:true});
  addEventListener('resize',schedule,{passive:true});
}
