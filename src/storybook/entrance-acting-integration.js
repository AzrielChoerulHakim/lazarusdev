import {createEntranceActing} from './entrance-acting.js';
const atlas = document.querySelector('#field-atlas');
document.querySelector('.hero-atlas-cue')?.addEventListener('click', () => {
  if (atlas) atlas.open = true;
});

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
