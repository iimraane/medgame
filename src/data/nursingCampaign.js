// Curated, fictional learning cards. They organise questions; they never
// confirm a real diagnosis or suggest a treatment.
const entries = [
  ['viral-syndrome', 'Syndrome viral', 'Un épisode fébrile avec fatigue et courbatures, à situer dans le temps.', ['fièvre apparue hier soir', 'courbatures diffuses', 'fatigue inhabituelle']],
  ['migraine', 'Migraine', 'Une céphalée récurrente, parfois associée à des nausées ou une sensibilité sensorielle.', ['douleur pulsatile d’un côté de la tête', 'lumière difficile à supporter', 'nausée pendant la crise']],
  ['gastroenteritis', 'Gastro-entérite', 'Un trouble digestif aigu dont l’intensité et l’évolution doivent être précisées.', ['selles plus liquides depuis ce matin', 'crampes abdominales par moments', 'nausée après avoir bu']],
  ['urinary-infection', 'Infection urinaire', 'Une gêne urinaire et son contexte, à explorer sans conclure trop vite.', ['brûlure au moment d’uriner', 'envies d’uriner très fréquentes', 'gêne dans le bas du ventre']],
  ['sinusitis', 'Sinusite', 'Une douleur faciale associée à des symptômes ORL, parmi plusieurs pistes possibles.', ['pression au niveau des pommettes', 'nez bouché avec sécrétions épaisses', 'douleur plus forte en se penchant']],
  ['reflux', 'Reflux gastro-œsophagien', 'Des brûlures ou remontées digestives qui demandent une chronologie précise.', ['brûlure derrière le sternum après le repas', 'goût acide dans la bouche', 'gêne plus nette en position allongée']],
  ['iron-deficiency', 'Déficit martial', 'Fatigue et essoufflement sont des indices fréquents mais non spécifiques.', ['fatigue qui s’installe depuis plusieurs semaines', 'essoufflement dans les escaliers', 'pâleur remarquée par un proche']],
  ['asthma', 'Asthme', 'Une gêne respiratoire variable à décrire selon le contexte et les épisodes.', ['sifflement en expirant', 'oppression thoracique par épisodes', 'réveil nocturne à cause de la toux']],
  ['hypothyroid-pattern', 'Profil hypothyroïdien', 'Un ensemble fatigue–frilosité–ralentissement, présenté ici comme piste éducative.', ['frilosité inhabituelle', 'peau plus sèche que d’habitude', 'impression de ralentir au quotidien']],
  ['covid-like-illness', 'Syndrome respiratoire viral', 'Toux, fièvre ou fatigue : la chronologie et les contacts comptent.', ['toux sèche depuis trois jours', 'fièvre mesurée le soir', 'goût et odeur moins présents']],
  ['appendicitis-pattern', 'Tableau appendiculaire', 'Une douleur abdominale évolutive : apprendre à repérer les changements importants.', ['douleur partie près du nombril puis descendue à droite', 'douleur plus marquée en marchant', 'perte d’appétit depuis ce matin']],
  ['kidney-stone-pattern', 'Colique néphrétique', 'Une douleur intense par vagues, parmi plusieurs hypothèses à distinguer.', ['douleur lombaire en vagues', 'douleur qui descend vers l’aine', 'urines rosées remarquées une fois']],
  ['lyme-like-illness', 'Tableau post-piqûre', 'Des symptômes retardés et une exposition éventuelle à contextualiser.', ['piqûre de tique retirée il y a deux semaines', 'plaque rouge qui s’agrandit lentement', 'fatigue avec douleurs articulaires']],
  ['endometriosis-pattern', 'Douleurs pelviennes cycliques', 'Des douleurs récurrentes à explorer sans les banaliser.', ['douleur pelvienne avant les règles', 'douleur qui revient à un rythme mensuel', 'fatigue lors des jours les plus douloureux']],
  ['shingles', 'Zona', 'Douleur localisée puis éruption possible : la chronologie est déterminante.', ['brûlure sur un seul côté du thorax', 'petites vésicules apparues ensuite', 'contact du vêtement devenu douloureux']],
  ['pneumonia-pattern', 'Infection respiratoire basse', 'Toux, souffle court et fièvre forment un tableau à nuancer.', ['toux devenue grasse', 'essoufflement pour un effort habituel', 'frissons avec température élevée']],
  ['heart-failure-pattern', 'Décompensation cardiaque', 'Essoufflement et gonflement sont des signaux à documenter dans cette simulation.', ['essoufflement en s’allongeant', 'chevilles plus gonflées le soir', 'prise de poids rapide remarquée']],
  ['diabetes-pattern', 'Déséquilibre glycémique', 'Soif, fatigue et variations corporelles : indices non conclusifs à recouper.', ['soif beaucoup plus importante', 'réveils nocturnes pour uriner', 'fatigue malgré des nuits complètes']],
  ['pulmonary-embolism-pattern', 'Alerte thrombo-embolique', 'Douleur thoracique ou essoufflement soudain : priorité à une escalade simulée.', ['essoufflement apparu brutalement', 'douleur thoracique en respirant', 'mollet droit douloureux depuis la veille']],
  ['meningitis-pattern', 'Alerte méningée', 'Fièvre et raideur inhabituelle : signaux pédagogiques nécessitant une escalade simulée.', ['forte fièvre soudaine', 'nuque très raide', 'lumière devenue insupportable']],
  ['hepatitis-pattern', 'Atteinte hépatique', 'Fatigue et changements de couleur : le contexte est essentiel.', ['urines très foncées', 'yeux légèrement jaunes selon un proche', 'fatigue avec manque d’appétit']],
  ['mononucleosis', 'Mononucléose', 'Fatigue prolongée et mal de gorge peuvent se ressembler à d’autres situations.', ['fatigue persistante depuis deux semaines', 'mal de gorge qui ne passe pas', 'ganglions sensibles au cou']],
  ['peptic-ulcer-pattern', 'Douleur ulcéreuse', 'Une douleur haute de l’abdomen dont le rythme doit être décrit.', ['brûlure au creux de l’estomac', 'douleur la nuit', 'gêne calmée un temps après avoir mangé']],
  ['panic-pattern', 'Crise de panique', 'Des sensations physiques réelles à accueillir, tout en vérifiant les signaux d’alerte.', ['cœur qui s’emballe par vagues', 'impression de manquer d’air', 'peur intense que quelque chose arrive']],
  ['rheumatoid-pattern', 'Inflammation articulaire', 'Raideur et douleurs articulaires, avec une évolution à préciser.', ['raideur des doigts au réveil', 'articulations gonflées par moments', 'raideur qui dure plus d’une heure']],
  ['multiple-sclerosis-pattern', 'Signes neurologiques fluctuants', 'Des troubles variables qui exigent une description factuelle et une chronologie.', ['fourmillements dans une jambe', 'vision devenue floue sur un œil puis améliorée', 'fatigue disproportionnée après un effort']],
  ['sleep-apnea-pattern', 'Trouble respiratoire du sommeil', 'Somnolence et réveils non réparateurs : un faisceau d’indices à investiguer.', ['ronflements signalés par l’entourage', 'réveils avec impression d’étouffer', 'somnolence importante dans la journée']],
  ['inflammatory-bowel-pattern', 'Maladie inflammatoire digestive', 'Des symptômes digestifs chroniques et leur retentissement au quotidien.', ['douleurs abdominales récurrentes', 'selles fréquentes depuis plusieurs semaines', 'perte de poids non recherchée']],
  ['anemia-pattern', 'Anémie', 'Pâleur, fatigue et essoufflement : une hypothèse parmi d’autres.', ['fatigue qui limite les activités habituelles', 'palpitations à la montée des escaliers', 'pâleur des lèvres remarquée']],
  ['sepsis-alert-pattern', 'Alerte infectieuse grave', 'Une altération rapide de l’état général : priorité à une escalade simulée.', ['frissons très intenses', 'confusion apparue ce matin', 'respiration plus rapide que d’habitude']],
];

export const NURSING_DISEASES = Object.freeze(Object.fromEntries(entries.map(([id, name, summary, symptoms]) => [id, { id, name, summary, symptoms }])));
export const NURSING_POOL_SIZES = [3, 6, 10, 15, 20, 22, 24, 26, 28, 30];
export const NURSING_THEMES = ['Premier tri', 'Fièvre, tête, abdomen', 'Fatigue et souffle', 'Le carnet oublié', 'Plusieurs pistes crédibles', 'Le détail décisif', 'Les symptômes retardés', 'Les faux amis', 'Le signal faible', 'La visite décisive'];
export const NURSING_POOLS = Object.freeze(NURSING_POOL_SIZES.map((size, index) => ({ order: index + 1, diseaseIds: entries.slice(0, size).map(([id]) => id), theme: NURSING_THEMES[index] })));
export function getNursingDisease(id) { return NURSING_DISEASES[id]; }
