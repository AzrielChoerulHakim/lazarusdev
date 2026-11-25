(()=>{'use strict';const stage=document.getElementById('stage');const id=Number(stage.dataset.concept);
  function wireLocalInteraction(id) {
    if (id === 2) {
      const labels = {a:'RUMAH SORE',b:'PAVILIUN UTARA',c:'RUANG PANTAI',d:'STUDIO TANAH'};
      const places = Array.from(stage.querySelectorAll('[data-map]'));
      places.forEach(place => place.addEventListener('click', () => {
        places.forEach(p => p.classList.toggle('active', p === place));
        stage.querySelectorAll('[data-pin]').forEach(pin => pin.classList.toggle('active', pin.dataset.pin === place.dataset.map));
        stage.querySelector('#map-readout').textContent = 'SELECTED: ' + labels[place.dataset.map];
      }));
    }
    if (id === 3) {
      const chapters=[
        ['The hour<br><em>between.</em>','A house that belongs as much to its shadows as to its walls.'],
        ['The space<br><em>in passing.</em>','A threshold that changes with the movement of its people.'],
        ['Where light<br><em>returns.</em>','An architecture that allows the day to remain visible.']
      ];
      stage.querySelectorAll('[data-film]').forEach(button => button.addEventListener('click', () => {
        const n = Number(button.dataset.film);
        const h = stage.querySelector('#film-title');
        // markup is constant, authored locally and never derived from user input
        h.innerHTML = chapters[n][0];
        stage.querySelector('#film-description').textContent = chapters[n][1];
        stage.querySelector('#film-part').textContent = String(n + 1).padStart(2,'0');
        stage.querySelector('.con-film').dataset.phase = n;
        stage.querySelectorAll('[data-film]').forEach(b => b.classList.toggle('active',b === button));
      }));
    }
    if (id === 4) {
      const names=[
        ['RS_024 / SECTION A—A','RUMAH SORE','RS-024/A','CAST CONCRETE, TIMBER'],
        ['PU_025 / ELEVATION B—B','PAVILIUN UTARA','PU-025/B','RECYCLED STEEL, GLASS'],
        ['RP_023 / SECTION C—C','RUANG PANTAI','RP-023/C','STONE, VENTILATED WOOD'],
        ['ST_026 / ELEVATION A—A','STUDIO TANAH','ST-026/A','EARTH BLOCK, TERRAZZO']
      ];
      stage.querySelectorAll('[data-blue]').forEach(b=>b.addEventListener('click',()=>{
        const [file,project,num,material]=names[Number(b.dataset.blue)];
        stage.querySelector('#blue-file-label').textContent=file;
        stage.querySelector('#blue-project').textContent=project;
        stage.querySelector('#blue-number').textContent=num;
        stage.querySelector('#blue-material').textContent=material;
        stage.querySelectorAll('[data-blue]').forEach(el=>el.classList.toggle('active',el===b));
      }));
    }
    if (id === 5) {
      const categories=['RUMAH SORE — RESIDENTIAL','PAVILIUN UTARA — PUBLIC','RUANG PANTAI — COASTAL','STUDIO TANAH — WORKPLACE'];
      stage.querySelectorAll('[data-public]').forEach(b=>b.addEventListener('click',()=>{
        stage.querySelector('#public-readout').textContent=categories[Number(b.dataset.public)];
        stage.querySelectorAll('[data-public]').forEach(el=>el.classList.toggle('active',el===b));
      }));
    }
    if (id === 6) {
      const names=[
        ['House of<br><i>afternoon.</i>','A model study on the relationship between shadow, threshold and domestic time.'],
        ['Pavilion of<br><i>quiet use.</i>','A civic structure considered through weight, repetition and approach.'],
        ['Room for<br><i>the weather.</i>','A coastal experiment in opening, enclosure and light.']
      ];
      stage.querySelectorAll('[data-object]').forEach(b=>b.addEventListener('click',()=>{
        let n=Number(b.dataset.object);
        stage.querySelector('#object-title').innerHTML=names[n][0];
        stage.querySelector('#object-desc').textContent=names[n][1];
        stage.querySelector('.con-object').dataset.object=n;
        stage.querySelectorAll('[data-object]').forEach(el=>el.classList.toggle('active',el===b));
      }));
    }
  }

wireLocalInteraction(id);
const groups=['map','film','blue','public','object'];for(const group of groups){const buttons=[...stage.querySelectorAll('[data-'+group+']')].filter(el=>el.tagName==='BUTTON');const sync=()=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));sync();buttons.forEach(b=>b.addEventListener('click',sync));}
})();