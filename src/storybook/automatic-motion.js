/** R12: motion is part of the narrative, not an opt-in feature.
 * Play finite, observable gestures as scenes enter view. No motion preference UI.
 * The OS reduced-motion accessibility preference is still respected.
 */
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const observed=[
  ['#entrance .entrance-stage','arrival',1050],
  ['#winding-path .path-map-art','route',720],
  ['#work-clearing .work-clearing-world','folio',650],
  ['#river-stories .river-scene','note',850],
  ['#house-on-the-hill [data-house-scene]','lantern',750]
];
const timers=new WeakMap();
const active=new Set();
function animate(el,name,duration){
  if(!el||document.hidden||reduced.matches)return;
  const previous=timers.get(el);
  if(previous)clearTimeout(previous);
  el.dataset.autoMotion=name;
  active.add(el);
  const timer=setTimeout(()=>{
    el.dataset.autoMotion='settled';
    active.delete(el);
    timers.delete(el);
  },duration);
  timers.set(el,timer);
}
function settle(){
  for(const el of active){
    clearTimeout(timers.get(el));
    el.dataset.autoMotion='settled';
    timers.delete(el);
  }
  active.clear();
}
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const el=entry.target;
      observer.unobserve(el);
      const found=observed.find(([selector])=>document.querySelector(selector)===el);
      if(found)animate(el,found[1],found[2]);
    }
  },{threshold:.18,rootMargin:'0px 0px -7% 0px'});
  for(const [selector] of observed){
    const el=document.querySelector(selector);
    if(el)observer.observe(el);
  }
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
reduced.addEventListener?.('change',()=>{if(reduced.matches)settle();});
