import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.NODE_ENV = 'test';
const { app, sessions } = await import('../server/server.js');
const { PSYCHOLOGY_POOLS } = await import('../src/data/psychologyCampaign.js');

async function withServer(run) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const post = (path, body) => new Promise((resolve, reject) => {
    const payload = JSON.stringify(body); const request = http.request({ host: '127.0.0.1', port, path, method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } }, (response) => { let raw = ''; response.on('data', (chunk) => { raw += chunk; }); response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(raw) })); }); request.on('error', reject); request.end(payload);
  });
  try { await run(post); } finally { sessions.clear(); await new Promise((resolve) => server.close(resolve)); }
}

test('Psychology start exposes only the exact public cumulative rail', async () => withServer(async (post) => {
  const start = await post('/game/api/start', { missionId: 'psychology-5', roleId: 'psychology' });
  assert.equal(start.status, 200); assert.deepEqual(start.body.differential.map((item) => item.id), PSYCHOLOGY_POOLS[4].motifIds);
  for (const card of start.body.differential) { assert.ok(card.label && card.description); assert.ok(card.signs.length >= 3 && card.signs.length <= 5); assert.equal('requiredOrientation' in card, false); }
  assert.equal((await post('/game/api/start', { missionId: 'psychology-1', roleId: 'nursing' })).status, 400);
}));

test('Dietetics mission start uses the same role-scoped session path', async () => withServer(async (post) => {
  const start = await post('/game/api/start', { missionId: 'dietetics-rhythm-overflow', roleId: 'dietetics' });
  assert.equal(start.status, 200);
  assert.match(start.body.variantId, /^dietetics-rhythm-overflow-case-/);
}));

test('Psychology deterministic seed exists only in the test server', async () => withServer(async (post) => {
  const seeded = await post('/game/api/__test__/psychology-seed', { order: 10, variant: 1 });
  assert.equal(seeded.status, 200); assert.equal(seeded.body.differential.length, 30);
  assert.equal(seeded.body.tools.length, 5); assert.match(seeded.body.variantId, /case-2$/);
}));

test('Psychology supports are level-gated, case-bound, repeatable and forged requests have no effect', async () => withServer(async (post) => {
  const start = await post('/game/api/start', { missionId: 'psychology-9', roleId: 'psychology' }); const session = sessions.get(start.body.sessionId);
  assert.deepEqual(start.body.tools.map((item) => item.id), ['daily-life-journal', 'timeline', 'relationship-map', 'reaction-chain', 'daily-life-fragments']);
  const journal = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'daily-life-journal' });
  assert.equal(journal.status, 200); assert.deepEqual(journal.body.tool.evidence, session.variant.evidence['daily-life-journal']);
  const count = session.usedTools.length; assert.equal((await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'daily-life-journal' })).body.tool.alreadyConsulted, true); assert.equal(session.usedTools.length, count);
  assert.equal((await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'unknown' })).body.tool, null); assert.equal(session.usedTools.length, count);
  const low = await post('/game/api/start', { missionId: 'psychology-1', roleId: 'psychology' }); assert.equal((await post('/game/api/consultation-tool', { sessionId: low.body.sessionId, toolId: 'timeline' })).body.tool, null);
  assert.equal((await post('/game/api/consultation-tool', { sessionId: 'forged', toolId: 'daily-life-journal' })).status, 400);
}));

test('Psychology formulation rejects invented facts and fails safely for invalid or expired sessions', async () => withServer(async (post) => {
  const start = await post('/game/api/start', { missionId: 'psychology-1', roleId: 'psychology' }); const session = sessions.get(start.body.sessionId); const motifId = session.variant.motifId;
  const forged = await post('/game/api/psychology-formulation', { sessionId: start.body.sessionId, motifId, board: ['fait inventé'], nextStep: '' }); assert.equal(forged.status, 400);
  const invalid = await post('/game/api/psychology-formulation', { sessionId: start.body.sessionId, motifId: 'forged', board: [], nextStep: '' }); assert.equal(invalid.status, 400);
  const expired = await post('/game/api/psychology-formulation', { sessionId: 'expired', motifId, board: [], nextStep: '' }); assert.equal(expired.status, 400);
}));

test('Psychology formulation accepts a displayed support fact and scores the final motif like Nursing', async () => withServer(async (post) => {
  const start = await post('/game/api/start', { missionId: 'psychology-1', roleId: 'psychology' });
  const session = sessions.get(start.body.sessionId);
  const journal = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'daily-life-journal' });
  const entry = journal.body.tool.evidence.entries[0];
  const result = await post('/game/api/psychology-formulation', {
    sessionId: start.body.sessionId,
    motifId: session.variant.motifId,
    board: [`${entry.moment} : ${entry.text}`],
    nextStep: '',
  });
  assert.equal(result.status, 200);
  assert.deepEqual({ mastery: result.body.mastery, total: result.body.total }, { mastery: true, total: 100 });
}));
