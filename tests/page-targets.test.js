import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage={getItem:()=>null};
const {pageTargets,resolveTarget,documentHref}=await import('../dist/document-links.js');
const {removeWorldItem}=await import('../dist/deletion.js');
const fixture=()=>({notes:[{id:'note',title:'Anotações',body:'<p>Uma <b>ideia</b></p>'}],folders:[{id:'folder',name:'Reinos'}],folderNotes:[{id:'doc',folder:'folder',title:'Crônica'}],characters:[{id:'hero',name:'Lyra'}],bestiary:[{id:'beast',name:'Dragão'}],plot:[{id:'plot',title:'Travessia'}],maps:[{id:'map',name:'Eldoria',pins:[{id:'pin',name:'Porto'}],lore:[{id:'lore',title:'Idioma antigo',category:'language',region:'pin',sections:{Falantes:'Povo do norte'}}]}],calendarEvents:[{id:'calendar',title:'Sessão de escrita'}],narrative:{scenes:[{id:'scene',title:'Chegada',body:'<p>No porto.</p>',references:['lore']}],events:[{id:'event',title:'Fundação',target:'lore'}],relations:[{from:'hero',to:'lore'}]}});
test('every app section and record is linkable after a save round trip without crossing worlds',()=>{
 const w=JSON.parse(JSON.stringify(fixture()));const targets=pageTargets(w);
 for(const id of ['note','folder','doc','hero','beast','plot','map','pin','lore','calendar','scene','event','tab:globe','tab:connections'])assert.ok(resolveTarget(w,id),id);
 assert.equal(new Set(targets.map(t=>t.id)).size,targets.length);
 assert.equal(resolveTarget(w,'pin').map,'map');assert.equal(resolveTarget(w,'lore').lore,true);assert.equal(resolveTarget(w,'doc').folder,'folder');
 assert.equal(resolveTarget(w,'note').description,'Uma ideia');assert.equal(resolveTarget({...w,characters:[]},'hero'),undefined);
 assert.equal(documentHref('tab:maps'),'#document/tab%3Amaps');
});
test('removing a pin preserves atlas writing and removing its map clears narrative references',()=>{
 const w=fixture();assert.equal(removeWorldItem(w,'pins','pin'),true);assert.equal(w.maps[0].lore[0].region,'');assert.equal(w.maps[0].lore[0].sections.Falantes,'Povo do norte');
 assert.equal(removeWorldItem(w,'maps','map'),true);assert.equal(resolveTarget(w,'lore'),undefined);assert.deepEqual(w.narrative.scenes[0].references,[]);assert.equal(w.narrative.events[0].target,'');assert.deepEqual(w.narrative.relations,[]);
});
