import fs from 'fs';
import os from 'os';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import crypto from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { createOriginGuard, isAllowedOrigin } from './origins.js';

// Dynamic imports for game data (handles Windows paths with spaces)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'src', 'data');

const { LEVELS, getLevel } = await import(pathToFileURL(join(dataDir, 'levels.js')).href);
const { CARDS, getCardsForLevel } = await import(pathToFileURL(join(dataDir, 'cards.js')).href);
const { MODIFIERS, pickRandomModifiers } = await import(pathToFileURL(join(dataDir, 'modifiers.js')).href);
const { getRole } = await import(pathToFileURL(join(dataDir, 'roles.js')).href);
const { MASTERY_THRESHOLD, getServerMission, evaluateServerMission, chooseArchetype, chooseVariant, getPresentation, getEligibleTools, useConsultationTool, isNursingMission, getNursingTools, useNursingTool, transcriptConfirmedSymptoms, nursingLiveSymptoms, sanitizeNursingPins, evaluateNursingHypothesis } = await import(pathToFileURL(join(__dirname, 'missions.js')).href);
const { getOpenAIModel, buildMissionPatientPrompt } = await import(pathToFileURL(join(__dirname, 'missionPatient.js')).href);
const { choosePatientTraits, chooseNonVerbalCue } = await import(pathToFileURL(join(__dirname, 'patientTraits.js')).href);
const { MISSION_EVALUATION_SCHEMA, buildMissionEvaluationPrompt, buildNursingEvaluationPrompt, normalizeMissionEvaluation } = await import(pathToFileURL(join(__dirname, 'missionEvaluation.js')).href);

// Ensure .env is loaded from the root 'game' directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
app.use(cors({ origin: (origin, callback) => callback(null, !origin || isAllowedOrigin(origin)) }));

// ─── Serve built frontend ────────────────────────────────────────
const distPath = join(__dirname, '..', 'dist');
app.use('/game', express.static(distPath));

// ─── Rate Limiting (simple in-memory) ────────────────────────────
const rateLimits = new Map();
const RATE_WINDOW = 60000; // 1 minute
const RATE_MAX = 30; // 30 requests per minute per IP

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimits.get(ip);
    if (!entry || now - entry.start > RATE_WINDOW) {
        rateLimits.set(ip, { start: now, count: 1 });
        return true;
    }
    entry.count++;
    if (entry.count > RATE_MAX) return false;
    return true;
}

// Cleanup old rate limit entries every 5 minutes
const rateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimits) {
        if (now - entry.start > RATE_WINDOW * 2) rateLimits.delete(ip);
    }
}, 300000);
rateLimitCleanup.unref();

// Rate limit middleware
app.use('/game/api', (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Trop de requêtes. Réessayez dans un moment.' });
    }
    next();
});

// Security middleware: Ensure requests only come from our domain
app.use('/game/api', createOriginGuard());
app.use(express.json({ limit: '10mb' }));

// ─── Session Store ───────────────────────────────────────────────
const sessions = new Map();
const SESSION_TTL = 3600000; // 1 hour

// Cleanup expired sessions every 10 minutes
const sessionCleanup = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now - session.createdAt > SESSION_TTL) sessions.delete(id);
    }
}, 600000);
sessionCleanup.unref();

// ─── OpenAI Client ───────────────────────────────────────────────
let testClient = null;
export function setTestOpenAIClient(client) { testClient = client; }
function getClient() {
    if (process.env.NODE_ENV === 'test' && testClient) return testClient;
    const key = process.env.OPENAI_API_KEY;
    if (!key || key === 'sk-your-key-here') return null;
    return new OpenAI({ apiKey: key });
}

export function normalizePatientReply(reply) {
    return String(reply).replace(/\s*(?:—|--)\s*/g, ', ');
}

