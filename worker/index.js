import { LEVELS, getLevel } from '../src/data/levels.js';
import { CARDS } from '../src/data/cards.js';
import { pickRandomModifiers } from '../src/data/modifiers.js';
import { getRole } from '../src/data/roles.js';
import {
  getServerMission, evaluateServerMission, chooseArchetype, chooseVariant,
  getPresentation, getEligibleTools, useConsultationTool, isNursingMission,
  getNursingTools, useNursingTool, nursingLiveSymptoms, evaluateNursingHypothesis,
} from '../server/missions.js';
import { getOpenAIModel, buildMissionPatientPrompt } from '../server/missionPatient.js';
import { choosePatientTraits, chooseNonVerbalCue } from '../server/patientTraits.js';
import { MISSION_EVALUATION_SCHEMA, buildMissionEvaluationPrompt, normalizeMissionEvaluation } from '../server/missionEvaluation.js';
import { isAllowedOrigin } from '../server/origins.js';

const TTL = 60 * 60 * 1000;
const RATE_WINDOW = 60 * 1000;
const RATE_MAX = 30;
const RATE_LIMIT_MAX_ENTRIES = 10_000;
const ORIGIN_ERROR = { error: 'Origine non autorisée.' };
const SESSION_ERROR = { error: 'Session expirée ou invalide.' };
const rateLimits = new Map();

