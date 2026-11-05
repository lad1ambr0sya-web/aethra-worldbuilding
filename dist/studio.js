import {richText} from './formatting.js';
import {escapeHTML as e,imageURL,world} from './store.js';
import {mountSavedCards} from './character-card.js';
export function studioOverview(w){
 return `<section class="studio-agenda atelier-panel"><div class="section-heading"><div><span class="eyebrow">UM PASSO DE CADA VEZ</span><h2>Próximos passos</h2></div></div><form id="studioTaskForm"><input name="task" placeholder="O que você quer desenvolver?" maxlength="180" required aria-label="Novo próximo passo"><button class="button" type="submit" aria-label="Adicionar próximo passo">＋</button></form><div id="studioTasks"></div></section>`;
}
export function mountStudioTasks(main,w,save,opts){
 const form=main.querySelector('#studioTaskForm'),list=main.querySelector('#studioTasks');if(!form)return;
 if(!Array.isArray(w.overview.tasks))w.overview.tasks=[];
 const draw=()=>{list.innerHTML=w.overview.tasks.map((t,i)=>`<div class="studio-task"><label><input type="checkbox" data-task="${i}" ${t.done?'checked':''}><span>${e(t.text)}</span></label><button type="button" data-remove-task="${i}" aria-label="Remover ${e(t.text)}">×</button></div>`).join('')||'<p class="help">Uma pequena lista para dar direção à sua próxima sessão.</p>';};
 form.addEventListener('submit',ev=>{ev.preventDefault();const text=form.elements.task.value.trim();if(!text)return;w.overview.tasks.push({text,done:false});form.reset();save();draw();},opts);
 list.addEventListener('change',ev=>{if(ev.target.dataset.task===undefined)return;w.overview.tasks[+ev.target.dataset.task].done=ev.target.checked;save();},opts);
 list.addEventListener('click',ev=>{const b=ev.target.closest('[data-remove-task]');if(!b)return;w.overview.tasks.splice(+b.dataset.removeTask,1);save();draw();},opts);draw();
}
export function mountCardTilt(container){
 mountSavedCards(container,[...world().characters,...world().bestiary]);
 if(!matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches)return;
 container.querySelectorAll('.card[data-kind="characters"],.character-list-card').forEach(card=>{
  let frame=0;card.onpointermove=ev=>{if(ev.pointerType==='touch')return;const r=card.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{card.style.setProperty('--tilt-x',`${(0.5-y)*9}deg`);card.style.setProperty('--tilt-y',`${(x-.5)*9}deg`);card.style.setProperty('--glow-x',`${x*100}%`);card.style.setProperty('--glow-y',`${y*100}%`);});};
  card.onpointerleave=()=>{cancelAnimationFrame(frame);card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');};
 });
}
export function characterSheet(item,creature=false){return `<article class="character-sheet"><div class="character-sheet-toolbar"><span class="eyebrow">${creature?'ARQUIVO DA CRIATURA':'ARQUIVO DO PERSONAGEM'}</span><button type="button" class="button ghost" id="expandCharacterSheet" aria-expanded="false">⛶ Expandir ficha</button></div><header class="character-sheet-hero">${imageURL(item.cardAppearance?.front?.image??item.image)?`<img src="${imageURL(item.cardAppearance?.front?.image??item.image)}" alt="${e(item.name)}">`:`<div class="character-monogram">${e(item.name.slice(0,1))}</div>`}<div><span class="eyebrow">${e(item.role||'PERSONAGEM')}</span><h2>${e(item.name)}</h2><div class="character-facts"><span>${e(item.species||'Espécie não definida')}</span><span>${e(item.age||'Idade não definida')}</span></div></div></header><div class="character-sheet-sections">${[[creature?'Descrição e comportamento':'Descrição e personalidade',item.description],[creature?'Habitat e distribuição':'Motivações e desejos',item.motivation],[creature?'Habilidades e fraquezas':'Conflitos e segredos',item.conflict],...(creature?Object.entries(item.beastDetails||{}):[])].map(([label,text])=>`<section><h3>${label}</h3><div class="rich-prose">${richText(text||'Ainda há uma história para descobrir.')}</div></section>`).join('')}</div><button type="button" class="button ghost" id="customizeCharacterCard">✧ Personalizar carta</button><button type="button" class="button" id="editCharacterSheet">Editar ${creature?'criatura':'personagem'}</button></article>`;}

export function mountSheetExpansion(){const button=document.querySelector('#expandCharacterSheet'),dialog=document.querySelector('#modal');if(!button)return;button.onclick=()=>{const open=dialog.classList.toggle('character-sheet-expanded');button.setAttribute('aria-expanded',String(open));button.textContent=open?'⛶ Restaurar ficha':'⛶ Expandir ficha';};dialog.addEventListener('close',()=>dialog.classList.remove('character-sheet-expanded'),{once:true});}