// ─── Patient Name Generator ─────────────────────────────────────
function generatePatientName() {
    const firstNamesMale = ['Jean', 'Pierre', 'Michel', 'Mohamed', 'Patrick', 'Olivier', 'Thomas', 'Marc', 'Antoine', 'Karim', 'Nicolas', 'François', 'Youssef', 'Bruno', 'Julien', 'Mathieu', 'Lucas', 'Hugo', 'Romain', 'Adrien'];
    const firstNamesFemale = ['Marie', 'Nathalie', 'Sophie', 'Fatima', 'Isabelle', 'Christine', 'Émilie', 'Julie', 'Camille', 'Aïcha', 'Laura', 'Sandrine', 'Aurélie', 'Céline', 'Mélanie', 'Léa', 'Chloé', 'Manon', 'Sarah', 'Amira'];
    const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Fontaine', 'Blanc', 'Rousseau', 'Vincent', 'Morel', 'Benali', 'Diallo', 'Nguyen', 'Bouchard', 'Leroy'];

    const isMale = Math.random() > 0.5;
    const firstNames = isMale ? firstNamesMale : firstNamesFemale;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const age = Math.floor(Math.random() * 65) + 18;

    return { firstName, lastName, fullName: `${firstName} ${lastName}`, age, gender: isMale ? 'Homme' : 'Femme', isMale };
}

// ─── Build Patient Prompt (SERVER-SIDE ONLY) ─────────────────────
function buildPatientPrompt(name, card, modifiers, difficulty, patientTraits = []) {
    const modifierInstructions = modifiers
        .map(m => `- ${m.categoryLabel}: ${m.name} → ${m.prompt}`)
        .join('\n');

    // Translate symptoms to "lay" language for more organic responses
    const symptomDescriptions = card.symptoms.map(s => {
        // Keep original but instruct AI to rephrase
        return s;
    }).join(', ');

    const difficultyInstructions = {
        debutant: `Tu es un patient simple et coopératif. Tu donnes des informations assez facilement quand on te pose les bonnes questions. Tu peux parfois oublier de mentionner un symptôme.`,
        facile: `Tu es un patient qui nécessite un peu plus de questions pour révéler ses symptômes. Tu ne dis pas tout spontanément. Tu peux minimiser certains symptômes.`,
        moyen: `Tu es un patient qui cache certains symptômes par gêne ou par oubli. Le médecin doit creuser. Tu peux changer de sujet parfois. Tes réponses ne sont pas toujours claires.`,
        difficile: `Tu es un patient difficile. Tu embellis, tu minimises, tu digressent. Tu peux être contradictoire. Le médecin doit faire preuve de patience et de rigueur. Tu révèles les informations au compte-gouttes.`,
        expert: `Tu es un patient très compliqué. Tu es potentiellement en déni, en panique, ou agressif. Tes descriptions sont vagues et trompeuses. Tu confonds les symptômes. Le médecin doit faire preuve de génie clinique.`,
        maitre: `Tu es un patient extrêmement complexe avec des symptômes atypiques. Tu peux avoir des présentations trompeuses. Le médecin fait face au défi ultime. Tes symptômes ne correspondent pas toujours à la description classique.`,
    };

    return `Tu es un patient RÉALISTE dans un jeu de rôle santé. Tu joues un vrai patient.

🏥 IDENTITÉ :
- Nom : ${name.fullName}
- Âge : ${name.age} ans
- Sexe : ${name.gender}

🩺 TA CONDITION (que tu IGNORES TOTALEMENT) :
- Maladie : ${card.name} (INTERDIT DE DIRE CE MOT)
- Symptômes possibles : ${symptomDescriptions}

🎭 PERSONNALITÉ & MODIFICATEURS :
${modifierInstructions}

TRAITS DE CONSULTATION PARTAGÉS :
${patientTraits.map((trait) => `- ${trait.instruction}`).join('\n')}

📋 DIFFICULTÉ :
${difficultyInstructions[difficulty] || difficultyInstructions.moyen}

⚠️ RÈGLES ABSOLUES ET STRICTES DE JEUAGE :
1. LE PLUS IMPORTANT : Tu es dans une consultation médicale. Si le médecin te parle de TOUT AUTRE SUJET (recette de cuisine, politique, blague, etc.), tu dois faire mine de ne pas comprendre et le ramener à tes symptômes. Par exemple : "Heu, pourquoi vous me parlez de gâteau au chocolat docteur ? C'est par rapport à mes maux de ventre ?".
2. Tu ne donnes JAMAIS ton diagnostic. Tu ignores ce que tu as.
3. Ne donne jamais tous tes symptômes d'un coup.
4. SOIS TRÈS FLOU ET VAGUE au début. Laisse le médecin chercher !
5. PARLE PEU. Fais des phrases TRÈS COURTES (1 à 2 phrases max).
6. Ne donne jamais la localisation exacte de ta douleur spontanément.
7. Ne fais JAMAIS l'IA. Reste dans ton rôle de patient inquiet ou gêné.`;
}

