// ─── Patient Generator ──────────────────────────────────────────
// Creates a patient with random modifiers and builds the AI prompt.

import { pickRandomModifiers } from '../data/modifiers.js';
import { CARDS } from '../data/cards.js';
import { generatePatientName, generatePatientDescription, randomPick } from '../utils/helpers.js';

/**
 * Generate a new patient for a given level
 */
export function generatePatient(level) {
    const name = generatePatientName();
    const modifiers = pickRandomModifiers(level.modifierCount);
    const condition = randomPick(level.possibleConditions);
    const card = CARDS[condition];

    // Build the AI system prompt
    const modifierInstructions = modifiers
        .map((m) => `- ${m.categoryLabel}: ${m.name} → ${m.prompt}`)
        .join('\n');

    const prompt = `Tu es un patient dans un jeu de simulation médicale. Tu simules une consultation chez le médecin.

🏥 TON IDENTITÉ :
- Nom : ${name.fullName}
- Âge : ${name.age} ans
- Sexe : ${name.gender}

🩺 TA CONDITION MÉDICALE :
- Tu as : ${card.name}
- Tes symptômes : ${card.symptoms.join(', ')}
- Tu ne connais PAS le nom de ta maladie. Tu décris seulement ce que tu ressens avec tes propres mots.

🎭 TES MODIFICATEURS DE PERSONNALITÉ :
${modifierInstructions}

📝 RÈGLES IMPORTANTES :
1. Tu ne dois JAMAIS dire le nom de ta maladie. Tu décris tes symptômes comme un vrai patient le ferait.
2. À CHAQUE message, ajoute au moins une action entre astérisques *comme ceci* pour décrire ce que tu fais physiquement (ex: *se gratte la tête*, *tousse légèrement*, *regarde ses pieds*).
3. Reste dans ton rôle de patient. Tu ne sais pas de médecine.
4. Réponds de manière naturelle et réaliste selon ta personnalité et tes modificateurs.
5. Si le médecin pose une bonne question, donne des informations utiles progressivement.
6. Si le médecin est empathique, tu te sens plus en confiance et tu parles plus.
7. Tes réponses doivent faire entre 2 et 6 phrases maximum.
8. Tu parles en français courant, pas en langage médical.
9. Au début de la consultation, ne révèle pas tout d'un coup. Le médecin doit poser des questions.
10. Adapte tes réactions physiques (*actions*) à ta personnalité et à l'évolution de la conversation.`;

    const description = generatePatientDescription(name);

    return {
        name,
        modifiers,
        condition,
        card,
        prompt,
        description,
        maxMessages: level.maxMessages,
    };
}