export function checkRateLimit(ip, now = Date.now()) {
  for (const [key, value] of rateLimits) if (now - value.startedAt > RATE_WINDOW) rateLimits.delete(key);
  const rate = rateLimits.get(ip);
  if (!rate) {
    if (rateLimits.size >= RATE_LIMIT_MAX_ENTRIES) rateLimits.delete(rateLimits.keys().next().value);
    rateLimits.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  rate.count += 1;
  return rate.count <= RATE_MAX;
}
export function resetRateLimits() { rateLimits.clear(); }

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
export const badOrigin = (request) => {
  const origin = request.headers.get('origin');
  if (origin && !isAllowedOrigin(origin, 'production')) return true;
  const referer = request.headers.get('referer');
  if (!origin && referer) {
    try { return !isAllowedOrigin(new URL(referer).origin, 'production'); } catch { return true; }
  }
  return false;
};

function patientName() {
  const males = ['Jean', 'Pierre', 'Michel', 'Mohamed', 'Patrick', 'Olivier', 'Thomas', 'Marc', 'Antoine', 'Karim'];
  const females = ['Marie', 'Nathalie', 'Sophie', 'Fatima', 'Isabelle', 'Christine', 'Émilie', 'Julie', 'Camille', 'Aïcha'];
  const last = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Moreau', 'Simon', 'Laurent', 'Lefebvre'];
  const isMale = Math.random() > .5, firstName = (isMale ? males : females)[Math.floor(Math.random() * 10)], lastName = last[Math.floor(Math.random() * 10)];
  return { firstName, lastName, fullName: `${firstName} ${lastName}`, age: Math.floor(Math.random() * 65) + 18, gender: isMale ? 'Homme' : 'Femme', isMale };
}
function classicPrompt(name, card, modifiers, difficulty, traits) {
  const difficultyText = { debutant: 'simple et coopératif', facile: 'un peu plus de questions', moyen: 'cache certains symptômes', difficile: 'difficile, contradictoire', expert: 'très compliqué', maitre: 'extrêmement complexe' }[difficulty] || 'cache certains symptômes';
  return `Tu es un patient RÉALISTE dans un jeu de rôle santé. Nom: ${name.fullName}; âge: ${name.age}; sexe: ${name.gender}. Ta maladie inconnue de toi est ${card.name}; symptômes possibles: ${card.symptoms.join(', ')}. Personnalité: ${modifiers.map((m) => m.prompt).join('; ')}. Traits: ${traits.map((t) => t.instruction).join('; ')}. Difficulté: ${difficultyText}. Ne donne jamais ton diagnostic, reste dans ton rôle, donne peu d'informations, parle en 1 à 2 phrases et ramène les sujets hors consultation à tes symptômes.`;
}
function normalizePatientReply(reply) { return String(reply).replace(/\s*(?:—|--)\s*/g, ', '); }
function buildFeedbackPrompt(condition) { return `Tu es un évaluateur médical. Le patient avait ${condition}. Analyse la conversation et donne un feedback pédagogique très court (1 à 2 phrases), à la troisième personne, en JSON: {"feedback":"..."}.`; }
function fallbackAntecedents() { return '• Aucun antécédent notable.\n• Bilan récent normal.'; }
async function generateAntecedents(apiKey, session) {
  if (!apiKey) return 'Antécédents: Non disponibles (hors ligne).';
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 100, temperature: .7, messages: [{ role: 'system', content: `Génère 2 à 4 antécédents médicaux plausibles pour ${session.name.fullName}, ${session.name.age} ans, sans révéler sa maladie (${session.card.name}). Réponds uniquement avec des puces.` }] }),
    });
    return response.ok ? ((await response.json()).choices?.[0]?.message?.content?.trim() || fallbackAntecedents()) : fallbackAntecedents();
  } catch { return fallbackAntecedents(); }
}
export function startSession(body) {
  const { levelId, missionId, roleId, recentVariantIds = [] } = body;
  if (missionId) {
    const mission = getServerMission(missionId), role = getRole(roleId);
    if (!mission || mission.roleId !== roleId || !role?.unlocked) return { error: 'Mission ou rôle invalide', status: 400 };
    const variant = chooseVariant(mission, recentVariantIds), archetype = chooseArchetype(mission), patientTraits = choosePatientTraits(), nursing = isNursingMission(mission);
    const presentation = nursing ? { opening: variant.opening } : getPresentation(variant, archetype);
    const opening = `${presentation.opening} ${chooseNonVerbalCue(patientTraits)}`;
    const session = { createdAt: Date.now(), missionId, roleId, variantId: variant.id, archetype, patientTraits, usedTools: [], actions: [], interactionEvents: [], prompt: buildMissionPatientPrompt(variant, archetype, [], patientTraits), messages: [{ role: 'assistant', content: opening }] };
    return { session, response: { variantId: variant.id, patient: { name: { firstName: variant.patient.name, fullName: variant.patient.name, age: variant.patient.age, gender: variant.patient.gender }, opening, modifiers: [], antecedentsHtml: nursing ? 'Simulation éducative fictive — aucune donnée médicale réelle.' : 'Profil de consultation chargé.' }, tools: nursing ? getNursingTools(mission) : getEligibleTools(mission), differential: nursing ? mission.diseases.map(({ id, name, summary, symptoms }) => ({ id, name, summary, symptoms })) : [] } };
  }
  const level = getLevel(levelId);
  if (!level) return { error: 'Niveau invalide', status: 400 };
  const name = patientName(), modifiers = pickRandomModifiers(level.modifierCount), patientTraits = choosePatientTraits(), condition = level.possibleConditions[Math.floor(Math.random() * level.possibleConditions.length)], card = CARDS[condition];
  if (!card) return { error: 'Condition invalide', status: 400 };
  const session = { createdAt: Date.now(), levelId, name, modifiers, patientTraits, condition, prompt: classicPrompt(name, card, modifiers, level.difficulty, patientTraits), antecedentsHtml: 'Antécédents: Non disponibles (hors ligne).', messages: [], messageCount: 0, symptomsList: '' };
  return { session, response: { patient: { name, antecedentsHtml: session.antecedentsHtml, modifiers: modifiers.map(({ category, categoryLabel, categoryIcon, name: label, id }) => ({ category, categoryLabel, categoryIcon, name: label, id })) } } };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (badOrigin(request)) return json(ORIGIN_ERROR, 403);
    if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!checkRateLimit(ip)) return json({ error: 'Trop de requêtes. Réessayez dans un moment.' }, 429);
    const body = await request.json().catch(() => ({}));
    if (url.pathname === '/api/start') {
      const started = startSession(body);
      if (started.error) return json({ error: started.error }, started.status);
      if (started.session.card) {
        const antecedentsHtml = await generateAntecedents(env.OPENAI_API_KEY, started.session);
        started.session.antecedentsHtml = antecedentsHtml;
        started.response.patient.antecedentsHtml = antecedentsHtml;
      }
      const sessionId = crypto.randomUUID(), stub = env.SESSIONS.get(env.SESSIONS.idFromName(sessionId));
      const initialized = await stub.fetch('https://session/init', { method: 'POST', body: JSON.stringify(started.session) });
      if (!initialized.ok) return json({ error: 'Erreur serveur' }, 500);
      return json({ sessionId, ...started.response });
    }
    const sessionId = body.sessionId;
    if (!sessionId) return json(SESSION_ERROR, 400);
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName(sessionId));
    return stub.fetch(`https://session${url.pathname}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  },
};

export class ConsultationSession {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(request) { return this.ctx.blockConcurrencyWhile(() => this.handleFetch(request)); }
  async handleFetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/init') { const session = this.compact(await request.json()); await this.ctx.storage.put('session', session); await this.ctx.storage.setAlarm(session.createdAt + TTL); return new Response(null, { status: 204 }); }
    const stored = await this.ctx.storage.get('session');
    if (!stored || Date.now() - stored.createdAt > TTL) { await this.ctx.storage.deleteAll(); return json(SESSION_ERROR, 400); }
    const session = this.hydrate(stored);
    const body = await request.json();
    const result = await this.dispatch(path, body, session);
    if (result.delete) await this.ctx.storage.deleteAll(); else await this.ctx.storage.put('session', this.compact(session));
    return json(result.body, result.status);
  }
  hydrate(stored) {
    const session = { ...stored };
    if (session.missionId) {
      session.mission = getServerMission(session.missionId);
      session.variant = session.mission?.blueprints.find((variant) => variant.id === session.variantId);
    } else { session.level = getLevel(session.levelId); session.card = CARDS[session.condition]; }
    return session;
  }
  compact(session) { const { mission, variant, level, card, ...stored } = session; return stored; }
  async alarm() { await this.ctx.storage.deleteAll(); }
  async chat(messages, options = {}) {
    if (!this.env.OPENAI_API_KEY) return null;
    const { signal, ...payload } = options;
    const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', signal, headers: { authorization: `Bearer ${this.env.OPENAI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: payload.model || getOpenAIModel(), messages, ...payload }) });
    if (!response.ok) throw new Error(`OpenAI ${response.status}`);
    return (await response.json()).choices?.[0]?.message?.content?.trim();
  }
  async extractNursingSymptoms(session, patientReply) {
    const controller = new AbortController(); let timeout;
    try {
      const authorized = session.variant.symptoms.map(({ id, label }) => ({ id, label }));
      const extraction = this.chat([{ role: 'system', content: `Dans cette simulation fictive, identifie uniquement les signes explicitement formulés dans la dernière réponse du patient. Tu peux choisir seulement parmi ces signes autorisés : ${JSON.stringify(authorized)}. N'infère rien, n'ajoute aucun identifiant et ne révèle aucune maladie.` }, { role: 'user', content: patientReply }], { response_format: { type: 'json_object' }, max_completion_tokens: 100, signal: controller.signal });
      const content = await Promise.race([extraction, new Promise((resolve) => { timeout = setTimeout(() => { controller.abort(); resolve(null); }, 3000); })]);
      const ids = JSON.parse(content || '{}').symptomIds;
      return Array.isArray(ids) ? ids : [];
    } catch { return []; } finally { clearTimeout(timeout); }
  }
  async dispatch(path, body, session) {
    const clientMissing = () => !this.env.OPENAI_API_KEY;
    if (path === '/api/evaluate') {
      if (!session.mission) return { body: SESSION_ERROR, status: 400 };
      let result = evaluateServerMission(session.missionId, session.variant, session.actions);
      if (!clientMissing() && session.messages.some((m) => m.role === 'user')) try { const content = await this.chat([{ role: 'system', content: buildMissionEvaluationPrompt(session.mission, session) }, ...session.messages], { response_format: { type: 'json_schema', json_schema: MISSION_EVALUATION_SCHEMA }, max_completion_tokens: 700 }); result = normalizeMissionEvaluation(JSON.parse(content || '{}'), result.safetyAcknowledged) || result; } catch {}
      return { body: result, status: 200, delete: true };
    }
    if (path === '/api/consultation-tool') {
      if (!session.mission) return { body: SESSION_ERROR, status: 400 };
      const nursing = isNursingMission(session.mission), tools = nursing ? getNursingTools(session.mission) : getEligibleTools(session.mission), tool = nursing ? useNursingTool(session.variant, body.toolId, session.usedTools.map((x) => x.id)) : useConsultationTool(session.variant, body.toolId, session.usedTools.map((x) => x.id));
      if (!tool || !tools.some((item) => item.id === body.toolId)) return { body: { tool: null, tools }, status: 200 };
      if (!tool.alreadyConsulted) { session.usedTools.push(tool); session.prompt = buildMissionPatientPrompt(session.variant, session.archetype, session.usedTools.flatMap((x) => x.promptNotes || []), session.patientTraits); }
      return { body: { tool: { id: tool.id, label: tool.label, kind: tool.kind, evidence: tool.evidence }, tools }, status: 200 };
    }
    if (path === '/api/nursing-symptoms') return { body: { error: 'Les signes recueillis sont désormais contrôlés par la conversation.' }, status: 410 };
    if (path === '/api/nursing-hypothesis') {
      if (!session.mission || !isNursingMission(session.mission)) return { body: { error: 'Session Nursing invalide.' }, status: 400 };
      const result = evaluateNursingHypothesis(session, body.diseaseId); return { body: result, status: result.error ? 400 : 200, delete: !result.error };
    }
    if (path === '/api/secure-next-step') { if (!session.mission) return { body: SESSION_ERROR, status: 400 }; if (session.variant.requiredAction && !session.actions.includes(session.variant.requiredAction)) session.actions.push(session.variant.requiredAction); return { body: { recorded: Boolean(session.variant.requiredAction) }, status: 200 }; }
    if (path === '/api/chat') {
      if (clientMissing()) return { body: { error: 'Clé API OpenAI non configurée sur le serveur.' }, status: 400 };
      try {
        const guard = await this.chat([{ role: 'system', content: 'Tu es un filtre de contenu. Bloque uniquement insultes, harcèlement, contenu sexuel explicite, spam ou texte incohérent. Réponds uniquement JSON {"valid":true} ou {"valid":false,"reason":"explication très courte"}.' }, { role: 'user', content: body.message }], { max_completion_tokens: 80 });
        try { const parsed = JSON.parse(guard || '{}'); if (!parsed.valid) return { body: { guardrailFailed: true, reason: parsed.reason || 'Message inapproprié.' }, status: 200 }; } catch {}
        session.messages.push({ role: 'user', content: body.message }); session.messageCount = (session.messageCount || 0) + 1;
        const reply = normalizePatientReply(await this.chat([{ role: 'system', content: session.prompt }, ...session.messages], { max_completion_tokens: 500 }));
        session.messages.push({ role: 'assistant', content: reply }); session.messageCount++;
        if (session.mission && isNursingMission(session.mission)) {
          const symptomIds = await this.extractNursingSymptoms(session, reply);
          session.liveSymptomIds = [...new Set([...(session.liveSymptomIds || []), ...symptomIds])];
          return { body: { message: reply, nursing: { symptoms: nursingLiveSymptoms(session, session.liveSymptomIds) } }, status: 200 };
        }
        return { body: { message: reply }, status: 200 };
      } catch { return { body: { error: "Erreur de communication avec l'IA." }, status: 500 }; }
    }
    if (path === '/api/exams' || path === '/api/hint' || path === '/api/symptoms' || path === '/api/dossier-partage' || path === '/api/traitement-epreuve' || path === '/api/guess' || path === '/api/photo' || path === '/api/transcribe') return this.aiRoute(path, body, session);
    return { body: { error: 'Route introuvable.' }, status: 404 };
  }
  async aiRoute(path, body, session) {
    if (!this.env.OPENAI_API_KEY) return { body: { error: 'Clé API non configurée.' }, status: 400 };
    if (path === '/api/guess') { const card = CARDS[session.condition]; if (!card) return { body: SESSION_ERROR, status: 400 }; let feedback = 'Aucun feedback disponible.'; try { feedback = JSON.parse(await this.chat([{ role: 'system', content: buildFeedbackPrompt(card.name) }, ...session.messages], { response_format: { type: 'json_object' } }) || '{}').feedback || feedback; } catch {} return { body: { isCorrect: body.guessedConditionId === session.condition, correctConditionId: session.condition, correctConditionName: card.name, feedback }, status: 200, delete: true }; }
    if (!session.condition) return { body: { error: 'Session invalide' }, status: 404 };
    const card = CARDS[session.condition]; if (!card) return { body: { error: 'Condition introuvable' }, status: 400 };
    try {
      if (path === '/api/exams') { const isLab = body.examType === 'lab'; const report = await this.chat([{ role: 'system', content: `Tu es un automate d'analyses médicales. Tu dois générer un rapport EXTRÊMEMENT COURT de ${isLab ? 'laboratoire (biologie sanguine, urinaire)' : 'radiologie / imagerie'}.
La *véritable* maladie du patient est : ${card.name}.
Les constantes HABITUELLES pour cette maladie sont : ${isLab ? card.labExams : card.radioExams}.

RÈGLES ABSOLUES ET STRICTES :
1. AUCUN FORMATAGE MARKDOWN (strictement aucun astérisque, ni gras, ni hashtags).
2. Fournis uniquement 3 à 5 constantes vitales / taux avec la valeur normale entre parenthèses, le tout sous forme de texte brut avec des tirets.
3. FINIS avec une seule et unique phrase d'interprétation. CETTE INTERPRÉTATION DOIT ÊTRE EXTRÊMEMENT VAGUE ET FACTUELLE. ELLE NE DOIT JAMAIS DONNER LE DIAGNOSTIC NI ORIENTER TROP CLAIREMENT LE MÉDECIN. Contente-toi de décrire l'aspect technique.
Le résultat doit tenir sur 4 ou 5 lignes maximum. Ne sois pas bavard.` }], { model: 'gpt-4o-mini' }); return { body: { report }, status: 200 }; }
      if (path === '/api/hint') return { body: { hint: await this.chat([{ role: 'system', content: `Tu es le chef de clinique IA qui épaule le médecin. Le patient souffre de: ${card.name}. Donne UN SEUL indice TRES COURT (1 phrase max) et subtil pour orienter le médecin vers le bon diagnostic, en prenant en compte ce qui s'est déjà dit dans la conversation, sa maladie, et son profil. Ne donne JAMAIS le nom exact de la maladie.` }, ...session.messages], { model: 'gpt-4o-mini', max_tokens: 50 }) }, status: 200 };
      if (path === '/api/symptoms') { session.symptomsList = await this.chat([{ role: 'system', content: `Tu es l'assistant du médecin en pleine consultation. Ton but est d'analyser l'intégralité de la conversation depuis le début et de relister SOUS FORME D'UNE COURTE LISTE À PUCES tous les symptômes, douleurs, et signes cliniques que le patient a confirmés avoir.
RÈGLE ABSOLUE ET CRITIQUE: Si le patient a avoué ou mentionné un symptôme, ne l'efface JAMAIS de la liste. S'il dit ensuite "Je préfère ne pas en parler", "Je ne veux rien dire", ou fait de la rétention d'information (roleplay), CE N'EST PAS UNE NÉGATION MÉDICALE DU SYMPTÔME. Tu dois CONSERVER le symptôme dans la liste.
N'invente aucune donnée médicale. Mets en évidence le symptôme avec un émoji pertinent. Si aucun symptôme pertinent n'a été avoué pour l'instant, réponds exactement par: "Aucun symptôme verbalisé pour l'instant."` }, ...session.messages], { model: 'gpt-4o-mini' }); return { body: { symptoms: session.symptomsList }, status: 200 }; }
      if (path === '/api/dossier-partage') return { body: { diagnoses: await this.chat([{ role: 'system', content: `En tant qu'IA médicale analysant cette consultation, liste les 3 diagnostics différentiels les plus probables pour ce patient au vu des symptômes mentionnés dans la conversation.
Réponds UNIQUEMENT sous la forme d'une courte liste numérotée (1., 2., 3.) sans aucune autre phrase. N'inclus pas d'explications superflues. Sois concis.` }, ...session.messages], { model: 'gpt-4o-mini', max_tokens: 100 }) }, status: 200 };
      if (path === '/api/traitement-epreuve') { if (!body.medication) return { body: { error: 'Médicament manquant.' }, status: 400 }; return { body: { evolution: await this.chat([{ role: 'system', content: `Le médecin vient d'administrer le traitement d'épreuve suivant au patient: "${body.medication}". Le patient souffre en réalité de: ${card.name}. Tu dois décrire l'évolution immédiate des symptômes du patient suite à ce traitement. Si le traitement est adapté ou traite les symptômes (même symptomatiquement), décris une amélioration ou un soulagement. Si le traitement est inutile ou contre-indiqué, décris une absence d'effet ou une aggravation. Réponds en 2 phrases maximum, de manière factuelle, clinique et descriptive, SANS DIRE EXPLICITEMENT si c'est le bon traitement ou non, juste les faits cliniques observables. NE PARLE PAS À LA PREMIÈRE PERSONNE. TU ES LE NARRATEUR CLINIQUE.` }], { model: 'gpt-4o-mini', max_tokens: 150 }) }, status: 200 }; }
      if (path === '/api/photo') { const response = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { authorization: `Bearer ${this.env.OPENAI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: 'dall-e-3', prompt: `A highly realistic documentary - style photography of a patient sitting in a brightly lit doctor's office. CRITICAL NEGATIVE PROMPT: DO NOT INCLUDE ANY SMARTPHONES, CAMERAS, HANDS HOLDING DEVICES, OR UI ELEMENTS. THIS IS NOT A POV SHOT. IT IS A STRAIGHTFORWARD PORTRAIT. The patient is a ${session.name.age} year old ${session.name.gender === 'Homme' ? 'man' : 'woman'}. They exhibit the following physical traits and signs: ${card.physicalSigns}. VITAL INSTRUCTION: The portrait MUST show the entire head (no cropped forehead) and the upper bust / shoulders. Do not zoom in too closely on the face. Raw, natural lighting.`, n: 1, size: '1024x1024', quality: 'standard' }) }); if (!response.ok) throw new Error('image'); return { body: { imageUrl: (await response.json()).data?.[0]?.url }, status: 200 }; }
      if (path === '/api/transcribe') { if (!body.audioBase64) return { body: { error: 'Audio manquant.' }, status: 400 }; const binary = Uint8Array.from(atob(body.audioBase64), (c) => c.charCodeAt(0)); const form = new FormData(); form.append('file', new File([binary], 'audio.webm', { type: 'audio/webm' })); form.append('model', 'whisper-1'); form.append('language', 'fr'); const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { authorization: `Bearer ${this.env.OPENAI_API_KEY}` }, body: form }); if (!response.ok) throw new Error('transcription'); return { body: { text: (await response.json()).text }, status: 200 }; }
    } catch { const errors = { '/api/exams': "Erreur lors de la génération de l'examen.", '/api/hint': "Erreur lors de la génération de l'indice.", '/api/symptoms': "Erreur d'extraction des symptômes.", '/api/dossier-partage': 'Erreur lors de la génération du dossier partagé.', '/api/traitement-epreuve': "Erreur lors de l'évaluation du traitement.", '/api/photo': 'Erreur lors de la génération de la photo.', '/api/transcribe': 'Erreur lors de la transcription vocale.' }; return { body: { error: errors[path] || 'Erreur serveur' }, status: 500 }; }
    return { body: { error: 'Route introuvable.' }, status: 404 };
  }
}
