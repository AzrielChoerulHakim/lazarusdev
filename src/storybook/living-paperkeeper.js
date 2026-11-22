/**
 * The living Paperkeeper: ONE painted sprite above chapter clipping boundaries.
 * Visual only; reading, scrolling, links, input and Atrium retain native control.
 * The V3 director is the sole scroll frame source. If art fails to decode,
 * the original in-scene figures remain intact as a complete fallback.
 */
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const sheet = new URL('../../storybook/assets/characters/r15a/paperkeeper-journey-r15a.webp', import.meta.url).href;
const routes = {
  entrance: { element: '.entrance-stage', frames: [[36,10],[48,12],[60,15],[74,17],[89,18]], key: 'entrance' },
  'winding-path': { element: '.path-map-art', frames: [[14,9],[22,35],[36,42],[55,53],[74,79]], mobile: [[16,7],[28,21],[49,42],[66,57],[83,80]], key: 'path' },
  'work-clearing': { element: '.work-clearing-world', frames: [[9,4],[28,6],[47,5],[55,9]], key: 'clearing' },
  'river-stories': { element: '.river-scene', frames: [[47,5],[61,8],[70,12],[77,14]], key: 'river' },
  'house-on-the-hill': { element: '.house-scene-canvas', frames: [[12,4],[34,13],[45,20],[59,30],[73,40]], key: 'house' }
};
const source = document.createElement('img');
const guide = document.createElement('span');
guide.className = 'living-guide';
guide.setAttribute('aria-hidden','true');
guide.dataset.pose = 'stand';
const seamNodes = [...document.querySelectorAll('.forest-seam[data-seam-to]')];
const obstacles = [...document.querySelectorAll(
 'a,button,input,textarea,summary,h1,h2,h3,blockquote,.hero-copy,.work-hangings,.house-contact,'+
 '.section-counter,.section-name,.eyebrow,.lead,.forest-seam-origin,.v3-story-sentence'
)];
let ready = false;
let last = null, previousX = 0, previousY = 0, facing = 1, settle = 0, cueTimer = 0, cuePose = '';
let walkingDistance = 0;
const clamp = (v, a, b) => Math.max(a,Math.min(b,v));
function trailPoint(points, progress) {
  const distance = clamp(progress,0,1) * (points.length-1);
  const i = Math.min(points.length-2,Math.floor(distance));
  const t = distance-i;
  return [points[i][0] + (points[i+1][0]-points[i][0])*t,
          points[i][1] + (points[i+1][1]-points[i][1])*t];
}
function visibleBlockingRects() {
  // Read visible layout only ONCE per storyframe, then test candidate lanes
  // in memory. This avoids repeated forced layout at every fallback point.
  const active=[];
  for(const el of obstacles) {
    const rect=el.getBoundingClientRect();
    if(rect.bottom<0 || rect.top>innerHeight || rect.right<0 || rect.left>innerWidth)continue;
    active.push(rect);
  }
  return active;
}
function collision(x,foot,size,rects) {
  const w=size*128/144, left=x-w*.57, right=x+w*.57, top=foot-size*.93;
  return rects.some(rect=>
    left<rect.right+5 && right>rect.left-5 &&
    top<rect.bottom+5 && foot>rect.top-5);
}
function safePosition(x,y,size,chapter) {
  const width=innerWidth, height=innerHeight;
  const minX=Math.max(20,size*.48), maxX=width-minX;
  const base=[clamp(x,minX,maxX),clamp(y,size+12,height-16)];
  const rects=visibleBlockingRects();
  if (!collision(base[0],base[1],size,rects)) return base;
  const candidates=width<=670 ?
    [[width*.50,height*.84],[width*.12,height*.87],[width*.88,height*.87],
     [width*.50,height*.67],[width*.12,height*.68],[width*.88,height*.68]] :
    [[width*.50,height*.76],[width*.30,height*.76],[width*.70,height*.76],
     [width*.09,height*.82],[width*.91,height*.82],
     [width*.50,height*.62],[width*.30,height*.62],[width*.70,height*.62],
     [width*.09,height*.62],[width*.91,height*.62]];
  for(const [cx,cy] of candidates) {
    const test=[clamp(cx,minX,maxX),clamp(cy,size+12,height-16)];
    if (!collision(test[0],test[1],size,rects)) return test;
  }
  // Never cover a link, text block or keyboard focus just to keep an actor visible.
  return null;
}
function activeSeam() {
  const vh=innerHeight;
  return seamNodes.find(node=>{
    const rect=node.getBoundingClientRect();
    return rect.top<vh*.72 && rect.bottom>vh*.28;
  });
}
function phaseForChapter(chapter, snapshot) {
  const config=routes[chapter];
  const stage=config && document.querySelector(config.element);
  if(!stage)return null;
  const rect=stage.getBoundingClientRect();
  let progress=clamp(snapshot.progress[config.key] ?? 0,0,1);
  const inView=rect.bottom>innerHeight*.05 && rect.top<innerHeight*.92;
  if(chapter==='entrance' && progress<.65) return null;
  if(chapter==='entrance') progress=clamp((progress-.65)/.35,0,1);
  // On the river the coherent short act takes precedence over walking.
  const event=document.querySelector('#river-stories .river-scene')?.dataset.rescue;
  const action=chapter==='river-stories' && ['watch','lantern','reach','lift','carrying','still'].includes(event) ? event : '';
  const point=trailPoint(innerWidth<=670 && config.mobile ? config.mobile : config.frames,progress);
  let x=rect.left+rect.width*point[0]/100;
  let y=rect.bottom-rect.height*point[1]/100;
  if(!inView) {
    // Ordinary reading between paintings: park beside the paper rather than
    // chasing the off-screen painted coordinate through prose.
    x=innerWidth<720 ? innerWidth*.88 : innerWidth*.91;
    y=innerHeight*.84;
  }
  return {x,y,progress,action,kind:chapter};
}
function sceneForSeam(node) {
  const rect=node.getBoundingClientRect(),vh=innerHeight;
  const progress=clamp((vh*.84-rect.top)/(rect.height+vh*.22),0,1);
  // Bridge the preceding painted exit and the next physical entrance.
  const bridges={
    'winding-path':[[86,8],[66,10],[43,9],[19,11]],
    'work-clearing':[[76,8],[55,9],[34,8],[15,7]],
    'river-stories':[[56,9],[53,10],[50,8],[47,6]],
    'house-on-the-hill':[[77,12],[57,11],[36,10],[16,9]]
  };
  const point=trailPoint(bridges[node.dataset.seamTo]||[[82,8],[62,9],[40,9],[18,10]],progress);
  return {x:rect.left+rect.width*point[0]/100,
    y:rect.bottom-rect.height*point[1]/100,
    progress,kind:'seam',action:''};
}
function setPose(pose) {
  if(guide.dataset.pose===pose)return;
  guide.dataset.pose=pose;
  const frames=['step-a','step-b','step-c','stand','turn','look','reach','read','lantern'];
  if(frames.includes(pose)) guide.style.backgroundPositionX=(frames.indexOf(pose)*12.5)+'%';
}
function render(snapshot, settling=false) {
  if(!ready || reduced.matches || document.hidden)return;
  const seam=activeSeam();
  const target=seam ? sceneForSeam(seam) : phaseForChapter(snapshot.chapter,snapshot);
  root.dataset.livingScene=target?.kind||'resting';
  if(!target || document.getElementById('atrium-room')?.hidden===false) {
    guide.style.opacity='0';
    return;
  }
  const size=innerWidth<=670 ? 83 : clamp(innerWidth*.10,105,155);
  const place=safePosition(target.x,target.y,size,target.kind);
  if(!place){guide.style.opacity='0';return;}
  const [x,y]=place;
  const motion=Math.hypot(x-previousX,y-previousY);
  // Face the actual horizontal travel vector, including reversed scrolling.
  const horizontal=x-previousX;
  if(last && Math.abs(horizontal)>4 && Math.sign(horizontal)!==facing){
    facing=Math.sign(horizontal);
    guide.dataset.turn='true';
  }else guide.dataset.turn='false';
  const travel=last && target.kind===last.kind && motion>1;
  if(travel)walkingDistance+=motion;
  let pose='stand';
  if(snapshot.pageOwner==='keeper' && target.kind!=='river-stories'){
    pose='carry';
  }else if(target.kind==='river-stories'){
    pose=({watch:'look-down',lantern:'set-lantern',reach:'reach',lift:'lift',carrying:'carry',still:'carry'})[target.action] || 'look';
  }else if(cuePose)pose=cuePose;
  else if(travel&&!settling) {
    const steps=['step-a','step-b','step-c','step-b'];
    pose=steps[Math.floor(walkingDistance/(size*.17))%steps.length];
  }else if(target.kind==='house-on-the-hill')pose='read';
  else if(target.kind==='work-clearing')pose='look';
  else if(target.kind==='entrance')pose='lantern';
  if(guide.dataset.turn==='true' && !cuePose && !target.action)pose='turn';
  setPose(pose);
  guide.dataset.storyAction=target.action;
  guide.dataset.carrying= snapshot.pageOwner==='keeper' ? 'true' : 'false';
  guide.style.height=size+'px';
  guide.style.transform='translate3d('+x+'px,'+y+'px,0) scaleX('+facing+')';
  // Slow handoff across chapter seams, short settling on ordinary scroll.
  guide.style.transitionDuration=last&&target.kind!==last.kind?'320ms':'100ms';
  guide.style.opacity='1';
  root.dataset.guideOutside=target.kind;
  document.querySelector('.entrance-stage')?.classList.toggle('guide-departing',
    snapshot.chapter==='entrance' && (snapshot.progress.entrance??0)>.65);
  previousX=x;previousY=y;last=target;
}
function cue(pose,ms=750) {
  if(!ready || reduced.matches)return;
  clearTimeout(cueTimer);
  cuePose=pose;
  if(last)render(lastSnapshot,true);
  cueTimer=setTimeout(()=>{cuePose='';if(lastSnapshot)render(lastSnapshot,true);},ms);
}
let lastSnapshot=null;
function onFrame(event) {
  lastSnapshot=event.detail;
  render(lastSnapshot);
  clearTimeout(settle);
  settle=setTimeout(()=>render(lastSnapshot,true),150);
}
function stop() {clearTimeout(settle);clearTimeout(cueTimer);cuePose='';guide.style.opacity='0';}
addEventListener('lazarus:storyframe',onFrame);
addEventListener('lazarus:storychange',event=>{
  if(lastSnapshot){
    lastSnapshot={...lastSnapshot,pageOwner:event.detail.owner};
    render(lastSnapshot,true);
  }
});
addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(lastSnapshot)render(lastSnapshot,true);});
reduced.addEventListener('change',()=>{
  root.classList.toggle('living-guide-ready',ready&&!reduced.matches);
  if(reduced.matches)stop();else if(lastSnapshot)render(lastSnapshot,true);
});
document.querySelector('#field-atlas')?.addEventListener('toggle',e=>{if(e.target.open)cue('lantern',650);});
for(const folio of document.querySelectorAll('#work-clearing .work-folio'))folio.addEventListener('toggle',()=>{
  if(folio.open)cue('look',720);
});
for(const link of document.querySelectorAll('#work-clearing [data-open-concept]'))link.addEventListener('click',()=>cue('look',720));
document.querySelector('[data-house-light-toggle]')?.addEventListener('click',()=>cue('lantern',680));
document.querySelector('#house-brief')?.addEventListener('focus',()=>cue('read',700));
document.querySelector('[data-atrium-enter]')?.addEventListener('click',stop);
source.onload=async()=>{
  try {
    await source.decode();
    if(!source.naturalWidth || !source.naturalHeight) return;
    document.body.append(guide);
    ready=true;
    root.classList.toggle('living-guide-ready',!reduced.matches);
    if(lastSnapshot)render(lastSnapshot,true);
  }catch{/* A painted in-scene fallback remains visible. */}
};
source.src=sheet;
