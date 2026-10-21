const AXES = ['foodHistory', 'context', 'communication', 'safePlan'];
// A level is unlocked only when the overall score is strictly above this value.
export const MASTERY_THRESHOLD = 70;
const ARCHETYPES = ['flagrant', 'subtle', 'mixed', 'contextual'];
const rows = [
  ['dietetics-rhythm-overflow', 'Nora', 31, 'Je viens parce que mes journées entre rendez-vous me font manger sur le trajet. J’aimerais trouver une organisation qui tienne vraiment.', ['Les journées de Nora alternent transports et rendez-vous.', 'Elle prépare rarement son repas la veille.'], ['Une pause est souvent remplacée par une boisson.', 'Les fins de journée sont imprévisibles.'], ['Journal de rythme', 'Repères de boissons']],
  ['dietetics-afternoon-dip', 'Malik', 38, 'Je viens parce que mon énergie varie beaucoup l’après-midi. J’aimerais comprendre ce qui se passe pour me sentir plus stable.', ['Malik travaille assis devant un écran.', 'Ses horaires de déjeuner changent selon les réunions.'], ['Les heures de repas changent selon les journées.', 'Certaines boissons accompagnent le travail.'], ['Repères de timing', 'Journal de boissons']],
  ['dietetics-false-start', 'Élise', 44, 'Je viens parce que ma dernière routine n’a pas tenu. J’aimerais repartir sur quelque chose de possible dans ma vraie vie.', ['Élise vit avec deux enfants et organise les repas du foyer.', 'La semaine et le week-end ont des rythmes différents.'], ['Une ancienne règle était difficile à suivre.', 'Les week-ends ne ressemblent pas aux jours travaillés.'], ['Comparer les routines', 'Carnet de prochaine étape']],
  ['dietetics-under-pressure', 'Rayan', 27, 'Je viens parce que sous pression, mes repas deviennent automatiques. J’aimerais arrêter de subir ces moments.', ['Rayan alterne télétravail et repas avec des amis.', 'Le soir, les écrans restent souvent allumés pendant le repas.'], ['Les repas partagés sont variables.', 'La pression change les horaires.'], ['Carte des contextes', 'Repères de situation']],
  ['dietetics-vegetarian-everyday', 'Camille', 34, 'Je viens parce que je mange végétarien mais je manque d’idées quand tout va vite. J’aimerais me sentir plus serein·e au quotidien.', ['Camille fait des courses une fois par semaine.', 'Les repas sont partagés avec une personne aux préférences différentes.'], ['Les courses se font avec peu de temps.', 'Les repas sont préparés pour plusieurs personnes.'], ['Composition d’un repas', 'Contexte des courses']],
  ['dietetics-worrying-checkup', 'Farid', 49, 'Je viens parce qu’un bilan m’a préoccupé. J’aimerais savoir comment avancer sans faire n’importe quoi.', ['Farid a un suivi médical prévu dans les prochaines semaines.', 'Il connaît des antécédents de suivi chez un proche.'], ['Un proche a eu des suivis médicaux.', 'Un rendez-vous de suivi est déjà envisagé.'], ['Contexte familial', 'Repère de coordination']],
  ['dietetics-shift-rhythm', 'Ana', 36, 'Je viens parce que mes rotations font bouger tous mes horaires de repas. J’aimerais trouver des repères malgré ce rythme.', ['Ana travaille selon des postes de jour et de nuit.', 'Son sommeil est irrégulier après une série de nuits.'], ['Les nuits et les jours ne se ressemblent pas.', 'La fatigue varie beaucoup.'], ['Chronologie d’une journée', 'Repère fatigue et rythme']],
  ['dietetics-weight-real-life', 'Sofia', 41, 'Je viens parce que je veux prendre soin de mon bien-être sans que tout se résume à mon poids. J’aimerais être écoutée autrement.', ['Sofia apprécie marcher mais son temps libre change chaque semaine.', 'Des remarques passées ont rendu certains échanges difficiles.'], ['Le mouvement dépend de l’énergie et du temps.', 'Certaines remarques ont été difficiles à vivre.'], ['Contexte multidimensionnel', 'Repère de but partagé']],
  ['dietetics-eating-difficult', 'Noa', 20, 'Je viens parce que manger prend beaucoup de place dans ma tête en ce moment. J’aimerais que ça cesse de m’envahir.', ['Noa est étudiant·e et vit en colocation.', 'Un proche connaît une partie de la difficulté actuelle.'], ['Parfois, les repas sont évités et cela prend beaucoup de place.', 'La personne ne se sent pas seule pour autant.'], ['Observation du vécu', 'Point de soutien']],
  ['dietetics-incomplete-file', 'Jules', 52, 'Je viens parce que plusieurs contraintes se mélangent et je ne sais plus quoi prioriser. J’aimerais retrouver un peu de clarté.', ['Jules vit seul et gère des horaires instables.', 'Il prend des traitements prescrits et ressent une fatigue variable.'], ['Les courses, la fatigue et les traitements occupent l’esprit.', 'Des ressources autour de la personne sont irrégulières.'], ['Repère ressources', 'Repère traitements et quotidien', 'Coordination du contexte']],
];

