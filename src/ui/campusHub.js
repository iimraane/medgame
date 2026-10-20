import { getDoorAction, getRole, ROLES } from '../data/roles.js';
import { navigate } from '../main.js';

const CAMPUS_IMAGE = `${import.meta.env.BASE_URL}assets/campus-hub.png`;
const MIN_LOADING_MS = 850;

function directoryMarkup() {
  return `<div class="campus-panel__intro"><p class="campus-panel__kicker">Campus MedGame</p><h2>Explorer les métiers</h2><p>Choisis une porte ou un métier pour découvrir le parcours qui t’attend.</p></div><nav class="campus-directory" aria-label="Métiers de santé">${Object.values(ROLES).map((role) => `<button class="campus-directory__item campus-directory__item--${role.theme}" data-manual="${role.id}"><span>${role.label}</span><i aria-hidden="true">›</i></button>`).join('')}</nav>`;
}

function manualMarkup(role) {
  const availability = role.unlocked ? 'Parcours disponible' : role.unlockRequirement;
  return `<button class="campus-panel__back" type="button" data-directory>← Tous les métiers</button><div class="campus-manual"><p class="campus-panel__kicker">${availability}</p><h2>${role.label}</h2><p class="campus-manual__purpose">${role.manual.purpose}</p><h3>Compétences travaillées</h3><ul>${role.manual.skills.map((skill) => `<li>${skill}</li>`).join('')}</ul><h3>Ce qui t’attend</h3><p>${role.manual.missions}</p>${role.unlocked ? '<button class="btn btn--primary campus-manual__enter" data-enter>Entrer dans le parcours</button>' : '<p class="campus-manual__locked">Ce parcours est présenté en avant-première. Les missions arriveront prochainement.</p>'}</div>`;
}

function showManual(panel, roleId) {
  const role = getRole(roleId);
  if (!role) return;
  panel.innerHTML = manualMarkup(role);
  panel.querySelector('[data-directory]').addEventListener('click', () => showDirectory(panel));
  panel.querySelector('[data-enter]')?.addEventListener('click', () => navigate('levels', { roleId: role.id }));
}

function showDirectory(panel) {
  panel.innerHTML = directoryMarkup();
  panel.querySelectorAll('[data-manual]').forEach((button) => button.addEventListener('click', () => showManual(panel, button.dataset.manual)));
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
  container.innerHTML = `<div class="view campus-shell"><div class="campus-mobile-notice"><span>MedGame est disponible sur PC</span><p>Le campus interactif demande un écran de 1024 px minimum.</p><button class="btn btn--secondary" data-back>Retour à l’accueil</button></div><main class="campus-scene" aria-label="Campus des professions de santé"><img class="campus-scene__image" src="${CAMPUS_IMAGE}" alt="Cour du campus MedGame avec les cinq pôles de santé"><div class="campus-scene__hotspots">${Object.values(ROLES).map((role) => `<button class="campus-hotspot campus-hotspot--${role.theme}" type="button" data-role="${role.id}" style="--left:${role.hotspot.left}%;--top:${role.hotspot.top}%;--width:${role.hotspot.width}%;--height:${role.hotspot.height}%"><span>${role.label}</span></button>`).join('')}</div><aside class="campus-panel" aria-live="polite"></aside><button class="campus-scene__exit" type="button" data-back>Quitter le campus</button></main></div>`;
  const panel = container.querySelector('.campus-panel');
  showDirectory(panel);
  container.querySelectorAll('[data-role]').forEach((door) => door.addEventListener('click', () => {
    const action = getDoorAction(door.dataset.role);
    if (action.roleId) navigate('levels', { roleId: action.roleId });
    else showManual(panel, door.dataset.role);
  }));
  container.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => navigate('menu')));
}
