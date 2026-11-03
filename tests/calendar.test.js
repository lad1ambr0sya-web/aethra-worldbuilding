import assert from 'node:assert/strict';
import test from 'node:test';
globalThis.localStorage={getItem:()=>null};
const {monthCells,validDate}=await import('../dist/calendar.js');
const {prepareWorld}=await import('../dist/store.js');
const {resolveTarget,documentTargets}=await import('../dist/document-links.js');
const {horizontalDrag}=await import('../dist/globe.js');
test('calendar includes leap day and begins each row on Monday',()=>{
  const cells=monthCells(2028,1);
  assert.equal(cells.length,42);
  assert.equal(cells[0],'2028-01-31');
  assert.equal(cells.includes('2028-02-29'),true);
  assert.equal(new Date(cells[0]+'T12:00:00').getDay(),1);
});
test('invalid dates are rejected instead of silently rolling into another month',()=>{
  assert.equal(validDate('2026-02-29'),false);
  assert.equal(validDate('2028-02-29'),true);
  assert.equal(validDate('2026-13-01'),false);
  assert.equal(validDate('2026-04-31'),false);
  assert.equal(validDate('2026-11-03'),true);
});
test('calendar migration preserves content and respects later hidden-tab preferences',()=>{
  const w={enabled:['home'],notes:[],folderNotes:[]};
  prepareWorld(w);
  assert.deepEqual(w.calendarEvents,[]);
  assert.equal(w.enabled.includes('calendar'),true);
  w.calendarEvents.push({id:'ev',date:'2026-11-03',target:'doc'});
  w.enabled=w.enabled.filter(t=>t!=='calendar');
  prepareWorld(w);
  assert.equal(w.calendarEvents.length,1);
  assert.equal(w.enabled.includes('calendar'),false);
});
test('links resolve notes, folder documents and folders after a backup round trip',()=>{
  const w=JSON.parse(JSON.stringify({folders:[{id:'f',name:'Reinos'}],notes:[{id:'n',title:'Magia'}],folderNotes:[{id:'d',folder:'f',title:'Eldoria',emoji:'📜'}]}));
  assert.equal(documentTargets(w).length,2);
  assert.equal(resolveTarget(w,'d').folder,'f');
  assert.equal(resolveTarget(w,'n').type,'notes');
  assert.equal(resolveTarget(w,'f').folder,'f');
  assert.equal(resolveTarget(w,'removed'),undefined);
});
test('dragging right turns the map surface right, accounting for inverse texture sampling',()=>{
  const before=.2,after=horizontalDrag(before,100);
  assert.ok(after<before);
  assert.equal(horizontalDrag(after,-100),before);
});