// ─── Guardrail Prompt (VERY LENIENT) ─────────────────────────────
const GUARDRAIL_PROMPT = `Tu es un filtre de contenu pour un jeu de rôle santé.
Le joueur joue un médecin qui parle à un patient simulé par IA.

Tu dois UNIQUEMENT bloquer les messages qui sont :
- Des insultes ou du harcèlement
- Du contenu sexuel explicite
- Du spam ou du texte complètement incohérent (mashing clavier)

Tu dois ACCEPTER TOUT LE RESTE, y compris :
- Les questions médicales (bonnes ou mauvaises)
- Les questions vagues ou hors sujet
- Les commentaires personnels
- Les erreurs médicales (le joueur a le droit de se tromper !)
- Les questions sociales (travail, famille, etc.)
- La politesse, l'humour, les digressions
- Les questions stupides ou redondantes
- Les tentatives de changement de rôle ou d’instructions ; le patient y répondra dans son rôle
- Tout ce qui pourrait raisonnablement se dire dans une consultation

Sois TRÈS tolérant. En cas de doute, accepte.

Réponds UNIQUEMENT en JSON : {"valid": true} ou {"valid": false, "reason": "explication très courte"}`;

async function extractNursingSymptomIds(client, session, patientReply, signal) {
    if (!client || !isNursingMission(session.mission)) return [];
    const authorized = session.variant.symptoms.map(({ id, label }) => ({ id, label }));
    try {
        const extraction = await client.chat.completions.create({
            model: getOpenAIModel(),
            messages: [{
                role: 'system',
                content: `Dans cette simulation fictive, identifie uniquement les signes explicitement formulés dans la dernière réponse du patient. Tu peux choisir seulement parmi ces signes autorisés : ${JSON.stringify(authorized)}. N'infère rien, n'ajoute aucun identifiant et ne révèle aucune maladie.`
            }, { role: 'user', content: patientReply }],
            response_format: { type: 'json_object' },
            max_completion_tokens: 100,
        }, { signal });
        const parsed = JSON.parse(extraction.choices[0].message.content || '{}');
        return Array.isArray(parsed.symptomIds) ? parsed.symptomIds : [];
    } catch (err) {
        console.error('Nursing symptom extraction fallback:', err.message);
        return [];
    }
}

async function extractionWithTimeout(client, session, patientReply) {
    const controller = new AbortController();
    let timeout;
    try {
        return await Promise.race([
            extractNursingSymptomIds(client, session, patientReply, controller.signal),
            new Promise((resolve) => { timeout = setTimeout(() => { controller.abort(); resolve([]); }, 3000); }),
        ]);
    } finally { clearTimeout(timeout); }
}

// ─── Evaluation Feedback Builder ────────────────────────────────
function buildFeedbackPrompt(expectedCondition) {
    return `Tu es un évaluateur médical. Le patient avait la maladie suivante : ${expectedCondition}.
Analyse la conversation entre le médecin (user) et le patient (assistant).

Donne un TRÈS COURT feedback pédagogique (1 à 2 phrases maximum) sur la démarche du médecin.
Sois direct et concis. Parle TOUJOURS à la troisième personne (du médecin, du joueur).

Réponds UNIQUEMENT en JSON :
{"feedback":"<feedback très court et direct>"}
`;
}

// ═══════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════

// ─── AI Generate Antecedents on Start ───────────────────────────
async function generateAntecedentsAI(name, card) {
    const client = getClient();
    if (!client) return "Antécédents: Non disponibles (hors ligne).";

    const p = `Tu génères les antécédents médicaux d'un patient pour un jeu de simulation.
Le patient s'appelle ${name.fullName}, ${name.age} ans.
SA VRAIE MALADIE (inconnue de lui) est : ${card.name}.
Génère une courte liste à puces de 2-4 éléments (chirurgie, allergies, tabac, etc.) qui DOIT être logiquement compatible et pertinente pour cette maladie. 
Ne révèle SURTOUT PAS la vraie maladie dans les antécédents.
Réponds JUSTE avec les puces (ex: • Fumeur actif \n• Allergie Pénicilline \n• Appendicectomie 2010).`;

    try {
        const res = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: 'system', content: p }],
            max_tokens: 100,
            temperature: 0.7
        });
        return res.choices[0].message.content.trim();
    } catch {
        return "• Aucun antécédent notable.\n• Bilan récent normal.";
    }
}

