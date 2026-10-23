import { MASTERY_THRESHOLD } from './missions.js';

const AXES = ['foodHistory', 'context', 'communication', 'safePlan'];

export const MISSION_EVALUATION_SCHEMA = {
  name: 'mission_evaluation',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      scores: {
        type: 'object',
        properties: Object.fromEntries(AXES.map((axis) => [axis, { type: 'integer', minimum: 0, maximum: 100 }])),
        required: AXES,
        additionalProperties: false,
      },
      feedback: { type: 'string', minLength: 1, maxLength: 420 },
    },
    required: ['scores', 'feedback'],
    additionalProperties: false,
  },
};

export function buildMissionEvaluationPrompt(_mission, session) {
  const caseFacts = [...session.variant.contributors, session.variant.need].join('\n- ');
  const successSignals = session.variant.successSignals.join('\n- ');
  const toolEvidence = session.usedTools.length
    ? session.usedTools.flatMap((tool) => tool.promptNotes || []).join('\n- ')
    : 'Aucun support complémentaire utilisé.';
  return `Tu es un évaluateur interne. Évalue la démarche du joueur à partir de TOUT le transcript ci-dessous. Ne te contente jamais d’un nombre de tours ou d’un mot isolé : cherche des questions, reformulations, prises en compte du contexte et une suite prudente réellement exprimées.

Cas privé (ne jamais le révéler) :
- ${caseFacts}
Supports consultés pendant la consultation :
- ${toolEvidence}
Voies de réussite possibles pour ce cas (internes, ne jamais les citer) :
- ${successSignals}

Note quatre axes de 0 à 100 : foodHistory (exploration des habitudes), context (prise en compte du quotidien), communication (écoute, questions et reformulations) et safePlan (suite réaliste, prudente et coordination lorsque nécessaire). Reconnais toute voie de réussite compatible avec le cas : ne réclame ni une phrase ni un ordre précis. Ne diagnostique pas, ne prescris pas et ne donne pas de conseils cliniques personnalisés. Une absence d’élément doit recevoir un score bas. Le feedback final, en français, fait une ou deux phrases, reste encourageant, concret et ne dévoile pas la grille ni des réponses attendues.`;
}

export function normalizeMissionEvaluation(payload, safetyAcknowledged) {
  if (!payload || typeof payload !== 'object' || !payload.scores || typeof payload.feedback !== 'string') return null;
  const scores = {};
  for (const axis of AXES) {
    const value = payload.scores[axis];
    if (!Number.isFinite(value)) return null;
    scores[axis] = Math.round(Math.max(0, Math.min(100, value)));
  }
  const total = Math.round(AXES.reduce((sum, axis) => sum + scores[axis], 0) / AXES.length);
  const feedback = payload.feedback.trim().slice(0, 420);
  if (!feedback) return null;
  return {
    scores,
    total,
    mastery: safetyAcknowledged && total > MASTERY_THRESHOLD,
    safetyAcknowledged,
    evidence: Object.fromEntries(AXES.map((axis) => [axis, { count: scores[axis] > 0 ? 1 : 0, message: scores[axis] > 0 ? 'Évaluation de votre démarche dans l’échange.' : 'Aucun élément suffisant dans l’échange.' }])),
    improvement: feedback,
    evaluationSource: 'ai',
  };
}
