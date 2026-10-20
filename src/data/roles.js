export const ROLES = {
  dietetics: {
    id: 'dietetics',
    name: 'Dietetics',
    label: 'Diététique',
    icon: '🥕',
    description: 'Explorer les habitudes, les contraintes et des objectifs réalistes, sans prescription personnalisée.',
    theme: 'dietetics',
    panelAsset: 'campus-panel-dietetics.png',
    unlocked: true,
    hotspot: { left: 2.8, top: 12.4, width: 16, height: 51.5 },
    manual: {
      purpose: 'Comprendre les habitudes de vie et accompagner des objectifs alimentaires réalistes.',
      skills: ['Mener une anamnèse alimentaire', 'Adapter sa communication au contexte', 'Construire un plan sûr et réalisable'],
      missions: 'Entretiens guidés, analyse de contexte et choix de stratégies d’accompagnement.',
    },
  },
  generalPractice: {
    id: 'generalPractice',
    name: 'General Practice',
    label: 'Médecine générale',
    icon: '🩺',
    description: 'Observer, orienter et coordonner le parcours de soin.',
    theme: 'general-practice',
    panelAsset: 'campus-panel-general-practice.png',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
    hotspot: { left: 25, top: 27.6, width: 12, height: 33.4 },
    manual: {
      purpose: 'Observer, orienter et coordonner les étapes d’un parcours de soin.',
      skills: ['Prioriser les informations', 'Repérer les signaux d’alerte', 'Orienter de façon sécurisée'],
      missions: 'Situations de première ligne, tri et coordination interprofessionnelle.',
    },
  },
  nursing: {
    id: 'nursing',
    name: 'Nursing',
    label: 'Soins infirmiers',
    icon: '🩹',
    description: 'Accompagner, surveiller et soutenir au plus près du quotidien.',
    theme: 'nursing',
    panelAsset: 'campus-panel-nursing.png',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
    hotspot: { left: 42.8, top: 34.7, width: 10.8, height: 25.5 },
    manual: {
      purpose: 'Accompagner, surveiller et soutenir les personnes dans leur quotidien de soin.',
      skills: ['Observer une évolution', 'Transmettre une information utile', 'Soutenir l’autonomie'],
      missions: 'Surveillance clinique, transmissions et accompagnement relationnel.',
    },
  },
  psychology: {
    id: 'psychology',
    name: 'Psychology',
    label: 'Psychologie',
    icon: '💬',
    description: 'Écouter avec attention et créer un espace de parole sûr.',
    theme: 'psychology',
    panelAsset: 'campus-panel-psychology.png',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
    hotspot: { left: 72.7, top: 37.2, width: 8.2, height: 23.4 },
    manual: {
      purpose: 'Créer un espace d’écoute sûr et comprendre les facteurs psychologiques.',
      skills: ['Écoute active', 'Reformulation', 'Repérage des besoins d’orientation'],
      missions: 'Entretiens, alliance thérapeutique et repérage des ressources.',
    },
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy',
    label: 'Pharmacie',
    icon: '⚗️',
    description: 'Informer et sécuriser le bon usage des traitements.',
    theme: 'pharmacy',
    panelAsset: 'campus-panel-pharmacy.png',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
    hotspot: { left: 85.9, top: 30, width: 11.3, height: 30.4 },
    manual: {
      purpose: 'Informer et sécuriser le bon usage des traitements au plus près des personnes.',
      skills: ['Expliquer un traitement', 'Prévenir les risques', 'Orienter vers le bon interlocuteur'],
      missions: 'Conseils de bon usage, prévention et coordination avec les soignants.',
    },
  },
};

export function getRole(roleId) { return ROLES[roleId]; }

export function getCampusPanelAction(roleId) {
  const role = getRole(roleId);
  if (!role?.panelAsset) return { feedback: 'Ce panneau ne peut pas être chargé pour le moment.' };
  return { roleId: role.id, panelAsset: role.panelAsset };
}

export function getDoorAction(roleId) {
  const role = getRole(roleId);
  if (!role) return { feedback: 'Ce parcours ne peut pas être ouvert pour le moment.' };
  if (role.unlocked) return { roleId: role.id };
  return { feedback: `${role.label} : parcours verrouillé. ${role.unlockRequirement}.` };
}
