import { PSYCHOLOGY_MOTIFS, PSYCHOLOGY_SUPPORTS } from '../src/data/psychologyCampaign.js';

const NAMES = ['Camille', 'Noa', 'Samira', 'Jules', 'Lina', 'Malo'];
const CONTEXTS = ['une période de changement au travail', 'un rythme d’études dense', 'des responsabilités familiales nouvelles', 'un déménagement récent', 'un quotidien devenu plus isolé', 'un conflit relationnel qui dure'];
const openings = ['Je ne sais pas vraiment comment expliquer ce qui a changé.', 'Ces dernières semaines, cela prend plus de place dans mes journées.', 'J’aimerais comprendre ce qui rend mon quotidien si difficile.', 'Je viens parce que je ne retrouve plus mon rythme habituel.', 'J’hésitais à en parler, mais cela commence à peser.', 'Je voudrais trouver des mots pour ce que je traverse.'];
function evidence(id, index) {
  const context = CONTEXTS[index];
  return {
    'daily-life-journal': { id: `${id}-journal-${index + 1}`, kind: 'psychology-journal', title: 'Journal du quotidien', entries: [{ moment: 'Matin', text: `Le départ de journée est marqué par ${context}.` }, { moment: 'Après-midi', text: 'Un échange ou une tâche a demandé davantage d’énergie que prévu.' }, { moment: 'Soir', text: 'La personne note ce qui lui a apporté un peu de répit.' }] },
    timeline: { id: `${id}-timeline-${index + 1}`, kind: 'psychology-timeline', title: 'Chronologie', events: ['Avant le changement : rythme habituel préservé.', `Point de bascule : ${context}.`, 'Aujourd’hui : retentissement plus visible dans le quotidien.'] },
    'relationship-map': { id: `${id}-relations-${index + 1}`, kind: 'psychology-relationships', title: 'Carte relationnelle', people: [{ name: 'Un proche', link: 'soutien irrégulier mais présent' }, { name: 'Un interlocuteur du quotidien', link: 'échange devenu délicat' }, { name: 'Un espace ressource', link: 'lieu ou activité parfois apaisante' }] },
    'reaction-chain': { id: `${id}-chain-${index + 1}`, kind: 'psychology-chain', title: 'Chaîne de réaction', steps: [`Situation : un moment lié à ${context}.`, 'Interprétation : « je vais avoir du mal à y arriver ».', 'Émotion : tension ou découragement ressenti.', 'Réponse : retrait, report ou recherche de réassurance.'] },
    'daily-life-fragments': { id: `${id}-fragments-${index + 1}`, kind: 'psychology-fragments', title: 'Fragments du quotidien', fragments: ['Note d’agenda : « prévoir une pause avant le rendez-vous »', 'Message non envoyé : « je ne sais pas comment le dire »', 'Liste : une activité simple gardée comme repère.'] },
  };
}
function blueprint(motifId, index) {
  const motif = PSYCHOLOGY_MOTIFS[motifId]; const context = CONTEXTS[index];
  return Object.freeze({ id: `${motifId}-case-${index + 1}`, motifId, patient: { name: NAMES[index], age: 22 + index * 3 }, opening: openings[index], context, facts: [`La difficulté s’est installée autour de ${context}.`, 'Elle a un retentissement concret sur les habitudes et les relations.', 'Un repère ou une ressource du quotidien reste disponible.'], requiredOrientation: ['ptsd', 'depressive-episode', 'borderline', 'bipolar'].includes(motifId), evidence: evidence(motifId, index) });
}
export const PSYCHOLOGY_DOSSIERS = Object.freeze(Object.fromEntries(Object.keys(PSYCHOLOGY_MOTIFS).map((motifId) => [motifId, Object.freeze(Array.from({ length: 6 }, (_, index) => blueprint(motifId, index)))])));
export function getPsychologyBlueprints(motifId) { return PSYCHOLOGY_DOSSIERS[motifId] || []; }
export function getPsychologyTools(order) { return PSYCHOLOGY_SUPPORTS.filter((support) => support.unlockOrder <= order); }
export function usePsychologySupport(blueprint, toolId, used = []) {
  const support = PSYCHOLOGY_SUPPORTS.find((item) => item.id === toolId); const evidence = blueprint?.evidence?.[toolId];
  if (!support || !evidence) return null;
  const promptNotes = (evidence.entries || evidence.events || evidence.steps || evidence.fragments || evidence.people || []).map((item) => typeof item === 'string' ? item : `${item.moment || item.name}: ${item.text || item.link}`);
  return { id: toolId, label: support.label, kind: support.kind, evidence, promptNotes, alreadyConsulted: used.includes(toolId) };
}
