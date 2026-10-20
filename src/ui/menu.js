import { navigate } from '../main.js';
import { loadSave } from '../utils/storage.js';
import { getDoorAction, ROLES } from '../data/roles.js';

export function doorMarkup(role) {
  const state = role.unlocked ? 'career-door--open' : 'career-door--locked';
  const status = role.unlocked ? 'Porte ouverte · Entrer' : `🔒 ${role.unlockRequirement}`;
  return `<button class="career-door ${state} career-door--${role.theme}" type="button" data-role="${role.id}"><span class="career-door__window" aria-hidden="true"></span><span class="career-door__icon" aria-hidden="true">${role.icon}</span><span class="career-door__sign">${role.label}</span><span class="career-door__description">${role.description}</span><span class="career-door__status">${status}</span></button>`;
}

export function renderMenu(container, initialFeedback = '') {
  const completed = Object.values(loadSave().missionProgress).filter((progress) => progress.attempts).length;
  container.innerHTML = `<div class="view menu career-hub"><header class="career-hub__header"><p class="career-hub__eyebrow">MedGame · simulation éducative fictive</p><h1 class="menu__title">La clinique des parcours</h1><p class="menu__subtitle">Choisissez une porte pour pratiquer une démarche de soin sûre et observable.</p><p class="career-hub__progress">${completed}/3 missions de diététique pratiquées</p></header><main class="clinic-alley" aria-label="Allée des professions de santé"><div class="clinic-alley__sky" aria-hidden="true"></div><div class="clinic-alley__buildings">${Object.values(ROLES).map(doorMarkup).join('')}</div><div class="clinic-alley__path" aria-hidden="true"></div></main><p class="career-hub__feedback" id="hub-feedback" role="status" aria-live="polite"></p><div class="menu__actions career-hub__actions"><button class="btn btn--secondary" id="btn-settings">Paramètres</button></div></div>`;
  const feedback = container.querySelector('#hub-feedback');
  feedback.textContent = initialFeedback;
  container.querySelectorAll('[data-role]').forEach((door) => door.addEventListener('click', () => {
    const action = getDoorAction(door.dataset.role);
    if (action.roleId) navigate('levels', { roleId: action.roleId });
    else feedback.textContent = action.feedback;
  }));
  container.querySelector('#btn-settings').addEventListener('click', () => navigate('settings'));
}
