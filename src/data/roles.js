export const ROLES = {
  dietetics: {
    id: 'dietetics',
    name: 'Dietetics',
    label: 'Diététique',
    icon: '🥕',
    description: 'Explorer les habitudes, les contraintes et des objectifs réalistes, sans prescription personnalisée.',
    theme: 'dietetics',
    unlocked: true,
    campus: { doorId: 'door-dietetics', position: [-7.2, 0, 1.4], footprint: [3.8, 4.2, 3.2], accent: '#8ee6a9', landmark: 'Serre nutrition', silhouette: 'house', sign: 'SERRE NUTRITION', materialAccent: 'warm concrete', preview: 'Des situations concrètes pour observer les habitudes et imaginer des choix réalistes.' },
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
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
    campus: { doorId: 'door-general-practice', position: [-3.7, 0, -2.2], footprint: [3.8, 4.2, 3.2], accent: '#8dc7ff', landmark: 'Clinique de première ligne', silhouette: 'house', sign: 'CLINIQUE · SOINS PRIMAIRES', materialAccent: 'warm concrete', preview: 'Un futur parcours pour trier les informations et orienter avec justesse.' },
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
    unlocked: true,
    campus: { doorId: 'door-nursing', position: [0, 0, 1.1], footprint: [3.8, 4.2, 3.2], accent: '#c5a7ff', landmark: 'Atelier du soin', silhouette: 'house', sign: 'ATELIER DU SOIN', materialAccent: 'warm concrete', preview: 'Un parcours vivant autour de l’observation, des transmissions et de l’autonomie.' },
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
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
    campus: { doorId: 'door-psychology', position: [4, 0, -2], footprint: [3.8, 4.2, 3.2], accent: '#fa9bb5', landmark: 'Conservatoire de l’écoute', silhouette: 'house', sign: 'CONSERVATOIRE · ÉCOUTE', materialAccent: 'warm concrete', preview: 'Un futur espace de pratique pour créer une parole sûre et attentive.' },
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
    unlocked: false,
    unlockRequirement: 'Bientôt disponible',
    campus: { doorId: 'door-pharmacy', position: [7.3, 0, 1.2], footprint: [3.8, 4.2, 3.2], accent: '#77e9cb', landmark: 'Tour de pharmacie', silhouette: 'house', sign: 'PHARMACIE · REMÈDES', materialAccent: 'warm concrete', preview: 'Un futur parcours pour rendre les traitements plus clairs et plus sûrs.' },
    manual: {
      purpose: 'Informer et sécuriser le bon usage des traitements au plus près des personnes.',
      skills: ['Expliquer un traitement', 'Prévenir les risques', 'Orienter vers le bon interlocuteur'],
      missions: 'Conseils de bon usage, prévention et coordination avec les soignants.',
    },
  },
};

export function getRole(roleId) { return ROLES[roleId]; }

export function getCampusHubSummary(roles = Object.values(ROLES)) {
  const playableRoles = roles.filter((role) => role.unlocked);
  const playableCount = playableRoles.length;
  return {
    playableCount,
    playableLabel: `${playableCount} parcours jouable${playableCount === 1 ? '' : 's'}`,
    playableShare: `${(playableCount / roles.length) * 100}%`,
    roleStates: roles.map((role) => ({ id: role.id, state: role.unlocked ? 'playable' : 'preview' })),
  };
}

export function getDoorAction(roleId) {
  const role = getRole(roleId);
  if (!role) return { feedback: 'Ce parcours ne peut pas être ouvert pour le moment.' };
  if (role.unlocked) return { roleId: role.id };
  return { feedback: `${role.label} : parcours verrouillé. ${role.unlockRequirement}.` };
}
