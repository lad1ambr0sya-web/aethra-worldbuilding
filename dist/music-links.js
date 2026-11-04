const spotifyTypes=new Set(['track','playlist','album','episode','show','artist']);
export function parseMusicLink(value){
 const raw=String(value||'').trim(),uri=raw.match(/^spotify:(track|playlist|album|episode|show|artist):([a-zA-Z0-9]{22})$/);
 if(uri)return spotifyLink(uri[1],uri[2]);
 let url;try{url=new URL(raw);}catch{throw Error('Cole o link copiado em Compartilhar no Spotify ou YouTube.');}
 if(!['https:','http:'].includes(url.protocol))throw Error('Use um link do Spotify ou YouTube.');
 const host=url.hostname.replace(/^www\./,'');
 if(host==='spotify.link')throw Error('Use o endereço completo de open.spotify.com, copiado em Compartilhar no Spotify.');
 if(host==='open.spotify.com'){const parts=url.pathname.split('/').filter(Boolean).filter(p=>!p.startsWith('intl-')&&p!=='embed');if(spotifyTypes.has(parts[0])&&/^[a-zA-Z0-9]{22}$/.test(parts[1]||''))return spotifyLink(parts[0],parts[1]);}
 if(['youtube.com','m.youtube.com','music.youtube.com','youtu.be','youtube-nocookie.com'].includes(host)){const id=host==='youtu.be'?url.pathname.split('/')[1]:url.searchParams.get('v')||url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];if(/^[\w-]{11}$/.test(id||''))return {kind:'youtube',source:`https://www.youtube.com/embed/${id}?rel=0`,publicURL:`https://www.youtube.com/watch?v=${id}`};}
 throw Error('Esse link não é reconhecido. Use um conteúdo do Spotify ou um vídeo do YouTube.');
}
function spotifyLink(type,id){return {kind:'spotify',contentType:type,uri:`spotify:${type}:${id}`,source:`https://open.spotify.com/embed/${type}/${id}`,publicURL:`https://open.spotify.com/${type}/${id}`};}