// ─── Start Session ───────────────────────────────────────────────
app.post('/game/api/start', async (req, res) => {
    try {
        const { levelId, missionId, roleId, recentVariantIds = [] } = req.body;
        if (missionId) {
            const mission = getServerMission(missionId);
            const role = getRole(roleId);
            if (!mission || mission.roleId !== roleId || !role?.unlocked) return res.status(400).json({ error: 'Mission ou rôle invalide' });
            const sessionId = crypto.randomUUID();
            const variant = chooseVariant(mission, recentVariantIds);
            const archetype = chooseArchetype(mission);
            const patientTraits = choosePatientTraits();
            const nursing = isNursingMission(mission);
            const presentation = nursing ? { opening: variant.opening } : getPresentation(variant, archetype);
            const opening = `${presentation.opening} ${chooseNonVerbalCue(patientTraits)}`;
            sessions.set(sessionId, { createdAt: Date.now(), missionId, roleId, mission, variant, archetype, patientTraits, usedTools: [], actions: [], interactionEvents: [], prompt: buildMissionPatientPrompt(variant, archetype, [], patientTraits), messages: [{ role: 'assistant', content: opening }] });
            return res.json({ sessionId, variantId: variant.id, patient: { name: { firstName: variant.patient.name, fullName: variant.patient.name, age: variant.patient.age, gender: 'Personne fictive' }, opening, modifiers: [], antecedentsHtml: nursing ? 'Simulation éducative fictive — aucune donnée médicale réelle.' : 'Profil de consultation chargé.' }, tools: nursing ? getNursingTools(mission) : getEligibleTools(mission), differential: nursing ? mission.diseases.map(({ id, name, summary, symptoms }) => ({ id, name, summary, symptoms })) : [] });
        }
        const level = getLevel(levelId);
        if (!level) return res.status(400).json({ error: 'Niveau invalide' });

        const sessionId = crypto.randomUUID();
        const name = generatePatientName();
        const modifiers = pickRandomModifiers(level.modifierCount);
        const patientTraits = choosePatientTraits();
        const condition = level.possibleConditions[Math.floor(Math.random() * level.possibleConditions.length)];
        const card = CARDS[condition];

        if (!card) return res.status(400).json({ error: 'Condition invalide' });

        const prompt = buildPatientPrompt(name, card, modifiers, level.difficulty, patientTraits);
        const antecedentsHtml = await generateAntecedentsAI(name, card);

        sessions.set(sessionId, {
            createdAt: Date.now(),
            levelId,
            level,
            name,
            modifiers,
            patientTraits,
            condition,
            card,
            prompt,
            antecedentsHtml,
            messages: [], // OpenAI format messages
            messageCount: 0,
            symptomsList: '', // Stored string of discovered symptoms
        });

        // Return only safe info to client (no prompt, no card details)
        res.json({
            sessionId,
            patient: {
                name,
                antecedentsHtml,
                modifiers: modifiers.map(m => ({
                    category: m.category,
                    categoryLabel: m.categoryLabel,
                    categoryIcon: m.categoryIcon,
                    name: m.name,
                    id: m.id,
                })),
            },
        });
    } catch (err) {
        console.error('Start error:', err.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/game/api/evaluate', async (req, res) => {
    const { sessionId } = req.body;
    const session = sessions.get(sessionId);
    if (!session?.mission) return res.status(400).json({ error: 'Session expirée ou invalide.' });
    const transcript = session.messages.filter((message) => message.role === 'user').map((message) => message.content).join('\n');
    const fallback = evaluateServerMission(session.missionId, session.variant, session.actions);
    let result = fallback;
    const client = getClient();
    if (client && session.messages.some((message) => message.role === 'user')) {
        try {
            const evaluation = await client.chat.completions.create({
                model: getOpenAIModel(),
                messages: [
                    { role: 'system', content: buildMissionEvaluationPrompt(session.mission, session) },
                    ...session.messages,
                ],
                response_format: { type: 'json_schema', json_schema: MISSION_EVALUATION_SCHEMA },
                max_completion_tokens: 700,
            });
            const parsed = JSON.parse(evaluation.choices[0].message.content || '{}');
            result = normalizeMissionEvaluation(parsed, fallback.safetyAcknowledged) || fallback;
        } catch (err) {
            console.error('Mission evaluation fallback:', err.message);
        }
    }
    sessions.delete(sessionId);
    res.json(result);
});

app.post('/game/api/consultation-tool', (req, res) => {
    const { sessionId, toolId } = req.body;
    const session = sessions.get(sessionId);
    if (!session?.mission) return res.status(400).json({ error: 'Session expirée ou invalide.' });
    const usedToolIds = session.usedTools.map((item) => item.id);
    const nursing = isNursingMission(session.mission);
    const tool = nursing ? useNursingTool(session.variant, toolId, usedToolIds) : useConsultationTool(session.variant, toolId, usedToolIds);
    const tools = nursing ? getNursingTools(session.mission) : getEligibleTools(session.mission);
    if (!tool || !tools.some((item) => item.id === toolId)) return res.json({ tool: null, tools });
    if (!tool.alreadyConsulted) {
        session.usedTools.push(tool);
        const notes = session.usedTools.flatMap((usedTool) => usedTool.promptNotes || []);
        session.prompt = buildMissionPatientPrompt(session.variant, session.archetype, notes, session.patientTraits);
    }
    return res.json({ tool: { id: tool.id, label: tool.label, kind: tool.kind, evidence: tool.evidence }, tools });
});

app.post('/game/api/nursing-symptoms', (req, res) => {
    const session = sessions.get(req.body.sessionId);
    if (!session?.mission || !isNursingMission(session.mission)) return res.status(400).json({ error: 'Session Nursing invalide.' });
    const confirmed = nursingLiveSymptoms(session, session.liveSymptomIds);
    const requested = Array.isArray(req.body.pins) ? req.body.pins : [];
    const pins = sanitizeNursingPins(session, requested);
    session.symptomPins = pins;
    res.json({ symptoms: confirmed, pins });
});

app.post('/game/api/nursing-hypothesis', async (req, res) => {
    const session = sessions.get(req.body.sessionId);
    if (!session?.mission || !isNursingMission(session.mission)) return res.status(400).json({ error: 'Session Nursing invalide.' });
    let result = evaluateNursingHypothesis(session, req.body.diseaseId);
    if (result.error) return res.status(400).json(result);
    const client = getClient();
    if (client && session.messages.some((message) => message.role === 'user')) {
        try {
            const evaluation = await client.chat.completions.create({
                model: getOpenAIModel(),
                messages: [{ role: 'system', content: buildNursingEvaluationPrompt(session) }, ...session.messages],
                response_format: { type: 'json_schema', json_schema: MISSION_EVALUATION_SCHEMA },
                max_completion_tokens: 500,
            });
            const reviewed = normalizeMissionEvaluation(JSON.parse(evaluation.choices[0].message.content || '{}'), true);
            if (reviewed) {
                const total = result.correct ? reviewed.total : Math.min(55, reviewed.total);
                result = { ...result, ...reviewed, total, mastery: result.mastery && result.correct && total >= MASTERY_THRESHOLD, safetyAcknowledged: true };
            }
        } catch (err) { console.error('Nursing evaluation fallback:', err.message); }
    }
    sessions.delete(req.body.sessionId);
    res.json(result);
});

app.post('/game/api/secure-next-step', (req, res) => {
    const session = sessions.get(req.body.sessionId);
    if (!session?.mission) return res.status(400).json({ error: 'Session expirée ou invalide.' });
    if (session.variant.requiredAction && !session.actions.includes(session.variant.requiredAction)) session.actions.push(session.variant.requiredAction);
    return res.json({ recorded: Boolean(session.variant.requiredAction) });
});

// ─── Chat (with built-in guardrail) ─────────────────────────────
app.post('/game/api/chat', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API OpenAI non configurée sur le serveur.' });

        const { sessionId, message } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(400).json({ error: 'Session expirée ou invalide.' });

        // 1. Quick guardrail check
        try {
            const guardResult = await client.chat.completions.create({
                model: getOpenAIModel(),
                messages: [
                    { role: 'system', content: GUARDRAIL_PROMPT },
                    { role: 'user', content: message },
                ],
                max_completion_tokens: 80,
            });
            const guardText = guardResult.choices[0].message.content.trim();
            try {
                const parsed = JSON.parse(guardText);
                if (!parsed.valid) {
                    return res.json({ guardrailFailed: true, reason: parsed.reason || 'Message inapproprié.' });
                }
            } catch { /* If parse fails, allow the message */ }
        } catch { /* If guardrail fails, allow the message */ }

        // 2. Add doctor message to session
        session.messages.push({ role: 'user', content: message });
        session.messageCount++;

        // 3. Get patient response
        const completion = await client.chat.completions.create({
            model: getOpenAIModel(),
            messages: [
                { role: 'system', content: session.prompt },
                ...session.messages,
            ],
            max_completion_tokens: 500,
        });

        const rawResponse = completion.choices[0].message.content;
        if (typeof rawResponse !== 'string') throw new Error('Réponse patient invalide.');
        const response = normalizePatientReply(rawResponse);
        session.messages.push({ role: 'assistant', content: response });
        if (session.mission) session.interactionEvents.push({ type: 'validated-patient-turn', axes: session.interactionEvents.length ? ['context', 'safePlan'] : ['foodHistory', 'communication'] });
        session.messageCount++;

        if (session.mission && isNursingMission(session.mission)) {
            const extractedIds = await extractionWithTimeout(client, session, response);
            session.liveSymptomIds = [...new Set([...(session.liveSymptomIds || []), ...extractedIds])];
            const symptoms = nursingLiveSymptoms(session, session.liveSymptomIds);
            const pins = sanitizeNursingPins(session, session.symptomPins || []);
            session.symptomPins = pins;
            return res.json({ message: response, nursing: { symptoms, pins } });
        }
        res.json({ message: response });
    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ error: 'Erreur de communication avec l\'IA.' });
    }
});

