import assert from 'node:assert/strict';
import test from 'node:test';
globalThis.localStorage={getItem:()=>null};
const {connectionCurve}=await import('../dist/connections.js');
test('connection enters the destination on the side facing the source',()=>{assert.ok(connectionCurve({x:0,y:0},{x:340,y:0}).path.endsWith('340 43'));assert.ok(connectionCurve({x:340,y:0},{x:0,y:0}).path.endsWith('216 43'));});
test('long horizontal connections arc above intermediate cards',()=>{const c=connectionCurve({x:70,y:90},{x:750,y:90});assert.ok(c.y<90);assert.ok(c.path.endsWith('750 133'));});
