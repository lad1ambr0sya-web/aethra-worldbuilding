export function publicConfig(url, key) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
    throw Error('Use somente o URL HTTPS do projeto, sem credenciais ou parâmetros.');
  }
  let publicKey = /^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key);
  if (!publicKey && /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(key)) {
    try { publicKey = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon'; } catch {}
  }
  if (!publicKey) throw Error('Deploy bloqueado: use uma chave publishable/anon. Chaves administrativas não podem ir ao navegador.');
  return {required: true, url: parsed.origin, anonKey: key};
}
