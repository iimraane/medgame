import test from 'node:test';
import assert from 'node:assert/strict';
const store = new Map();
globalThis.localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) };
globalThis.document = { cookie: '' };
const { default: GameEngine } = await import('../src/game/engine.js');
function startResponse() { return { sessionId: 'session-1', patient: { name: { fullName: 'Samira' }, opening: 'Bonjour.' } }; }
test('completion serializes recorded actions to server evaluation', async () => {
  let evaluationBody;
  globalThis.fetch = async (_url, options) => { const body = JSON.parse(options.body); if (body.missionId) return { json: async () => startResponse() }; evaluationBody = body; return { json: async () => ({ scores: { foodHistory: 80, context: 80, communication: 80, safePlan: 80 }, total: 80, mastery: true, safetyAcknowledged: true, evidence: {}, improvement: 'OK' }) }; };
  const engine = new GameEngine(); await engine.startMission('dietetics-rhythm-overflow'); engine.recordAction('goal'); await engine.finishMission();
  assert.equal(evaluationBody.actions, undefined);
});
test('evaluation failure uses a non-mastering offline fallback', async () => {
  globalThis.fetch = async (_url, options) => JSON.parse(options.body).missionId ? { json: async () => startResponse() } : { json: async () => ({ error: 'offline' }) };
  const engine = new GameEngine(); await engine.startMission('dietetics-rhythm-overflow'); let result; engine.onFinish = (value) => { result = value; }; await engine.finishMission();
  assert.equal(result.mastery, false); assert.equal(result.total, 0);
});
test('finish is ignored while a message is pending', async () => {
  const engine = new GameEngine(); engine.isWaiting = true; await engine.finishMission(); assert.equal(engine.isFinished, false);
});
test('Nursing chat payload updates the live-sign callback without a follow-up request', async () => {
  const symptoms = [{ id: 'sign-1', label: 'Signe autorisé' }]; let requests = 0;
  globalThis.fetch = async (_url, options) => {
    requests++;
    const body = JSON.parse(options.body);
    if (body.missionId) return { json: async () => ({ ...startResponse(), differential: [], tools: [] }) };
    return { json: async () => ({ message: 'Réponse fictive.', nursing: { symptoms, pins: [{ id: 'sign-1', state: 'confirmed' }] } }) };
  };
  const engine = new GameEngine(); await engine.startMission('nursing-1'); let received;
  engine.onNursingSymptoms = (found, pins) => { received = { found, pins }; };
  await engine.sendDoctorMessage('Pouvez-vous préciser ?');
  assert.equal(requests, 2);
  assert.deepEqual(received, { found: symptoms, pins: [{ id: 'sign-1', state: 'confirmed' }] });
  assert.deepEqual(engine.symptomPins, [{ id: 'sign-1', state: 'confirmed' }]);
});
