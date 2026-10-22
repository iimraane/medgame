import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MISSIONS } from '../src/data/missions.js';
import { CASES, MASTERY_THRESHOLD, chooseVariant, getEligibleTools, useConsultationTool, evaluateServerMission } from '../server/missions.js';
import { buildMissionEvaluationPrompt, normalizeMissionEvaluation } from '../server/missionEvaluation.js';
import { nextRecentVariantIds } from '../src/utils/storage.js';

test('the browser exposes only ten ordered safe mission cards', () => {
  assert.equal(MISSIONS.length, 10);
  assert.deepEqual(MISSIONS.map(({ id }) => id), Object.keys(CASES));
  for (const mission of MISSIONS) assert.deepEqual(Object.keys(mission).sort(), ['icon', 'id', 'order', 'roleId', 'summary', 'title']);
});

test('every mission owns six coherent private variants and avoids recent variants', () => {
  for (const mission of Object.values(CASES)) {
    assert.ok(mission.blueprints.length >= 6);
    const first = mission.blueprints[0];
    assert.ok(first.need && first.contributors.length >= 2 && first.successSignals.length >= 2);
    const selected = chooseVariant(mission, [first.id], () => 0);
    assert.notEqual(selected.id, first.id);
    assert.equal(chooseVariant(mission, mission.blueprints.map(({ id }) => id), () => 0).id, first.id);
  }
});

test('a replay cycle clears after all six variants before recording the new case', () => {
  const variants = CASES['dietetics-rhythm-overflow'].blueprints.map(({ id }) => id);
  assert.deepEqual(nextRecentVariantIds(variants, variants[0]), [variants[0]]);
  assert.deepEqual(nextRecentVariantIds(variants.slice(0, 5), variants[5]), variants);
});

test('tools unlock cumulatively and only release selected case evidence once', () => {
  assert.deepEqual(getEligibleTools(CASES['dietetics-rhythm-overflow']).map(({ id }) => id), []);
  assert.deepEqual(getEligibleTools(CASES['dietetics-afternoon-dip']).map(({ id }) => id), ['gallery']);
  assert.deepEqual(getEligibleTools(CASES['dietetics-incomplete-file']).map(({ id }) => id), ['gallery', 'rhythm-journal', 'shopping-receipt', 'pantry-fridge', 'constraints-calendar']);
  const variant = CASES['dietetics-afternoon-dip'].blueprints[0];
  const gallery = useConsultationTool(variant, 'gallery');
  assert.equal(gallery.evidence.images.length, 2);
  assert.equal(gallery.evidence.images.every((image) => image.status === 'available'), true);
  assert.equal(useConsultationTool(variant, 'gallery', ['gallery']), null);
  assert.equal(useConsultationTool(variant, 'forged-tool'), null);
  assert.equal(useConsultationTool({ ...variant, evidence: { ...variant.evidence, gallery: ['missing-asset'] } }, 'gallery').evidence.images[0].status, 'unavailable');
});

test('safety mastery requires the server-recorded secure action and never invents fallback scores', () => {
  const variant = CASES['dietetics-eating-difficult'].blueprints[0];
  assert.equal(evaluateServerMission('dietetics-eating-difficult', variant, []).mastery, false);
  const result = evaluateServerMission('dietetics-eating-difficult', variant, ['secure-next-step']);
  assert.equal(MASTERY_THRESHOLD, 70); assert.equal(result.safetyAcknowledged, true); assert.equal(result.mastery, false);
  assert.deepEqual(result.scores, { foodHistory: 0, context: 0, communication: 0, safePlan: 0 });
});

test('the AI debrief receives full server context and alone can award mastery', () => {
  const variant = CASES['dietetics-afternoon-dip'].blueprints[0]; const gallery = useConsultationTool(variant, 'gallery');
  const prompt = buildMissionEvaluationPrompt(null, { variant, usedTools: [gallery] });
  assert.match(prompt, new RegExp(gallery.promptNotes[0]));
  assert.match(prompt, new RegExp(variant.successSignals[0]));
  const result = normalizeMissionEvaluation({ scores: { foodHistory: 80, context: 75, communication: 78, safePlan: 72 }, feedback: 'Votre démarche est cohérente.' }, true);
  assert.equal(result.mastery, true); assert.equal(result.total, 76);
  const serverSource = fs.readFileSync(new URL('../server/server.js', import.meta.url), 'utf8');
  assert.match(serverSource, /buildMissionEvaluationPrompt\(session\.mission, session\)[\s\S]*?\.\.\.session\.messages/);
});

test('patient style and specialized tool presentation stay in the private and visual paths', () => {
  const patientSource = fs.readFileSync(new URL('../server/missionPatient.js', import.meta.url), 'utf8');
  const chatSource = fs.readFileSync(new URL('../src/ui/chat.js', import.meta.url), 'utf8');
  assert.match(patientSource, /variant\.responseStyle/);
  assert.match(chatSource, /consultation-evidence--\$\{tool\.kind\}/);
  assert.match(chatSource, /requiresSecureNextStep/);
});

test('retired consultation language is absent from dietetics production code', () => {
  const sources = ['server/missions.js', 'server/server.js', 'src/game/ai.js', 'src/game/engine.js', 'src/ui/chat.js', 'src/style.css'].map((file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').toLowerCase()).join('\n');
  assert.doesNotMatch(sources, /screening|observation/);
});
