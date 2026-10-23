import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MISSIONS } from '../src/data/missions.js';
import { CASES, NURSING_CASES, MASTERY_THRESHOLD, chooseVariant, getEligibleTools, useConsultationTool, getNursingTools, useNursingTool, sanitizeNursingPins, evaluateNursingHypothesis, evaluateServerMission } from '../server/missions.js';
import { NURSING_POOL_SIZES } from '../src/data/nursingCampaign.js';
import { NURSING_DISEASES } from '../src/data/nursingCampaign.js';
import { NURSING_DOSSIERS, NURSING_DOCUMENT_DEFINITIONS } from '../server/nursingDossiers.js';
import { buildMissionEvaluationPrompt, normalizeMissionEvaluation } from '../server/missionEvaluation.js';
import { nextRecentVariantIds } from '../src/utils/storage.js';

test('the browser exposes ten ordered cards per open campaign', () => {
  assert.equal(MISSIONS.length, 20);
  assert.deepEqual(MISSIONS.filter((mission) => mission.roleId === 'dietetics').map(({ id }) => id), Object.keys(CASES));
  for (const mission of MISSIONS) assert.deepEqual(Object.keys(mission).sort(), ['icon', 'id', 'order', 'roleId', 'summary', 'title']);
});

test('Nursing has ten cumulative pools of 3 through 30 curated diseases and six cases per disease', () => {
  assert.deepEqual(Object.values(NURSING_CASES).map((mission) => mission.diseases.length), NURSING_POOL_SIZES);
  for (const mission of Object.values(NURSING_CASES)) assert.ok(mission.blueprints.length >= mission.diseases.length * 6);
});

test('Nursing has an authored, complete server-only dossier for every condition', () => {
  assert.deepEqual(Object.keys(NURSING_DOSSIERS).sort(), Object.keys(NURSING_DISEASES).sort());
  for (const [diseaseId, dossier] of Object.entries(NURSING_DOSSIERS)) {
    assert.deepEqual(Object.keys(dossier).sort(), NURSING_DOCUMENT_DEFINITIONS.map(([id]) => id).sort());
    const allFacts = Object.values(dossier).flatMap((document) => document.facts);
    assert.equal(new Set(allFacts).size, allFacts.length, diseaseId);
    for (const [documentId, _unlock, label] of NURSING_DOCUMENT_DEFINITIONS) {
      const document = dossier[documentId];
      assert.equal(document.title, label, `${diseaseId}/${documentId}`);
      assert.ok(document.facts.length >= 3 && document.facts.length <= 6, diseaseId);
      assert.ok(document.facts.every((fact) => fact.length > 18), diseaseId);
      assert.equal(document.facts.join(' ').includes(NURSING_DISEASES[diseaseId].name), false, diseaseId);
    }
  }
  for (const [documentId] of NURSING_DOCUMENT_DEFINITIONS) {
    const factStructures = Object.values(NURSING_DOSSIERS).map((dossier) => JSON.stringify(dossier[documentId].facts));
    assert.equal(new Set(factStructures).size, factStructures.length, `${documentId} must vary for all diseases`);
  }
  const fullDossiers = Object.values(NURSING_DOSSIERS).map((dossier) => JSON.stringify(dossier));
  assert.equal(new Set(fullDossiers).size, fullDossiers.length, 'distinct conditions must not share an entire dossier');
});

test('Nursing disease pools use distinct concrete signs and only expose the authored unlocked dossier', () => {
  for (const mission of Object.values(NURSING_CASES)) {
    for (const disease of mission.diseases) {
      assert.equal(new Set(disease.symptoms).size, 3);
      assert.ok(disease.symptoms.every((symptom) => symptom.length > 12));
    }
    const variant = mission.blueprints[0];
    for (const tool of getNursingTools(mission)) {
      const first = useNursingTool(variant, tool.id);
      const reopened = useNursingTool(variant, tool.id, [tool.id]);
      assert.ok(first?.evidence?.facts?.length >= 3, `${mission.id}: ${tool.id}`);
      assert.deepEqual(first.evidence, NURSING_DOSSIERS[variant.diseaseId][tool.id]);
      assert.equal(reopened.alreadyConsulted, true);
    }
    const expectedCount = NURSING_DOCUMENT_DEFINITIONS.filter(([, unlock]) => mission.order >= unlock).length;
    assert.equal(getNursingTools(mission).length, expectedCount);
    assert.deepEqual(getNursingTools(mission).map(({ id, label }) => [id, label]), NURSING_DOCUMENT_DEFINITIONS.filter(([, unlock]) => mission.order >= unlock).map(([id, _unlock, label]) => [id, label]));
  }
});