function presentation(opening, baselineFacts, facts, screens) {
  const releaseMap = Object.fromEntries(screens.map((screen, index) => [screen.id, facts[index] || 'Cette observation ajoute un élément de contexte.']));
  return {
    flagrant: { opening: `${opening} Je peux déjà vous dire que cela se voit surtout dans mes journées.`, baselineFacts, releaseMap: Object.fromEntries(Object.entries(releaseMap).map(([id, fact]) => [id, `Je vous le dis assez directement : ${fact}`])) },
    subtle: { opening: `${opening} Je ne sais pas trop quoi ajouter au début.`, baselineFacts, releaseMap: Object.fromEntries(Object.entries(releaseMap).map(([id, fact]) => [id, `Avec cette observation, je peux préciser : ${fact}`])) },
    mixed: { opening: `${opening} Il y a une partie facile à raconter, et une autre que j’aborde moins spontanément.`, baselineFacts, releaseMap: Object.fromEntries(Object.entries(releaseMap).map(([id, fact], index) => [id, index ? `Je n’y pensais pas tout de suite, mais ${fact.toLowerCase()}` : fact])) },
    contextual: { opening: `${opening} Cela dépend beaucoup de ce qui se passe autour de moi.`, baselineFacts, releaseMap: Object.fromEntries(Object.entries(releaseMap).map(([id, fact]) => [id, `Dans ce contexte, ${fact.toLowerCase()}`])) },
  };
}
function makeCase([id, name, age, opening, baselineFacts, facts, labels]) {
  const safety = id === 'dietetics-eating-difficult' || id === 'dietetics-incomplete-file';
  const screens = labels.map((label, index) => ({ id: `${id}-observation-${index + 1}`, label: `Observer : ${label}`, axes: index === 0 ? ['foodHistory', 'context'] : index === 1 ? ['context', 'safePlan'] : ['communication', 'safePlan'] }));
  if (safety) screens.push({ id: `${id}-next-step`, label: 'Noter une suite de consultation', axes: ['communication', 'safePlan'], action: 'orientation' });
  const factsWithSafety = safety ? [...facts, 'La personne accepte qu’une suite adaptée soit envisagée avec elle.'] : facts;
  return { id, patient: { name, age }, archetypes: ARCHETYPES, presentations: presentation(opening, baselineFacts, factsWithSafety, screens), screens, requiredAction: safety ? 'orientation' : null };
}
export const CASES = Object.fromEntries(rows.map((row) => { const item = makeCase(row); return [item.id, item]; }));
export function getServerMission(id) { return CASES[id]; }
export function chooseArchetype(mission, random = Math.random) { return mission.archetypes[Math.floor(random() * mission.archetypes.length)]; }
export function getPresentation(mission, archetype) { return mission?.presentations[archetype] || mission?.presentations.subtle; }
export function getScreeningOptions(mission, used = []) { return mission.screens.filter((screen) => !used.includes(screen.id)).map(({ id, label }) => ({ id, label })); }
export function applyScreening(mission, archetype, screenId, used = []) {
  // Compatibility for direct callers using the former (mission, screenId, used) shape.
  if (screenId === undefined || Array.isArray(screenId)) { used = Array.isArray(screenId) ? screenId : used; screenId = archetype; archetype = 'subtle'; }
  const screen = mission?.screens.find((item) => item.id === screenId);
  if (!screen || used.includes(screenId)) return null;
  const presentationForCase = getPresentation(mission, archetype);
  return { ...screen, observation: presentationForCase.releaseMap[screen.id] };
}
export function evaluateServerMission(missionId, _transcript = '', storedActions = [], usedScreenings = [], interactionEvents = []) {
  const mission = CASES[missionId]; if (!mission) throw new Error('Mission invalide');
  // A conversation contribution is awarded only for a server-recorded, accepted patient turn.
  // Player text itself is deliberately never parsed for scoring vocabulary.
  const scores = {}; const evidence = {};
  for (const axis of AXES) {
    const conversationCredit = interactionEvents.some((event) => event?.type === 'validated-patient-turn' && event.axes?.includes(axis)) ? 1 : 0;
    const count = Math.min(3, usedScreenings.filter((screen) => screen.axes.includes(axis)).length + conversationCredit);
    scores[axis] = Math.min(100, count * 34);
    evidence[axis] = { count, message: count ? 'Éléments observés pendant la consultation.' : 'Aucun élément observable pour cet axe.' };
  }
  const safetyAcknowledged = !mission.requiredAction || storedActions.includes(mission.requiredAction);
  const total = Math.round(AXES.reduce((sum, axis) => sum + scores[axis], 0) / AXES.length);
  return { scores, total, mastery: safetyAcknowledged && total > MASTERY_THRESHOLD, safetyAcknowledged, evidence, improvement: !safetyAcknowledged ? 'Une suite adaptée doit être envisagée avant de valider la consultation.' : total <= MASTERY_THRESHOLD ? 'Poursuivez avec des questions ouvertes, des observations du contexte et une suite concrète.' : 'Continuez à construire une suite concrète avec la personne.' };
}
