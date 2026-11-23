/** One torn page, one narrative owner. The director supplies all scroll
 * progress; only a committed short act uses finite timers. */
const river=document.querySelector('#river-stories .river-scene');
const house=document.querySelector('#house-on-the-hill .house-scene');
if(river&&house){
 const walker=river.querySelector('[data-walk="river"]');
 const calm=matchMedia('(prefers-reduced-motion: reduce)');
 const pageId='forest-torn-page-01';
 const poses={watch:'look-down',lantern:'set-lantern',reach:'reach',lift:'lift',carrying:'carry',still:'carry'};
 let started=false,completed=false,delivered=false,armed=true;
 const moments=[];
 river.dataset.pageId=pageId;house.dataset.pageId=pageId;
 function stopTimers(){while(moments.length)clearTimeout(moments.pop());}
 function publish(phase){
  river.dataset.rescue=phase;
  const owner=delivered?'window':(completed||phase==='lift'||phase==='carrying'||phase==='still')?'keeper':'river';
  document.body.dataset.pageOwner=owner;
  house.dataset.pageOwner=owner;
  river.dataset.pageOwner=owner;
  if(walker&&poses[phase]){
   walker.dataset.pose=poses[phase];
   const ordinary=['step-a','step-b','step-c','stand','turn','look','reach','read','lantern'];
   if(ordinary.includes(poses[phase]))walker.style.backgroundPositionX=(ordinary.indexOf(poses[phase])*12.5)+'%';
   else walker.style.removeProperty('background-position-x');
  }
  dispatchEvent(new CustomEvent('lazarus:storychange',{detail:{pageId,phase,owner,completed,delivered}}));
 }
 function complete(){stopTimers();started=false;completed=true;armed=false;publish(calm.matches?'still':'carrying');}
 function start(){
  if(!armed||started||completed||calm.matches||document.hidden)return;
  started=true;armed=false;publish('watch');
  for(const [phase,delay] of [['lantern',260],['reach',550],['lift',1120]])
   moments.push(setTimeout(()=>publish(phase),delay));
  moments.push(setTimeout(complete,1940));
 }
 function reset(){stopTimers();started=false;completed=false;delivered=false;armed=true;publish('idle');}
 function onFrame(event){
  if(document.hidden)return;
  const s=event.detail, rect=river.getBoundingClientRect(),vh=innerHeight;
  const visible=rect.bottom>vh*.16&&rect.top<vh*.86;
  const wrapper=river.closest('.v3-river-scroll')||river;
  if(completed&&s.direction<0&&wrapper.getBoundingClientRect().top>vh*1.12){reset();return;}
  if(calm.matches){if(visible&&(s.progress.river??0)>=.45&&!completed)complete();}
  else if(visible&&(s.progress.river??0)>=.48&&!started&&armed)start();
  const h=house.getBoundingClientRect();
  // A direct chapter anchor or rapid leap never leaves the visitor at a
  // contradictory final caption with the canonical page still in the river.
  // Resolve skipped acts immediately, with no catch-up animations.
  if(!completed&&s.chapter==='house-on-the-hill'){
   stopTimers();started=false;completed=true;armed=false;delivered=true;
   publish(calm.matches?'still':'carrying');return;
  }
  if(completed&&!delivered&&h.top<vh*.78&&h.bottom>vh*.18){
   delivered=true;publish(calm.matches?'still':'carrying');
  }
 }
 function onHidden(){if(started)complete();else stopTimers();}
 calm.addEventListener('change',()=>{
  if(calm.matches){
   if(started)complete();
   else publish(completed?'still':'idle');
  }else publish(completed?'carrying':'idle');
 });
 addEventListener('lazarus:storyframe',onFrame);
 addEventListener('pagehide',onHidden);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)onHidden();});
 publish('idle');
}
