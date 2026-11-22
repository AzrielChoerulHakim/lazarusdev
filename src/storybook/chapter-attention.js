/**
 * R06 — Nonessential finite chapter gestures, never character-puppet transforms.
 * Native chapter controls own actions; this is only supporting pigment feedback.
 */
const still=window.matchMedia('(prefers-reduced-motion: reduce)');
const controllers=[];
function finite(scene,kind,ms=700){
  if(!scene)return;
  let id=0;
  const set=value=>{if(!scene.isConnected)return;scene.dataset.motionCue=value;};
  const cue=()=>{
    if(id)clearTimeout(id);
    if(still.matches){set('settled');return;}
    // A new gesture replaces the prior one; never queue or loop.
    set(kind);
    id=setTimeout(()=>{id=0;set('settled');},ms);
  };
  const stop=()=>{if(id)clearTimeout(id);id=0;set('settled');};
  const onPreference=()=>{if(still.matches)stop();};
  still.addEventListener('change',onPreference);
  window.addEventListener('pagehide',stop,{once:true});
  controllers.push({cue,stop});
  return cue;
}

const pathScene=document.querySelector('[data-path-map] .path-map-art');
const pathButton=document.querySelector('[data-path-trace-toggle]');
const trace=finite(pathScene,'route',700);
pathButton?.addEventListener('click',()=>{
  // R07 cue highlights the illustrated route, never changes the real button.
  trace?.();
});

const clearing=document.querySelector('#work-clearing .work-clearing-world');
const folioCue=finite(clearing,'folio',650);
const folios=[...document.querySelectorAll('#work-clearing details.work-folio')];
for(const folio of folios){
  folio.addEventListener('toggle',()=>{
    if(!folio.open)return;
    clearing.dataset.activeFolio=folio.id;
    folioCue?.();
  });
}
const sheets=[...document.querySelectorAll('#work-clearing [data-open-concept]')];
for(const link of sheets)link.addEventListener('click',()=>{
  clearing.dataset.activeFolio=link.hash.slice(1);
  folioCue?.();
});

const riverScene=document.querySelector('#river-stories .river-scene');
const noteCue=finite(riverScene,'note',850);
const riverFolds=[...document.querySelectorAll('#river-stories .river-note-fold')];
for(const fold of riverFolds)fold.addEventListener('toggle',()=>{
  if(!fold.open)return;
  riverScene.dataset.activeNote=fold.closest('.river-note')?.id||'';
  noteCue?.();
});

const houseScene=document.querySelector('[data-house-scene]');
const houseCue=finite(houseScene,'lantern',750);
document.querySelector('[data-house-light-toggle]')?.addEventListener('click',()=>houseCue?.());

document.addEventListener('visibilitychange',()=>{
  if(document.hidden)for(const item of controllers)item.stop();
});

/* Two companions, two small event cues. Neither starts a permanent loop. */
const moth=document.querySelector('.path-map-moth');
const bird=document.querySelector('.river-roundbird');
let guided=false;
addEventListener('lazarus:storyframe',event=>{
 if(still.matches||document.hidden)return;
 const p=event.detail.progress.path;
 if(p===undefined)return;
 if(p>.41&&p<.83&&!guided){guided=true;moth?.setAttribute('data-cue','turn');}
 if(p<.17&&guided){guided=false;moth?.removeAttribute('data-cue');}
});
addEventListener('lazarus:storychange',event=>{
 if(still.matches||document.hidden)return;
 const phase=event.detail.phase;
 if(['watch','lantern','reach'].includes(phase))bird?.setAttribute('data-cue','notice');
 else if(phase==='lift')bird?.setAttribute('data-cue','lift');
 else bird?.removeAttribute('data-cue');
});
addEventListener('pagehide',()=>{
 guided=false;moth?.removeAttribute('data-cue');bird?.removeAttribute('data-cue');
});

/* The printed Atlas Paperkeeper acknowledges an unfolding leaf in place.
   This stays meaningful while the roaming guide has not left the Entrance. */
const atlas=document.querySelector('#field-atlas');
const atlasCue=finite(atlas,'acknowledge',820);
atlas?.addEventListener('toggle',()=>{if(atlas.open)atlasCue?.();});
