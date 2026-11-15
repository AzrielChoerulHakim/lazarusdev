/** Chapter 04, Stage 09 — native note navigation. No scroll hijack, no screenshots. */
const riverNotes = new Map(
  [...document.querySelectorAll('#river-stories .river-note[id]')]
    .map(article => [article.id, article.querySelector('details')])
);
const riverJumps = [...document.querySelectorAll('#river-stories [data-river-jump]')];
function unfoldRiverNote(id) {
  const note = riverNotes.get(id);
  if (!note) return;
  note.open = true;
  for (const link of riverJumps) {
    link.dataset.active = String(link.getAttribute('data-river-jump') === id);
  }
}
for (const link of riverJumps) {
  link.addEventListener('click', () => unfoldRiverNote(link.dataset.riverJump));
}
window.addEventListener('hashchange', () => unfoldRiverNote(location.hash.slice(1)));
unfoldRiverNote(location.hash.slice(1));
