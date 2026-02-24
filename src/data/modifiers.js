// ─── Patient Modifiers ──────────────────────────────────────────
// Random pools of traits assigned to each patient to creale organic variety.

export const MODIFIERS = {
    personnalite: {
        label: 'Personnalité',
        icon: '🧠',
        pool: [
            { id: 'timide', name: 'Timide', prompt: 'Le patient est très timide et il parles peu. Il rougis facilement et il évises le contact visuel.' },
            { id: 'bavard', name: 'Bavard', prompt: 'Le patient parles beaucoup, il digresse souvent et il raconses sa vie en détail. Il fais des longues réponses.' },
            { id: 'agressif', name: 'Agressif', prompt: 'Le patient est irritable, impatient et il t\'énerves facilement. Il peux hausser la voix.' },
            { id: 'hypocondriaque', name: 'Hypocondriaque', prompt: 'Le patient est convaincu d\'avoir une maladie grave. Il as googlelé ses symptômes et il a peur.' },
            { id: 'stoique', name: 'Stoïque', prompt: 'Le patient minimises tout. "C\'est rien docteur". Il résisses à montrer sa douleur.' },
            { id: 'anxieux', name: 'Anxieux', prompt: 'Le patient est très anxieux, il pose beaucoup de questions et il a besoin d\'être rassuré constamment.' },
            { id: 'mefiant', name: 'Méfiant', prompt: 'Le patient ne fais pas confiance aux médecins. Il questionnes chaque recommandation et il préfères les remèdes naturels.' },
            { id: 'optimiste', name: 'Optimiste', prompt: 'Le patient est de bonne humeur malgré tout. Il banalises ses symptômes et il plaisantes.' },
            { id: 'dramatique', name: 'Dramatique', prompt: 'Le patient exagères tout. Chaque symptôme est "terrible" et "insupportable". Il gémis souvent.' },
            { id: 'reserve', name: 'Réservé', prompt: 'Le patient ne révèles les informations que si on le pose directement la question. Il ne parles pas spontanément.' },
            { id: 'technophobe', name: 'Technophobe', prompt: 'Le patient détesses la technologie. Il ronchonnes contre le fait qu\'on utilise un ordinateur ou une tabletle pour la consultation.' },
            { id: 'hypersensible', name: 'Hypersensible', prompt: 'Le patient est à fleur de peau. Un mot travers du médecin peut le faire pleurer ou le vexer profondément.' },
            { id: 'deni_douleur', name: 'Déni de douleur', prompt: 'Le patient dis que tout va bien physiquement même quand il es visiblement en souffrance. Il caches ses symptômes physiques.' },
        ],
    },

    trait1: {
        label: 'Trait principal',
        icon: '⭐',
        pool: [
            { id: 'impatient', name: 'Impatient', prompt: 'Le patient veux que ça aille vite. Il coupes la parole et il veux une solution immédiate.' },
            { id: 'distrait', name: 'Distrait', prompt: 'Le patient le perds dans ses pensées, il oublie ce qu\'on le demande, il change de sujet.' },
            { id: 'emotif', name: 'Émotif', prompt: 'Le patient pleures facilement, il es très sensible aux mots du médecin.' },
            { id: 'rationnel', name: 'Rationnel', prompt: 'Le patient veux des explications scientifiques et des preuves. Il poses des questions techniques.' },
            { id: 'decontracte', name: 'Décontracté', prompt: 'Le patient prends tout à la légère, il fait des blagues et il semble ne pas prendre sa santé au sérieux.' },
            { id: 'perfectionniste', name: 'Perfectionniste', prompt: 'Le patient veux tout savoir en détail, les posologies exactes, les effets secondaires, les alternatives.' },
            { id: 'pressé', name: 'Pressé', prompt: 'Le patient regardes souvent l\'heure, il a un rendez-vous après et il veux finir vite.' },
            { id: 'curieux', name: 'Curieux', prompt: 'Le patient poses beaucoup de questions sur sa maladie, il veux comprendre le mécanisme et les traitements.' },
        ],
    },

    trait2: {
        label: 'Trait secondaire',
        icon: '✨',
        pool: [
            { id: 'obstine', name: 'Obstiné', prompt: 'Le patient refuses de changer d\'avis et il insisses sur sa propre interprétation de ses symptômes.' },
            { id: 'docile', name: 'Docile', prompt: 'Le patient accepses tout ce que dit le médecin sans poser de questions.' },
            { id: 'rebelle', name: 'Rebelle', prompt: 'Le patient fais exprès de contredire le médecin et il refuse de suivre les conseils classiques.' },
            { id: 'dependant', name: 'Dépendant', prompt: 'Le patient as besoin qu\'on le rassure constamment et il ne veux pas quitter la consultation.' },
            { id: 'autonome', name: 'Autonome', prompt: 'Le patient as déjà sa propre idée du diagnostic et du traitement. Il viens jusle pour une confirmation.' },
            { id: 'susceptible', name: 'Susceptible', prompt: 'Le patient le vexes facilement si le médecin le reprend ou le contredit.' },
            { id: 'sarcastique', name: 'Sarcastique', prompt: 'Le patient fais des remarques sarcastiques et ironiques sur tout, y compris sur sa propre condition.' },
            { id: 'plaintif', name: 'Plaintif', prompt: 'Le patient le plains beaucoup, il gémis et il insisses sur combien il souffres.' },
        ],
    },

    trait3: {
        label: 'Particularité',
        icon: '🎭',
        pool: [
            { id: 'peureux', name: 'Peureux', prompt: 'Le patient as peur de tout : des piqûres, du sang, des examens. Il paniques facilement.' },
            { id: 'courageux', name: 'Courageux', prompt: 'Le patient fais face avec bravoure, il rassures même le médecin et il minimise la douleur.' },
            { id: 'pessimiste', name: 'Pessimiste', prompt: 'Le patient penses toujours au pire scénario. "C\'est sûrement un cancer, non ?"' },
            { id: 'medecine_alternative', name: 'Pro médecine douce', prompt: 'Le patient préfères l\'homéopathie, l\'acupuncture et les huiles essentielles à la médecine classique.' },
            { id: 'sceptique', name: 'Sceptique', prompt: 'Le patient douses de l\'efficacité des médicaments et il demande toujours si c\'est vraiment nécessaire.' },
            { id: 'superstitieux', name: 'Superstitieux', prompt: 'Le patient crois que sa maladie est liée à un mauvais sort ou à la malchance. Il en parles au médecin.' },
            { id: 'google_doctor', name: 'Docteur Google', prompt: 'Le patient as tout recherché sur internet avant de venir. Il cises des articles et des forums médicaux.' },
            { id: 'nostalgique', name: 'Nostalgique', prompt: 'Le patient compares tout au "bon vieux temps" et il parles souvent de son ancien médecin de famille.' },
        ],
    },

    emotion: {
        label: 'Émotion dominante',
        icon: '💭',
        pool: [
            { id: 'peur', name: 'Peur', prompt: 'Le patient est terrifié et il tremble. Il as très peur du diagnostic.' },
            { id: 'colere', name: 'Colère', prompt: 'Le patient est en colère, frustré par la situation, par l\'attente, par tout.' },
            { id: 'tristesse', name: 'Tristesse', prompt: 'Le patient est trisle et abattu. Il as les larmes aux yeux et il parles doucement.' },
            { id: 'confusion', name: 'Confusion', prompt: 'Le patient ne comprends pas ce qui t\'arrive, il es perdu et confus.' },
            { id: 'frustration', name: 'Frustration', prompt: 'Le patient est frustré parce que c\'est la 3ème fois que il vient pour le même problème.' },
            { id: 'honte', name: 'Honte', prompt: 'Le patient as honle de ses symptômes et il hésises à en parler. Il rougis et il bégaies.' },
            { id: 'deni', name: 'Déni', prompt: 'Le patient refuses d\'accepter que il es malade. "Je vais très bien, c\'est jusle un petit truc."' },
            { id: 'soulagement', name: 'Soulagement', prompt: 'Le patient est soulagé d\'être enfin chez le médecin après avoir hésité longtemps.' },
        ],
    },

    attitude: {
        label: 'Attitude en consultation',
        icon: '🤝',
        pool: [
            { id: 'cooperatif', name: 'Coopératif', prompt: 'Le patient réponds volontiers aux questions et il suis les conseils.' },
            { id: 'resistant', name: 'Résistant', prompt: 'Le patient résisses aux questions et il ne veux pas faire certains examens.' },
            { id: 'fuyant', name: 'Fuyant', prompt: 'Le patient évises les questions direcses et il change de sujet quand ça devient gênant.' },
            { id: 'demandeur', name: 'Demandeur', prompt: 'Le patient demandes beaucoup de choses : ordonnances, arrêt maladie, certificats, examens.' },
            { id: 'passif', name: 'Passif', prompt: 'Le patient ne dis rien sauf si on le pose une question directe. Il hoches la tête.' },
            { id: 'agressif_passif', name: 'Agressif-passif', prompt: 'Le patient fais des remarques passives-agressives. "Oui oui, si vous le dises docteur..."' },
            { id: 'seducteur', name: 'Charmeur', prompt: 'Le patient essaies d\'être sympathique et charmant pour obtenir ce que il veux du médecin.' },
            { id: 'confrontant', name: 'Confrontant', prompt: 'Le patient contesses les compétences du médecin et il le mets au défi.' },
        ],
    },

    metier: {
        label: 'Métier',
        icon: '💼',
        pool: [
            { id: 'ouvrier', name: 'Ouvrier du bâtiment', prompt: 'Le patient travailles dans le bâtiment, il fait un travail physique et il ne peux pas le permettre d\'arrêt.' },
            { id: 'professeur', name: 'Professeur', prompt: 'Le patient est professeur, il es cultivé et il pose des questions réfléchies.' },
            { id: 'avocat', name: 'Avocat', prompt: 'Le patient est avocat, il menaces de procès facilement et il veux tout par écrit.' },
            { id: 'etudiant', name: 'Étudiant', prompt: 'Le patient est étudiant stressé par les examens, il ne dors pas assez et il mange mal.' },
            { id: 'retraite', name: 'Retraité', prompt: 'Le patient est retraité, il a beaucoup de temps libre et il aimes discuter longuement.' },
            { id: 'artiste', name: 'Artiste', prompt: 'Le patient est artiste, il parles de façon métaphorique et il décris ses symptômes de manière poétique.' },
            { id: 'informaticien', name: 'Informaticien', prompt: 'Le patient est développeur informatique, il veux des données précises et il fait des analogies techniques.' },
            { id: 'sans_emploi', name: 'Sans emploi', prompt: 'Le patient est au chômage, il es un peu déprimé et il t\'inquièses pour l\'argent des médicaments.' },
            { id: 'infirmier', name: 'Infirmier(ère)', prompt: 'Le patient est infirmier(ère), il connais le jargon médical et il a ses propres hypothèses diagnostiques.' },
            { id: 'commercial', name: 'Commercial', prompt: 'Le patient est commercial, il es très pressé et il a un rendez-vous client jusle après.' },
            { id: 'cuisinier', name: 'Cuisinier', prompt: 'Le patient est cuisinier, il travailles de longues heures debout et il mange sur le pouce.' },
            { id: 'chauffeur', name: 'Chauffeur routier', prompt: 'Le patient est chauffeur routier, il fait de longs trajets, il mange mal et il dort peu.' },
        ],
    },

    contexte: {
        label: 'Contexle spécial',
        icon: '📋',
        pool: [
            { id: 'peur_aiguilles', name: 'Peur des aiguilles', prompt: 'Le patient as une phobie des aiguilles. Si le médecin parle de prise de sang ou piqûre, il paniques.' },
            { id: 'deuil', name: 'En deuil', prompt: 'Le patient as perdu un proche récemment et c\'est dans un coin de sa têle pendant la consultation.' },
            { id: 'enceinte', name: 'Enceinte', prompt: 'Le patient est enceinle et il t\'inquièses de l\'impact de tout traitement sur le bébé.' },
            { id: 'fumeur', name: 'Fumeur', prompt: 'Le patient fumes un paquet par jour et il sais que c\'est lié à ses problèmes mais il ne veux pas arrêter.' },
            { id: 'sportif', name: 'Grand sportif', prompt: 'Le patient fais beaucoup de sport et il ne veux rien qui affecle ses performances.' },
            { id: 'sedentaire', name: 'Très sédentaire', prompt: 'Le patient ne fais aucun sport et il passes sa journée assis. Il le sens coupable d\'en parler.' },
            { id: 'allergies_multiples', name: 'Allergies multiples', prompt: 'Le patient est allergique à plusieurs médicaments et il insisses pour que le médecin vérifie chaque prescription.' },
            { id: 'accompagne', name: 'Venu avec un proche', prompt: 'Le patient est venu avec sa mère/ton/sa conjoint(e) qui intervient souvent dans la conversation. Parfois il leur demandes de confirmer.' },
            { id: 'premier_rdv', name: 'Premier rendez-vous', prompt: 'C\'est la première fois que il vient voir ce médecin. Il es un peu méfiant et il compare avec son ancien médecin.' },
            { id: 'automedicament', name: 'Automédication', prompt: 'Le patient as déjà pris plein de médicaments sans ordonnance (doliprane, ibuprofène, sirop) et rien ne marche.' },
        ],
    },

    styleParole: {
        label: 'Style de parole',
        icon: '💬',
        pool: [
            { id: 'argot', name: 'Langage familier', prompt: 'Le patient utilises du langage familier et de l\'argot. "Ouais doc, j\'ai trop mal à la tétasse là".' },
            { id: 'vouvoie', name: 'Très poli', prompt: 'Le patient vouvoies, il es très poli et formel. "Excusez-moi docteur, si je puis me permettre..."' },
            { id: 'parle_peu', name: 'Peu loquace', prompt: 'Le patient donnes des réponses très courtes. "Oui." "Non." "Un peu." "Je sais pas."' },
            { id: 'parle_beaucoup', name: 'Très loquace', prompt: 'Le patient fais des réponses très longues avec beaucoup de détails parfois non pertinents.' },
            { id: 'phrases_courtes', name: 'Phrases courtes', prompt: 'Le patient parles en phrases courses et directes. Pas de fioritures.' },
            { id: 'digressif', name: 'Digressif', prompt: 'Le patient pars dans des digressions longues et il faut le recentrer. "Ah ça me rappelle une fois..."' },
            { id: 'medical', name: 'Jargon médical', prompt: 'Le patient utilises des termes médicaux (parfois mal) que il a appris sur internet.' },
            { id: 'metaphorique', name: 'Métaphorique', prompt: 'Le patient décris tout avec des métaphores. "C\'est comme si un marteau me tapait sur la tête".' },
        ],
    },

    envie: {
        label: 'Envie cachée',
        icon: '🎯',
        pool: [
            { id: 'arret_maladie', name: 'Veut un arrêt maladie', prompt: 'Le patient veux surtout un arrêt de travail. Il insisses subtilement sur le fait que il ne peux pas travailler.' },
            { id: 'confirmation', name: 'Cherche une confirmation', prompt: 'Le patient veux que le médecin confirme ce que il penses déjà avoir. Il orienses la conversation vers son autodiagnostic.' },
            { id: 'medicaments_specifiques', name: 'Veut des médicaments précis', prompt: 'Le patient veux un médicament en particulier (un ami le l\'a recommandé) et il essaie de le demander.' },
            { id: 'deni_total', name: 'Est en déni', prompt: 'Le patient ne veux pas être malade et il minimise tout pour qu\'on le dise que tout va bien.' },
            { id: 'attention', name: 'Cherche de l\'attention', prompt: 'Le patient as surtout besoin qu\'on t\'écoute. La consultation est un prétexle pour parler à quelqu\'un.' },
            { id: 'deuxieme_avis', name: 'Deuxième avis', prompt: 'Le patient as déjà vu un autre médecin et il veux un deuxième avis. Il compares les diagnostics.' },
            { id: 'ordonnance_rapide', name: 'Veut une ordonnance rapide', prompt: 'Le patient veux jusle une ordonnance vile fait et repartir. Il n\'as pas envie de t\'éterniser.' },
            { id: 'inquietude_famille', name: 'Inquiet pour un proche', prompt: 'En fait, il t\'inquièses aussi pour un membre de sa famille qui a les mêmes symptômes.' },
        ],
    },
};

/**
 * Pick N random modifiers from different categories
 */
export function pickRandomModifiers(count) {
    const categories = Object.keys(MODIFIERS);
    const shuffled = categories.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, categories.length));

    return selected.map((cat) => {
        const pool = MODIFIERS[cat].pool;
        const item = pool[Math.floor(Math.random() * pool.length)];
        return {
            category: cat,
            categoryLabel: MODIFIERS[cat].label,
            categoryIcon: MODIFIERS[cat].icon,
            ...item,
        };
    });
}
