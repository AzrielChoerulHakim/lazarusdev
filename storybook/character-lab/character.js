/** Stage 05: static angle selector only. No motion, scene composition or user tracking. */
const paths={
  front:{filename:'paperkeeper.front.webp',label:'FRONT / the leaf-brim silhouette',alt:'Front view of the Paperkeeper, with an asymmetrical leaf hat, mossy leaf cloak, paper satchel and acorn lantern.'},
  'three-quarter':{filename:'paperkeeper.three-quarter.webp',label:'THREE-QUARTER / a little turn toward the path',alt:'Three-quarter view of the same Paperkeeper, showing the crooked leaf brim, layered green cloak, shoulder satchel and lantern.'},
  profile:{filename:'paperkeeper.profile.webp',label:'PROFILE / the path ahead',alt:'Side profile of the Paperkeeper, its long asymmetrical hat brim, layered leaves and lantern clearly visible.'},
  back:{filename:'paperkeeper.back.webp',label:'BACK / the layered cape and satchel strap',alt:'Rear view of the Paperkeeper revealing the leaf hat crown, layered moss cloak, twig legs, shoulder strap and lantern.'}
};
const buttons=[...document.querySelectorAll('button[data-angle]')];
const image=document.querySelector('#selected-pose');
const caption=document.querySelector('#selected-pose-label');
if(buttons.length!==4||!image||!caption)throw new Error('Character bible view controls unavailable.');
function selectView(key){
  const v=paths[key];if(!v)return;
  image.src='../assets/characters/'+v.filename;
  image.alt=v.alt;
  caption.textContent=v.label;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.angle===key));
  document.body.dataset.characterView=key;
}
buttons.forEach(btn=>btn.addEventListener('click',()=>selectView(btn.dataset.angle)));
selectView('front');
document.body.dataset.characterLabReady='true';