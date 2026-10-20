import { getDoorAction, getRole, ROLES } from '../data/roles.js';
import { navigate } from '../main.js';

const CAMPUS_IMAGE = `${import.meta.env.BASE_URL}assets/campus-hub.png`;
const MIN_LOADING_MS = 850;

function manualMarkup(role) {
  const availability = role.unlocked ? 'Parcours disponible' : role.unlockRequirement;
  return `<button class="campus-panel__back" type="button" data-directory>← Retour au panneau</button><div class="campus-manual"><p class="campus-panel__kicker">${availability}</p><h2>${role.label}</h2><p class="campus-manual__purpose">${role.manual.purpose}</p><h3>Compétences travaillées</h3><ul>${role.manual.skills.map((skill) => `<li>${skill}</li>`).join('')}</ul><h3>Ce qui t’attend</h3><p>${role.manual.missions}</p>${role.unlocked ? '<button class="btn btn--primary campus-manual__enter" data-enter>Entrer dans le parcours</button>' : '<p class="campus-manual__locked">Ce parcours est présenté en avant-première. Les missions arriveront prochainement.</p>'}</div>`;
}

function showManual(panel, roleId) {
  const role = getRole(roleId);
  if (!role) return;
  panel.hidden = false;
  panel.innerHTML = manualMarkup(role);
  panel.querySelector('[data-directory]').addEventListener('click', () => { panel.hidden = true; panel.innerHTML = ''; });
  panel.querySelector('[data-enter]')?.addEventListener('click', () => navigate('levels', { roleId: role.id }));
}

export function renderCampusLoading(container) {
  container.innerHTML = `<div class="view campus-loading"><div class="campus-loading__glow" aria-hidden="true"></div><div class="campus-loading__content"><span class="campus-loading__mark">MG</span><p>Préparation du campus…</p><div class="campus-loading__track" aria-label="Chargement en cours"><i></i></div></div></div>`;
  const startedAt = performance.now();
  const image = new Image();
  const finish = () => window.setTimeout(() => navigate('hub'), Math.max(0, MIN_LOADING_MS - (performance.now() - startedAt)));
  image.addEventListener('load', finish, { once: true });
  image.addEventListener('error', () => navigate('menu', { hubFeedback: 'Le campus n’a pas pu être chargé. Réessaie dans un instant.' }), { once: true });
  image.src = CAMPUS_IMAGE;
}

export function renderCampusHub(container) {
  container.innerHTML = `<div class="view campus-shell"><div class="campus-mobile-notice"><span>MedGame est disponible sur PC</span><p>Le campus interactif demande un écran de 1024 px minimum.</p><button class="btn btn--secondary" data-back>Retour à l’accueil</button></div><main class="campus-scene" aria-label="Campus des professions de santé"><img class="campus-scene__image" src="${CAMPUS_IMAGE}" alt="Cour du campus MedGame avec les cinq pôles de santé"><div class="campus-scene__hotspots">${Object.values(ROLES).map((role) => `<button class="campus-hotspot campus-hotspot--${role.theme}" type="button" data-role="${role.id}" aria-label="Entrer dans ${role.label}" style="--left:${role.hotspot.left}%;--top:${role.hotspot.top}%;--width:${role.hotspot.width}%;--height:${role.hotspot.height}%"></button>`).join('')}</div><nav class="campus-directory-hotspots" aria-label="Panneau des métiers">${Object.values(ROLES).map((role, index) => `<button type="button" class="campus-directory-hotspot" data-manual="${role.id}" style="--row:${index}" aria-label="Consulter le manuel ${role.label}"></button>`).join('')}</nav><aside class="campus-panel-detail" aria-live="polite" hidden></aside><button class="campus-scene__exit" type="button" data-back>Quitter le campus</button></main></div>`;
  const panel = container.querySelector('.campus-panel-detail');
  container.querySelectorAll('[data-role]').forEach((door) => door.addEventListener('click', () => {
    const action = getDoorAction(door.dataset.role);
    if (action.roleId) navigate('levels', { roleId: action.roleId });
    else showManual(panel, door.dataset.role);
  }));
  container.querySelectorAll('[data-manual]').forEach((entry) => entry.addEventListener('click', () => showManual(panel, entry.dataset.manual)));
  container.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => navigate('menu')));
}
