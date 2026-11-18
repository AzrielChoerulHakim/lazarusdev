/* The Atrium / enterable concept study. Works on both canonical and legacy routes. */
(() => {
  const note = document.querySelector('#folio-atrium .folio-body');
  const poster = document.querySelector('[data-open-concept="atrium"]');
  if (!note || !poster) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const enter = document.createElement('button');
  enter.type = 'button';
  enter.className = 'atrium-enter';
  enter.textContent = 'Enter The Atrium ↗';
  enter.setAttribute('aria-haspopup', 'dialog');
  note.append(enter);
  const overlay = document.createElement('div');
  overlay.className = 'atrium-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="atrium-experience" role="dialog" aria-modal="true" aria-labelledby="atrium-room-title" tabindex="-1">
      <header class="atrium-topline"><span>LAZARUS DEV / AN ENTERABLE STUDY</span><button class="atrium-back" type="button">← Back to the clearing</button></header>
      <div class="atrium-room">
        <div class="atrium-backwall" aria-hidden="true">
          <div class="atrium-relief"><span class="atrium-relief-ring"></span><span class="atrium-relief-flower">✳</span><span class="atrium-relief-inscription">WHAT LIGHT REMEMBERS</span></div>
        </div>
        <div class="atrium-pillar atrium-pillar--left" aria-hidden="true"></div>
        <div class="atrium-pillar atrium-pillar--right" aria-hidden="true"></div>
        <div class="atrium-shadow atrium-shadow--left" aria-hidden="true"></div>
        <div class="atrium-shadow atrium-shadow--right" aria-hidden="true"></div>
        <div class="atrium-beam" aria-hidden="true"></div>
        <div class="atrium-arch" aria-hidden="true"><span class="atrium-arch-inner"></span></div>
        <div class="atrium-floor" aria-hidden="true"></div>
        <div class="atrium-room-copy"><span>01 / THE ATRIUM</span><h2 id="atrium-room-title">A room made<br><em>of light.</em></h2></div>
      </div>
      <footer class="atrium-controls">
        <div class="atrium-instruction"><strong>Move the light.</strong><span>Watch the pillars cast their shadows and the wall reveal its story.</span></div>
        <label for="atrium-light">Light position <output id="atrium-light-value">Center</output></label>
        <input id="atrium-light" type="range" min="0" max="100" step="1" value="50" aria-label="Move the light from left to right">
        <div class="atrium-axis" aria-hidden="true"><span>LEFT</span><span>RIGHT</span></div>
        <p class="atrium-concept">An interactive architectural concept study, not a commissioned project.</p>
      </footer>
    </section>`;
  document.body.append(overlay);
  const room = overlay.querySelector('.atrium-experience');
  const slider = overlay.querySelector('#atrium-light');
  const value = overlay.querySelector('#atrium-light-value');
  const back = overlay.querySelector('.atrium-back');
  const scrollArea = document.querySelector('.work-hangings');
  const entryState = { trigger: enter, scrollY: 0, galleryX: 0, previousHash: '' };
  let active = false;
  let lastFocus = null;
  let oldOverflow = '';
  let openingTimer = 0;
  function light(position) {
    const n = Math.max(0, Math.min(100, Number(position)));
    room.style.setProperty('--light-x', n + '%');
    room.style.setProperty('--light-offset', ((n - 50) / 50).toFixed(3));
    room.style.setProperty('--light-reveal', (0.32 + Math.abs(n - 50) / 100).toFixed(3));
    value.textContent = n < 34 ? 'Left' : n > 66 ? 'Right' : 'Center';
    slider.value = String(n);
  }
  light(50);
  slider.addEventListener('input', () => light(slider.value));
  function show(push) {
    if (active) return;
    active = true;
    entryState.scrollY = window.scrollY;
    entryState.galleryX = scrollArea?.scrollLeft || 0;
    entryState.previousHash = location.hash;
    lastFocus = document.activeElement;
    oldOverflow = document.body.style.overflow;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    overlay.classList.remove('atrium-closing');
    overlay.classList.toggle('atrium-opening', !reduced.matches);
    clearTimeout(openingTimer);
    openingTimer = setTimeout(() => overlay.classList.remove('atrium-opening'), reduced.matches ? 0 : 420);
    if (push) history.pushState({ ...history.state, lazarusAtrium: true }, '', '#the-atrium-room');
    room.focus({ preventScroll: true });
  }
  function hide() {
    if (!active) return;
    active = false;
    clearTimeout(openingTimer);
    overlay.hidden = true;
    overlay.classList.remove('atrium-opening');
    document.body.style.overflow = oldOverflow;
    if (scrollArea) scrollArea.scrollLeft = entryState.galleryX;
    window.scrollTo({ top: entryState.scrollY, behavior: 'instant' });
    const target = entryState.trigger?.isConnected ? entryState.trigger : lastFocus;
    if (target?.focus) target.focus({ preventScroll: true });
  }
  enter.addEventListener('click', () => { entryState.trigger = enter; show(true); });
  // The hanging artwork still opens readable notes; it never becomes a hidden interaction.
  back.addEventListener('click', () => {
    if (history.state?.lazarusAtrium) history.back();
    else hide();
  });
  addEventListener('popstate', () => {
    if (history.state?.lazarusAtrium || location.hash === '#the-atrium-room') show(false);
    else hide();
  });
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      back.click();
    }
    if (event.key === 'Tab') {
      const controls = [back, slider];
      const i = controls.indexOf(document.activeElement);
      if (event.shiftKey && (i <= 0)) { event.preventDefault(); slider.focus(); }
      else if (!event.shiftKey && i === controls.length - 1) { event.preventDefault(); back.focus(); }
    }
  });
  // A deep link works without first traversing the forest.
  if (location.hash === '#the-atrium-room') {
    document.querySelector('#folio-atrium').open = true;
    entryState.trigger = enter;
    show(false);
  }
})();