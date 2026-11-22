/**
 * Lazarus V3 — one native-scroll scene director.
 * It NEVER changes scroll position, intercepts gestures, or replaces
 * semantic chapter content. Existing character acting and interactions
 * remain authoritative; V3 owns only camera, typography and scene rhythm.
 */
import { clamp01, progressWithin, phaseAt, stageProgress } from './narrative-math.js';

const root = document.documentElement;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 670px), (max-height: 650px)');
const chapters = [...document.querySelectorAll('main [data-chapter]')];
const chaptersExpected = ['entrance','winding-path','work-clearing','river-stories','house-on-the-hill'];
const storySentences={
 entrance:['A little light. A way in.','He lifts the lantern so the first step can be seen.','The path begins beyond the painted arch.','There is room for one more traveler.'],
 path:['Not every mark is a road.','The moth knows where the roots turn.','Every turn begins with a choice.','The clearing is near.'],
 clearing:['Three unfinished worlds hang among the trees.','Each sheet has its own small possibility.','Look closer; a door might be waiting.'],
 river:['The roundbird notices a page drifting at the bank.','He slows and sets his lantern down.','He reaches for what the current almost kept.','The page is safe enough to carry.'],
 house:['A square of light waits up the hill.','A page has found a place to dry.','The next page is yours to begin.']
};
if (chapters.length !== 5 || chapters.some((c,i) => c.id !== chaptersExpected[i])) {
  throw new Error('Lazarus V3 requires the intact five-chapter source.');
}

const wrap = (node, className) => {
  if (!node) return null;
  const holder = document.createElement('div');
  holder.className = className;
  node.parentNode.insertBefore(holder, node);
  holder.append(node);
  return holder;
};

const entrance = wrap(document.querySelector('#entrance .hero-layout'), 'v3-entrance-scroll');
const path = wrap(document.querySelector('#winding-path .path-map'), 'v3-path-scroll');
const river = wrap(document.querySelector('#river-stories .river-scene'), 'v3-river-scroll');
const actors = [
  { id:'entrance', chapter:chapters[0], host:entrance, stage:entrance?.querySelector('.entrance-stage'), cues:['THE INVITATION','THE LANTERN','THE THRESHOLD','THE CROSSING'], keys:[0,.24,.54,.82] },
  { id:'path', chapter:chapters[1], host:path, stage:path?.querySelector('.path-map-art'), cues:['THE FIRST MARK','FOLLOW THE LINE','A DIRECTION FORMS','THE NEXT TURN'], keys:[0,.25,.52,.82] },
  { id:'clearing', chapter:chapters[2], host:document.querySelector('.work-clearing-world'), stage:document.querySelector('.work-clearing-world'), cues:['THE CLEARING','WORLDS IN PROGRESS','COME CLOSER'], keys:[0,.43,.78] },
  { id:'river', chapter:chapters[3], host:river, stage:river?.querySelector('.river-scene'), cues:['THE RIVER','SOMETHING ADRIFT','THE ACT OF CARE','CARRY IT HOME'], keys:[0,.25,.52,.82] },
  { id:'house', chapter:chapters[4], host:document.querySelector('.house-scene'), stage:document.querySelector('.house-scene'), cues:['THE ARRIVAL','THE KEPT PAGE','LIGHT IN THE WINDOW'], keys:[0,.42,.76] }
];

const marker = document.createElement('div');
marker.className = 'v3-reading-marker';
marker.setAttribute('aria-hidden','true');
const markerText = document.createElement('span');
markerText.className = 'v3-reading-number';
markerText.textContent = '01 / 05';
const markerTrack = document.createElement('span');
markerTrack.className = 'v3-reading-track';
marker.append(markerText,markerTrack);
document.body.append(marker);

function addCue(actor) {
  if (!actor.stage) return;
  const label = document.createElement('div');
  label.className = 'v3-beat-note';
  label.setAttribute('aria-hidden','true');
  const number = document.createElement('span');
  number.className = 'v3-beat-index';
  number.textContent = 'FIELD ' + String(actors.indexOf(actor)+1).padStart(2,'0');
  const text = document.createElement('span');
  text.className = 'v3-beat-text';
  text.textContent = actor.cues[0];
  label.append(number,text);
  actor.stage.append(label);
  actor.label = text;
  actor.activeBeat = -1;
  const sentence=document.createElement('p');
  sentence.className='v3-story-sentence';
  sentence.textContent=storySentences[actor.id][0];
  const after=actor.id==='clearing'?actor.stage.closest('figure'):actor.host;
  after?.insertAdjacentElement('afterend',sentence);
  actor.sentence=sentence;
}
actors.forEach(addCue);
// The four original pencil seams are a continuous map: draw their actual
// authored SVG strokes as they enter the reading window, never a stock line.
const seams = [...document.querySelectorAll('.forest-seam')].map(node => ({
  node,
  strokes: [...node.querySelectorAll('.seam-trail')].filter(path => typeof path.getTotalLength === 'function')
    .map(path => ({path, length:path.getTotalLength()}))
}));
root.classList.add('v3-enhanced');
document.body.dataset.narrativeVersion = '3';

let pending = 0;
let currentIndex = -1;
let previousScroll = scrollY;

function setVar(node,name,value) {
  if (node) node.style.setProperty(name, value);
}

