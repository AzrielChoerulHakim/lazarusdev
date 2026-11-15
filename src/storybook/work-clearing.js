/** Stage 08 — illustrated hanging prints open *real* semantic concept notes.
 * Native hyperlinks and <details> provide a no-JS fallback. No carousel JS,
 * invented outbound project URLs, looping motion or scroll interception. */
const sheets = [...document.querySelectorAll('#work-clearing [data-open-concept]')];
const notes = [...document.querySelectorAll('#work-clearing details.work-folio[id]')];
function revealNote(id) {
  if (!/^folio-(atrium|oracle|archive)$/.test(id)) return;
  const note = document.getElementById(id);
  if (!note) return;
  note.open = true;
  sheets.forEach(link => { link.dataset.active = String(link.hash === `#${id}`); });
}
for (const sheet of sheets) {
  sheet.addEventListener('click', () => revealNote(sheet.hash.slice(1)));
}
for (const note of notes) {
  note.addEventListener('toggle', () => {
    if (note.open) sheets.forEach(link => {
      link.dataset.active = String(link.hash === `#${note.id}`);
    });
  });
}
window.addEventListener('hashchange', () => revealNote(location.hash.slice(1)));
revealNote(location.hash.slice(1));