import {writeFile} from 'node:fs/promises';

const url = String(process.env.AETHRA_SUPABASE_URL || '').trim();
const anonKey = String(process.env.AETHRA_SUPABASE_ANON_KEY || '').trim();
if (!/^https:\/\//i.test(url) || !anonKey) {
  throw new Error('Configure AETHRA_SUPABASE_URL e AETHRA_SUPABASE_ANON_KEY nas variáveis do repositório antes de publicar.');
}
const config = {required: true, url: url.replace(/\/$/, ''), anonKey};
await writeFile(new URL('../dist/auth-config.js', import.meta.url), `window.AETHRA_AUTH_CONFIG = ${JSON.stringify(config)};\n`, 'utf8');
