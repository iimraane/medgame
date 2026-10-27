// Public educational cards only. Private case material deliberately lives in server/.
const entries = [
  ['generalized-anxiety', 'Trouble anxieux généralisé', 'Une inquiétude qui prend beaucoup de place dans plusieurs domaines du quotidien.', ['pensées qui tournent autour de plusieurs sujets', 'tension ressentie au fil de la journée', 'difficulté à décrocher des préoccupations']],
  ['panic', 'Trouble panique', 'Des montées de peur intenses dont le contexte et l’après-coup méritent d’être explorés.', ['montée brusque de peur', 'crainte qu’un épisode recommence', 'évitement d’un lieu ou d’un trajet']],
  ['social-phobia', 'Phobie sociale', 'Une appréhension marquée des situations où le regard des autres semble peser.', ['peur d’être jugé', 'préparation excessive avant une interaction', 'retrait après une situation sociale']],
  ['specific-phobia', 'Phobie spécifique', 'Une peur très liée à une situation précise, à situer dans la vie de la personne.', ['évitement d’une situation précise', 'anticipation difficile', 'réaction physique de peur']],
  ['ocd', 'Trouble obsessionnel-compulsif (TOC)', 'Des pensées et gestes répétitifs dont il faut comprendre le sens vécu sans les réduire à une étiquette.', ['vérifications répétées', 'doute qui persiste', 'temps pris par des routines']],
  ['depressive-episode', 'Épisode dépressif', 'Un changement durable d’élan et de quotidien qui demande une écoute contextualisée.', ['perte d’intérêt dans des activités habituelles', 'fatigue ou ralentissement', 'retrait du quotidien']],
  ['burnout', 'Burn-out', 'Un épuisement lié au travail ou aux responsabilités, à distinguer avec prudence d’autres difficultés.', ['surcharge qui dure', 'détachement vis-à-vis du travail', 'ressources quotidiennes qui diminuent']],
  ['adjustment', 'Trouble de l’adaptation', 'Une difficulté apparue dans le sillage d’un changement ou d’un événement de vie.', ['changement récent important', 'réactions qui débordent le quotidien', 'besoin de repères nouveaux']],
  ['ptsd', 'Stress post-traumatique', 'Des réactions persistantes après un événement marquant, à aborder avec délicatesse.', ['souvenir intrusif ou évité', 'hypervigilance dans certains contextes', 'réaction forte à un rappel']],
  ['insomnia', 'Trouble du sommeil / insomnie', 'Un sommeil devenu difficile à trouver ou à maintenir, à relier aux rythmes et préoccupations.', ['endormissement difficile', 'réveils répétés', 'fatigue dans la journée']],
  ['eating', 'Trouble alimentaire', 'Un rapport à l’alimentation qui pèse sur le quotidien et mérite une approche non jugeante.', ['repas source de tension', 'règles alimentaires rigides', 'préoccupation autour de l’image ou du contrôle']],
  ['screen-addiction', 'Addiction aux écrans', 'Une place des écrans qui empiète sur le rythme, les liens ou les activités choisies.', ['temps d’écran difficile à réduire', 'sommeil ou activités décalés', 'conflits autour des usages']],
  ['gaming-addiction', 'Addiction aux jeux vidéo', 'Un usage du jeu qui peut prendre une place problématique dans l’organisation quotidienne.', ['jeu qui repousse d’autres activités', 'horaires décalés', 'difficulté à s’arrêter']],
  ['emotional-dependence', 'Dépendance affective', 'Une relation où le besoin de lien ou de réassurance semble limiter la liberté de choix.', ['crainte de la distance', 'besoin de réassurance fréquent', 'décisions guidées par une relation']],
  ['adhd', 'Trouble de l’attention avec ou sans hyperactivité (TDAH)', 'Des difficultés d’attention ou d’organisation à comprendre dans leurs contextes variés.', ['distraction fréquente', 'organisation difficile', 'impulsivité ou agitation selon les situations']],
  ['dyslexia', 'Trouble dyslexique / difficultés d’apprentissage', 'Des obstacles durables dans les apprentissages, sans les confondre avec un manque d’effort.', ['lecture ou écriture coûteuse', 'fatigue dans les tâches scolaires', 'stratégies de compensation']],
  ['autism', 'Trouble du spectre de l’autisme (TSA)', 'Des façons singulières de communiquer, de ressentir les stimulations ou de s’organiser.', ['sensibilité à certains environnements', 'besoin de routines', 'malentendus dans les échanges']],
  ['borderline', 'Trouble borderline', 'Des émotions et relations vécues avec une intensité qui demande une formulation prudente.', ['émotions très intenses', 'relations vécues comme instables', 'sentiment de vide ou de débordement']],
  ['bipolar', 'Trouble bipolaire', 'Des variations d’énergie et d’humeur à situer dans le temps sans conclure hâtivement.', ['énergie qui varie nettement', 'rythmes de sommeil modifiés', 'retentissement sur les décisions']],
  ['avoidant-personality', 'Trouble de la personnalité évitante', 'Une tendance durable à se protéger du jugement ou du rejet au prix de certaines possibilités.', ['évitement par peur du jugement', 'sentiment d’inadéquation', 'envie de lien freinée par la crainte']],
  ['complicated-grief', 'Deuil compliqué', 'Un deuil qui reste très envahissant et transforme durablement le quotidien.', ['manque très présent', 'difficulté à reprendre certaines activités', 'souvenirs qui submergent']],
  ['social-isolation', 'Isolement social', 'Un éloignement des liens et activités qui peut avoir plusieurs origines.', ['contacts devenus rares', 'sentiment d’être à l’écart', 'difficulté à solliciter un proche']],
  ['harassment', 'Harcèlement scolaire ou professionnel', 'Des interactions répétées qui fragilisent le sentiment de sécurité ou d’appartenance.', ['remarques ou gestes répétés', 'appréhension avant un lieu', 'impact sur la confiance']],
  ['family-conflict', 'Conflit familial persistant', 'Un conflit qui s’inscrit dans la durée et affecte les ressources de chacun.', ['tensions récurrentes', 'communication bloquée', 'place difficile à tenir dans la famille']],
  ['inferiority', 'Complexe d’infériorité', 'Une tendance à se comparer défavorablement qui influence les choix et relations.', ['comparaisons défavorables', 'réussites minimisées', 'hésitation à prendre sa place']],
  ['self-confidence', 'Manque de confiance en soi', 'Une difficulté à reconnaître ses capacités ou à agir malgré le doute.', ['doute avant d’agir', 'besoin de validation extérieure', 'renoncement à une occasion']],
  ['perfectionism', 'Perfectionnisme excessif', 'Une exigence très élevée qui peut rendre l’action ou le repos difficiles.', ['peur de ne pas faire assez bien', 'temps excessif sur un détail', 'difficulté à terminer']],
  ['procrastination', 'Procrastination chronique', 'Un report répété des tâches à explorer avec les émotions et contraintes qui l’entourent.', ['tâches reportées malgré l’intention', 'soulagement bref en évitant', 'pression qui augmente à l’approche d’une échéance']],
  ['emotion-regulation', 'Difficulté à gérer ses émotions', 'Des émotions vécues comme difficiles à identifier, tolérer ou exprimer.', ['émotion qui déborde', 'réaction regrettée après coup', 'difficulté à nommer ce qui se passe']],
  ['assertiveness', 'Difficulté d’affirmation de soi', 'Une difficulté à exprimer ses besoins ou limites dans certaines relations.', ['dire non difficile', 'besoins tus pour préserver la paix', 'frustration après un échange']],
];
export const PSYCHOLOGY_MOTIFS = Object.freeze(Object.fromEntries(entries.map(([id, label, description, signs]) => [id, { id, label, description, signs }])));
export const PSYCHOLOGY_POOL_SIZES = Object.freeze([3, 6, 10, 15, 20, 22, 24, 26, 28, 30]);
export const PSYCHOLOGY_POOLS = Object.freeze(PSYCHOLOGY_POOL_SIZES.map((size, index) => ({ order: index + 1, motifIds: entries.slice(0, size).map(([id]) => id), theme: `Consultation ${index + 1}` })));
export const PSYCHOLOGY_SUPPORTS = Object.freeze([
  { id: 'daily-life-journal', label: 'Journal du quotidien', unlockOrder: 1, kind: 'psychology-journal' },
  { id: 'timeline', label: 'Chronologie', unlockOrder: 3, kind: 'psychology-timeline' },
  { id: 'relationship-map', label: 'Carte relationnelle', unlockOrder: 5, kind: 'psychology-relationships' },
  { id: 'reaction-chain', label: 'Chaîne de réaction', unlockOrder: 7, kind: 'psychology-chain' },
  { id: 'daily-life-fragments', label: 'Fragments du quotidien', unlockOrder: 9, kind: 'psychology-fragments' },
]);
export function getPsychologyMotif(id) { return PSYCHOLOGY_MOTIFS[id] || null; }
