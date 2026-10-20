export const ROLES = {
  dietetics: {
    id: 'dietetics',
    name: 'Dietetics',
    label: 'Diététique',
    icon: '🥕',
    description: 'Explorer les habitudes, les contraintes et des objectifs réalistes, sans prescription personnalisée.',
    theme: 'dietetics',
    unlocked: true,
  },
  generalPractice: {
    id: 'generalPractice',
    name: 'General Practice',
    label: 'Médecine générale',
    icon: '🩺',
    description: 'Observer, orienter et coordonner le parcours de soin.',
    theme: 'general-practice',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
  },
  nursing: {
    id: 'nursing',
    name: 'Nursing',
    label: 'Soins infirmiers',
    icon: '🩹',
    description: 'Accompagner, surveiller et soutenir au plus près du quotidien.',
    theme: 'nursing',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
  },
  psychology: {
    id: 'psychology',
    name: 'Psychology',
    label: 'Psychologie',
    icon: '💬',
    description: 'Écouter avec attention et créer un espace de parole sûr.',
    theme: 'psychology',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy',
    label: 'Pharmacie',
    icon: '⚗️',
    description: 'Informer et sécuriser le bon usage des traitements.',
    theme: 'pharmacy',
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
  },
};

export function getRole(roleId) { return ROLES[roleId]; }

export function getDoorAction(roleId) {
  const role = getRole(roleId);
  if (!role) return { feedback: 'Ce parcours ne peut pas être ouvert pour le moment.' };
  if (role.unlocked) return { roleId: role.id };
  return { feedback: `${role.label} : parcours verrouillé. ${role.unlockRequirement}.` };
}
