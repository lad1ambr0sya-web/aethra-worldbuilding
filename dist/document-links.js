export function documentTargets(w){return [...w.notes.map(n=>({id:n.id,type:'notes',title:n.title,emoji:n.emoji||'',label:'Nota'})),...w.folderNotes.map(n=>({id:n.id,type:'folder',folder:n.folder,title:n.title,emoji:n.emoji||'',label:w.folders.find(f=>f.id===n.folder)?.name||'Documento'}))];}
export function resolveTarget(w,id){return documentTargets(w).find(n=>n.id===id)||w.folders.find(f=>f.id===id)&&{id,type:'folder',folder:id,title:w.folders.find(f=>f.id===id).name};}
export const documentHref=id=>'#document/'+encodeURIComponent(id);