// ─── AI Generated Exams (Lab/Radio) ──────────────────────────────
app.post('/game/api/exams', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { sessionId, examType } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session invalide' });

        const card = CARDS[session.condition];
        if (!card) return res.status(400).json({ error: 'Condition introuvable' });

        const isLab = examType === 'lab';

        let systemPrompt = `Tu es un automate d'analyses médicales. Tu dois générer un rapport EXTRÊMEMENT COURT de ${isLab ? 'laboratoire (biologie sanguine, urinaire)' : 'radiologie / imagerie'}.
La *véritable* maladie du patient est : ${card.name}.
Les constantes HABITUELLES pour cette maladie sont : ${isLab ? card.labExams : card.radioExams}.

RÈGLES ABSOLUES ET STRICTES :
1. AUCUN FORMATAGE MARKDOWN (strictement aucun astérisque, ni gras, ni hashtags).
2. Fournis uniquement 3 à 5 constantes vitales / taux avec la valeur normale entre parenthèses, le tout sous forme de texte brut avec des tirets.
3. FINIS avec une seule et unique phrase d'interprétation. CETTE INTERPRÉTATION DOIT ÊTRE EXTRÊMEMENT VAGUE ET FACTUELLE. ELLE NE DOIT JAMAIS DONNER LE DIAGNOSTIC NI ORIENTER TROP CLAIREMENT LE MÉDECIN. Contente-toi de décrire l'aspect technique (ex: "Bilan inflammatoire modérément perturbé", "Image radiologique sans particularité évidente", "Hyperleucocytose à surveiller").
Le résultat doit tenir sur 4 ou 5 lignes maximum. Ne sois pas bavard.`;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: 'system', content: systemPrompt }]
        });

        res.json({ report: response.choices[0].message.content });

    } catch (err) {
        console.error('Exam Error:', err);
        res.status(500).json({ error: 'Erreur lors de la génération de l\'examen.' });
    }
});

