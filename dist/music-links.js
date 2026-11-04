export function parseMusicLink(value){
 let url;try{url=new URL(String(value||'').trim());}catch{throw Error('Cole um link de vídeo ou playlist do YouTube.');}
 const host=url.hostname.replace(/^www\./,'');
 if(!['https:','http:'].includes(url.protocol)||!['youtube.com','m.youtube.com','music.youtube.com','youtu.be','youtube-nocookie.com'].includes(host))throw Error('Use um link de vídeo ou playlist do YouTube.');
 const id=host==='youtu.be'?url.pathname.split('/')[1]:url.searchParams.get('v')||url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
 if(id!=='videoseries'&&/^[\w-]{11}$/.test(id||''))return {kind:'youtube',contentType:'video',source:`https://www.youtube.com/embed/${id}?rel=0`,publicURL:`https://www.youtube.com/watch?v=${id}`};
 const list=url.searchParams.get('list');
 if((url.pathname==='/playlist'||url.pathname==='/embed/videoseries')&&/^[\w-]{10,100}$/.test(list||''))return {kind:'youtube',contentType:'playlist',source:`https://www.youtube.com/embed/videoseries?list=${list}`,publicURL:`https://www.youtube.com/playlist?list=${list}`};
 throw Error('Esse link não é reconhecido. Copie o link de um vídeo ou playlist do YouTube.');
}
