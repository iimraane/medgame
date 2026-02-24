// ─── Unlockable Perks ────────────────────────────────────────────
// Perks unlocked at specific levels that give the player advantages.

export const PERKS = {
    fichePatient: {
        id: 'fichePatient',
        name: 'Fiche Patient',
        emoji: '📋',
        description: 'Voir l\'âge, le sexe et le métier du patient avant la consultation.',
        unlockLevel: 2,
    },
    reponsesRapides: {
        id: 'reponsesRapides',
        name: 'Réponses Rapides',
        emoji: '💬',
        description: '3 réponses pré-écrites contextuelles disponibles pendant la consultation.',
        unlockLevel: 4,
    },
    analysesLaboratoire: {
        id: 'analysesLaboratoire',
        name: 'Analyses de Labo',
        emoji: '🧪',
        description: 'Obtenir les constantes biologiques clés une fois par consultation.',
        unlockLevel: 6,
    },
    photoPatient: {
        id: 'photoPatient',
        name: 'Photo du Patient',
        emoji: '📸',
        description: 'Obtenir une photo réaliste du patient pour observer ses signes cliniques visibles.',
        unlockLevel: 8,
    },
    antecedents: {
        id: 'antecedents',
        name: 'Antécédents Médicaux',
        emoji: '📜',
        description: 'Consulter l\'historique médical du patient, généré en fonction de son profil et de sa pathologie.',
        unlockLevel: 10,
    },
    indiceDiagnostic: {
        id: 'indiceDiagnostic',
        name: 'Indice Diagnostic',
        emoji: '🔍',
        description: 'Obtenir un indice IA personnalisé sur la pathologie du patient en fonction de la situation actuelle.',
        unlockLevel: 12,
    },
    dossierPartage: {
        id: 'dossierPartage',
        name: 'Dossier Partagé',
        emoji: '🗂️',
        description: 'Permet de voir les 3 diagnostics les plus probables calculés par l\'IA selon la conversation actuelle. (Aide au diagnostic différentiel).',
        unlockLevel: 15,
    },
    traitementEpreuve: {
        id: 'traitementEpreuve',
        name: 'Traitement d\'épreuve',
        emoji: '💊',
        description: 'Vous suggérez un médicament au patient pour voir comment il réagit physiquement. L\'IA décrit l\'évolution immédiate.',
        unlockLevel: 17,
    },
    avisSpecialiste: {
        id: 'avisSpecialiste',
        name: 'Avis Spécialiste',
        emoji: '🔬',
        description: 'Éliminer 3 diagnostics incorrects lors du choix final.',
        unlockLevel: 20,
    },
};

export function getUnlockedPerks(currentLevel) {
    return Object.values(PERKS).filter((p) => p.unlockLevel <= currentLevel);
}

export function getPerkUnlockedAtLevel(level) {
    return Object.values(PERKS).find((p) => p.unlockLevel === level) || null;
}
