// Browser-safe campaign cards. Facts, scoring, safety gates and observations stay on the server.
export const COMPETENCY_AXES = ['foodHistory', 'context', 'communication', 'safePlan'];
export const MISSIONS = [
  ['dietetics-rhythm-overflow', 'Le rythme qui déborde', '🕒', 'Une semaine pressée, entre repas, collations et boissons.'],
  ['dietetics-afternoon-dip', 'Le creux de l’après-midi', '🥤', 'Explorer la faim, le rassasiement et les habitudes du quotidien.'],
  ['dietetics-false-start', 'Après le faux départ', '🌱', 'Reprendre après un essai qui n’a pas tenu dans la vraie vie.'],
  ['dietetics-under-pressure', 'Manger sous pression', '💬', 'Faire de la place au stress, aux écrans et aux repas partagés.'],
  ['dietetics-vegetarian-everyday', 'Choix végétariens au quotidien', '🥕', 'Composer avec variété, organisation et contraintes pratiques.'],
  ['dietetics-worrying-checkup', 'Le bilan qui inquiète', '📋', 'Mettre en contexte une prévention et coordonner avec soin.'],
  ['dietetics-shift-rhythm', 'Rythme décalé', '🌙', 'Comprendre une alimentation qui suit des horaires changeants.'],
  ['dietetics-weight-real-life', 'Objectif de poids, vraie vie', '⚖️', 'Accueillir préférences, activité et changement progressif.'],
  ['dietetics-eating-difficult', 'Quand manger devient difficile', '🧭', 'Une consultation délicate qui appelle une attention respectueuse.'],
  ['dietetics-incomplete-file', 'Le dossier incomplet', '🧩', 'Avancer prudemment parmi plusieurs contextes qui se croisent.'],
].map(([id, title, icon, summary], index) => ({ id, roleId: 'dietetics', order: index + 1, title, icon, summary }));
export function getMission(id) { return MISSIONS.find((mission) => mission.id === id); }
export function getMissionsForRole(roleId) { return MISSIONS.filter((mission) => mission.roleId === roleId); }