test('Nursing pins only retain symptoms actually stated by the patient and hypotheses reward exploration', () => {
  const mission = NURSING_CASES['nursing-10'];
  const variant = mission.blueprints[0];
  const session = {
    mission, variant,
    usedTools: getNursingTools(mission),
    messages: [
      { role: 'assistant', content: `${variant.symptoms[0].label}; ${variant.symptoms[1].label}; ${variant.symptoms[2].label}.` },
      { role: 'user', content: 'Depuis quand est-ce présent ?' },
      { role: 'user', content: 'Qu’est-ce qui change dans votre quotidien ?' },
      { role: 'user', content: 'Pouvez-vous préciser ce signe ?' },
    ],
  };
  assert.deepEqual(sanitizeNursingPins(session, [{ id: variant.symptoms[0].id, state: 'confirmed' }, { id: 'forged', state: 'confirmed' }, { id: variant.symptoms[1].id, state: 'to-verify' }]), [{ id: variant.symptoms[0].id, state: 'confirmed' }, { id: variant.symptoms[1].id, state: 'to-verify' }]);
  const evaluated = evaluateNursingHypothesis(session, variant.diseaseId);
  assert.equal(evaluated.mastery, true);
  assert.ok(evaluated.total >= MASTERY_THRESHOLD);
  const rushed = evaluateNursingHypothesis({ ...session, usedTools: [], messages: [{ role: 'assistant', content: variant.symptoms[0].label }] }, variant.diseaseId);
  assert.equal(rushed.mastery, false);
  assert.equal(evaluateNursingHypothesis(session, 'forged').error, 'Hypothèse inconnue pour cette mission.');
});

test('high-alert Nursing simulations require an explicit fictional escalation before mastery', () => {
  const mission = NURSING_CASES['nursing-10']; const variant = mission.blueprints.find((item) => item.diseaseId === 'sepsis-alert-pattern');
  const session = { mission, variant, usedTools: getNursingTools(mission), messages: [{ role: 'assistant', content: variant.symptoms.map((item) => item.label).join('. ') }, { role: 'user', content: 'Pouvez-vous préciser les signes et leur chronologie ?' }, { role: 'user', content: 'Je reformule ce que vous venez de dire.' }, { role: 'user', content: 'Je vais appeler et transmettre ces éléments sans attendre.' }] };
  assert.equal(evaluateNursingHypothesis({ ...session, messages: session.messages.slice(0, -1) }, variant.diseaseId).mastery, false);
  assert.equal(evaluateNursingHypothesis(session, variant.diseaseId).mastery, true);
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
  assert.equal(useConsultationTool(variant, 'gallery', ['gallery']).alreadyConsulted, true);
  assert.equal(useConsultationTool(variant, 'forged-tool'), null);
  assert.equal(useConsultationTool({ ...variant, evidence: { ...variant.evidence, gallery: ['missing-asset'] } }, 'gallery').evidence.images[0].status, 'unavailable');
});

