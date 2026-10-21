import { navigate } from '../main.js';
export function renderMenu(container, initialFeedback = '') {
  container.innerHTML = `<div class="view menu landing-menu"><div class="landing-menu__mark" aria-hidden="true">MG</div><p class="landing-menu__eyebrow">Jeu de rôles santé</p><h1 class="menu__title">MedGame</h1><p class="menu__subtitle">Découvre les métiers de santé à travers des situations guidées.</p><p class="landing-menu__feedback" role="status">${initialFeedback}</p><div class="menu__actions"><button class="btn btn--primary" id="btn-play">Jouer</button><button class="btn btn--secondary" id="btn-settings">Paramètres</button></div></div>`;
  container.querySelector('#btn-play').addEventListener('click', () => navigate('loading'));
  container.querySelector('#btn-settings').addEventListener('click', () => navigate('settings'));
}
