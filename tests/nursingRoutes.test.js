import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.NODE_ENV = 'test';
const { app, sessions } = await import('../server/server.js');

async function withServer(run) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const post = (path, body) => new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = http.request({ host: '127.0.0.1', port, path, method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } }, (response) => {
      let raw = ''; response.on('data', (chunk) => { raw += chunk; }); response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(raw) }));
    }); request.on('error', reject); request.end(payload);
  });
  try { await run(post); } finally { sessions.clear(); await new Promise((resolve) => server.close(resolve)); }
}

test('Nursing HTTP flow returns role-specific data, reusable evidence and server-authorized pins', async () => {
  await withServer(async (post) => {
    const start = await post('/game/api/start', { missionId: 'nursing-2', roleId: 'nursing' });
    assert.equal(start.status, 200); assert.equal(start.body.differential.length, 6);
    assert.deepEqual(start.body.tools.map((tool) => tool.id), ['nursing-document-2']);
    const session = sessions.get(start.body.sessionId); const symptom = session.variant.symptoms[0];
    session.messages.push({ role: 'assistant', content: symptom.label });
    const document = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'nursing-document-2' });
    assert.equal(document.status, 200); assert.ok(document.body.tool.evidence.facts.length >= 4);
    const pins = await post('/game/api/nursing-symptoms', { sessionId: start.body.sessionId, pins: [{ id: symptom.id, state: 'confirmed' }, { id: 'forged', state: 'confirmed' }] });
    assert.deepEqual(pins.body.pins, [{ id: symptom.id, state: 'confirmed' }]);
    const result = await post('/game/api/nursing-hypothesis', { sessionId: start.body.sessionId, diseaseId: session.variant.diseaseId });
    assert.equal(result.status, 200); assert.equal(result.body.correct, true);
    const expired = await post('/game/api/nursing-hypothesis', { sessionId: start.body.sessionId, diseaseId: session.variant.diseaseId });
    assert.equal(expired.status, 400);
  });
});
