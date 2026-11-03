import assert from 'node:assert/strict';
import test from 'node:test';
globalThis.localStorage={getItem:()=>null};
const {prepareWorld}=await import('../dist/store.js');

test('separates existing folder documents without losing their content',()=>{
  const document={id:'a',folder:'f',title:'Capítulo',body:'<p>Uma história.</p>'};
  const loose={id:'b',folder:'',title:'Ideia',body:'<p>Um começo.</p>'};
  const w={notes:[document,loose]};
  prepareWorld(w);
  assert.deepEqual(w.folderNotes,[document]);
  assert.deepEqual(w.notes,[loose]);
  prepareWorld(w);
  assert.deepEqual(w.folderNotes,[document]);
  assert.deepEqual(w.notes,[loose]);
});
test('keeps independent collections independent across backup round trips',()=>{
  const w={notes:[{id:'n',body:'Nota'}],folderNotes:[{id:'f',folder:'folder',body:'Documento'}]};
  const restored=prepareWorld(JSON.parse(JSON.stringify(w)));
  restored.notes[0].body='Nota editada';
  assert.equal(restored.folderNotes[0].body,'Documento');
  assert.equal(restored.notes.length,1);
  assert.equal(restored.folderNotes.length,1);
});
test('rejects a malformed folder collection',()=>{
  assert.throws(()=>prepareWorld({notes:[],folderNotes:{}}),/inválidos/);
});
