/** Stage 08 — illustrated hanging prints open *real* semantic concept notes.
 * Native hyperlinks and <details> provide a no-JS fallback. No carousel JS,
 * invented outbound project URLs, looping motion or scroll interception. */
const sheets = [...document.querySelectorAll('#work-clearing [data-open-concept]')];
function revealNote(id) {
  const sheet = sheets.find(link => link.hash.slice(1) === id);
  const note = sheet && document.getElementById(id);
  if (note) note.open = true;
}

for (const sheet of sheets) {
  const note = document.getElementById(sheet.hash.slice(1));
  if (!note) continue;
  const updateSheet = () => { sheet.dataset.active = String(note.open); };
  note.addEventListener('toggle', updateSheet);
  updateSheet();
  sheet.addEventListener('click', event => {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) note.open = true;
  });
}
window.addEventListener('hashchange', () => revealNote(location.hash.slice(1)));
revealNote(location.hash.slice(1));