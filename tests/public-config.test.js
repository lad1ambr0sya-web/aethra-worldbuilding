import test from 'node:test';
import assert from 'node:assert/strict';
import {publicConfig} from '../scripts/public-config.mjs';
const url = 'https://example.supabase.co';
const jwt = role => ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({role})).toString('base64url'), 'test_signature'].join('.');
test('only public browser keys are accepted by the deploy', () => {
  assert.equal(publicConfig(url, 'sb_publishable_' + 'x'.repeat(24)).required, true);
  assert.equal(publicConfig(url, jwt('anon')).url, url);
  for (const key of ['sb_secret_' + 'x'.repeat(24), jwt('service_role'), jwt('authenticated'), 'not-a-public-key']) {
    assert.throws(() => publicConfig(url, key), /Deploy bloqueado/);
  }
});
test('deployment URLs cannot carry credentials or unsafe protocols', () => {
  for (const value of ['http://example.supabase.co', 'https://user:pass@example.supabase.co', url + '?token=example', url + '/private']) {
    assert.throws(() => publicConfig(value, 'sb_publishable_' + 'x'.repeat(24)));
  }
});