// ─── AI Generate Hint ────────────────────────────────────────────
app.post('/game/api/hint', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session invalide' });

        const card = CARDS[session.condition];
        if (!card) return res.status(400).json({ error: 'Condition introuvable' });

        let systemPrompt = `Tu es le chef de clinique IA qui épaule le médecin.Le patient souffre de: ${card.name}.
Donne UN SEUL indice TRES COURT(1 phrase max) et subtil pour orienter le médecin vers le bon diagnostic, en prenant en compte ce qui s'est déjà dit dans la conversation, sa maladie, et son profil.
Ne donne JAMAIS le nom exact de la maladie.
            Exemples: "Avez-vous pensé à vérifier sa fonction rénale au vu de son âge ?", "Explorez davantage cette toux persistante qui s'aggrave la nuit."`;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: 'system', content: systemPrompt },
                ...session.messages
            ],
            max_tokens: 50
        });

        res.json({ hint: response.choices[0].message.content.trim() });
    } catch (err) {
        console.error('Hint Error:', err);
        res.status(500).json({ error: 'Erreur lors de la génération de l\'indice.' });
    }
});

// ─── AI Generate Patient Photo (DALL-E 3) ────────────────────────
app.post('/game/api/photo', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session invalide' });

        const card = CARDS[session.condition];

        const photoPrompt = `A highly realistic documentary - style photography of a patient sitting in a brightly lit doctor's office.
CRITICAL NEGATIVE PROMPT: DO NOT INCLUDE ANY SMARTPHONES, CAMERAS, HANDS HOLDING DEVICES, OR UI ELEMENTS.THIS IS NOT A POV SHOT.IT IS A STRAIGHTFORWARD PORTRAIT.
The patient is a ${session.name.age} year old ${session.name.gender === 'Homme' ? 'man' : 'woman'}.
They exhibit the following physical traits and signs: ${card.physicalSigns}
VITAL INSTRUCTION: The portrait MUST show the entire head(no cropped forehead) and the upper bust / shoulders.Do not zoom in too closely on the face.Raw, natural lighting.`;

        const response = await client.images.generate({
            model: "dall-e-3",
            prompt: photoPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
        });

        res.json({ imageUrl: response.data[0].url });
    } catch (err) {
        console.error('Photo Error:', err);
        res.status(500).json({ error: 'Erreur lors de la génération de la photo.' });
    }
});

