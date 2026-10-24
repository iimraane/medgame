import * as THREE from 'three';
import { getCampusHubSummary, getDoorAction, getRole, ROLES } from '../data/roles.js';
import { navigate } from '../main.js';
import { canInitializeCampus, createCampusLifecycle, resolveCampusSelection } from './campusHubState.js';

const MIN_LOADING_MS = 850;
const campusLifecycle = createCampusLifecycle(
  (...args) => window.setTimeout(...args),
  (timer) => window.clearTimeout(timer),
);

export function renderCampusLoading(container) {
  container.innerHTML = `<div class="view campus-loading"><div class="campus-loading__content"><span class="campus-loading__mark">MG</span><p>Préparation du campus…</p><div class="campus-loading__track" aria-label="Chargement en cours"><i></i></div></div></div>`;
  campusLifecycle.scheduleLoading(() => navigate('hub'), MIN_LOADING_MS);
}

export function disposeCampusHub() { campusLifecycle.dispose(); }

function disposeObject(object) { object.traverse((child) => { child.geometry?.dispose(); (Array.isArray(child.material) ? child.material : [child.material]).filter(Boolean).forEach((material) => material.dispose()); }); }
function addBox(group, size, position, material) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; }

function addCampusBuilding(scene, role, doors) {
  const { position, footprint, accent, doorId } = role.campus;
  const [width, height, depth] = footprint;
  const building = new THREE.Group(); building.position.set(...position);
  const accentColor = new THREE.Color(accent);
  const concrete = new THREE.MeshStandardMaterial({ color: 0x31505a, roughness: .76, metalness: .12 });
  const glass = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: .32, roughness: .2, metalness: .35, transparent: true, opacity: .72 });
  const trim = new THREE.MeshStandardMaterial({ color: accentColor.clone().lerp(new THREE.Color(0xffffff), .25), roughness: .35, metalness: .5 });
  addBox(building, [width, height, depth], [0, height / 2, 0], concrete); addBox(building, [width + .18, .16, depth + .18], [0, height + .08, 0], trim);
  for (let row = 0; row < Math.max(2, Math.floor(height / 1.25)); row += 1) for (let column = 0; column < 3; column += 1) addBox(building, [width * .19, .42, .035], [(column - 1) * width * .27, 1.35 + row * 1.05, depth / 2 + .025], glass);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: role.unlocked ? 1.2 : .35, roughness: .22, metalness: .32 });
  const door = addBox(building, [width * .3, 1.75, .13], [0, .88, depth / 2 + .1], doorMaterial);
  door.name = doorId; door.userData = { roleId: role.id, doorMaterial, baseEmissive: doorMaterial.emissiveIntensity }; doors.push(door);
  addBox(building, [width * .56, .12, .2], [0, 2.02, depth / 2 + .13], trim); scene.add(building);
}

function buildScene(canvas, roles, onDoor, onUnavailable) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); let scene; let cleanup = () => renderer.dispose();
  try {
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2); renderer.setPixelRatio(pixelRatio); renderer.shadowMap.enabled = true; renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x152e3a); scene.fog = new THREE.FogExp2(0x152e3a, .045);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 100); camera.position.set(0, 8, 22); camera.lookAt(0, 2.1, 0);
  scene.add(new THREE.HemisphereLight(0xf5d8a5, 0x17383b, 2.3)); const sun = new THREE.DirectionalLight(0xffca85, 3.1); sun.position.set(-10, 14, 7); sun.castShadow = true; scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(44, 32), new THREE.MeshStandardMaterial({ color: 0x193d3e, roughness: .94 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(5, 30), new THREE.MeshStandardMaterial({ color: 0x789091, roughness: .9 })); path.rotation.x = -Math.PI / 2; path.position.y = .012; scene.add(path);
  const doors = []; roles.forEach((role) => addCampusBuilding(scene, role, doors));
  for (let index = 0; index < 35; index += 1) { const shrub = new THREE.Mesh(new THREE.SphereGeometry(.28 + (index % 3) * .08, 10, 8), new THREE.MeshStandardMaterial({ color: index % 2 ? 0x34735d : 0x265448, roughness: 1 })); shrub.position.set(((index * 3.7) % 20) - 10, .3, ((index * 5.1) % 13) - 6.5); scene.add(shrub); }
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.045, .08, 7, 12), new THREE.MeshBasicMaterial({ color: 0x9effec, transparent: true, opacity: .34 })); beacon.position.set(0, 3.5, -4.8); scene.add(beacon);
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let hovered = null; let frame = 0;
  const setHighlight = (door) => { if (hovered === door) return; if (hovered) hovered.userData.doorMaterial.emissiveIntensity = hovered.userData.baseEmissive; hovered = door; if (hovered) hovered.userData.doorMaterial.emissiveIntensity = hovered.userData.baseEmissive + 1.4; };
  const doorAt = (event) => { const bounds = canvas.getBoundingClientRect(); pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1; pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(doors, false)[0]?.object ?? null; };
  const onMove = (event) => { setHighlight(doorAt(event)); canvas.style.cursor = hovered ? 'pointer' : 'default'; }; const onLeave = () => { setHighlight(null); canvas.style.cursor = 'default'; }; const onClick = (event) => { const door = doorAt(event); if (door) onDoor(door.userData.roleId); };
  const resize = () => { const { width, height } = canvas.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
  const render = (time) => { const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2); if (nextPixelRatio !== pixelRatio) { pixelRatio = nextPixelRatio; renderer.setPixelRatio(pixelRatio); resize(); } if (!reducedMotion.matches) beacon.material.opacity = .2 + Math.sin(time / 750) * .12; renderer.render(scene, camera); frame = window.requestAnimationFrame(render); };
  let onContextLost;
  const dispose = () => { window.cancelAnimationFrame(frame); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('click', onClick); canvas.removeEventListener('webglcontextlost', onContextLost); window.removeEventListener('resize', resize); disposeObject(scene); renderer.dispose(); };
  cleanup = dispose;
  onContextLost = (event) => { event.preventDefault(); dispose(); onUnavailable(); };
  canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave); canvas.addEventListener('click', onClick); canvas.addEventListener('webglcontextlost', onContextLost); window.addEventListener('resize', resize); resize(); frame = window.requestAnimationFrame(render);
  return { doors, setHighlight, dispose };
  } catch (error) {
    cleanup();
    if (scene) disposeObject(scene);
    throw error;
  }
}

