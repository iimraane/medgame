import { navigate } from '../main.js';
import { loadSave } from '../utils/storage.js';
export function renderMenu(container) {
  const completed = Object.values(loadSave().missionProgress).filter((progress) => progress.attempts).length;
  container.innerHTML = `<div class="view menu career-hub"><div class="menu__logo">🥕</div><p class="career-hub__eyebrow">MedGame · simulation éducative fictive</p><h1 class="menu__title">La clinique des parcours</h1><p class="menu__subtitle">Apprendre des démarches de soin sûres et observables, jamais du conseil personnalisé.</p><div class="career-hub__progress">${completed}/3 missions de diététique pratiquées</div><div class="menu__actions"><button class="btn btn--primary" id="btn-play">Entrer dans la clinique</button><button class="btn btn--secondary" id="btn-settings">Paramètres</button></div></div>`;
  container.querySelector('#btn-play').addEventListener('click', () => navigate('levels'));
  container.querySelector('#btn-settings').addEventListener('click', () => navigate('settings'));
}
