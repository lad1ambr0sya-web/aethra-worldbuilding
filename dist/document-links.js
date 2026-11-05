import {tabs} from './store.js';
const excerpt=value=>String(value||'').replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
export function pageTargets(w){
 const result=Object.entries(tabs).map(([type,[,title]])=>({id:'tab:'+type,type,title,label:'Meu universo',description:'Abrir '+title}));
 const add=(items,type,label,titleKey='title',extra=()=>({}))=>(items||[]).forEach(x=>result.push({id:x.id,type,title:x[titleKey]||'Sem título',emoji:x.emoji||'',label,description:excerpt(x.body||x.description),image:x.image||'',...extra(x)}));
 add(w.notes,'notes','Nota');add(w.folders,'folder','Pasta','name',x=>({folder:x.id}));
 add(w.folderNotes,'folder','Documento de pasta','title',x=>({folder:x.folder,label:w.folders?.find(f=>f.id===x.folder)?.name||'Documento de pasta'}));
 add(w.characters,'characters','Personagem','name');add(w.bestiary,'bestiary','Criatura','name');add(w.plot,'plot','Trama');add(w.maps,'maps','Mapa','name');
 for(const m of w.maps||[])add(m.pins,'maps','Região','name',x=>({map:m.id,pin:x.id}));
 add(w.narrative?.scenes,'scenes','Cena');add(w.narrative?.events,'timeline','Acontecimento');add(w.calendarEvents,'calendar','Evento de calendário');
 for(const m of w.maps||[])add(m.lore,'maps','Construção de mundo','title',()=>({map:m.id,lore:true}));
 return result;
}
export function documentTargets(w){return pageTargets(w).filter(x=>(x.type==='notes'||x.type==='folder')&&!x.id.startsWith('tab:')&&!(w.folders||[]).some(f=>f.id===x.id));}
export function resolveTarget(w,id){return pageTargets(w).find(x=>x.id===id);}
export const documentHref=id=>'#document/'+encodeURIComponent(id);
