import test from 'node:test';
import assert from 'node:assert/strict';
import {themeCover,usesDefaultCover} from '../dist/theme-covers.js';
test('default cover follows the active theme including legacy defaults',()=>{
 for(const palette of ['sapphire','pond','aurora']){
  assert.equal(themeCover({cover:'assets/castle.jpg'},palette),`assets/theme-covers/${palette}.jpg`);
  assert.equal(themeCover({coverMode:'default',cover:'old.jpg'},palette),`assets/theme-covers/${palette}.jpg`);
 }
});
test('changing theme preserves user images',()=>{
 const overview={cover:'data:image/jpeg;base64,custom'};
 assert.equal(usesDefaultCover(overview),false);
 assert.equal(themeCover(overview,'aurora'),overview.cover);
 assert.equal(themeCover({...overview,coverMode:'custom'},'pond'),overview.cover);
});
