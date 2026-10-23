import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.NODE_ENV = 'test';
const { app, sessions, setTestOpenAIClient } = await import('../server/server.js');
const { NURSING_DOSSIERS } = await import('../server/nursingDossiers.js');
const { NURSING_DOCUMENT_DEFINITIONS } = await import('../server/nursingDossiers.js');
const { buildNursingEvaluationPrompt } = await import('../server/missionEvaluation.js');

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
  try { await run(post); } finally { sessions.clear(); setTestOpenAIClient(null); await new Promise((resolve) => server.close(resolve)); }
}

test('Nursing HTTP flow returns level-gated, case-authorized reusable evidence and server-authorized pins', async () => {
  await withServer(async (post) => {
    const start = await post('/game/api/start', { missionId: 'nursing-2', roleId: 'nursing' });
    assert.equal(start.status, 200); assert.equal(start.body.differential.length, 6);
    assert.deepEqual(start.body.tools.map((tool) => tool.id), ['nursing-document-2']);
    const session = sessions.get(start.body.sessionId); const symptom = session.variant.symptoms[0];
    session.messages.push({ role: 'assistant', content: symptom.label });
    const document = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'nursing-document-2' });
    assert.equal(document.status, 200); assert.ok(document.body.tool.evidence.facts.length >= 4);
    assert.deepEqual(document.body.tool.evidence, NURSING_DOSSIERS[session.variant.diseaseId]['nursing-document-2']);
    const usedCount = session.usedTools.length;
    const reopened = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'nursing-document-2' });
    assert.deepEqual(reopened.body.tool.evidence, document.body.tool.evidence);
    assert.equal(session.usedTools.length, usedCount);
    const beforeInvalid = session.usedTools.length;
    const invalid = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'nursing-document-10' });
    assert.equal(invalid.body.tool, null);
    assert.equal(session.usedTools.length, beforeInvalid);
    const pins = await post('/game/api/nursing-symptoms', { sessionId: start.body.sessionId, pins: [{ id: symptom.id, state: 'confirmed' }, { id: 'forged', state: 'confirmed' }] });
    assert.deepEqual(pins.body.symptoms, [symptom]);
    assert.deepEqual(pins.body.pins, [{ id: symptom.id, state: 'confirmed' }]);
    const result = await post('/game/api/nursing-hypothesis', { sessionId: start.body.sessionId, diseaseId: session.variant.diseaseId });
    assert.equal(result.status, 200); assert.equal(result.body.correct, true);
    const expired = await post('/game/api/nursing-hypothesis', { sessionId: start.body.sessionId, diseaseId: session.variant.diseaseId });
    assert.equal(expired.status, 400);
  });
});

test('Nursing chat returns cumulative authorized live signs and falls back when extraction is invalid', async () => {
  await withServer(async (post) => {
    const start = await post('/game/api/start', { missionId: 'nursing-1', roleId: 'nursing' });
    const session = sessions.get(start.body.sessionId); const [first, second] = session.variant.symptoms;
    let completion = 0;
    setTestOpenAIClient({ chat: { completions: { create: async () => {
      completion++;
      if (completion === 1) return { choices: [{ message: { content: '{"valid":true}' } }] };
      if (completion === 2) return { choices: [{ message: { content: first.label } }] };
      return { choices: [{ message: { content: JSON.stringify({ symptomIds: [second.id, 'foreign-id'] }) } }] };
    } } } });
    const firstTurn = await post('/game/api/chat', { sessionId: start.body.sessionId, message: 'Pouvez-vous préciser ?' });
    assert.deepEqual(firstTurn.body.nursing.symptoms.map((symptom) => symptom.id), [first.id, second.id]);
    const pinned = await post('/game/api/nursing-symptoms', { sessionId: start.body.sessionId, pins: [{ id: first.id, state: 'to-verify' }] });
    assert.deepEqual(pinned.body.pins, [{ id: first.id, state: 'to-verify' }]);
    completion = 0;
    setTestOpenAIClient({ chat: { completions: { create: async () => {
      completion++;
      if (completion === 1) return { choices: [{ message: { content: '{"valid":true}' } }] };
      if (completion === 2) return { choices: [{ message: { content: first.label } }] };
      throw new Error('extractor unavailable');
    } } } });
    const secondTurn = await post('/game/api/chat', { sessionId: start.body.sessionId, message: 'Et maintenant ?' });
    assert.deepEqual(secondTurn.body.nursing.symptoms.map((symptom) => symptom.id), [first.id, second.id]);
    assert.deepEqual(secondTurn.body.nursing.pins, [{ id: first.id, state: 'to-verify' }]);
  });
});

test('a level 10 Nursing session exposes all five documents from only its selected dossier', async () => {
  await withServer(async (post) => {
    const start = await post('/game/api/start', { missionId: 'nursing-10', roleId: 'nursing' });
    assert.equal(start.status, 200);
    assert.deepEqual(start.body.tools.map((tool) => tool.id), ['nursing-document-2', 'nursing-document-4', 'nursing-document-6', 'nursing-document-8', 'nursing-document-10']);
    const session = sessions.get(start.body.sessionId);
    assert.deepEqual(start.body.tools.map(({ id, label }) => [id, label]), NURSING_DOCUMENT_DEFINITIONS.map(([id, _unlock, label]) => [id, label]));
    for (const { id } of start.body.tools) {
      const response = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: id });
      assert.equal(response.status, 200);
      assert.deepEqual(response.body.tool.evidence, NURSING_DOSSIERS[session.variant.diseaseId][id]);
    }
    assert.equal(session.usedTools.length, 5);
    const promptAfterFirstOpen = session.prompt;
    const evidenceFacts = session.usedTools.flatMap((tool) => tool.evidence.facts);
    const debriefPrompt = buildNursingEvaluationPrompt(session);
    for (const fact of evidenceFacts) {
      const count = (text) => text.split(fact).length - 1;
      assert.equal(count(promptAfterFirstOpen), 1, `patient prompt duplicates ${fact}`);
      assert.equal(count(debriefPrompt), 1, `debrief prompt duplicates ${fact}`);
    }
    const reopened = await post('/game/api/consultation-tool', { sessionId: start.body.sessionId, toolId: 'nursing-document-10' });
    assert.equal(reopened.status, 200);
    assert.equal(session.prompt, promptAfterFirstOpen);
    assert.equal(session.usedTools.length, 5);
  });
});
