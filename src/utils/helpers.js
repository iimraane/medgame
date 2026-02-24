// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Format *actions* in patient messages to italic
 */
export function formatPatientMessage(text) {
    return text.replace(/\*([^*]+)\*/g, '<em class="patient-action">$1</em>');
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random item from array
 */
export function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Delay promise
 */
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random French patient name
 */
export function generatePatientName() {
    const firstNamesMale = ['Jean', 'Pierre', 'Michel', 'Mohamed', 'Patrick', 'Olivier', 'Thomas', 'Marc', 'Antoine', 'Karim', 'Nicolas', 'François', 'Youssef', 'Bruno', 'Julien', 'Mathieu', 'Lucas', 'Hugo', 'Romain', 'Adrien'];
    const firstNamesFemale = ['Marie', 'Nathalie', 'Sophie', 'Fatima', 'Isabelle', 'Christine', 'Émilie', 'Julie', 'Camille', 'Aïcha', 'Laura', 'Sandrine', 'Aurélie', 'Céline', 'Mélanie', 'Léa', 'Chloé', 'Manon', 'Sarah', 'Amira'];
    const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Fontaine', 'Blanc', 'Rousseau', 'Vincent', 'Morel', 'Benali', 'Diallo', 'Nguyen', 'Bouchard', 'Leroy'];

    const isMale = Math.random() > 0.5;
    const firstName = isMale ? randomPick(firstNamesMale) : randomPick(firstNamesFemale);
    const lastName = randomPick(lastNames);
    const age = randomInt(18, 82);

    return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        age,
        gender: isMale ? 'Homme' : 'Femme',
        isMale,
    };
}

/**
 * Generate patient physical description for photo perk
 */
export function generatePatientDescription(patient) {
    const builds = patient.isMale
        ? ['corpulence moyenne', 'plutôt mince', 'assez costaud', 'légèrement en surpoids', 'très mince']
        : ['corpulence moyenne', 'plutôt mince', 'silhouette sportive', 'légèrement ronde', 'très mince'];

    const hairColors = ['cheveux bruns', 'cheveux noirs', 'cheveux blonds', 'cheveux roux', 'cheveux grisonnants', 'cheveux poivre et sel'];
    const features = ['lunettes', 'barbe de 3 jours', 'sourire nerveux', 'air fatigué', 'regard fuyant', 'yeux cernés', 'teint pâle', 'air soucieux'];

    if (patient.age > 60) hairColors.push('cheveux blancs');

    const build = randomPick(builds);
    const hair = randomPick(hairColors);
    const feat1 = randomPick(features);
    const feat2 = randomPick(features.filter((f) => f !== feat1));

    return `${patient.gender}, ${patient.age} ans, ${build}, ${hair}, ${feat1}, ${feat2}.`;
}

/**
 * Difficulty label and color
 */
export function getDifficultyInfo(difficulty) {
    const map = {
        debutant: { label: 'Débutant', color: '#2d6a4f', bg: '#d8f3dc' },
        facile: { label: 'Facile', color: '#0077b6', bg: '#caf0f8' },
        moyen: { label: 'Moyen', color: '#e76f51', bg: '#fce4d6' },
        difficile: { label: 'Difficile', color: '#d62828', bg: '#ffd7d7' },
        expert: { label: 'Expert', color: '#7b2cbf', bg: '#ede4f5' },
        maitre: { label: 'Maître', color: '#ff006e', bg: '#ffe4f0' },
    };
    return map[difficulty] || map.debutant;
}

/**
 * Stars display
 */
export function starsHTML(count, max = 3) {
    let html = '';
    for (let i = 0; i < max; i++) {
        html += `<span class="star ${i < count ? 'star--filled' : 'star--empty'}">★</span>`;
    }
    return html;
}

/**
 * Custom Confirm Dialog
 */
export function showCustomConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';

    overlay.innerHTML = `
    <div class="custom-confirm-box shadow-xl">
      <div class="custom-confirm-message">${message}</div>
      <div class="custom-confirm-actions">
        <button class="btn btn--secondary" id="confirm-cancel">Annuler</button>
        <button class="btn btn--primary" id="confirm-ok">Oui</button>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#confirm-ok').addEventListener('click', () => {
        overlay.remove();
        onConfirm();
    });
}