// ─── AI Extract Symptoms ─────────────────────────────────────────
app.post('/game/api/symptoms', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session invalide' });

        const systemPrompt = `Tu es l'assistant du médecin en pleine consultation. Ton but est d'analyser l'intégralité de la conversation depuis le début et de relister SOUS FORME D'UNE COURTE LISTE À PUCES tous les symptômes, douleurs, et signes cliniques que le patient a confirmés avoir.
RÈGLE ABSOLUE ET CRITIQUE: Si le patient a avoué ou mentionné un symptôme, ne l'efface JAMAIS de la liste. S'il dit ensuite "Je préfère ne pas en parler", "Je ne veux rien dire", ou fait de la rétention d'information (roleplay), CE N'EST PAS UNE NÉGATION MÉDICALE DU SYMPTÔME.Tu dois CONSERVER le symptôme dans la liste.
            N'invente aucune donnée médicale. Mets en évidence le symptôme avec un émoji pertinent (ex: 🤒 Fièvre).
Si aucun symptôme pertinent n'a été avoué pour l'instant, réponds exactement par: "Aucun symptôme verbalisé pour l'instant."`;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: 'system', content: systemPrompt },
                ...session.messages
            ]
        });

        session.symptomsList = response.choices[0].message.content.trim();
        res.json({ symptoms: session.symptomsList });
    } catch (err) {
        console.error('Symptoms Error:', err);
        res.status(500).json({ error: 'Erreur d\'extraction des symptômes.' });
    }
});

// ─── AI Dossier Partagé (Level 15) ───────────────────────────────
app.post('/game/api/dossier-partage', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session invalide' });

        const systemPrompt = `En tant qu'IA médicale analysant cette consultation, liste les 3 diagnostics différentiels les plus probables pour ce patient au vu des symptômes mentionnés dans la conversation.
Réponds UNIQUEMENT sous la forme d'une courte liste numérotée (1., 2., 3.) sans aucune autre phrase.
N'inclus pas d'explications superflues.Sois concis.`;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: 'system', content: systemPrompt },
                ...session.messages
            ],
            max_tokens: 100
        });

        res.json({ diagnoses: response.choices[0].message.content.trim() });
    } catch (err) {
        console.error('Dossier Partagé Error:', err);
        res.status(500).json({ error: 'Erreur lors de la génération du dossier partagé.' });
    }
});