export function renderCampusHub(container) {
  disposeCampusHub(); const roles = Object.values(ROLES); const hubSummary = getCampusHubSummary(roles);
  container.innerHTML = `<div class="view campus-shell"><div class="campus-mobile-notice"><span>MedGame est disponible sur PC</span><p>Le campus interactif demande un écran de 1024 px minimum.</p><button class="btn btn--secondary" data-back>Retour à l’accueil</button></div><main class="campus-scene" aria-label="Campus des professions de santé"><canvas class="campus-canvas" aria-hidden="true"></canvas><header class="campus-hud" style="--playable-share:${hubSummary.playableShare}"><p class="campus-hud__eyebrow">Campus MedGame</p><h1>Choisis ton premier parcours</h1><p>Explore les portes lumineuses pour commencer.</p><div class="campus-hud__availability"><span>${hubSummary.playableLabel}</span><i aria-hidden="true"></i></div></header><nav class="campus-destination-list" aria-label="Destinations du campus">${roles.map((role) => `<button type="button" data-role="${role.id}" aria-controls="campus-preview">${role.label}<small>${role.unlocked ? 'Parcours jouable' : role.unlockRequirement}</small></button>`).join('')}</nav><aside id="campus-preview" class="campus-preview" data-preview hidden aria-live="polite"><p class="campus-preview__eyebrow">Aperçu du parcours</p><h2 data-preview-title></h2><p data-preview-copy></p><p class="campus-preview__availability" data-preview-availability></p><button class="campus-preview__return" type="button" data-preview-close>Retour au campus</button></aside><p class="campus-scene__feedback" aria-live="polite"></p><button class="campus-scene__exit" type="button" data-back>Quitter le campus</button></main></div>`;
  const scene = container.querySelector('.campus-scene'); const canvas = container.querySelector('.campus-canvas'); const destinations = [...container.querySelectorAll('[data-role]')]; const preview = container.querySelector('[data-preview]'); const closePreview = container.querySelector('[data-preview-close]'); const feedback = container.querySelector('.campus-scene__feedback'); let previewInvoker = null; let world = null;
  const showFallback = () => { world = null; scene.classList.add('campus-scene--fallback'); feedback.textContent = 'La vue 3D est indisponible : utilisez la liste des parcours.'; };
  const close = () => { preview.hidden = true; destinations.forEach((destination) => { destination.disabled = false; }); feedback.textContent = 'Aperçu fermé.'; previewInvoker?.focus(); previewInvoker = null; };
  const selectRole = (roleId, invoker = null) => { const role = getRole(roleId); if (!role) return; const selection = resolveCampusSelection(role.id, getDoorAction, !preview.hidden); if (selection.kind === 'ignore') return; if (selection.kind === 'levels') { navigate('levels', { roleId: selection.roleId }); return; } previewInvoker = invoker; container.querySelector('[data-preview-title]').textContent = role.label; container.querySelector('[data-preview-copy]').textContent = role.campus.preview; container.querySelector('[data-preview-availability]').textContent = role.unlockRequirement; preview.hidden = false; destinations.forEach((destination) => { destination.disabled = true; }); feedback.textContent = `Aperçu ${role.label} affiché.`; closePreview.focus(); };
  destinations.forEach((destination) => { destination.addEventListener('click', () => selectRole(destination.dataset.role, destination)); destination.addEventListener('focus', () => world?.setHighlight(world.doors.find((door) => door.userData.roleId === destination.dataset.role))); destination.addEventListener('blur', () => world?.setHighlight(null)); }); closePreview.addEventListener('click', close); container.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => navigate('menu')));
  if (canInitializeCampus(window.innerWidth)) {
    try { world = buildScene(canvas, roles, (roleId) => selectRole(roleId, destinations.find((destination) => destination.dataset.role === roleId)), showFallback); } catch { showFallback(); }
  }
  campusLifecycle.setSceneDisposer(() => { world?.dispose(); });
}
