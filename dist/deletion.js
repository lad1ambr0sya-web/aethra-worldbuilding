// All deletion entry points share the same model cleanup and normal save path.
export function removeWorldItem(w, kind, id) {
  const nested = ['scenes', 'events'].includes(kind);
  const owner = kind === 'pins' ? (w.maps || []).find(map => (map.pins || []).some(pin => pin.id === id)) : nested ? w.narrative : w;
  if (!owner || !Array.isArray(owner[kind])) return false;
  const item = owner[kind].find(x => x.id === id);
  if (!item) return false;
  const removed = new Set([id]);
  if (kind === 'folders') {
    for (const note of w.folderNotes || []) if (note.folder === id) removed.add(note.id);
    w.folderNotes = (w.folderNotes || []).filter(note => note.folder !== id);
  }
  if (kind === 'maps') {for (const pin of item.pins || []) removed.add(pin.id);for(const record of item.lore||[])removed.add(record.id);}
  owner[kind] = owner[kind].filter(x => x.id !== id);
  if(kind==='pins')for(const map of w.maps||[])for(const r of map.lore||[])if(r.region===id)r.region='';
  const n = w.narrative;
  if (n) {
    n.relations = (n.relations || []).filter(r => !removed.has(r.from) && !removed.has(r.to));
    n.connectionBoard = (n.connectionBoard || []).filter(key => !removed.has(key));
    for (const key of removed) if (n.connectionPositions) delete n.connectionPositions[key];
    for (const scene of n.scenes || []) {
      scene.references = (scene.references || []).filter(key => !removed.has(key));
      if (removed.has(scene.event)) scene.event = '';
    }
    for (const event of n.events || []) if (removed.has(event.target)) event.target = '';
  }
  for (const event of w.calendarEvents || []) if (removed.has(event.target)) event.target = '';
  if (removed.has(w.goalDocument)) w.goalDocument = '';
  return true;
}

const labels = {notes:'nota',folderNotes:'documento',characters:'personagem',bestiary:'criatura',plot:'item da trama',scenes:'cena',events:'acontecimento',calendarEvents:'evento',folders:'pasta'};
const trash = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';

export function initDeletionControls(main, {world, confirmDelete, onDeleted = () => {}}) {
  const folders = document.querySelector('#folders');
  function add(source, kind, id, placement = 'row') {
    if (source.dataset.deleteReady) return;
    source.dataset.deleteReady = 'true';
    const w = world(), owner = ['scenes','events'].includes(kind) ? w.narrative : w;
    const item = owner?.[kind]?.find(x => x.id === id);
    if (!item) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'item-delete'; button.innerHTML = trash;
    button.title = `Excluir ${labels[kind]}`;
    button.setAttribute('aria-label', `Excluir ${labels[kind]}: ${item.title || item.name || 'Sem título'}`);
    button.addEventListener('pointerdown', event => event.stopPropagation());
    button.addEventListener('keydown', event => event.stopPropagation());
    button.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation();
      const title = item.title || item.name || 'Sem título';
      const message = document.createElement('p');
      message.textContent = `“${title}” será excluído desta conta e a alteração será sincronizada. ${kind === 'folders' ? 'Os documentos desta pasta também serão removidos. ' : ''}Esta ação não pode ser desfeita.`;
      confirmDelete(`Excluir ${labels[kind]}?`, message.innerHTML, () => {
        if (removeWorldItem(w, kind, id)) onDeleted(kind, id);
      });
    });
    if (placement === 'row') {
      const row = document.createElement('div'); row.className = 'deletable-row';
      source.before(row); row.append(source, button);
    } else if (placement === 'card') {
      source.classList.add('deletable-card'); source.append(button);
    } else source.parentElement.append(button);
  }
  function scan() {
    const w = world();
    main.querySelectorAll('.note-list [data-note]').forEach(el => add(el, (w.folderNotes || []).some(n => n.id === el.dataset.note) ? 'folderNotes' : 'notes', el.dataset.note));
    main.querySelectorAll('.note-list [data-scene]').forEach(el => add(el, 'scenes', el.dataset.scene));
    main.querySelectorAll('.character-list-card[data-character]').forEach(el => add(el, el.dataset.kind||'characters', el.dataset.character, 'card'));
    main.querySelectorAll('button.card[data-kind="bestiary"]').forEach(el => {
      if (el.dataset.deleteReady) return;
      const wrapper = document.createElement('article'); wrapper.className = 'deletable-card creature-delete-wrapper';
      el.before(wrapper); wrapper.append(el); add(el, 'bestiary', el.dataset.entity, 'sibling');
    });
    main.querySelectorAll('.plot-card[data-plot]').forEach(el => add(el, 'plot', el.dataset.plot, 'card'));
    main.querySelectorAll('.timeline-edit[data-event]').forEach(el => add(el, 'events', el.dataset.event, 'sibling'));
    main.querySelectorAll('.agenda-event [data-edit-event]').forEach(el => add(el, 'calendarEvents', el.dataset.editEvent, 'sibling'));
    folders?.querySelectorAll('[data-folder]').forEach(el => add(el, 'folders', el.dataset.folder));
  }
  const observer = new MutationObserver(scan);
  observer.observe(main, {childList:true, subtree:true});
  if (folders) observer.observe(folders, {childList:true, subtree:true});
  scan();
  return () => observer.disconnect();
}
