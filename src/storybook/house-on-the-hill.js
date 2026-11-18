/** Stage 13 — field-letter editor; an honest, local-only inquiry tool.
 * Does not submit, transmit, persist or share data without an explicit user action.
 * The studio has no verified public delivery destination at this stage.
 */
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
  const saveButton = house.querySelector('[data-house-save]');
  const copyStatus = house.querySelector('#house-copy-status');
  const builder = house.querySelector('[data-letter-builder]');
  const review = house.querySelector('[data-letter-review]');
  const output = house.querySelector('[data-letter-output]');
  const goal = house.querySelector('#house-letter-goal');
  const timing = house.querySelector('#house-letter-timing');

  if (field && copyButton && saveButton && copyStatus && builder && review && output && goal && timing) {
    builder.hidden = false;
    review.hidden = false;
    copyButton.hidden = false;
    saveButton.hidden = false;

    function composeLetter() {
      const note = field.value.trim();
      if (!note) return '';
      const selected = house.querySelector('input[name="house-letter-kind"]:checked');
      const direction = selected ? selected.value : 'To be discussed';
      return [
        'LAZARUS DEV / PROJECT BRIEF', '',
        'DIRECTION / ' + direction,
        'PURPOSE / ' + (goal.value.trim() || 'To be discussed'),
        'TIMING / ' + timing.value,
        '', 'PROJECT NOTE', note, '',
        'Draft only. Not submitted to Lazarus Dev.'
      ].join('\n');
    }

    function updateReview() {
      output.textContent = composeLetter() || 'Write a project note above to prepare your letter.';
    }
    field.addEventListener('input', updateReview);
    goal.addEventListener('input', updateReview);
    timing.addEventListener('change', updateReview);
    for (const item of house.querySelectorAll('input[name="house-letter-kind"]')) {
      item.addEventListener('change', updateReview);
    }
    updateReview();

    function requireLetter() {
      const letter = composeLetter();
      if (!letter) {
        copyStatus.textContent = 'Write a short note before copying or saving your brief.';
        field.focus();
        return '';
      }
      return letter;
    }

    copyButton.addEventListener('click', async () => {
      const letter = requireLetter();
      if (!letter) return;
      try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(letter);
        copyStatus.textContent = 'Brief copied to your clipboard. Nothing has been sent.';
      } catch (_) {
        // Try copying the *complete assembled letter*, not just the raw note.
        const fallback = document.createElement('textarea');
        fallback.value = letter;
        fallback.setAttribute('aria-hidden', 'true');
        fallback.style.position = 'fixed';
        fallback.style.left = '-9999px';
        document.body.append(fallback);
        fallback.select();
        let copied = false;
        try { copied = typeof document.execCommand === 'function' && document.execCommand('copy'); } catch (_) { /* manual fallback */ }
        fallback.remove();
        if (copied) {
          copyButton.focus();
          copyStatus.textContent = 'Your complete brief was copied. Nothing has been sent.';
        } else {
          review.open = true;
          output.focus();
          const selection = window.getSelection();
          if (selection) selection.selectAllChildren(output);
          copyStatus.textContent = 'Clipboard access is unavailable. Your complete letter is shown under “Read the complete letter” for manual copying, or save it as a text file. Nothing was sent.';
        }
      }
    });

    saveButton.addEventListener('click', () => {
      const letter = requireLetter();
      if (!letter) return;
      const url = URL.createObjectURL(new Blob([letter + '\n'], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lazarus-project-brief.txt';
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      copyStatus.textContent = 'Your text file is ready to save locally. Nothing has been sent.';
    });
  }
}
