/** R11 — A physically drawn 720ms pencil route on explicit activation.
 * Passive native scrolling, no CSS character rig, no focus/scroll changes.
 */
const map=document.querySelector('[data-path-map]');
const toggle=document.querySelector('[data-path-trace-toggle]');
const readout=document.getElementById('path-trace-status');

if(map&&toggle&&readout){
  const paths=[...map.querySelectorAll('[data-path-stroke]')];
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let manual=false,frame=0,tween=0,displayed=0;
  for(const path of paths){
    const length=path.getTotalLength();
    path.dataset.length=String(length);
    path.style.strokeDasharray=length+' '+length;
    path.style.strokeDashoffset=String(length);
  }
  const scrollProgress=()=>{
    const rect=map.getBoundingClientRect();
    const fraction=(innerHeight*.86-rect.top)/(rect.height+innerHeight*.34);
    return Math.min(1,Math.max(0,fraction));
  };
  const target=()=>motion.matches||manual?1:scrollProgress();
  const paint=progress=>{
    displayed=Math.min(1,Math.max(0,progress));
    for(const path of paths)path.style.strokeDashoffset=String(Number(path.dataset.length)*(1-displayed));
    map.dataset.progress=String(Math.round(displayed*100));
  };
  const stop=()=>{
    if(tween)cancelAnimationFrame(tween);
    tween=0;
    map.dataset.tracePhase='settled';
  };
  const update=()=>{
    frame=0;
    if(!tween)paint(target());
  };
  const schedule=()=>{if(!frame&&!tween)frame=requestAnimationFrame(update);};
  const traceTo=goal=>{
    stop();
    if(motion.matches||document.hidden||Math.abs(goal-displayed)<.003){
      paint(goal);
      return;
    }
    const from=displayed,started=performance.now(),duration=720;
    map.dataset.tracePhase='drawing';
    const draw=now=>{
      const t=Math.min(1,(now-started)/duration);
      const ease=1-Math.pow(1-t,3);
      paint(from+(goal-from)*ease);
      if(t>=1){
        tween=0;
        map.dataset.tracePhase='settled';
        schedule();
      }else tween=requestAnimationFrame(draw);
    };
    tween=requestAnimationFrame(draw);
  };
  toggle.hidden=false;
  map.dataset.tracePhase='settled';
  toggle.addEventListener('click',()=>{
    manual=!manual;
    toggle.setAttribute('aria-pressed',String(manual));
    toggle.textContent=manual?'Return to natural tracing':'Reveal the whole route';
    readout.textContent=manual
      ?'A pencil traces the full route. The journey remains yours to navigate.'
      :'The route follows your natural scroll again. Every chapter link still works.';
    traceTo(target());
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  motion.addEventListener('change',()=>{
    stop();
    paint(target());
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){stop();paint(target());}
  });
  addEventListener('pagehide',stop,{once:true});
  schedule();
}
