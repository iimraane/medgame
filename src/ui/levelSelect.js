import { navigate } from '../main.js';
import GameEngine from '../game/engine.js';
import { ROLES } from '../data/roles.js';
export function renderLevelSelect(container) {
  const cards = GameEngine.getMissionsWithStatus().map((mission) => `<button class="level-card ${mission.unlocked ? '' : 'level-card--locked'}" data-mission="${mission.id}" ${mission.unlocked ? '' : 'disabled'}><div class="level-card__number">Mission ${mission.order}</div><div class="level-card__name">${mission.icon} ${mission.title}</div><div class="level-card__desc">${mission.summary}</div><div class="mission-status">${mission.progress ? `Meilleur score ${mission.progress.bestScore}% · ${mission.progress.attempts} essai(s)` : mission.unlocked ? 'Prête à être pratiquée' : 'Terminez la mission précédente pour la débloquer'}</div></button>`).join('');
  container.innerHTML = `<div class="view level-select"><div class="level-select__header"><button class="btn btn--icon btn--secondary" id="btn-back">←</button><div><p class="career-hub__eyebrow">${ROLES.dietetics.label}</p><h1>Carte des missions</h1></div></div><section class="role-strip"><span>🥕 Diététique</span><span class="role-strip__locked">🩺 Soins infirmiers · ${ROLES.nursing.unlockRequirement}</span></section><div class="level-select__grid">${cards}</div></div>`;
  container.querySelector('#btn-back').addEventListener('click', () => navigate('menu'));
  container.querySelectorAll('[data-mission]').forEach((card) => card.addEventListener('click', () => navigate('game', { missionId: card.dataset.mission })));
}
