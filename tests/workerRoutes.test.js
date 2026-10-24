import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { ConsultationSession, badOrigin, checkRateLimit, resetRateLimits, startSession } from '../worker/index.js';

function storage() {
  const entries = new Map();
  return {
    entries,
    get: async (key) => entries.get(key), put: async (key, value) => entries.set(key, value),
    deleteAll: async () => entries.clear(), setAlarm: async () => {},
  };
}

function durableContext(sessionStorage = storage()) {
  let tail = Promise.resolve();
  return { storage: sessionStorage, blockConcurrencyWhile: (work) => { const next = tail.then(work, work); tail = next.catch(() => {}); return next; } };
}

function durableBinding(env) {
  const objects = new Map();
  return {
    idFromName: (name) => name,
    get: (id) => {
      if (!objects.has(id)) objects.set(id, new ConsultationSession(durableContext(), env));
      const object = objects.get(id);
      return { fetch: (input, init) => object.fetch(input instanceof Request ? input : new Request(input, init)) };
    },
    objects,
  };
}

test('Worker rejects a foreign API origin before any session work', async () => {
  const request = new Request('https://alimni.tv/api/start', { method: 'POST', headers: { origin: 'https://foreign.example', 'content-type': 'application/json' }, body: '{}' });
  assert.equal(badOrigin(request), true);
  const response = await worker.fetch(request, { ASSETS: { fetch: () => { throw new Error('static assets must not run'); } } });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'Origine non autorisée.' });
});

test('Worker keeps assets and API at the same custom-domain origin', async () => {
  const expected = new Response('asset');
  const request = new Request('https://alimni.tv/assets/app.js');
  const response = await worker.fetch(request, { ASSETS: { fetch: async (received) => { assert.equal(received.url, request.url); return expected; } } });
  assert.equal(await response.text(), 'asset');
});

test('Durable session expires and missing OpenAI credentials stay server-side', async () => {
  const sessionStorage = storage();
  const instance = new ConsultationSession(durableContext(sessionStorage), {});
  const started = startSession({ missionId: 'nursing-1', roleId: 'nursing' });
  await instance.fetch(new Request('https://session/init', { method: 'POST', body: JSON.stringify(started.session) }));
  const missingSecret = await instance.fetch(new Request('https://session/api/chat', { method: 'POST', body: JSON.stringify({ message: 'Bonjour' }) }));
  assert.equal(missingSecret.status, 400);
  assert.deepEqual(await missingSecret.json(), { error: 'Clé API OpenAI non configurée sur le serveur.' });
  const saved = await sessionStorage.get('session'); saved.createdAt = Date.now() - (61 * 60 * 1000); await sessionStorage.put('session', saved);
  const expired = await instance.fetch(new Request('https://session/api/evaluate', { method: 'POST', body: '{}' }));
  assert.equal(expired.status, 400);
  assert.deepEqual(await expired.json(), { error: 'Session expirée ou invalide.' });
});

test('Worker forwards a Nursing session lifecycle through its Durable Object', async () => {
  const env = { ASSETS: { fetch: async () => new Response('asset') } };
  env.SESSIONS = durableBinding(env);
  const start = await worker.fetch(new Request('https://alimni.tv/api/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ missionId: 'nursing-10', roleId: 'nursing' }) }), env);
  assert.equal(start.status, 200);
  const session = await start.json();
  const tool = await worker.fetch(new Request('https://alimni.tv/api/consultation-tool', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: session.sessionId, toolId: 'nursing-document-10' }) }), env);
  assert.equal(tool.status, 200);
  assert.equal((await tool.json()).tool.id, 'nursing-document-10');
  const stored = await env.SESSIONS.objects.get(session.sessionId).ctx.storage.get('session');
  assert.equal('mission' in stored, false);
  assert.equal('variant' in stored, false);
  assert.ok(Buffer.byteLength(JSON.stringify(stored)) < 20_000);
  const hypothesis = await worker.fetch(new Request('https://alimni.tv/api/nursing-hypothesis', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: session.sessionId, diseaseId: stored.variantId.split('-case-')[0].split(/^\d+-/)[1] }) }), env);
  assert.equal(hypothesis.status, 200);
});

test('rate tracking expires old entries and remains bounded', () => {
  resetRateLimits();
  assert.equal(checkRateLimit('old', 0), true);
  for (let index = 0; index < 10_100; index += 1) assert.equal(checkRateLimit(`ip-${index}`, 61_000), true);
  // The old address was evicted on the first insertion after its window.
  assert.equal(checkRateLimit('old', 61_000), true);
  resetRateLimits();
});

test('Durable Object serializes overlapping mutations and bounds Nursing extraction', async () => {
  const sessionStorage = storage();
  const instance = new ConsultationSession(durableContext(sessionStorage), {});
  const started = startSession({ missionId: 'nursing-2', roleId: 'nursing' });
  await instance.fetch(new Request('https://session/init', { method: 'POST', body: JSON.stringify(started.session) }));
  await Promise.all(['a', 'b'].map(() => instance.fetch(new Request('https://session/api/consultation-tool', { method: 'POST', body: JSON.stringify({ toolId: 'nursing-document-2' }) }))));
  assert.equal((await sessionStorage.get('session')).usedTools.length, 1);
  instance.chat = async (_messages, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  const hydrated = instance.hydrate(await sessionStorage.get('session'));
  const startedAt = Date.now();
  assert.deepEqual(await instance.extractNursingSymptoms(hydrated, 'Texte lent'), []);
  assert.ok(Date.now() - startedAt >= 2_900);
});

test('gallery assets use root URLs and exist in the Vite public manifest', async () => {
  const { useConsultationTool } = await import('../server/missions.js');
  const { getServerMission, chooseVariant } = await import('../server/missions.js');
  const gallery = useConsultationTool(chooseVariant(getServerMission('dietetics-rhythm-overflow')), 'gallery');
  for (const image of gallery.evidence.images) {
    assert.match(image.src, /^\/assets\/dietetics\//);
    await import('node:fs/promises').then((fs) => fs.access(new URL(`../src/public${image.src}`, import.meta.url)));
  }
});

test('Wrangler configuration binds static assets, Durable Object sessions, and alimni.tv', async () => {
  const config = await import('node:fs/promises').then((fs) => fs.readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.match(config, /"directory": "\.\/dist"/);
  assert.match(config, /"class_name": "ConsultationSession"/);
  assert.match(config, /"pattern": "alimni\.tv"/);
  assert.match(config, /"required": \["OPENAI_API_KEY"\]/);
});
