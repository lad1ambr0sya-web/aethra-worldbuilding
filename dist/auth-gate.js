const config = window.AETHRA_AUTH_CONFIG || {};
const gate = document.querySelector('#authGate');
const sessionKey = 'aethra.auth.session.v1';
let activeSession = null;
let activeUserKey = '';
let saveTimer = 0;
let syncPromise = null;
let syncAgain = false;

function showGate(message = '', error = false) {
  document.body.classList.add('auth-required');
  gate.hidden = false;
  gate.innerHTML = `<section class="auth-card"><div class="auth-mark"><span aria-hidden="true">✧</span> Aethra · Ateliê de mundos</div><span class="eyebrow">UM ESPAÇO SÓ SEU</span><h1>Entre no seu universo</h1><p>Use o e-mail e a senha da conta que recebeu do administrador.</p><form id="authForm"><label>E-mail<input name="email" type="email" autocomplete="username" required maxlength="254"></label><label>Senha<input name="password" type="password" autocomplete="current-password" required minlength="8"></label><button type="submit">Entrar no Aethra</button></form><p class="auth-message" id="authMessage" role="status" aria-live="polite"></p></section>`;
  gate.querySelector('#authForm').onsubmit = signIn;
  setMessage(message, error);
}

function setMessage(message, error = false) {
  const el = gate.querySelector('#authMessage');
  if (el) { el.textContent = message; el.dataset.error = String(error); }
}

function endpoint(path) { return `${String(config.url).replace(/\/$/, '')}${path}`; }
function headers(token) { return { apikey: config.anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }; }
function safeError(data, fallback) {
  const message = String(data?.msg || data?.message || data?.error_description || data?.error || fallback);
  if (/invalid login credentials|invalid email or password/i.test(message)) return 'E-mail ou senha incorretos. Se ainda não recebeu acesso, peça ao administrador para criar sua conta.';
  if (/email not confirmed/i.test(message)) return 'Confirme o endereço de e-mail pelo convite que recebeu.';
  return message.slice(0, 240);
}

async function signIn(event) {
  event.preventDefault();
  const form = event.currentTarget, button = form.querySelector('button');
  button.disabled = true; setMessage('Verificando seu acesso…');
  try {
    const response = await fetch(endpoint('/auth/v1/token?grant_type=password'), {
      method: 'POST', headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.elements.email.value.trim(), password: form.elements.password.value })
    });
    const result = await response.json();
    if (!response.ok || !result.access_token || !result.user?.id) throw Error(safeError(result, 'Não foi possível entrar.'));
    const session = { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + Number(result.expires_in || 3600) * 1000, user: result.user };
    localStorage.setItem(sessionKey, JSON.stringify(session));
    await openWorkspace(session);
  } catch (error) { setMessage(error.message || 'Falha de conexão. Tente novamente.', true); button.disabled = false; }
}

