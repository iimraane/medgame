import { getCampusPanelAction, getDoorAction, getRole, ROLES } from '../data/roles.js';
import { navigate } from '../main.js';
import { createPanelRequestGuard, createRetryableLoadCache, isCampusDesktop } from './campusPanelState.js';

const CAMPUS_IMAGE = `${import.meta.env.BASE_URL}assets/campus-hub.png`;
const MIN_LOADING_MS = 850;
const campusStateLoads = createRetryableLoadCache((source) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener('load', resolve, { once: true });
  image.addEventListener('error', () => reject(new Error(source)), { once: true });
  image.src = source;
}));

function campusStateSource(role) {
  return `${import.meta.env.BASE_URL}assets/${role.panelAsset}`;
}

function preloadCampusState(role) {
  const source = campusStateSource(role);
  return campusStateLoads.load(source);
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
  const roles = Object.values(ROLES);
  container.innerHTML = `<div class="view campus-shell"><div class="campus-mobile-notice"><span>MedGame est disponible sur PC</span><p>Le campus interactif demande un écran de 1024 px minimum.</p><button class="btn btn--secondary" data-back>Retour à l’accueil</button></div><main class="campus-scene" aria-label="Campus des professions de santé"><img class="campus-scene__image" src="${CAMPUS_IMAGE}" alt="Cour du campus MedGame avec les cinq pôles de santé">${roles.map((role) => `<div class="campus-kiosk-state" data-state="${role.id}" aria-hidden="true"><img data-src="${campusStateSource(role)}" alt=""></div>`).join('')}<div class="campus-scene__hotspots">${roles.map((role) => `<button class="campus-hotspot campus-hotspot--${role.theme}" type="button" data-role="${role.id}" aria-label="${role.unlocked ? `Entrer dans ${role.label}` : `Prévisualiser le panneau ${role.label}, parcours verrouillé`}" style="--left:${role.hotspot.left}%;--top:${role.hotspot.top}%;--width:${role.hotspot.width}%;--height:${role.hotspot.height}%"></button>`).join('')}</div><nav class="campus-directory-hotspots" aria-label="Panneau des métiers">${roles.map((role, index) => `<button type="button" class="campus-directory-hotspot" data-panel-role="${role.id}" style="--row:${index}" aria-label="Consulter le panneau ${role.label}"></button>`).join('')}</nav><button class="campus-kiosk-return" type="button" data-directory hidden>Retour au panneau</button><button class="campus-kiosk-enter" type="button" data-enter hidden>Entrer dans le parcours Dietetics</button><p class="campus-scene__feedback" aria-live="polite"></p><button class="campus-scene__exit" type="button" data-back>Quitter le campus</button></main></div>`;
  const directory = container.querySelector('.campus-directory-hotspots');
  const returnButton = container.querySelector('[data-directory]');
  const enterButton = container.querySelector('[data-enter]');
  const feedback = container.querySelector('.campus-scene__feedback');
  const panelRequests = createPanelRequestGuard();
  let activeRoleId = null;
  let activeInvoker = null;

  const setPanelState = (roleId = null) => {
    activeRoleId = roleId;
    container.querySelectorAll('[data-state]').forEach((state) => state.classList.toggle('campus-kiosk-state--active', state.dataset.state === roleId));
    directory.hidden = roleId !== null;
    returnButton.hidden = roleId === null;
    enterButton.hidden = roleId !== 'dietetics';
  };

  const attachStateImage = (role) => {
    const image = container.querySelector(`[data-state="${role.id}"] img`);
    if (!image.getAttribute('src')) image.src = image.dataset.src;
  };

  const openPanel = async (roleId, invoker) => {
    const action = getCampusPanelAction(roleId);
    if (!action.roleId) {
      feedback.textContent = action.feedback;
      return;
    }
    const requestVersion = panelRequests.request();
    try {
      const role = getRole(action.roleId);
      await preloadCampusState(role);
      if (!panelRequests.isCurrent(requestVersion)) return;
      attachStateImage(role);
      activeInvoker = invoker;
      setPanelState(role.id);
      feedback.textContent = `Panneau ${role.label} affiché.`;
      returnButton.focus();
    } catch {
      if (!panelRequests.isCurrent(requestVersion)) return;
      setPanelState(null);
      feedback.textContent = 'Le panneau demandé ne peut pas être chargé pour le moment.';
    }
  };

  if (isCampusDesktop(window.innerWidth)) roles.forEach((role) => { preloadCampusState(role).catch(() => {}); });
  container.querySelectorAll('[data-role]').forEach((door) => door.addEventListener('click', () => {
    const action = getDoorAction(door.dataset.role);
    if (action.roleId) navigate('levels', { roleId: action.roleId });
    else openPanel(door.dataset.role, door);
  }));
  container.querySelectorAll('[data-panel-role]').forEach((entry) => entry.addEventListener('click', () => openPanel(entry.dataset.panelRole, entry)));
  returnButton.addEventListener('click', () => {
    panelRequests.cancel();
    setPanelState();
    feedback.textContent = 'Panneau des métiers affiché.';
    activeInvoker?.focus();
    activeInvoker = null;
  });
  enterButton.addEventListener('click', () => {
    if (activeRoleId === 'dietetics') navigate('levels', { roleId: 'dietetics' });
  });
  container.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => navigate('menu')));
}