test('receipt and calendar evidence are precise, reusable consultation supports', () => {
  const variant = CASES['dietetics-incomplete-file'].blueprints[0];
  const receipt = useConsultationTool(variant, 'shopping-receipt');
  assert.ok(receipt.evidence.store && receipt.evidence.date);
  assert.equal(receipt.evidence.items.length, 4);
  assert.ok(receipt.evidence.items.every((item) => item.brand && item.item && item.quantity));
  const calendar = useConsultationTool(variant, 'constraints-calendar');
  assert.equal(calendar.evidence.days.length, 7);
  assert.ok(calendar.evidence.days.every((day) => day.slots.length >= 1));
  const pantry = useConsultationTool(variant, 'pantry-fridge');
  assert.equal(pantry.evidence.pantry.length, 4);
  assert.equal(pantry.evidence.fridge.length, 4);
  assert.ok([...pantry.evidence.pantry, ...pantry.evidence.fridge].every((item) => item.item && item.quantity));
  const journal = useConsultationTool(variant, 'rhythm-journal');
  assert.equal(journal.evidence.entries.length, 5);
  assert.ok(journal.evidence.entries.every((entry) => entry.time && entry.entry && entry.context));
});

test('every dietetics level provides six distinct, level-appropriate consultation variants', () => {
  const toolUnlocks = {
    gallery: 2,
    'rhythm-journal': 4,
    'shopping-receipt': 6,
    'pantry-fridge': 8,
    'constraints-calendar': 10,
  };

  for (const mission of Object.values(CASES)) {
    for (const [toolId, unlockOrder] of Object.entries(toolUnlocks)) {
      const payloads = mission.blueprints.map((variant) => variant.evidence[toolId]);
      assert.equal(new Set(payloads.map((payload) => JSON.stringify(payload))).size, 6, `${mission.id}: ${toolId} must vary between the six cases`);

      const eligibleToolIds = getEligibleTools(mission).map(({ id }) => id);
      assert.equal(eligibleToolIds.includes(toolId), mission.order >= unlockOrder, `${mission.id}: ${toolId} unlock order`);
    }
  }

  const shiftJournal = useConsultationTool(CASES['dietetics-shift-rhythm'].blueprints[5], 'rhythm-journal');
  assert.match(JSON.stringify(shiftJournal.evidence), /poste|garde|sommeil/i);
  const vegetarianJournal = useConsultationTool(CASES['dietetics-vegetarian-everyday'].blueprints[5], 'rhythm-journal');
  assert.match(JSON.stringify(vegetarianJournal.evidence), /végétarien|tofu|lentilles/i);
  const incompleteCalendar = useConsultationTool(CASES['dietetics-incomplete-file'].blueprints[0], 'constraints-calendar');
  assert.match(JSON.stringify(incompleteCalendar.evidence), /rendez-vous|imprévu|retour/i);
});

test('safety is assessed from the exchange rather than a side-panel action', () => {
  const variant = CASES['dietetics-eating-difficult'].blueprints[0];
  const result = evaluateServerMission('dietetics-eating-difficult', variant);
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
  const styleSource = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.match(patientSource, /variant\.responseStyle/);
  assert.match(chatSource, /consultation-evidence--\$\{tool\.kind\}/);
  assert.match(chatSource, /nursing-tools-rail/);
  assert.match(chatSource, /chatBody\.classList\.add\('chat__body--nursing'\)/);
  assert.match(chatSource, /chatBody\.append\(rail\)/);
  assert.match(styleSource, /\.career-chat \.chat__body--nursing \{ grid-template-columns: minmax\(220px, 250px\) minmax\(0, 1fr\) minmax\(270px, 320px\); \}/);
  assert.doesNotMatch(chatSource, /Prévoir une prochaine étape sûre/);
});

test('consultation modal is hidden until a support is opened', () => {
  const styleSource = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.match(styleSource, /\.consultation-modal\[hidden\]\s*\{\s*display:\s*none/);
});

test('retired consultation language is absent from dietetics production code', () => {
  const missionSource = fs.readFileSync(new URL('../server/missions.js', import.meta.url), 'utf8').split('const NURSING_NAMES')[0];
  const sources = [missionSource, fs.readFileSync(new URL('../src/game/ai.js', import.meta.url), 'utf8'), fs.readFileSync(new URL('../src/game/engine.js', import.meta.url), 'utf8')].join('\n').toLowerCase();
  assert.doesNotMatch(sources, /screening|observation/);
});
