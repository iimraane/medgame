import { navigate } from '../main.js';
import GameEngine from '../game/engine.js';
import { ROLES } from '../data/roles.js';
export function renderLevelSelect(container, roleId) {
  const role = ROLES[roleId];
  if (!role) {
    navigate('menu', { hubFeedback: 'Cette porte ne peut pas être ouverte pour le moment.' });
    return;
  }
  if (!role?.unlocked) {
    container.innerHTML = `<div class="view level-select"><div class="level-select__header"><button class="btn btn--icon btn--secondary" id="btn-back">←</button><div><p class="career-hub__eyebrow">Clinique des parcours</p><h1>Parcours indisponible</h1></div></div><p class="level-select__notice">${role?.label || 'Cette profession'} n’est pas encore accessible. ${role?.unlockRequirement || ''}</p></div>`;
    container.querySelector('#btn-back').addEventListener('click', () => navigate('menu'));
    return;
  }
  const cards = GameEngine.getMissionsWithStatus(role.id).map((mission) => `<button class="level-card ${mission.unlocked ? '' : 'level-card--locked'}" data-mission="${mission.id}" ${mission.unlocked ? '' : 'disabled'}><div class="level-card__number">Mission ${mission.order}</div><div class="level-card__name">${mission.icon} ${mission.title}</div><div class="level-card__desc">${mission.summary}</div></button>`).join('');
  container.innerHTML = `<div class="view level-select"><div class="level-select__header"><button class="btn btn--icon btn--secondary" id="btn-back">←</button><div><p class="career-hub__eyebrow">${role.label}</p><h1>Carte des missions</h1></div></div><div class="level-select__grid">${cards}</div></div>`;
  container.querySelector('#btn-back').addEventListener('click', () => navigate('hub'));
  container.querySelectorAll('[data-mission]').forEach((card) => card.addEventListener('click', () => navigate('game', { missionId: card.dataset.mission })));
}
