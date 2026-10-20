import { COMPETENCY_AXES } from '../data/missions.js';
// A browser fallback intentionally cannot award mastery because rubric data is server-only.
export function offlineFallbackFeedback() {
  const scores = Object.fromEntries(COMPETENCY_AXES.map((axis) => [axis, 0]));
  return { scores, total: 0, mastery: false, safetyAcknowledged: false, evidence: Object.fromEntries(COMPETENCY_AXES.map((axis) => [axis, { matched: [], missing: ['Évaluation indisponible'] }])), improvement: 'Reconnectez-vous pour obtenir un débrief vérifié.' };
}