function render() {
  pending = 0;
  if (document.hidden) return;
  const vh = Math.max(1,innerHeight);
  const still = motion.matches;
  const small = compact.matches;
  const delta = scrollY - previousScroll;
  const direction = Math.abs(delta) < 1.5 ? 0 : Math.sign(delta);
  previousScroll = scrollY;
  const storyProgress = {};
  root.dataset.storyDirection = direction < 0 ? 'backward' : direction > 0 ? 'forward' : 'still';
  root.dataset.v3Motion = still ? 'reduced' : small ? 'compact' : 'full';
  const documentTravel = Math.max(1, document.documentElement.scrollHeight - vh);
  setVar(root,'--v3-page-progress', (scrollY/documentTravel).toFixed(4));
  let index = 0;
  for (let i=0;i<chapters.length;i++) {
    if (chapters[i].getBoundingClientRect().top < vh*.48) index=i;
  }
  if (currentIndex !== index) {
    currentIndex = index;
    markerText.textContent = String(index+1).padStart(2,'0') + ' / 05';
  }
  for (const seam of seams) {
    const rect=seam.node.getBoundingClientRect();
    if(rect.top>vh*1.7 || rect.bottom < -vh)continue;
    const progress=progressWithin(rect.top,rect.height,vh);
    for(const {path,length} of seam.strokes) {
      if(still) {
        path.style.removeProperty('stroke-dasharray');
        path.style.removeProperty('stroke-dashoffset');
      }else{
        path.style.strokeDasharray=String(length);
        path.style.strokeDashoffset=String(length*(1-progress));
      }
    }
  }
  for (const actor of actors) {
    if (!actor.host) continue;
    const rect=actor.host.getBoundingClientRect();
    if (rect.bottom < -vh || rect.top > vh*2) continue;
    // Pinned scenes traverse their actual extra scroll distance.
    const pinned = actor.id==='entrance'||actor.id==='path'||actor.id==='river';
    const progress = still ? 0.5 : stageProgress(rect.top,rect.height,vh,pinned && !small);
    storyProgress[actor.id] = progress;
    const p=progress.toFixed(4);
    setVar(actor.host,'--v3-progress',p);
    setVar(actor.chapter,'--v3-progress',p);
    const beat=phaseAt(progress,actor.keys);
    const phase=actor.id==='river'?actor.stage?.dataset.rescue:'';
    const rescueCues={
      watch:['SOMETHING ADRIFT',storySentences.river[0]],
      lantern:['THE LANTERN RESTS',storySentences.river[1]],
      reach:['THE ACT OF CARE',storySentences.river[2]],
      lift:['THE PAGE IS LIFTED','He lifts the torn page above the water.'],
      carrying:['CARRY IT HOME',storySentences.river[3]],
      still:['THE PAGE IS KEPT',storySentences.river[3]]
    };
    const override=rescueCues[phase];
    const cue=override?override[0]:actor.cues[beat];
    const sentence=override?override[1] :
      actor.id==='house' && document.body.dataset.pageOwner!=='window' && beat>=1
        ? 'The window waits for a page from the river.'
        : storySentences[actor.id][beat];
    if(beat!==actor.activeBeat||actor.label?.textContent!==cue){
      actor.activeBeat=beat;
      if(actor.label)actor.label.textContent=cue;
      actor.chapter.dataset.v3Beat=String(beat);
    }
    if(actor.sentence&&actor.sentence.textContent!==sentence)actor.sentence.textContent=sentence;
    if (still) continue;
    if(actor.id==='entrance'){
      setVar(actor.host,'--v3-camera-scale',(1+progress*.18).toFixed(4));
      setVar(actor.host,'--v3-camera-x',(-progress*24).toFixed(1)+'px');
      setVar(actor.host,'--v3-camera-y',(-progress*11).toFixed(1)+'px');
      setVar(actor.host,'--v3-keeper-x',(progress*13).toFixed(1)+'px');
      setVar(actor.host,'--v3-keeper-y',(-progress*17).toFixed(1)+'px');
      setVar(actor.host,'--v3-light-alpha',(.12+Math.sin(progress*Math.PI)*.34).toFixed(3));
      setVar(actor.host,'--v3-type-shift',(-progress*19).toFixed(1)+'px');
    }else if(actor.id==='path'){
      setVar(actor.host,'--v3-map-scale',(1+progress*.09).toFixed(4));
      setVar(actor.host,'--v3-map-y',(-progress*19).toFixed(1)+'px');
    }else if(actor.id==='clearing'){
      setVar(actor.chapter,'--v3-world-scale',(1+progress*.075).toFixed(4));
      setVar(actor.chapter,'--v3-world-x',((progress-.5)*12).toFixed(1)+'px');
    }else if(actor.id==='river'){
      setVar(actor.host,'--v3-river-pan',(-progress*25).toFixed(1)+'px');
      setVar(actor.host,'--v3-river-scale',(1+progress*.065).toFixed(4));
    }else if(actor.id==='house'){
      setVar(actor.chapter,'--v3-dusk',(.87+progress*.13).toFixed(4));
    }
  }
  // One authoritative snapshot; walking, camera and scene prose share a frame.
  dispatchEvent(new CustomEvent('lazarus:storyframe', {
    detail: { progress: storyProgress, direction, compact: small, reduced: still,
      chapter: chapters[index].id, pageOwner: document.body.dataset.pageOwner||'river' }
  }));
}

function schedule() {
  if (!pending) pending=requestAnimationFrame(render);
}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
addEventListener('orientationchange',schedule,{passive:true});
addEventListener('hashchange',schedule);
addEventListener('pageshow',schedule);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden)schedule(); });
motion.addEventListener('change',schedule);
compact.addEventListener('change',schedule);
addEventListener('lazarus:storychange',schedule);
addEventListener('pagehide',()=>{
  if(pending)cancelAnimationFrame(pending);
  pending=0;
  previousScroll=scrollY;
});
schedule();
