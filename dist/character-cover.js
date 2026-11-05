import {imageFile,imageURL,escapeHTML as e} from './store.js';
import {defaultThemeCover} from './theme-covers.js';
export function mountCharacterCover(item,{save,notify}){
 const hero=document.querySelector('.character-sheet-hero');if(!hero)return;
 const image=document.createElement('img');image.className='character-cover-image';image.alt='Capa da ficha';hero.prepend(image);
 const controls=document.createElement('div');controls.className='character-cover-controls';controls.innerHTML=`<button type="button" class="button ghost" id="characterCoverToggle" aria-expanded="false">▧ Trocar capa</button><div class="character-cover-menu" hidden><strong>Capa da ficha</strong><label class="button ghost">Carregar imagem<input type="file" accept="image/*" aria-label="Capa personalizada do personagem"></label><small>Ou escolha uma capa padrão</small>${[['sapphire','Safira'],['pond','Lago'],['aurora','Aurora']].map(([key,label])=>`<button type="button" data-character-cover="${key}"><img src="${defaultThemeCover(key)}" alt=""><span>${label}</span></button>`).join('')}<button type="button" data-character-cover="none">Remover capa</button></div>`;hero.append(controls);
 const menu=controls.querySelector('.character-cover-menu'),toggle=controls.querySelector('#characterCoverToggle');
 function apply(){const src=['sapphire','pond','aurora'].includes(item.sheetCoverMode)?defaultThemeCover(item.sheetCoverMode):item.sheetCoverMode==='custom'?imageURL(item.sheetCoverImage):'';image.hidden=!src;if(src)image.src=src;hero.classList.toggle('has-character-cover',!!src);controls.querySelectorAll('[data-character-cover]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.characterCover===item.sheetCoverMode)));}
 toggle.onclick=()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));};
 const close=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');};
 controls.querySelectorAll('[data-character-cover]').forEach(b=>b.onclick=()=>{item.sheetCoverMode=b.dataset.characterCover;save();apply();close();});
 controls.querySelector('input').onchange=async event=>{const input=event.target,file=input.files[0];if(!file)return;input.disabled=true;try{const src=await imageFile(file);item.sheetCoverImage=src;item.sheetCoverMode='custom';save();apply();close();notify('Capa da ficha atualizada.');}catch(error){notify(error.message);}finally{input.disabled=false;input.value='';}};
 controls.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();event.stopPropagation();close();toggle.focus();}});apply();
}
