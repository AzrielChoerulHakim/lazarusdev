/** Chapter 05. Opt-in cottage window-light and explicit local-only brief.
 * This code never uploads or stores any project notes. */
const house = document.getElementById('house-on-the-hill');
if (house) {
  const scene = house.querySelector('[data-house-scene]');
  const lightButton = house.querySelector('[data-house-light-toggle]');
  const lightLabel = house.querySelector('[data-house-light-label]');
  const lightStatus = house.querySelector('#house-light-status');
  if (scene && lightButton && lightLabel && lightStatus) {
    lightButton.hidden = false;
    lightButton.addEventListener('click', () => {
      const lit = scene.dataset.lit !== 'true';
      scene.dataset.lit = String(lit);
      lightButton.setAttribute('aria-pressed', String(lit));
      lightLabel.textContent = lit ? 'Return to quiet light' : 'Brighten the windows';
      lightStatus.textContent = lit ? 'The cottage windows shine a little brighter.' : 'A little light is already on.';
    });
  }

  const field = house.querySelector('#house-brief');
  const copyButton = house.querySelector('[data-house-copy]');
  const copyStatus = house.querySelector('#house-copy-status');
  if (field && copyButton && copyStatus) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const note = field.value.trim();
      if (!note) {
        copyStatus.textContent = 'Write a short note first, then copy it to your own device.';
        field.focus();
        return;
      }
      const output = 'LAZARUS DEV / PROJECT BRIEF\n\n' + note + '\n\nDraft only. Not submitted to Lazarus Dev.';
      try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(output);
        copyStatus.textContent = 'Brief copied to your clipboard. Nothing has been sent.';
      } catch (_) {
        field.focus();
        field.select();
        let copied = false;
        try { copied = typeof document.execCommand === 'function' && document.execCommand('copy'); } catch (_) { /* manual fallback */ }
        copyStatus.textContent = copied ? 'Your note was copied. Nothing has been sent.' : 'Clipboard access is unavailable. Your note is selected so you can copy it manually. Nothing was sent.';
      }
    });
  }
}
