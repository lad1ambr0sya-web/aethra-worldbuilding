import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMusicLink} from '../dist/music-links.js';
const id='0Lr4kGOYn9l83EjuK6cZFQ';
test('Spotify share links, localized links, embeds and URIs resolve to the same content',()=>{
 const expected=parseMusicLink(`https://open.spotify.com/track/${id}`);
 for(const value of [`https://open.spotify.com/intl-pt/track/${id}?si=shared`,`https://open.spotify.com/embed/track/${id}`,`spotify:track:${id}`])assert.deepEqual(parseMusicLink(value),expected);
 for(const type of ['album','playlist','episode'])assert.equal(parseMusicLink(`spotify:${type}:${id}`).contentType,type);
});
test('YouTube shares, music links and saved embeds remain playable',()=>{
 const video='dQw4w9WgXcQ';
 for(const value of [`https://youtu.be/${video}?si=shared`,`https://music.youtube.com/watch?v=${video}`,`https://www.youtube.com/embed/${video}?rel=0`])assert.equal(parseMusicLink(value).source,`https://www.youtube.com/embed/${video}?rel=0`);
});
test('untrusted destinations, invalid content IDs and unsupported short links are rejected',()=>{
 for(const value of ['javascript:alert(1)','https://open.spotify.com.evil.test/track/abc','https://open.spotify.com/track/abc','https://youtube.com/watch?v=bad','https://spotify.link/abc','not a link'])assert.throws(()=>parseMusicLink(value));
});
