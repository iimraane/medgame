import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { NURSING_POOLS, NURSING_DISEASES } from '../src/data/nursingCampaign.js';
import { NURSING_DOCUMENT_DEFINITIONS, materializeNursingDossier } from './nursingDossiers.js';

export const MASTERY_THRESHOLD = 70;
const AXES = ['foodHistory', 'context', 'communication', 'safePlan'];
const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = join(__dirname, '..', 'src', 'public', 'assets', 'dietetics');

// Server-only whitelist: a browser can receive only these supplied static files.
const ASSETS = Object.freeze({
  'meal-a1-rushed-breakfast': 'meal-a1-rushed-breakfast.png', 'meal-a2-train-snack': 'meal-a2-train-snack.png', 'meal-a3-desk-lunch': 'meal-a3-desk-lunch.png', 'meal-a4-afternoon-pause': 'meal-a4-afternoon-pause.png', 'meal-a5-late-dinner': 'meal-a5-late-dinner.png',
  'meal-b1-family-table': 'meal-b1-family-table.png', 'meal-b2-leftover-box': 'meal-b2-leftover-box.png', 'meal-b3-vegetarian-fast': 'meal-b3-vegetarian-fast.png', 'meal-b4-social-takeaway': 'meal-b4-social-takeaway.png', 'meal-b5-weekend-brunch': 'meal-b5-weekend-brunch.png',
  'meal-c1-careful-lunch': 'meal-c1-careful-lunch.png', 'meal-c2-night-shift': 'meal-c2-night-shift.png', 'meal-c3-grazing-evening': 'meal-c3-grazing-evening.png', 'meal-c4-restaurant-choice': 'meal-c4-restaurant-choice.png', 'meal-c5-active-day': 'meal-c5-active-day.png',
  'meal-d1-student-kitchen': 'meal-d1-student-kitchen.jpg', 'meal-d2-quiet-breakfast': 'meal-d2-quiet-breakfast.jpg', 'meal-d3-busy-caregiver': 'meal-d3-busy-caregiver.jpg', 'meal-d4-limited-shopping': 'meal-d4-limited-shopping.jpg', 'meal-d5-uncertain-evening': 'meal-d5-uncertain-evening.jpg',
});
const ASSET_NOTES = Object.freeze({
  'meal-a1-rushed-breakfast': 'Le premier repas semble avoir été pris rapidement avant de partir.', 'meal-a2-train-snack': 'Une collation est consommée pendant un déplacement.', 'meal-a3-desk-lunch': 'Le déjeuner est pris près du poste de travail.', 'meal-a4-afternoon-pause': 'Une pause de l’après-midi associe boisson et petite collation.', 'meal-a5-late-dinner': 'Le repas du soir est préparé tard après une journée longue.',
  'meal-b1-family-table': 'Le repas du soir est partagé et organisé pour plusieurs personnes.', 'meal-b2-leftover-box': 'Un repas est préparé à partir de restes pour le lendemain.', 'meal-b3-vegetarian-fast': 'Un repas végétarien rapide est préparé avec peu de temps.', 'meal-b4-social-takeaway': 'Le repas est commandé et partagé dans un contexte social.', 'meal-b5-weekend-brunch': 'Le rythme du week-end diffère du rythme des jours travaillés.',
  'meal-c1-careful-lunch': 'Le repas est très structuré et préparé avec prudence.', 'meal-c2-night-shift': 'La pause repas survient pendant un horaire de nuit.', 'meal-c3-grazing-evening': 'La soirée comporte plusieurs prises alimentaires espacées.', 'meal-c4-restaurant-choice': 'Un repas pris à l’extérieur dépend du contexte social.', 'meal-c5-active-day': 'Le repas est emporté pour une journée aux horaires changeants.',
  'meal-d1-student-kitchen': 'Le repas dépend d’une cuisine partagée et de moyens limités.', 'meal-d2-quiet-breakfast': 'Le premier repas de la journée reste très modeste.', 'meal-d3-busy-caregiver': 'La préparation est morcelée entre plusieurs responsabilités.', 'meal-d4-limited-shopping': 'Les produits disponibles proviennent d’achats pratiques et limités.', 'meal-d5-uncertain-evening': 'Le repas du soir s’inscrit dans un quotidien chargé et incertain.',
});
const TOOL_DEFINITIONS = [
  { id: 'gallery', label: 'Galerie de repas', unlockOrder: 2, kind: 'gallery' },
  { id: 'rhythm-journal', label: 'Journal de rythme', unlockOrder: 4, kind: 'journal' },
  { id: 'shopping-receipt', label: 'Ticket de courses', unlockOrder: 6, kind: 'receipt' },
  { id: 'pantry-fridge', label: 'Garde-manger & réfrigérateur', unlockOrder: 8, kind: 'pantry' },
  { id: 'constraints-calendar', label: 'Calendrier des contraintes', unlockOrder: 10, kind: 'calendar' },
];
const frames = [
  ['dietetics-rhythm-overflow', 'Le rythme qui déborde', ['repas pris entre deux déplacements', 'préparation la veille rarement possible', 'fin de journée imprévisible'], ['meal-a1-rushed-breakfast', 'meal-a2-train-snack']],
  ['dietetics-afternoon-dip', 'Le creux de l’après-midi', ['déjeuner décalé par les réunions', 'longues périodes devant un écran', 'boissons qui accompagnent le travail'], ['meal-a3-desk-lunch', 'meal-a4-afternoon-pause']],
  ['dietetics-false-start', 'Après le faux départ', ['ancienne règle trop rigide', 'organisation familiale changeante', 'week-ends très différents'], ['meal-b1-family-table', 'meal-b2-leftover-box']],
  ['dietetics-under-pressure', 'Manger sous pression', ['pression qui modifie les horaires', 'écrans présents au repas', 'repas sociaux variables'], ['meal-b4-social-takeaway', 'meal-c3-grazing-evening']],
  ['dietetics-vegetarian-everyday', 'Choix végétariens au quotidien', ['courses rapides une fois par semaine', 'repas partagés aux préférences diverses', 'peu de temps le soir'], ['meal-b3-vegetarian-fast', 'meal-b2-leftover-box']],
  ['dietetics-worrying-checkup', 'Le bilan qui inquiète', ['bilan récent source de questions', 'rendez-vous de suivi déjà prévu', 'antécédents dans l’entourage'], ['meal-c1-careful-lunch', 'meal-c4-restaurant-choice']],
  ['dietetics-shift-rhythm', 'Rythme décalé', ['alternance de postes de jour et de nuit', 'sommeil variable après les nuits', 'pauses parfois écourtées'], ['meal-c2-night-shift', 'meal-c5-active-day']],
  ['dietetics-weight-real-life', 'Objectif de poids, vraie vie', ['remarques passées difficiles', 'énergie et temps libre changeants', 'activité quotidienne non linéaire'], ['meal-c5-active-day', 'meal-c4-restaurant-choice']],
  ['dietetics-eating-difficult', 'Quand manger devient difficile', ['repas parfois évités', 'vie en colocation ou études', 'proche informé partiellement'], ['meal-d1-student-kitchen', 'meal-d2-quiet-breakfast']],
  ['dietetics-incomplete-file', 'Le dossier incomplet', ['horaires instables', 'fatigue variable et traitements prescrits', 'ressources autour de la personne irrégulières'], ['meal-d3-busy-caregiver', 'meal-d5-uncertain-evening']],
];
// Each consultation still reveals two meal photos, but six possible pairs stop a
// replay from showing the exact same visual clue. Pools stay tied to the theme
// of their mission rather than pulling arbitrary images from the campaign.
const GALLERY_POOLS = {
  'dietetics-rhythm-overflow': ['meal-a1-rushed-breakfast', 'meal-a2-train-snack', 'meal-a3-desk-lunch', 'meal-a4-afternoon-pause'],
  'dietetics-afternoon-dip': ['meal-a3-desk-lunch', 'meal-a4-afternoon-pause', 'meal-a5-late-dinner', 'meal-c1-careful-lunch'],
  'dietetics-false-start': ['meal-b1-family-table', 'meal-b2-leftover-box', 'meal-b5-weekend-brunch', 'meal-b4-social-takeaway'],
  'dietetics-under-pressure': ['meal-b4-social-takeaway', 'meal-c3-grazing-evening', 'meal-c4-restaurant-choice', 'meal-a4-afternoon-pause'],
  'dietetics-vegetarian-everyday': ['meal-b3-vegetarian-fast', 'meal-b2-leftover-box', 'meal-c1-careful-lunch', 'meal-c4-restaurant-choice'],
  'dietetics-worrying-checkup': ['meal-c1-careful-lunch', 'meal-c4-restaurant-choice', 'meal-a3-desk-lunch', 'meal-b5-weekend-brunch'],
  'dietetics-shift-rhythm': ['meal-c2-night-shift', 'meal-c5-active-day', 'meal-a2-train-snack', 'meal-c3-grazing-evening'],
  'dietetics-weight-real-life': ['meal-c5-active-day', 'meal-c4-restaurant-choice', 'meal-b5-weekend-brunch', 'meal-a5-late-dinner'],
  'dietetics-eating-difficult': ['meal-d1-student-kitchen', 'meal-d2-quiet-breakfast', 'meal-d4-limited-shopping', 'meal-d5-uncertain-evening'],
  'dietetics-incomplete-file': ['meal-d3-busy-caregiver', 'meal-d5-uncertain-evening', 'meal-d4-limited-shopping', 'meal-a5-late-dinner'],
};
const GALLERY_PAIR_INDEXES = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]];
const patients = [
  { name: 'Nora', gender: 'Femme' }, { name: 'Malik', gender: 'Homme' }, { name: 'Élise', gender: 'Femme' }, { name: 'Rayan', gender: 'Homme' }, { name: 'Camille', gender: 'Femme' },
  { name: 'Farid', gender: 'Homme' }, { name: 'Ana', gender: 'Femme' }, { name: 'Sofia', gender: 'Femme' }, { name: 'Noa', gender: 'Homme' }, { name: 'Jules', gender: 'Homme' },
];
const styles = ['va droit au but, avec peu de temps', 'reste d’abord en retrait', 'prend le temps de réfléchir avant de répondre', 'montre de la fatigue tout en coopérant', 'hésite sur certains détails', 'donne volontiers des exemples concrets'];
const routes = ['clarifier le vécu et co-construire un petit repère réaliste', 'reformuler les contraintes puis envisager une suite adaptée', 'partir des priorités de la personne et proposer une étape faisable'];
const RECEIPT_STORES = ['Épicerie du Quartier', 'Marché des Halles', 'Supermarché Horizon', 'Panier & Cie', 'Le Comptoir Local', 'Rue des Saveurs'];
const RECEIPT_BASKETS = [
  [{ brand: 'Matin Doux', item: 'Flocons d’avoine', quantity: '1 paquet' }, { brand: 'Verger Clair', item: 'Compotes pomme-poire', quantity: '4 gourdes' }, { brand: 'Laitier & Co', item: 'Yaourts nature', quantity: '4 pots' }, { brand: 'Boulangerie Saint-Paul', item: 'Pain complet tranché', quantity: '1 sachet' }],
  [{ brand: 'Repas Minute', item: 'Soupe de légumes', quantity: '2 briques' }, { brand: 'Bon Champ', item: 'Pois chiches', quantity: '2 bocaux' }, { brand: 'Grain Libre', item: 'Riz complet', quantity: '1 sachet' }, { brand: 'Frais & Prêt', item: 'Salade lavée', quantity: '1 sachet' }],
  [{ brand: 'Pause Nomade', item: 'Mélange amandes-noisettes', quantity: '1 sachet' }, { brand: 'Fruit Direct', item: 'Bananes', quantity: '6 pièces' }, { brand: 'Maison Simple', item: 'Œufs plein air', quantity: '6 pièces' }, { brand: 'Cuisine Pratique', item: 'Légumes surgelés', quantity: '1 sachet' }],
  [{ brand: 'Végétal Plus', item: 'Tofu nature', quantity: '2 blocs' }, { brand: 'Bon Champ', item: 'Lentilles corail', quantity: '1 sachet' }, { brand: 'Pâtes du Jour', item: 'Pâtes semi-complètes', quantity: '1 paquet' }, { brand: 'Verger Clair', item: 'Pommes', quantity: '4 pièces' }],
  [{ brand: 'Cuisine Partagée', item: 'Tomates concassées', quantity: '2 boîtes' }, { brand: 'Matin Doux', item: 'Céréales nature', quantity: '1 boîte' }, { brand: 'Laitier & Co', item: 'Fromage blanc', quantity: '1 pot' }, { brand: 'Frais & Prêt', item: 'Carottes', quantity: '1 kg' }],
  [{ brand: 'Garde de Nuit', item: 'Wraps complets', quantity: '1 paquet' }, { brand: 'Pause Nomade', item: 'Galettes de riz', quantity: '1 paquet' }, { brand: 'Verger Clair', item: 'Clémentines', quantity: '8 pièces' }, { brand: 'Bon Champ', item: 'Haricots rouges', quantity: '2 boîtes' }],
];
const WEEK_PATTERNS = [
  [['07:30 — Départ', '19:15 — Retour'], ['08:45 — Réunion', '18:30 — Retour'], ['07:15 — Départ', '20:00 — Activité'], ['09:00 — Télétravail', '18:45 — Courses'], ['08:00 — Départ', '20:15 — Retour'], ['10:30 — Visite familiale'], ['17:30 — Préparation de semaine']],
  [['06:45 — Poste du matin', '15:30 — Fin de poste'], ['21:00 — Poste de nuit'], ['21:00 — Poste de nuit'], ['08:30 — Sommeil après garde'], ['14:00 — Rendez-vous'], ['12:30 — Déjeuner partagé'], ['18:00 — Préparer la semaine']],
  [['08:15 — Départ', '18:30 — Enfants'], ['07:45 — Départ', '19:00 — Retour'], ['12:15 — Rendez-vous', '18:45 — Retour'], ['08:30 — Télétravail', '17:45 — Courses'], ['07:30 — Départ', '20:00 — Dîner prévu'], ['09:30 — Courses'], ['16:00 — Trajet retour']],
  [['09:00 — Cours', '18:00 — Travail étudiant'], ['08:00 — Cours', '19:30 — Retour'], ['13:00 — Bibliothèque'], ['09:30 — Cours', '18:30 — Travail étudiant'], ['08:30 — Cours', '20:00 — Sortie'], ['11:00 — Laverie'], ['17:00 — Appel proche']],
  [['08:00 — Départ', '18:15 — Retour'], ['08:00 — Départ', '19:00 — Sport'], ['08:30 — Départ', '18:30 — Retour'], ['09:00 — Télétravail', '19:00 — Dîner'], ['07:45 — Départ', '20:15 — Retour'], ['10:00 — Marché'], ['18:00 — Préparer les trajets']],
  [['07:00 — Départ', '18:45 — Retour'], ['09:00 — Rendez-vous', '17:30 — Retour'], ['08:00 — Départ', '19:15 — Retour'], ['08:30 — Départ', '20:00 — Imprévu'], ['08:00 — Départ', '18:30 — Retour'], ['12:00 — Déjeuner social'], ['17:30 — Courses rapides']],
];
const PANTRY_SETS = [
  { pantry: [{ item: 'Flocons d’avoine', quantity: '½ paquet' }, { item: 'Pâtes semi-complètes', quantity: '1 paquet' }, { item: 'Tomates concassées', quantity: '2 boîtes' }, { item: 'Compotes pomme-poire', quantity: '3 gourdes' }], fridge: [{ item: 'Yaourts nature', quantity: '2 pots' }, { item: 'Carottes', quantity: '5 pièces' }, { item: 'Œufs', quantity: '4 pièces' }, { item: 'Fromage blanc', quantity: '1 pot' }] },
  { pantry: [{ item: 'Lentilles corail', quantity: '1 sachet' }, { item: 'Riz complet', quantity: '¾ paquet' }, { item: 'Pois chiches', quantity: '1 bocal' }, { item: 'Galettes de riz', quantity: '1 paquet' }], fridge: [{ item: 'Salade lavée', quantity: '1 sachet' }, { item: 'Tofu nature', quantity: '1 bloc' }, { item: 'Pommes', quantity: '3 pièces' }, { item: 'Lait', quantity: '⅓ bouteille' }] },
  { pantry: [{ item: 'Céréales nature', quantity: '1 boîte' }, { item: 'Haricots rouges', quantity: '2 boîtes' }, { item: 'Soupes de légumes', quantity: '2 briques' }, { item: 'Amandes', quantity: '1 petit sachet' }], fridge: [{ item: 'Pain complet', quantity: '6 tranches' }, { item: 'Bananes', quantity: '2 pièces' }, { item: 'Légumes surgelés', quantity: '1 sachet' }, { item: 'Œufs', quantity: '6 pièces' }] },
  { pantry: [{ item: 'Wraps complets', quantity: '1 paquet' }, { item: 'Thon au naturel', quantity: '2 boîtes' }, { item: 'Semoule', quantity: '1 paquet' }, { item: 'Compotes sans sucres ajoutés', quantity: '4 pots' }], fridge: [{ item: 'Concombre', quantity: '1 pièce' }, { item: 'Fromage frais', quantity: '1 barquette' }, { item: 'Yaourts végétaux', quantity: '3 pots' }, { item: 'Restes de légumes', quantity: '1 boîte' }] },
  { pantry: [{ item: 'Pâtes', quantity: '1 paquet' }, { item: 'Lait de coco', quantity: '1 brique' }, { item: 'Pois cassés', quantity: '1 sachet' }, { item: 'Crackers complets', quantity: '1 boîte' }], fridge: [{ item: 'Tomates', quantity: '4 pièces' }, { item: 'Houmous', quantity: '1 pot' }, { item: 'Yaourts nature', quantity: '4 pots' }, { item: 'Pommes', quantity: '5 pièces' }] },
  { pantry: [{ item: 'Soupe instantanée', quantity: '2 portions' }, { item: 'Pain de mie complet', quantity: '1 paquet' }, { item: 'Mélange de noix', quantity: '1 sachet' }, { item: 'Haricots blancs', quantity: '1 bocal' }], fridge: [{ item: 'Œufs', quantity: '2 pièces' }, { item: 'Carottes râpées', quantity: '1 barquette' }, { item: 'Lait', quantity: '1 bouteille' }, { item: 'Clémentines', quantity: '6 pièces' }] },
];
const JOURNAL_DAYS = [
  [{ time: '07:10', entry: 'Café au lait et 2 tartines', context: 'Pris debout avant le départ' }, { time: '10:45', entry: 'Rien', context: 'Trajet et rendez-vous enchaînés' }, { time: '13:40', entry: 'Sandwich poulet crudités', context: 'Mangée dans le train' }, { time: '16:30', entry: 'Compote', context: 'Pause entre deux rendez-vous' }, { time: '21:15', entry: 'Pâtes tomate-fromage', context: 'Préparées rapidement au retour' }],
  [{ time: '06:20', entry: 'Yaourt et banane', context: 'Avant une prise de poste' }, { time: '11:50', entry: 'Salade de lentilles', context: 'Pause de 20 minutes' }, { time: '15:30', entry: 'Café et biscuits', context: 'Baisse d’énergie en fin de journée' }, { time: '19:45', entry: 'Soupe et pain', context: 'Repas pris à la maison, sans autre personne' }, { time: '22:30', entry: 'Rien', context: 'Prépare les affaires du lendemain' }],
  [{ time: '08:00', entry: 'Rien', context: 'Réveil tardif après une nuit courte' }, { time: '12:25', entry: 'Restes de riz et légumes', context: 'Déjeuner devant l’écran' }, { time: '15:50', entry: 'Poignée d’amandes', context: 'Entre deux réunions' }, { time: '18:40', entry: 'Courses rapides', context: 'Peu de temps avant de rentrer' }, { time: '21:00', entry: 'Wrap et crudités', context: 'Repas partagé' }],
  [{ time: '07:40', entry: 'Flocons d’avoine et lait', context: 'Petit-déjeuner préparé la veille' }, { time: '12:10', entry: 'Plat végétarien', context: 'Cantine avec collègues' }, { time: '16:45', entry: 'Fruit', context: 'Faim ressentie après un cours' }, { time: '19:20', entry: 'Tofu, riz et légumes', context: 'Préparation pour deux personnes' }, { time: '22:00', entry: 'Tisane', context: 'Fin de journée calme' }],
  [{ time: '09:15', entry: 'Thé et pain complet', context: 'Matinée en télétravail' }, { time: '13:15', entry: 'Soupe et tartines', context: 'Déjeuner très rapide' }, { time: '17:00', entry: 'Rien', context: 'Trajet de retour plus long que prévu' }, { time: '19:45', entry: 'Plat commandé', context: 'Dîner avec des proches' }, { time: '22:20', entry: 'Compote', context: 'Encore faim en soirée' }],
  [{ time: '18:30', entry: 'Repas avant le poste', context: 'Préparé en moins de 15 minutes' }, { time: '22:10', entry: 'Galettes de riz et yaourt', context: 'Pause écourtée' }, { time: '01:40', entry: 'Café', context: 'Coup de fatigue pendant la garde' }, { time: '04:30', entry: 'Banane', context: 'Petite pause disponible' }, { time: '08:45', entry: 'Rien', context: 'Retour puis sommeil' }],
];
function makeReceipt(missionIndex, index) { return { store: RECEIPT_STORES[(missionIndex + index) % RECEIPT_STORES.length], date: `Mardi ${8 + ((missionIndex + index) % 14)} octobre`, items: RECEIPT_BASKETS[(missionIndex + index) % RECEIPT_BASKETS.length] }; }
function makeWeeklyCalendar(missionIndex, index) { const pattern = WEEK_PATTERNS[(missionIndex + index) % WEEK_PATTERNS.length]; return { weekLabel: `Semaine du ${14 + ((missionIndex + index) % 7)} au ${20 + ((missionIndex + index) % 7)} octobre`, days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, offset) => ({ day, date: String(14 + ((missionIndex + index + offset) % 14)), slots: pattern[offset] })) }; }
function makePantry(missionIndex, index) { return PANTRY_SETS[(missionIndex + index) % PANTRY_SETS.length]; }
function makeJournal(missionIndex, index) { return { dayLabel: ['Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][(missionIndex + index) % 6], entries: JOURNAL_DAYS[(missionIndex + index) % JOURNAL_DAYS.length] }; }
const VARIANT_NEEDS = {
  'dietetics-rhythm-overflow': ['Réduire les repas pris en déplacement.', 'Trouver une préparation compatible avec des journées imprévisibles.', 'Éviter une fatigue trop forte au repas du soir.', 'Mieux gérer les pauses qui sautent souvent.', 'Trouver un repère quand les rendez-vous s’enchaînent.', 'Préserver une routine simple les jours de transport.'],
  'dietetics-afternoon-dip': ['Comprendre les variations d’énergie de l’après-midi.', 'Repérer ce qui se passe les jours de réunion.', 'Trouver une pause compatible avec le travail sur écran.', 'Mieux distinguer faim, fatigue et automatisme.', 'Éviter que le déjeuner se décale trop souvent.', 'Trouver une organisation qui ne dépend pas d’une journée parfaite.'],
  'dietetics-false-start': ['Repartir après une règle alimentaire trop stricte.', 'Retrouver une organisation qui inclut les week-ends.', 'Réduire la charge mentale des repas familiaux.', 'Faire avec des imprévus sans abandonner complètement.', 'Revenir à des repères après plusieurs tentatives décevantes.', 'Construire une suite réalisable avec le rythme du foyer.'],
  'dietetics-under-pressure': ['Comprendre les repas automatiques en période de stress.', 'Faire une place aux repas quand les écrans prennent le relais.', 'Préserver des choix personnels lors de repas sociaux.', 'Repérer ce qui change les soirs de pression.', 'Trouver une alternative aux repas pris sans pause.', 'Diminuer la culpabilité après des journées difficiles.'],
  'dietetics-vegetarian-everyday': ['Trouver des idées végétariennes quand le temps manque.', 'Composer avec des préférences différentes à la maison.', 'Varier les repas sans multiplier la préparation.', 'Anticiper les courses d’une semaine chargée.', 'Rendre les repas rapides plus satisfaisants.', 'Garder une organisation souple pour les soirs imprévus.'],
  'dietetics-worrying-checkup': ['Préparer sereinement un rendez-vous de suivi.', 'Faire le tri entre inquiétude familiale et habitudes actuelles.', 'Avancer sans suivre des conseils contradictoires en ligne.', 'Identifier un premier changement réaliste sans promesse excessive.', 'Mieux formuler ses questions pour le prochain suivi.', 'Retrouver un sentiment de contrôle sans s’imposer de règle rigide.'],
  'dietetics-shift-rhythm': ['Trouver des repères entre postes de jour et de nuit.', 'Limiter le désordre des repas après une garde.', 'Prévoir des options simples pour les pauses écourtées.', 'Composer avec une faim qui varie après le sommeil.', 'Préserver une vie sociale malgré les horaires décalés.', 'Organiser les repas sans appliquer un horaire impossible.'],
  'dietetics-weight-real-life': ['Parler du bien-être sans réduire la discussion au poids.', 'Retrouver des objectifs personnels après des remarques difficiles.', 'Composer avec une activité qui varie selon la semaine.', 'Faire de la place aux repas sociaux sans jugement.', 'Identifier ce qui aide vraiment dans les périodes de faible énergie.', 'Construire un changement choisi plutôt qu’imposé.'],
  'dietetics-eating-difficult': ['Mettre des mots sur des repas devenus envahissants.', 'Aborder des moments où manger est évité.', 'Trouver comment demander un soutien sans ressentir de jugement.', 'Comprendre ce qui rend certains repas plus difficiles.', 'Préparer une prochaine étape avec une personne de confiance.', 'Retrouver une discussion plus apaisée autour de l’alimentation.'],
  'dietetics-incomplete-file': ['Prioriser parmi fatigue, horaires et contraintes matérielles.', 'Préparer une suite quand plusieurs suivis se croisent.', 'Identifier une aide réaliste malgré des ressources irrégulières.', 'Faire avec des courses et repas difficiles à anticiper.', 'Clarifier ce qui mérite d’être discuté au prochain rendez-vous.', 'Construire un repère prudent dans un quotidien instable.'],
};
function makeBlueprint(frame, index) {
  const [missionId, theme, contributors, mealAssets] = frame;
  const missionIndex = frames.findIndex((item) => item[0] === missionId);
  const rotated = contributors.map((_, offset) => contributors[(index + offset) % contributors.length]);
  const galleryPool = GALLERY_POOLS[missionId] || mealAssets;
  const galleryPair = GALLERY_PAIR_INDEXES[index].map((assetIndex) => galleryPool[assetIndex]);
  const patient = patients[(missionIndex + index) % patients.length];
  return { id: `${missionId}-case-${index + 1}`, patient: { ...patient, age: 24 + ((index * 7 + missionIndex * 3) % 31) }, need: VARIANT_NEEDS[missionId][index], contributors: rotated, responseStyle: styles[index], evidence: { gallery: galleryPair, 'rhythm-journal': makeJournal(missionIndex, index), 'shopping-receipt': makeReceipt(missionIndex, index), 'pantry-fridge': makePantry(missionIndex, index), 'constraints-calendar': makeWeeklyCalendar(missionIndex, index) }, successSignals: [routes[index % routes.length], routes[(index + 1) % routes.length]] };
}
export const CASES = Object.fromEntries(frames.map((frame, order) => [frame[0], { id: frame[0], order: order + 1, theme: frame[1], blueprints: Array.from({ length: 6 }, (_, index) => makeBlueprint(frame, index)) }]));
const NURSING_PATIENTS = [{ name: 'Alex', gender: 'Homme' }, { name: 'Sam', gender: 'Homme' }, { name: 'Lina', gender: 'Femme' }, { name: 'Morgan', gender: 'Homme' }, { name: 'Noor', gender: 'Femme' }, { name: 'Camille', gender: 'Femme' }];
const NURSING_VARIANT_STYLES = ['répond brièvement mais précisément', 'minimise au début', 'retrace volontiers la chronologie', 'aborde difficilement certains détails', 's’appuie sur des notes personnelles', 'la fatigue est présente mais la personne reste coopérative'];
function nursingDocuments(order, diseaseId, variantIndex) {
  const dossier = materializeNursingDossier(diseaseId, variantIndex);
  if (!dossier) return {};
  return Object.fromEntries(NURSING_DOCUMENT_DEFINITIONS
    .filter(([, unlock]) => order >= unlock)
    .flatMap(([id]) => dossier[id] ? [[id, dossier[id]]] : []));
}
function makeNursingMission(pool) {
  const diseases = pool.diseaseIds.map((id) => NURSING_DISEASES[id]);
  return { id: `nursing-${pool.order}`, roleId: 'nursing', order: pool.order, theme: pool.theme, diseases, blueprints: diseases.flatMap((disease) => Array.from({ length: 6 }, (_, index) => ({
    id: `${pool.order}-${disease.id}-case-${index + 1}`, diseaseId: disease.id, patient: { ...NURSING_PATIENTS[index], age: 27 + ((index * 6 + pool.order) % 38) }, responseStyle: NURSING_VARIANT_STYLES[index],
    opening: ['Je ne me sens pas comme d’habitude depuis quelques jours.', 'Je voulais en parler parce que ça change dans mon quotidien.', 'J’ai noté des choses, mais je ne sais pas ce qui est utile.'][index % 3],
    symptoms: disease.symptoms.map((label, symptomIndex) => ({ id: `${disease.id}-symptom-${symptomIndex + 1}`, label })),
    evidence: nursingDocuments(pool.order, disease.id, index),
  }))) };
}
export const NURSING_CASES = Object.freeze(Object.fromEntries(NURSING_POOLS.map((pool) => [`nursing-${pool.order}`, makeNursingMission(pool)])));
export function getServerMission(id) { return CASES[id] || NURSING_CASES[id]; }
export function isNursingMission(mission) { return mission?.roleId === 'nursing'; }
export function chooseNursingCase(mission, recentVariantIds = [], random = Math.random) { return chooseVariant(mission, recentVariantIds, random); }
export function getNursingTools(mission) { return NURSING_DOCUMENT_DEFINITIONS.filter(([, order]) => mission.order >= order).map(([id, , label]) => ({ id, label, kind: 'nursing-document' })); }
export function useNursingTool(variant, toolId, used = []) { const evidence = variant?.evidence?.[toolId]; if (!evidence) return null; return { id: toolId, label: evidence.title, kind: 'nursing-document', alreadyConsulted: used.includes(toolId), evidence, promptNotes: evidence.facts }; }
const SIGN_STOPWORDS = new Set(['avec', 'avoir', 'chez', 'dans', 'pour', 'sans', 'sous', 'sur', 'tres', 'une', 'des', 'les', 'par', 'plus']);
function normalizedWords(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]+/g) || []; }
function hasNegationNear(words, start, end) {
  const context = words.slice(Math.max(0, start - 7), Math.min(words.length, end + 6)).join(' ');
  return /\b(?:n|ne)\s+(?:\w+\s+){0,3}(?:pas|jamais|plus)\b|\b(?:pas|jamais)\s+(?:de\s+)?|\bsans\b|\baucun(?:e)?\b/i.test(context);
}
function symptomAppearsInClause(clause, meaningfulWords) {
  const words = normalizedWords(clause);
  const positions = meaningfulWords.map((word) => words.indexOf(word));
  if (positions.some((position) => position < 0)) return false;
  const start = Math.min(...positions); const end = Math.max(...positions);
  if (end - start > meaningfulWords.length + 5) return false;
  return !hasNegationNear(words, start, end);
}
function messageAffirmsSymptom(message, label) {
  const text = String(message.content || ''); const symptom = String(label || '');
  const meaningfulWords = [...new Set(normalizedWords(symptom).filter((word) => word.length >= 3 && !SIGN_STOPWORDS.has(word)))];
  if (meaningfulWords.length < 2) return false;
  return text.split(/[.!?;]|,\s*(?:mais|sauf)\b/i).some((clause) => symptomAppearsInClause(clause, meaningfulWords));
}
export function transcriptConfirmedSymptoms(session) { return session.variant.symptoms.filter((symptom) => session.messages.some((message) => message.role === 'assistant' && messageAffirmsSymptom(message, symptom.label))); }
export function normalizeExtractedNursingSymptoms(session, extractedIds = []) {
  if (!Array.isArray(extractedIds)) return [];
  const allowed = new Set(session.variant.symptoms.map((symptom) => symptom.id));
  return [...new Set(extractedIds)].filter((id) => typeof id === 'string' && allowed.has(id));
}
export function nursingLiveSymptoms(session, extractedIds = []) {
  const extracted = new Set(normalizeExtractedNursingSymptoms(session, extractedIds));
  return session.variant.symptoms.filter((symptom) => extracted.has(symptom.id) || transcriptConfirmedSymptoms(session).some((confirmed) => confirmed.id === symptom.id));
}
export function evaluateNursingHypothesis(session, diseaseId) {
  const disease = NURSING_DISEASES[diseaseId];
  if (!disease || !session.mission.diseases.some((item) => item.id === diseaseId)) return { error: 'Hypothèse inconnue pour cette mission.' };
  const confirmed = nursingLiveSymptoms(session, session.liveSymptomIds);
  const correct = diseaseId === session.variant.diseaseId;
  const total = correct ? 100 : 0;
  const scores = Object.fromEntries(AXES.map((axis) => [axis, total]));
  return {
    correct, selectedDiseaseId: diseaseId, total, mastery: correct,
    scores, safetyAcknowledged: true, confirmedSymptoms: confirmed.map((symptom) => symptom.id),
    evidence: {
      foodHistory: { count: confirmed.length, message: `${confirmed.length} signe(s) explicitement recueilli(s).` },
      context: { count: session.usedTools.length, message: `${session.usedTools.length} document(s) consulté(s).` },
      communication: { count: session.messages.filter((message) => message.role === 'user').length, message: 'Les échanges n’influencent pas la victoire.' },
      safePlan: { count: correct ? 1 : 0, message: correct ? 'La bonne maladie a été identifiée.' : 'La maladie sélectionnée ne correspond pas au cas.' },
    },
    improvement: correct ? 'Bonne identification : le niveau suivant est déverrouillé.' : 'Rejouez cette mission pour essayer une autre maladie.',
    feedback: correct ? 'Bonne maladie identifiée pour ce cas.' : 'La maladie choisie ne correspond pas à ce cas.',
  };
}
export function getEligibleTools(mission) { return mission ? TOOL_DEFINITIONS.filter((tool) => mission.order >= tool.unlockOrder).map(({ id, label, kind }) => ({ id, label, kind })) : []; }
export function chooseVariant(mission, recentVariantIds = [], random = Math.random) { if (!mission) return null; const recent = new Set(Array.isArray(recentVariantIds) ? recentVariantIds : []); const pool = mission.blueprints.filter((variant) => !recent.has(variant.id)); const eligible = pool.length ? pool : mission.blueprints; return eligible[Math.floor(random() * eligible.length)]; }
export function chooseArchetype(_mission, random = Math.random) { return ['direct', 'reserved', 'reflective', 'tired'][Math.floor(random() * 4)]; }
export function getPresentation(variant, archetype) { const openings = { direct: 'Je préfère vous expliquer franchement ce qui se passe.', reserved: 'Je ne sais pas très bien par où commencer.', reflective: 'J’ai essayé de comprendre par moi-même, mais je tourne un peu en rond.', tired: 'Je voudrais que cela devienne un peu moins compliqué au quotidien.' }; return { opening: `${variant.need} ${openings[archetype] || openings.reserved}`, baselineFacts: variant.contributors.slice(0, 2) }; }
function visualItem(assetId) { const filename = ASSETS[assetId]; if (!filename || !fs.existsSync(join(ASSET_DIR, filename))) return { id: assetId, status: 'unavailable', label: 'Document indisponible' }; return { id: assetId, status: 'available', src: `/game/assets/dietetics/${filename}`, alt: 'Support visuel de consultation' }; }
export function useConsultationTool(variant, toolId, used = []) { const tool = TOOL_DEFINITIONS.find((item) => item.id === toolId); if (!variant || !tool || !variant.evidence[toolId]) return null; const payload = variant.evidence[toolId]; const promptNotes = toolId === 'gallery' ? payload.slice(0, 2).map((assetId) => ASSET_NOTES[assetId]).filter(Boolean) : toolId === 'rhythm-journal' ? payload.entries.map((entry) => `${entry.time} : ${entry.entry} — ${entry.context}`) : toolId === 'shopping-receipt' ? payload.items.map((item) => `${item.quantity} de ${item.item} (${item.brand})`) : toolId === 'pantry-fridge' ? [...payload.pantry, ...payload.fridge].map((item) => `${item.quantity} de ${item.item}`) : toolId === 'constraints-calendar' ? payload.days.flatMap((day) => day.slots.map((slot) => `${day.day} ${day.date} : ${slot}`)) : payload; return { id: tool.id, label: tool.label, kind: tool.kind, alreadyConsulted: used.includes(toolId), evidence: toolId === 'gallery' ? { images: payload.slice(0, 2).map(visualItem) } : toolId === 'rhythm-journal' || toolId === 'shopping-receipt' || toolId === 'pantry-fridge' || toolId === 'constraints-calendar' ? payload : { notes: payload }, promptNotes }; }
export function evaluateServerMission(_missionId, variant) { if (!variant) throw new Error('Cas invalide'); const scores = Object.fromEntries(AXES.map((axis) => [axis, 0])); return { scores, total: 0, mastery: false, safetyAcknowledged: true, evidence: Object.fromEntries(AXES.map((axis) => [axis, { count: 0, message: 'Évaluation IA indisponible.' }])), improvement: 'L’évaluation IA est nécessaire pour valider la maîtrise de la mission.' }; }
