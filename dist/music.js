import {escapeHTML as e,uid} from './store.js';
import {parseMusicLink} from './music-links.js';
export {parseMusicLink} from './music-links.js';
const glyphs={music:'<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',play:'<path d="m9 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',previous:'<path d="M5 5v14m14-14L8 12l11 7Z"/>',next:'<path d="M19 5v14M5 5l11 7-11 7Z"/>',plus:'<path d="M12 5v14M5 12h14"/>',upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>'};
const icon=key=>`<svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[key]||glyphs.music}</svg>`;
let youtubeAPI;
function loadYouTubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(youtubeAPI)return youtubeAPI;
 youtubeAPI=new Promise((resolve,reject)=>{
  const script=document.createElement('script'),timer=setTimeout(()=>{script.remove();youtubeAPI=null;reject(Error('Use os controles do vídeo para reproduzir.'));},12000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);resolve(window.YT);};
  script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timer);script.remove();youtubeAPI=null;reject(Error('Use os controles do vídeo para reproduzir.'));};document.head.append(script);
 });return youtubeAPI;
}
function database(){return new Promise((resolve,reject)=>{const request=indexedDB.open('aethra.music',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Não foi possível abrir o armazenamento de músicas.'));});}
async function fileStore(mode,id,value){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('files',mode),store=tx.objectStore('files');let result;const request=mode==='readonly'?store.get(id):value?store.put(value,id):store.delete(id);request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(Error('Não foi possível salvar o arquivo. Verifique o espaço disponível.'));tx.onabort=tx.onerror;});}finally{db.close();}}
export function initMusic(){
 let tracks=[];try{const saved=JSON.parse(localStorage.getItem('aethra.music.v1'));if(Array.isArray(saved))tracks=saved.filter(t=>t&&typeof t.id==='string'&&typeof t.title==='string'&&['file','youtube'].includes(t.kind));}catch{}
 const root=document.createElement('div');root.className='music-widget';root.innerHTML=`<button type="button" class="music-toggle" aria-label="Abrir player de música" aria-expanded="false">${icon('music')}<span>Música</span><i hidden></i></button><section class="music-panel" aria-label="Player de música" hidden><header><div><small>SEU ESPAÇO SONORO</small><h2>Música para criar</h2></div><button type="button" class="music-close" aria-label="Recolher player">${icon('close')}</button></header><div class="music-stage"></div><div class="music-now" hidden><div><small class="music-provider"></small><strong class="music-current"></strong></div><a class="music-external" target="_blank" rel="noopener noreferrer" aria-label="Abrir música no serviço original">↗</a></div><div class="music-navigation" hidden><button type="button" data-music-prev aria-label="Item anterior da playlist">${icon('previous')}</button><button type="button" class="music-play" aria-label="Reproduzir" disabled>${icon('play')}</button><button type="button" data-music-next aria-label="Próximo item da playlist">${icon('next')}</button></div><div class="music-library-heading"><h3>Minha playlist <span class="music-count">0</span></h3><button type="button" class="music-add-toggle" aria-expanded="false">${icon('plus')}Adicionar</button></div><form class="music-add" hidden><label><span>Link do YouTube</span><input name="url" type="text" inputmode="url" placeholder="Cole o link aqui..." aria-label="Link da música" required></label><input name="title" placeholder="Nome personalizado (opcional)" aria-label="Nome da música" maxlength="120"><button type="submit">Adicionar à playlist</button><small class="music-add-hint">YouTube → Compartilhar → Copiar link. Aceita vídeos e playlists.</small></form><p class="music-status" role="status" aria-live="polite"></p><div class="music-list" aria-label="Faixas da playlist"></div><footer class="music-footer"><button type="button" class="music-import">${icon('upload')}Importar músicas</button><input class="music-file-input" type="file" accept="audio/mpeg,audio/mp3,video/mp4,audio/mp4,.mp3,.mp4,.m4a" multiple hidden><small>MP3 · MP4 · M4A</small></footer><p class="music-help">Reproduza vídeos pelos controles do YouTube. Importe vários arquivos para montar sua playlist neste navegador.</p></section>`;document.body.append(root);
 const $=selector=>root.querySelector(selector),panel=$('.music-panel'),stage=$('.music-stage'),status=$('.music-status'),form=$('.music-add');
 let current='',objectURL='',generation=0,youtubePlayer=null,youtubeFailed=false;
 const tell=message=>status.textContent=message;
 function save(){try{localStorage.setItem('aethra.music.v1',JSON.stringify(tracks));return true;}catch{tell('Armazenamento cheio. Não foi possível salvar a playlist.');return false;}}
 const visibleTracks=()=>tracks;
 function setPlaying(playing){$('.music-play').innerHTML=icon(playing?'pause':'play');$('.music-play').setAttribute('aria-label',playing?'Pausar':'Reproduzir');$('.music-toggle i').hidden=!playing;}
 function emptyStage(){if(current)return;stage.className='music-stage music-stage-empty';stage.innerHTML=`<span class="music-empty-icon">${icon('music')}</span><h3>Uma trilha para sua história</h3><p>Cole um link do YouTube ou importe músicas para sua playlist.</p><button type="button" class="music-empty-add">${icon('plus')}Adicionar do YouTube</button>`;$('.music-empty-add').onclick=()=>showForm(true);}
 function showForm(open){form.hidden=!open;$('.music-add-toggle').setAttribute('aria-expanded',String(open));if(open)form.elements.url.focus();}
 function draw(){
  const list=visibleTracks();$('.music-count').textContent=list.length;
  $('.music-list').innerHTML=list.map(t=>`<div class="music-track ${t.id===current?'active':''}"><button type="button" data-play="${e(t.id)}" aria-label="Abrir ${e(t.title)}" ${t.id===current?'aria-current="true"':''}><span class="music-track-icon ">${icon(t.kind==='youtube'?'play':'music')}</span><span><strong>${e(t.title)}</strong><small>${t.kind==='file'?'Arquivo local':'YouTube'}</small></span>${t.id===current?'<i class="music-selected-dot"></i>':''}</button><button type="button" class="music-remove" data-remove="${e(t.id)}" aria-label="Remover ${e(t.title)} da playlist">${icon('close')}</button></div>`).join('')||`<p class="music-empty">Seus links e arquivos aparecerão aqui.</p>`;
  root.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>play(b.dataset.play));
  root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=async()=>{const track=tracks.find(t=>t.id===b.dataset.remove);if(!track)return;if(current===track.id)stop();tracks=tracks.filter(t=>t!==track);save();draw();if(track.kind==='file')try{await fileStore('readwrite',track.id);}catch{tell('Item removido da playlist.');}});
 }
 function stop(){generation++;youtubeFailed=false;youtubePlayer?.destroy();youtubePlayer=null;stage.querySelector('audio,video')?.pause();stage.replaceChildren();if(objectURL){URL.revokeObjectURL(objectURL);objectURL='';}current='';setPlaying(false);$('.music-now').hidden=true;$('.music-navigation').hidden=true;$('.music-play').disabled=true;emptyStage();}
 async function youtubeFrame(track,verified,request){
  youtubeFailed=false;
  const frame=document.createElement('iframe'),url=new URL(verified.source);url.hostname='www.youtube.com';
  if(!['http:','https:'].includes(location.protocol))throw Error('Abra o projeto pelo Live Server. O YouTube precisa do endereço HTTP do site.');
  url.searchParams.set('origin',location.origin);url.searchParams.set('enablejsapi','1');url.searchParams.set('playsinline','1');
  frame.title=track.title;frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;frame.className='youtube';frame.src=url.href;stage.replaceChildren(frame);
  tell('Preparando vídeo…');
  try{const api=await loadYouTubeAPI();if(request!==generation)return;
   youtubePlayer=new api.Player(frame,{events:{
    onReady:({target})=>{if(request!==generation)return;$('.music-play').disabled=false;tell('Pressione reproduzir para ouvir.');target.playVideo();},
    onStateChange:({data,target})=>{if(request!==generation)return;setPlaying(data===1);if(data===1){tell('Reproduzindo');const title=target.getVideoData()?.title;if(title&&/^Vídeo do YouTube$/.test(track.title)){track.title=title;save();draw();$('.music-current').textContent=title;}}else if(data===3)tell('Carregando áudio…');else if(data===2)tell('Pausado');else if(data===0){if(track.contentType!=='playlist')next(1);}},
    onAutoplayBlocked:()=>{if(request===generation)tell('Pressione reproduzir para iniciar o áudio.');},
    onError:({data})=>{if(request!==generation)return;youtubeFailed=true;setPlaying(false);$('.music-play').disabled=false;$('.music-play').setAttribute('aria-label','Tentar novamente');tell(`YouTube: erro ${data}. `+({100:'Vídeo removido ou privado.',101:'A reprodução incorporada foi recusada pelo YouTube neste navegador.',150:'A reprodução incorporada foi recusada pelo YouTube neste navegador.',153:'O YouTube não identificou a origem do site. Use o Live Server ou o endereço publicado.'}[data]||'Não foi possível reproduzir o vídeo.')+' Tente novamente ou use a seta para abrir no YouTube.');}
   }});
  }catch(error){if(request===generation)tell(error.message);}
 }
 async function play(id){
  const track=tracks.find(t=>t.id===id);if(!track)return;if(current===id&&!youtubeFailed){if(youtubePlayer)youtubePlayer.playVideo();else stage.querySelector('audio,video')?.play().catch(()=>{});return;}
  stop();current=id;const request=++generation;stage.className='music-stage';$('.music-current').textContent=track.title;$('.music-provider').textContent=track.kind==='file'?'ARQUIVO LOCAL':track.kind.toUpperCase();$('.music-now').hidden=false;$('.music-navigation').hidden=false;draw();tell('');
  try{
   if(track.kind==='file'){
    stage.innerHTML='<p>Preparando seu arquivo…</p>';const blob=await fileStore('readonly',track.id);if(request!==generation)return;if(!blob)throw Error('Arquivo indisponível. Importe-o novamente neste navegador.');
    objectURL=URL.createObjectURL(blob);const media=document.createElement(track.video?'video':'audio');media.controls=true;media.src=objectURL;media.onended=()=>{if(request===generation)next(1);};media.onplay=()=>{if(request===generation)setPlaying(true);};media.onpause=()=>{if(request===generation)setPlaying(false);};media.onerror=()=>{if(request===generation)tell('O navegador não conseguiu reproduzir este formato.');};stage.replaceChildren(media);$('.music-external').hidden=true;$('.music-play').disabled=false;media.play().catch(()=>{if(request===generation)tell('Pressione reproduzir para iniciar.');});
   }else{
    const verified=parseMusicLink(track.source);$('.music-external').hidden=false;$('.music-external').href=verified.publicURL;$('.music-external').setAttribute('aria-label','Abrir no YouTube');await youtubeFrame(track,verified,request);
   }
  }catch(error){if(request===generation){stage.innerHTML='<p>Não foi possível abrir esta música.</p>';tell(error.message);}}
 }
 function next(delta){const list=visibleTracks();if(!list.length)return;const index=list.findIndex(t=>t.id===current);play(list[index<0?0:(index+delta+list.length)%list.length].id);}
 function toggle(open){panel.hidden=!open;$('.music-toggle').setAttribute('aria-expanded',String(open));}
 $('.music-toggle').onclick=()=>toggle(panel.hidden);$('.music-close').onclick=()=>toggle(false);$('[data-music-prev]').onclick=()=>next(-1);$('[data-music-next]').onclick=()=>next(1);
 $('.music-play').onclick=()=>{if(youtubeFailed){play(current);return;}if(youtubePlayer){youtubePlayer.getPlayerState()===1?youtubePlayer.pauseVideo():youtubePlayer.playVideo();return;}const media=stage.querySelector('audio,video');if(media)(media.paused?media.play().catch(()=>tell('Use o botão de reprodução do arquivo.')):media.pause());};
 $('.music-add-toggle').onclick=()=>showForm(form.hidden);
 form.onsubmit=async event=>{
  event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;
  try{const data=new FormData(form),parsed=parseMusicLink(data.get('url'));let track=tracks.find(t=>t.kind===parsed.kind&&t.source===parsed.source);if(track){tell('Este conteúdo já está na playlist.');showForm(false);await play(track.id);return;}
   const customTitle=String(data.get('title')).trim();track={id:uid(),title:customTitle||(parsed.contentType==='playlist'?'Playlist do YouTube':'Vídeo do YouTube'),...parsed};tracks.push(track);if(!save()){tracks.pop();return;}
   form.reset();showForm(false);draw();play(track.id);
  }catch(error){tell(error.message);}finally{button.disabled=false;}
 };
 $('.music-import').onclick=()=>$('.music-file-input').click();$('.music-file-input').onchange=async event=>{
  const input=event.target;input.disabled=true;let added=0,failed=0;
  try{for(const file of input.files){if(!/\.(mp3|mp4|m4a)$/i.test(file.name)){failed++;continue;}const id=uid();await fileStore('readwrite',id,file);tracks.push({id,kind:'file',title:file.name.replace(/\.[^.]+$/,''),video:/\.mp4$/i.test(file.name)});if(!save()){tracks.pop();await fileStore('readwrite',id);throw Error('Armazenamento cheio.');}added++;}draw();emptyStage();tell(`${added} arquivo(s) adicionado(s).${failed?' Use arquivos MP3, MP4 ou M4A.':''}`);}catch(error){draw();tell(error.message);}finally{input.disabled=false;input.value='';}
 };
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)toggle(false);});draw();emptyStage();window.addEventListener('pagehide',()=>{if(objectURL)URL.revokeObjectURL(objectURL);});
}
