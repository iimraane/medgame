import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { MISSIONS } from '../src/data/missions.js';
import { CASES, MASTERY_THRESHOLD, applyScreening, chooseArchetype, evaluateServerMission, getPresentation, getScreeningOptions } from '../server/missions.js';
import { DEFAULT_OPENAI_MODEL, buildMissionPatientPrompt, getOpenAIModel } from '../server/missionPatient.js';
import { PATIENT_TRAITS, chooseNonVerbalCue, choosePatientTraits } from '../server/patientTraits.js';
import { MISSION_EVALUATION_SCHEMA, buildMissionEvaluationPrompt, normalizeMissionEvaluation } from '../server/missionEvaluation.js';

test('all ten client and server mission ids, orders, and screening ids form a complete contract', () => {
  assert.equal(MISSIONS.length, 10);
  assert.deepEqual(MISSIONS.map(({ id }) => id), Object.keys(CASES));
  assert.deepEqual(MISSIONS.map(({ order }) => order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (const mission of Object.values(CASES)) {
    const screens = getScreeningOptions(mission);
    assert.ok(screens.length >= 2);
    assert.equal(new Set(screens.map((screen) => screen.id)).size, screens.length);
    assert.ok(screens.every((screen) => screen.id.startsWith(`${mission.id}-`)));
  }
});
test('browser-safe cards contain no objectives, rubrics, safety answers or server truth', () => {
  for (const mission of MISSIONS) assert.deepEqual(Object.keys(mission).sort(), ['icon', 'id', 'order', 'roleId', 'summary', 'title']);
  const clientMissionSource = fs.readFileSync(new URL('../src/data/missions.js', import.meta.url), 'utf8').toLowerCase();
  assert.doesNotMatch(clientMissionSource, /objective|rubric|requiredaction|orientation|baselinefacts|releasemap/);
});
test('each archetype has a distinct opening, baseline facts, and controlled release map', () => {
  for (const mission of Object.values(CASES)) {
    const openings = new Set();
    for (const archetype of ['flagrant', 'subtle', 'mixed', 'contextual']) {
      const presentation = getPresentation(mission, archetype);
      openings.add(presentation.opening);
      assert.ok(presentation.baselineFacts.length >= 2);
      assert.deepEqual(Object.keys(presentation.releaseMap), mission.screens.map((screen) => screen.id));
      const screen = mission.screens[0];
      assert.equal(applyScreening(mission, archetype, screen.id).observation, presentation.releaseMap[screen.id]);
    }
    assert.equal(openings.size, 4);
  }
});
test('unknown or duplicate screening gives no new observation or score', () => {
  for (const mission of Object.values(CASES)) {
    const screen = mission.screens[0];
    assert.equal(applyScreening(mission, 'subtle', 'unknown-screen'), null);
    const first = applyScreening(mission, 'subtle', screen.id);
    assert.ok(first);
    assert.equal(applyScreening(mission, 'subtle', screen.id, [screen.id]), null);
    assert.equal(getScreeningOptions(mission, [screen.id]).some((item) => item.id === screen.id), false);
  }
});
test('conversation credit is server-event based, not transcript keyword matching', () => {
  const mission = CASES['dietetics-rhythm-overflow'];
  const screens = mission.screens;
  const pasted = 'foodHistory context communication safePlan rubric objectif orientation';
  assert.deepEqual(evaluateServerMission(mission.id, pasted, [], []).scores, evaluateServerMission(mission.id, '', [], []).scores);
  const greeting = evaluateServerMission(mission.id, '', [], [], [{ type: 'validated-patient-turn', axes: ['foodHistory', 'communication'] }]);
  assert.equal(greeting.scores.context, 0); assert.equal(greeting.scores.safePlan, 0);
  assert.ok(greeting.total > 0);
  assert.equal(evaluateServerMission(mission.id, '', [], screens, []).total > 0, true);
});
test('screening API lifecycle records only server session evidence and actions', async () => {
  process.env.NODE_ENV = 'test';
  const { app, sessions } = await import('../server/server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/game/api`;
  const post = async (path, body) => (await fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
  const start = async () => post('/start', { missionId: 'dietetics-eating-difficult', roleId: 'dietetics' });
  try {
    const first = await start(); const mission = CASES['dietetics-eating-difficult'];
    assert.equal(sessions.get(first.sessionId).messages[0].role, 'assistant');
    assert.equal(sessions.get(first.sessionId).messages[0].content, first.patient.opening);
    assert.equal((await post('/screening', { sessionId: first.sessionId, screeningId: 'unknown' })).observation, null);
    const firstScreen = mission.screens[0].id;
    assert.ok((await post('/screening', { sessionId: first.sessionId, screeningId: firstScreen })).observation);
    assert.equal((await post('/screening', { sessionId: first.sessionId, screeningId: firstScreen })).observation, null);
    sessions.get(first.sessionId).interactionEvents.push({ type: 'validated-patient-turn', axes: ['foodHistory', 'communication'] }, { type: 'validated-patient-turn', axes: ['context', 'safePlan'] });
    const forged = await post('/evaluate', { sessionId: first.sessionId, actions: ['orientation'] });
    assert.equal(forged.safetyAcknowledged, false); assert.equal(forged.mastery, false);

    const second = await start();
    for (const screen of mission.screens) assert.ok((await post('/screening', { sessionId: second.sessionId, screeningId: screen.id })).observation);
    sessions.get(second.sessionId).interactionEvents.push({ type: 'validated-patient-turn', axes: ['foodHistory', 'communication'] }, { type: 'validated-patient-turn', axes: ['context', 'safePlan'] });
    const verified = await post('/evaluate', { sessionId: second.sessionId, actions: [] });
    assert.equal(verified.safetyAcknowledged, true); assert.equal(verified.mastery, true);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
test('both safety gates reject forged client actions and accept only stored server actions', () => {
  const serverSource = fs.readFileSync(new URL('../server/server.js', import.meta.url), 'utf8');
  assert.match(serverSource, /const \{ sessionId \} = req\.body;/);
  assert.match(serverSource, /session\.actions, session\.usedScreenings, session\.interactionEvents/);
  for (const id of ['dietetics-eating-difficult', 'dietetics-incomplete-file']) {
    const mission = CASES[id];
    assert.equal(evaluateServerMission(id, '', [], mission.screens, [{ type: 'validated-patient-turn' }]).mastery, false);
    assert.equal(evaluateServerMission(id, '', ['orientation'], mission.screens, [{ type: 'validated-patient-turn' }]).safetyAcknowledged, true);
  }
});
test('patient role protocol and model configuration are deterministic and client-safe', () => {
  const mission = CASES['dietetics-afternoon-dip'];
  assert.notEqual(chooseArchetype(mission, () => 0), chooseArchetype(mission, () => .9));
  const traits = choosePatientTraits(() => 0);
  assert.equal(new Set(traits.map(({ id }) => id)).size, 2);
  assert.ok(PATIENT_TRAITS.length >= 18);
  assert.match(chooseNonVerbalCue(traits, () => 0), /^\*.+\*$/);
  const prompt = buildMissionPatientPrompt(mission, 'subtle', [], traits);
  assert.match(prompt, /première personne/); assert.match(prompt, /Refuse calmement/); assert.match(prompt, /ni conseil diététique/); assert.match(prompt, /MÉMOIRE ET NATUREL/); assert.match(prompt, /CONTEXTE PRIVÉ COMPLET/);
  for (const fact of Object.values(getPresentation(mission, 'subtle').releaseMap)) assert.match(prompt, new RegExp(fact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(DEFAULT_OPENAI_MODEL, 'gpt-5.6-luna'); assert.equal(getOpenAIModel({}), DEFAULT_OPENAI_MODEL); assert.equal(getOpenAIModel({ OPENAI_MODEL: 'custom-model' }), 'custom-model');
  const serverSource = fs.readFileSync(new URL('../server/server.js', import.meta.url), 'utf8');
  assert.match(serverSource, /max_completion_tokens: 80/); assert.match(serverSource, /max_completion_tokens: 500/);
});
test('debrief remains client-safe generic evidence', () => {
  const source = fs.readFileSync(new URL('../src/ui/debrief.js', import.meta.url), 'utf8');
  assert.match(source, /evidence\?\.message/);
  assert.doesNotMatch(source, /matched|missing|rubric|requiredAction/);
});
test('patient action cues are rendered as safe italic text rather than injected HTML', () => {
  const source = fs.readFileSync(new URL('../src/ui/chat.js', import.meta.url), 'utf8');
  assert.match(source, /message__cue/);
  assert.match(source, /document\.createTextNode/);
  assert.match(source, /supportsCues/);
});
test('the debrief wait state is visible while evaluation runs and no educational-medical label remains in the UI', () => {
  const chat = fs.readFileSync(new URL('../src/ui/chat.js', import.meta.url), 'utf8');
  const debrief = fs.readFileSync(new URL('../src/ui/debrief.js', import.meta.url), 'utf8');
  const menu = fs.readFileSync(new URL('../src/ui/menu.js', import.meta.url), 'utf8');
  assert.match(chat, /Préparation du débrief/); assert.match(chat, /onEvaluating/); assert.match(chat, /debrief-loading/);
  assert.doesNotMatch(`${chat}${debrief}${menu}`.toLowerCase(), /éducative|educative|simulation médicale/);
});
test('AI debrief evaluates the complete server transcript with a strict, safe schema', () => {
  const mission = CASES['dietetics-rhythm-overflow'];
  const session = { archetype: 'subtle', usedScreenings: [applyScreening(mission, 'subtle', mission.screens[0].id)], messages: [{ role: 'assistant', content: 'Bonjour.' }, { role: 'user', content: 'Pouvez-vous me raconter une journée type ?' }] };
  const prompt = buildMissionEvaluationPrompt(mission, session);
  assert.match(prompt, /TOUT le transcript/); assert.match(prompt, /Cas privé/); assert.equal(MISSION_EVALUATION_SCHEMA.strict, true);
  const result = normalizeMissionEvaluation({ scores: { foodHistory: 82, context: 75, communication: 77, safePlan: 70 }, feedback: 'Votre écoute a permis de clarifier une partie du vécu.' }, true);
  assert.equal(result.total, 76); assert.equal(result.mastery, true); assert.equal(result.evaluationSource, 'ai');
  const thresholdResult = normalizeMissionEvaluation({ scores: { foodHistory: 70, context: 70, communication: 70, safePlan: 70 }, feedback: 'Une progression reste possible.' }, true);
  assert.equal(MASTERY_THRESHOLD, 70); assert.equal(thresholdResult.mastery, false);
  assert.equal(normalizeMissionEvaluation({ scores: { foodHistory: '82' }, feedback: 'x' }, true), null);
});
