import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMusicLink} from '../dist/music-links.js';
test('YouTube shares, music links and saved embeds remain playable',()=>{
 const video='dQw4w9WgXcQ';
 for(const value of [`https://youtu.be/${video}?si=shared`,`https://music.youtube.com/watch?v=${video}`,`https://www.youtube.com/embed/${video}?rel=0`])assert.equal(parseMusicLink(value).source,`https://www.youtube.com/embed/${video}?rel=0`);
});
test('YouTube playlists survive normalization and reload',()=>{
 const list='PL1234567890abcdef',parsed=parseMusicLink(`https://www.youtube.com/playlist?list=${list}`);
 assert.equal(parsed.contentType,'playlist');assert.deepEqual(parseMusicLink(parsed.source),parsed);
});
test('Spotify and unsupported destinations are rejected',()=>{
 for(const value of ['spotify:track:0Lr4kGOYn9l83EjuK6cZFQ','https://open.spotify.com/track/0Lr4kGOYn9l83EjuK6cZFQ','javascript:alert(1)','https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ','https://youtube.com/watch?v=bad','not a link'])assert.throws(()=>parseMusicLink(value));
});
