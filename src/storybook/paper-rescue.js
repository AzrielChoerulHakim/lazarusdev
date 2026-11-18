/** A single small act of care. It plays through after touch, never arrests scroll.
 * An intentional revisit above the river prepares it to play again.
 * Static props tell the same story when scripting or motion is unavailable.
 */
const river = document.querySelector('#river-stories .river-scene');
const house = document.querySelector('#house-on-the-hill .house-scene');
if (river && house) {
  const walker = river.querySelector('[data-walk="river"]');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let completed = false;
  let timer = 0;
  const moments = [];
  const stagePose = { watch:'look-down', lantern:'set-lantern', reach:'reach', lift:'lift', carrying:'carry', still:'carry' };
  const poses = ['step-a','step-b','step-c','stand','turn','look','reach','read','lantern'];
  function setScene(phase) {
    river.dataset.rescue = phase;
    const pose = stagePose[phase];
    if (walker && pose) {
      walker.dataset.pose = pose;
      if (poses.includes(pose)) walker.style.backgroundPositionX = String(poses.indexOf(pose) * 12.5) + '%';
      else walker.style.removeProperty('background-position-x');
    }
  }
  function stopTimers() {
    clearTimeout(timer);
    while (moments.length) clearTimeout(moments.pop());
  }
  function runAct() {
    if (started || completed || calm.matches) return;
    started = true;
    setScene('watch');
    moments.push(setTimeout(() => setScene('lantern'), 260));
    moments.push(setTimeout(() => setScene('reach'), 550));
    moments.push(setTimeout(() => setScene('lift'), 1120));
    moments.push(setTimeout(() => {
      setScene('carrying');
      completed = true;
      started = false;
    }, 1940));
  }
  function atRiver() {
    if (calm.matches) { stopTimers(); started = false; setScene('still'); return; }
    const r = river.getBoundingClientRect();
    // Below: don't replay or stop a genuine gesture that already began.
    if (r.bottom < 0) return;
    // Fully returned above the illustrated river: a deliberate revisit resets it.
    if (r.top > innerHeight * 1.05) {
      if (completed) { completed = false; started = false; stopTimers(); river.dataset.rescue = 'idle'; }
      return;
    }
    const exposed = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(0, r.top));
    const fraction = exposed / Math.min(Math.max(r.height,1), Math.max(innerHeight,1));
    if (fraction >= .45 && !completed && !started && !timer) {
      timer = setTimeout(() => {
        timer = 0;
        const now = river.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(now.bottom, innerHeight) - Math.max(0,now.top));
        if (overlap / Math.min(Math.max(now.height,1),Math.max(innerHeight,1)) >= .35) runAct();
      }, 160);
    } else if (fraction < .25 && timer) { clearTimeout(timer); timer = 0; }
  }
  if (calm.matches) setScene('still'); else river.dataset.rescue = 'idle';
  let requested = false;
  function schedule() {
    if (requested) return;
    requested = true;
    requestAnimationFrame(() => { requested = false; atRiver(); });
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  calm.addEventListener('change', () => {
    stopTimers();
    started = false;
    if (calm.matches) setScene('still');
    else { completed = false; river.dataset.rescue = 'idle'; schedule(); }
  });
  schedule();
}
