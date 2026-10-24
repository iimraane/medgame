import { getCampusHubSummary, getDoorAction, getRole, ROLES } from '../data/roles.js';
import { navigate } from '../main.js';

const MIN_LOADING_MS = 850;

export function renderCampusLoading(container) {
  container.innerHTML = `<div class="view campus-loading"><div class="campus-loading__glow" aria-hidden="true"></div><div class="campus-loading__content"><span class="campus-loading__mark">MG</span><p>Préparation du campus…</p><div class="campus-loading__track" aria-label="Chargement en cours"><i></i></div></div></div>`;
  window.setTimeout(() => navigate('hub'), MIN_LOADING_MS);
}

function buildingStyle(role) {
  const { left, top, width, height } = role.campus;
  return `--building-left:${left}%;--building-top:${top}%;--building-width:${width}%;--building-height:${height}%;`;
}

function buildingMarkup(role) {
  const state = role.unlocked ? 'playable' : 'preview';
  const action = role.unlocked ? `Entrer dans ${role.label}` : `Découvrir ${role.label}, parcours verrouillé`;
  return `<button class="campus-building campus-building--${role.theme} campus-building--${state}" type="button" data-role="${role.id}" data-route-state="${state}" style="${buildingStyle(role)}" aria-label="${action}">
    <span class="campus-building__mass" aria-hidden="true"><span class="campus-building__windows"></span><span class="campus-building__portal"></span><span class="campus-building__roof"></span></span>
    <span class="campus-building__sign"><b>${role.label}</b><small>${role.unlocked ? 'Parcours jouable' : role.unlockRequirement}</small></span>
    <span class="campus-building__landmark" aria-hidden="true">${role.campus.landmark}</span>
  </button>`;
}

export function renderCampusHub(container) {
  const roles = Object.values(ROLES);
  const hubSummary = getCampusHubSummary(roles);
  container.innerHTML = `<div class="view campus-shell">
    <div class="campus-mobile-notice"><span>MedGame est disponible sur PC</span><p>Le campus interactif demande un écran de 1024 px minimum.</p><button class="btn btn--secondary" data-back>Retour à l’accueil</button></div>
    <main class="campus-scene" aria-label="Campus des professions de santé">
      <div class="campus-sky" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="campus-horizon" aria-hidden="true"></div>
      <div class="campus-walkways" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="campus-route-lines" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="campus-beacon" aria-hidden="true"><i></i><span>ORIENTATION</span></div>
      <header class="campus-hud" style="--playable-share:${hubSummary.playableShare}"><p class="campus-hud__eyebrow">Campus MedGame</p><h1>Choisis ton premier parcours</h1><p>Explore les bâtiments lumineux pour commencer.</p><div class="campus-hud__availability"><span>${hubSummary.playableLabel}</span><i aria-hidden="true"></i></div></header>
      <section class="campus-destinations" aria-label="Parcours du campus">${roles.map(buildingMarkup).join('')}</section>
      <aside class="campus-preview" data-preview hidden aria-live="polite"><p class="campus-preview__eyebrow">Aperçu du parcours</p><h2 data-preview-title></h2><p data-preview-copy></p><p class="campus-preview__availability" data-preview-availability></p><button class="campus-preview__return" type="button" data-preview-close>Retour au campus</button></aside>
      <p class="campus-scene__feedback" aria-live="polite"></p>
      <button class="campus-scene__exit" type="button" data-back>Quitter le campus</button>
    </main>
  </div>`;

  const destinations = [...container.querySelectorAll('[data-role]')];
  const preview = container.querySelector('[data-preview]');
  const previewTitle = container.querySelector('[data-preview-title]');
  const previewCopy = container.querySelector('[data-preview-copy]');
  const previewAvailability = container.querySelector('[data-preview-availability]');
  const closePreview = container.querySelector('[data-preview-close]');
  const feedback = container.querySelector('.campus-scene__feedback');
  let previewInvoker = null;

  const close = () => {
    preview.hidden = true;
    destinations.forEach((destination) => { destination.disabled = false; });
    feedback.textContent = 'Aperçu fermé.';
    previewInvoker?.focus();
    previewInvoker = null;
  };

  const openPreview = (role, invoker) => {
    previewInvoker = invoker;
    previewTitle.textContent = role.label;
    previewCopy.textContent = role.campus.preview;
    previewAvailability.textContent = role.unlockRequirement;
    preview.hidden = false;
    destinations.forEach((destination) => { destination.disabled = true; });
    feedback.textContent = `Aperçu ${role.label} affiché.`;
    closePreview.focus();
  };

  destinations.forEach((destination) => destination.addEventListener('click', () => {
    const role = getRole(destination.dataset.role);
    const action = getDoorAction(role.id);
    if (action.roleId) navigate('levels', { roleId: action.roleId });
    else openPreview(role, destination);
  }));
  closePreview.addEventListener('click', close);
  container.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => navigate('menu')));
}
