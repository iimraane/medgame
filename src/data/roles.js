export const ROLES = {
  dietetics: {
    id: 'dietetics',
    name: 'Dietetics',
    label: 'Diététique',
    icon: '🥕',
    description: 'Assessment, education, prevention, and realistic goal setting — never individual medical prescribing.',
    unlocked: true,
  },
  nursing: {
    id: 'nursing', name: 'Nursing', label: 'Soins infirmiers', icon: '🩺',
    description: 'Coming soon.', unlocked: false, unlockRequirement: 'Available in a future update',
  },
};

export function getRole(roleId) { return ROLES[roleId]; }