async function refreshSession(session) {
  if (!session?.refresh_token || Date.now() < Number(session.expires_at || 0) - 60000) return session;
  const response = await fetch(endpoint('/auth/v1/token?grant_type=refresh_token'), { method: 'POST', headers: { apikey: config.anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw Error('Sua sessão expirou. Entre novamente.');
  const next = { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + Number(result.expires_in || 3600) * 1000, user: result.user || session.user };
  localStorage.setItem(sessionKey, JSON.stringify(next));
  return next;
}

async function workspaceRequest(session, method = 'GET', data = null) {
  const query = method === 'GET' ? `?user_id=eq.${encodeURIComponent(session.user.id)}&select=data` : '?on_conflict=user_id';
  const response = await fetch(endpoint(`/rest/v1/aethra_workspaces${query}`), {
    method, headers: { ...headers(session.access_token), ...(method === 'POST' ? { Prefer: 'resolution=merge-duplicates,return=minimal' } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {})
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw Error(response.status === 404 || body.code === '42P01' ? 'A tabela ainda não foi criada. Execute supabase/schema.sql no SQL Editor do Supabase.' : safeError(body, `Falha ao sincronizar (${response.status}).`));
  }
  return method === 'GET' ? response.json() : null;
}

async function openWorkspace(session) {
  session = await refreshSession(session);
  const data = await workspaceRequest(session);
  const scopedKey = `aethra.v1.user.${session.user.id}`;
  const remote = Array.isArray(data) && data.length ? data[0].data : null;
  let snapshot = remote?.workspace || (Array.isArray(remote?.worlds) ? remote : null);
  if (snapshot && (!Array.isArray(snapshot.worlds) || !snapshot.worlds.length)) throw Error('Os dados salvos desta conta parecem inválidos. Fale com o administrador antes de continuar.');
  if (!snapshot) {
    try { snapshot = JSON.parse(localStorage.getItem(scopedKey) || 'null'); } catch { snapshot = null; }
  }
  let migrateGuest = false;
  if (!snapshot) {
    let guest = null;
    try { guest = JSON.parse(localStorage.getItem('aethra.v1') || 'null'); } catch {}
    if (Array.isArray(guest?.worlds) && guest.worlds.length && confirm('Encontramos um espaço Aethra salvo neste navegador. Deseja transferi-lo para esta conta?')) {
      snapshot = guest; migrateGuest = true;
    }
  }
  activeSession = session;
  activeUserKey = scopedKey;
  window.AETHRA_USER_NAMESPACE = session.user.id;
  const localMusicKey = `aethra.music.v1.user.${session.user.id}`;
  let localTracks = [];
  try { localTracks = JSON.parse(localStorage.getItem(localMusicKey) || '[]').filter(track => track?.kind === 'file'); } catch {}
  const remoteTracks = remote && Array.isArray(remote.music) ? remote.music.filter(track => track?.kind === 'youtube') : [];
  let guestTracks = [];
  if (migrateGuest) try { guestTracks = JSON.parse(localStorage.getItem('aethra.music.v1') || '[]').filter(track => track?.kind === 'youtube'); } catch {}
  try {
    const playlist = JSON.stringify([...remoteTracks, ...guestTracks, ...localTracks]);
    localStorage.setItem('aethra.music.v1', playlist);
    localStorage.setItem(localMusicKey, playlist);
  } catch {}
  if (snapshot) localStorage.setItem('aethra.v1', JSON.stringify(snapshot));
  else localStorage.removeItem('aethra.v1');
  localStorage.setItem(sessionKey, JSON.stringify(session));
  gate.hidden = true;
  document.body.classList.remove('auth-required');
  if (!window.__aethraAppLoaded) {
    window.__aethraAppLoaded = true;
    await import('./app.js?v=user-accounts-1');
    const { save } = await import('./store.js');
    save();
  }
  const status = document.createElement('div');
  status.id = 'cloudStatus'; status.hidden = true; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  document.body.append(status);
  const profile = document.querySelector('#profileButton');
  if (profile) {
    const name = session.user.user_metadata?.display_name || session.user.email || 'Conta Aethra';
    profile.title = `${name} · Sair`;
    profile.setAttribute('aria-label', `Sair da conta ${name}`);
    profile.onclick = signOut;
  }
  syncLocalCopy();
}

function syncLocalCopy(snapshot = localStorage.getItem('aethra.v1')) {
  if (!activeUserKey || !snapshot) return;
  try { localStorage.setItem(activeUserKey, snapshot); } catch {}
  try { localStorage.setItem(`aethra.music.v1.user.${activeSession.user.id}`, localStorage.getItem('aethra.music.v1') || '[]'); } catch {}
}

function showCloudStatus(message, error = false) {
  const el = document.querySelector('#cloudStatus');
  if (!el) return;
  el.textContent = message; el.dataset.error = String(error); el.hidden = false;
  clearTimeout(el.hideTimer);
  if (!error && message === 'Sincronizado na nuvem') el.hideTimer = setTimeout(() => { el.hidden = true; }, 2400);
}

async function flushSave() {
  if (!activeSession) return;
  if (syncPromise) { syncAgain = true; return syncPromise; }
  syncPromise = (async () => {
    do {
      syncAgain = false;
      const session = await refreshSession(activeSession);
      activeSession = session;
      const raw = localStorage.getItem('aethra.v1');
      if (!raw) return;
      syncLocalCopy(raw); showCloudStatus('Salvando na nuvem…');
      let music = [];
      try { music = JSON.parse(localStorage.getItem('aethra.music.v1') || '[]').filter(track => track?.kind === 'youtube'); } catch {}
      await workspaceRequest(session, 'POST', { user_id: session.user.id, data: { workspace: JSON.parse(raw), music }, updated_at: new Date().toISOString() });
    } while (syncAgain);
    showCloudStatus('Sincronizado na nuvem');
  })().catch(error => {
    showCloudStatus(`Cópia local salva; nuvem pendente. ${error.message}`, true);
    clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 8000);
  }).finally(() => { syncPromise = null; });
  return syncPromise;
}

function signOut() {
  if (!activeSession) return;
  if (!confirm('Sair da sua conta Aethra? As alterações locais já salvas serão sincronizadas antes de sair.')) return;
  clearTimeout(saveTimer);
  flushSave().finally(async () => {
    try { await fetch(endpoint('/auth/v1/logout'), { method: 'POST', headers: headers(activeSession.access_token) }); } catch {}
    localStorage.removeItem('aethra.v1'); localStorage.removeItem('aethra.music.v1'); localStorage.removeItem(sessionKey);
    activeSession = null; activeUserKey = '';
    location.reload();
  });
}

window.addEventListener('aethra:save', event => {
  if (!activeSession) return;
  syncLocalCopy(event.detail?.snapshot);
  clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 900);
});
window.addEventListener('aethra:music-save', () => {
  if (!activeSession) return;
  syncLocalCopy(); clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 900);
});
window.addEventListener('pagehide', () => { syncLocalCopy(); if (activeSession) flushSave(); });

async function start() {
  if (!config.required) { await import('./app.js'); return; }
  document.body.classList.add('auth-required');
  if (!/^https:\/\//i.test(config.url || '') && !/^http:\/\/localhost(?::\d+)?$/i.test(config.url || '') || !config.anonKey) {
    showGate('O login ainda não foi configurado. Preencha as variáveis AETHRA_SUPABASE_URL e AETHRA_SUPABASE_ANON_KEY no GitHub Actions.', true);
    gate.querySelector('form')?.remove(); return;
  }
  let session = null;
  try { session = JSON.parse(localStorage.getItem(sessionKey) || 'null'); } catch {}
  if (session?.refresh_token && session?.user?.id) {
    try { await openWorkspace(session); return; }
    catch (error) { localStorage.removeItem(sessionKey); localStorage.removeItem('aethra.v1'); showGate(error.message, true); return; }
  }
  showGate();
}

start().catch(error => { showGate(error.message || 'Não foi possível iniciar o login.', true); gate.querySelector('form')?.remove(); });
