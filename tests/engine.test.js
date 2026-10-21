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
