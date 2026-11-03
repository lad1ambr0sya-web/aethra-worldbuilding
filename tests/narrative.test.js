import assert from 'node:assert/strict';
import test from 'node:test';
globalThis.localStorage={getItem:()=>null};
const {initNarrative,fictionalOrdinal,loreTargets}=await import('../dist/narrative.js');
const {createWorld,prepareWorld}=await import('../dist/store.js');
test('narrative migration preserves data and respects hidden tabs after first migration',()=>{const w=prepareWorld(createWorld());const n=initNarrative(w);n.scenes.push({id:'scene',title:'Cena',body:'<p>Texto</p>',references:[]});w.enabled=w.enabled.filter(t=>t!=='scenes');assert.equal(initNarrative(w).scenes[0].body,'<p>Texto</p>');assert.ok(!w.enabled.includes('scenes'));assert.deepEqual(initNarrative(JSON.parse(JSON.stringify(w))).scenes,n.scenes);});
test('fictional dates sort across negative years and unequal month lengths',()=>{const c={months:[{days:10},{days:20}]};assert.equal(fictionalOrdinal({year:0,month:1,day:1},c),10);assert.equal(fictionalOrdinal({year:1,month:0,day:1},c)-fictionalOrdinal({year:0,month:1,day:20},c),1);assert.ok(fictionalOrdinal({year:-1,month:1,day:20},c)<0);});
test('invalid fictional month lengths are rejected',()=>{const w=prepareWorld(createWorld());w.narrative.calendar.months[0].days=0;assert.throws(()=>initNarrative(w),/inválidos/);});