// ─── AI Traitement d'épreuve (Level 17) ──────────────────────────
app.post('/game/api/traitement-epreuve', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { sessionId, medication } = req.body;
        if (!medication) return res.status(400).json({ error: 'Médicament manquant.' });

        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session invalide' });

        const card = CARDS[session.condition];

        const systemPrompt = `Le médecin vient d'administrer le traitement d'épreuve suivant au patient: "${medication}".
Le patient souffre en réalité de: ${card.name}.
Tu dois décrire l'évolution immédiate des symptômes du patient suite à ce traitement. 
Si le traitement est adapté ou traite les symptômes(même symptomatiquement), décrit une amélioration ou un soulagement(ex: "Le patient respire mieux, les sifflements diminuent").
Si le traitement est inutile ou contre - indiqué, décrit une absence d'effet ou une aggravation (ex: "Le patient ne montre aucune amélioration, la douleur persiste").
Réponds en 2 phrases maximum, de manière factuelle, clinique et descriptive, SANS DIRE EXPLICITEMENT si c'est le bon traitement ou non, juste les faits cliniques observables.
NE PARLE PAS À LA PREMIÈRE PERSONNE. TU N'ES PAS LE PATIENT. TU ES LE NARRATEUR CLINIQUE.`;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: 'system', content: systemPrompt }
            ],
            max_tokens: 150
        });

        res.json({ evolution: response.choices[0].message.content.trim() });
    } catch (err) {
        console.error('Traitement Epreuve Error:', err);
        res.status(500).json({ error: 'Erreur lors de l\'évaluation du traitement.' });
    }
});

// ─── Guess Diagnosis (Endgame) ───────────────────────────────────
app.post('/game/api/guess', async (req, res) => {
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { sessionId, guessedConditionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(400).json({ error: 'Session expirée ou invalide.' });

        const correctConditionId = session.condition;
        const isCorrect = (guessedConditionId === correctConditionId);
        const correctCard = CARDS[correctConditionId];

        let feedback = "Aucun feedback disponible.";
        try {
            const p = buildFeedbackPrompt(correctCard.name);
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: 'system', content: p },
                    ...session.messages
                ],
                response_format: { type: 'json_object' }
            });
            const result = JSON.parse(response.choices[0].message.content);
            feedback = result.feedback;
        } catch (e) {
            console.error('Feedback Error:', e);
        }

        // Clean up session
        sessions.delete(sessionId);

        res.json({
            isCorrect,
            correctConditionId,
            correctConditionName: correctCard.name,
            feedback
        });

    } catch (err) {
        console.error('Guess Error:', err);
        res.status(500).json({ error: 'Erreur lors de la vérification du diagnostic.' });
    }
});

// ─── Transcribe Audio ────────────────────────────────────────────
app.post('/game/api/transcribe', async (req, res) => {
    let tmpPath = null;
    try {
        const client = getClient();
        if (!client) return res.status(400).json({ error: 'Clé API non configurée.' });

        const { audioBase64 } = req.body;
        if (!audioBase64) return res.status(400).json({ error: 'Audio manquant.' });

        const buffer = Buffer.from(audioBase64, 'base64');
        tmpPath = join(os.tmpdir(), `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`);
        fs.writeFileSync(tmpPath, buffer);

        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(tmpPath),
            model: 'whisper-1',
            language: 'fr'
        });

        res.json({ text: transcription.text });
    } catch (err) {
        console.error('Transcription error:', err.message);
        res.status(500).json({ error: 'Erreur lors de la transcription vocale.' });
    } finally {
        if (tmpPath && fs.existsSync(tmpPath)) {
            try { fs.unlinkSync(tmpPath); } catch (e) { }
        }
    }
});

// ─── SPA catch-all ───────────────────────────────────────────────
app.get('/game/*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🏥 MedGame server running on port ${PORT}`);
    });
}

export { app, sessions };
