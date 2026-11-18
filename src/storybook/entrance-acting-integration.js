/** R12: the atlas Paperkeeper acts on arrival, not only after a click.
 * Native atlas navigation remains fully functional. No motion switch.
 */
import {createEntranceActing} from './entrance-acting.js';
const atlas=document.querySelector('details#field-atlas[data-field-atlas]');
const cue=document.querySelector('#entrance .hero-atlas-cue');
const keeper=atlas?.querySelector('.field-atlas-paperkeeper');
if(atlas&&keeper){
  const acting=createEntranceActing(keeper);
  let entered=false;
  const playOnce=()=>{
    if(entered||document.hidden)return;
    entered=true;
    void acting.play();
  };
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){
        observer.disconnect();
        playOnce();
      }
    },{threshold:.25});
    observer.observe(keeper);
  }else addEventListener('load',playOnce,{once:true});
  // Atlas remains native. A repeated deliberate opening can acknowledge.
  cue?.addEventListener('click',()=>{if(!atlas.open)atlas.open=true;});
  atlas.addEventListener('toggle',()=>{if(atlas.open&&entered)void acting.play();});
}

// The invitation starts at the painted gate itself. The atlas repeats the
// gesture on its own page, using the same registered lantern drawings.
const gateGuide = document.querySelector('.entrance-paperkeeper');
if (gateGuide && 'IntersectionObserver' in window) {
  const gateActing = createEntranceActing(gateGuide);
  const arrival = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      arrival.disconnect();
      void gateActing.play();
    }
  }, {threshold: .45});
  arrival.observe(gateGuide);
}
