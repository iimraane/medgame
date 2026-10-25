import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getDoorAction, getRole, ROLES } from '../data/roles.js';
import { navigate } from '../main.js';
import { canInitializeCampus, createCampusLifecycle, resolveCampusSelection, shouldExitCampusOnEscape } from './campusHubState.js';
import { addBox, animateArcadePortals, createCampusBuildings, setArcadePortalHighlight } from './campusBuildings.js';
import { loadLocalLandscapeModels } from './campusLandscapeAssets.js';
import { CAMPUS_COMPOSITION, attachMedicalGardenComposition, LANDSCAPE_PLACEMENTS } from './campusGardenComposition.js';

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

function disposeObject(object) {
  const textures = new Set();
  object.traverse((child) => {
    child.geometry?.dispose();
    (Array.isArray(child.material) ? child.material : [child.material]).filter(Boolean).forEach((material) => {
      ['map', 'bumpMap', 'emissiveMap', 'roughnessMap', 'metalnessMap', 'alphaMap'].forEach((key) => { if (material[key]) textures.add(material[key]); });
      material.dispose();
    });
  });
  textures.forEach((texture) => texture.dispose());
}
const landscapeLoader = new GLTFLoader();

function shadow(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
function addTree(scene, x, z, scale = 1, hue = 0) {
  const tree = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x624831, roughness: .98 }); const leaf = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.36 + hue, .38, .28), roughness: .93 });
  const trunk = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.11 * scale, .18 * scale, 1.18 * scale, 8), bark)); trunk.position.y = .59 * scale; tree.add(trunk);
  [-.26, .24].forEach((offset, index) => { const branch = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.035 * scale, .075 * scale, .62 * scale, 7), bark)); branch.position.set(offset * scale, 1.16 * scale, 0); branch.rotation.z = (index ? -.75 : .75); tree.add(branch); });
  [[-.28, 1.72, .06], [.31, 1.77, -.05], [0, 2.06, .04], [.02, 1.48, .28]].forEach(([cx, cy, cz], index) => { const crown = shadow(new THREE.Mesh(new THREE.DodecahedronGeometry((.52 - index * .025) * scale, 1), leaf)); crown.position.set(cx * scale, cy * scale, cz * scale); crown.rotation.set(index, index * .7, .2); tree.add(crown); });
  tree.position.set(x, 0, z); scene.add(tree);
}

function addShrub(scene, x, z, scale = 1, color = 0x397550) { const group = new THREE.Group(); const material = new THREE.MeshStandardMaterial({ color, roughness: .94 }); [[0, .24, 0], [-.2, .2, .05], [.21, .18, -.05]].forEach(([px, py, pz], index) => { const bush = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry((.28 - index * .025) * scale, 1), material)); bush.position.set(px * scale, py * scale, pz * scale); group.add(bush); }); group.position.set(x, 0, z); scene.add(group); }
function addFlowerBed(scene, x, z, width = 1.45) { const group = new THREE.Group(); const soil = shadow(new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2 + .06, .09, 12), new THREE.MeshStandardMaterial({ color: 0x76533b, roughness: 1 }))); soil.position.y = .045; group.add(soil); for (let index = 0; index < 10; index += 1) { const angle = index * 2.4; const radius = .1 + (index % 4) * .09; const stem = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.012, .018, .18 + (index % 2) * .05, 5), new THREE.MeshStandardMaterial({ color: 0x326a42, roughness: 1 }))); stem.position.set(Math.cos(angle) * radius * width, .14, Math.sin(angle) * radius * width); group.add(stem); const bloom = shadow(new THREE.Mesh(new THREE.OctahedronGeometry(.065 + (index % 2) * .012, 0), new THREE.MeshStandardMaterial({ color: index % 3 ? 0xffc869 : 0xf38cae, roughness: .7, emissive: index % 3 ? 0x311900 : 0x260611, emissiveIntensity: .16 }))); bloom.position.copy(stem.position); bloom.position.y += .16; group.add(bloom); } group.position.set(x, 0, z); scene.add(group); }
function addBench(scene, x, z, direction = 1) { const bench = new THREE.Group(); const wood = new THREE.MeshStandardMaterial({ color: 0x8d5f39, roughness: .78 }); const metal = new THREE.MeshStandardMaterial({ color: 0x263d43, metalness: .65, roughness: .32 }); [-.22, 0, .22].forEach((y) => { const slat = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.15, .075, .11), wood)); slat.position.set(0, .52 + y * .55, -.12 + y * .12); slat.rotation.x = -.16; bench.add(slat); }); [-.42, .42].forEach((sx) => { const leg = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.04, .055, .5, 6), metal)); leg.position.set(sx, .25, 0); bench.add(leg); }); bench.position.set(x, 0, z); bench.rotation.y = direction * .25; scene.add(bench); }
function addLamp(scene, x, z) { const lamp = new THREE.Group(); const metal = new THREE.MeshStandardMaterial({ color: 0x284a50, metalness: .74, roughness: .25 }); const pole = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.035, .065, 1.35, 10), metal)); pole.position.y = .675; lamp.add(pole); const cap = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.17, .11, .09, 10), metal)); cap.position.y = 1.38; lamp.add(cap); const lantern = shadow(new THREE.Mesh(new THREE.CylinderGeometry(.1, .13, .2, 8), new THREE.MeshStandardMaterial({ color: 0xffe5a1, emissive: 0xffbd54, emissiveIntensity: 1.1, roughness: .35 }))); lantern.position.y = 1.25; lamp.add(lantern); const glow = new THREE.PointLight(0xffd985, .48, 3.4); glow.position.y = 1.18; lamp.add(glow); lamp.position.set(x, 0, z); scene.add(lamp); }
function addRock(scene, x, z, scale = 1) { const rock = shadow(new THREE.Mesh(new THREE.DodecahedronGeometry(.23 * scale, 0), new THREE.MeshStandardMaterial({ color: 0x788979, roughness: .98 }))); rock.scale.set(1.35, .65, .9); rock.position.set(x, .12 * scale, z); rock.rotation.set(.2, x, .1); scene.add(rock); }
function addGrassTufts(scene) { const material = new THREE.MeshStandardMaterial({ color: 0x78ae5b, roughness: 1, side: THREE.DoubleSide }); for (let index = 0; index < 95; index += 1) { const x = ((index * 37) % 190) / 10 - 9.5; const z = ((index * 71) % 250) / 10 - 10.5; if (Math.abs(x) < 3 || Math.abs(z - 2) < .5) continue; const tuft = new THREE.Group(); for (let blade = 0; blade < 4; blade += 1) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(.075, .31 + ((index + blade) % 3) * .045), material); leaf.position.set((blade - 1.5) * .028, .16, (blade % 2 ? .025 : -.025)); leaf.rotation.set((blade - 1.5) * .18, index + blade * .8, (blade - 1.5) * .25); tuft.add(leaf); } tuft.position.set(x, 0, z); scene.add(tuft); } }

function addMountainRange(scene, z, color, scale = 1) {
  const points = [[-18, 0], [-15, 2.6], [-12.5, 1.1], [-9, 4.4], [-6.2, 1.7], [-2.6, 3.5], [.2, 1.4], [3.4, 4.8], [6.7, 1.5], [10.2, 3.7], [13.6, 1.2], [17, 2.8], [18, 0]];
  const shape = new THREE.Shape(); shape.moveTo(points[0][0], points[0][1]); points.slice(1).forEach(([x, y]) => shape.lineTo(x, y * scale)); shape.lineTo(18, -1); shape.lineTo(-18, -1); shape.closePath();
  const mountain = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide }));
  mountain.name = 'campus-mountain-layer'; mountain.position.set(0, .15, z); scene.add(mountain);
}

function addCloud(scene, x, y, z, scale = 1) {
  const cloud = new THREE.Group(); const material = new THREE.MeshBasicMaterial({ color: 0xf8fdff, transparent: true, opacity: .72, depthWrite: false });
  [[-.45, 0, 0, .36], [-.1, .08, .01, .5], [.31, .02, -.01, .39], [.58, -.06, 0, .26]].forEach(([cx, cy, cz, radius]) => { const puff = new THREE.Mesh(new THREE.SphereGeometry(radius * scale, 14, 10), material); puff.position.set(cx * scale, cy * scale, cz); cloud.add(puff); });
  cloud.name = 'campus-procedural-cloud'; cloud.position.set(x, y, z); scene.add(cloud);
}

function loadLandscapeKit(scene, isActive = () => true, placements = LANDSCAPE_PLACEMENTS) {
  return loadLocalLandscapeModels({ scene, loader: landscapeLoader, isActive, placements });
}

function createSkyTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512; const context = canvas.getContext('2d');
  const sky = context.createLinearGradient(0, 0, 0, canvas.height); sky.addColorStop(0, '#55b9ee'); sky.addColorStop(.48, '#9cdaef'); sky.addColorStop(1, '#eff4d9'); context.fillStyle = sky; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(255,255,255,.24)'; [[150, 92, 74], [455, 61, 66], [780, 126, 88]].forEach(([x, y, width]) => { context.beginPath(); context.ellipse(x, y, width, 14, 0, 0, Math.PI * 2); context.ellipse(x + width * .34, y - 10, width * .48, 19, 0, 0, Math.PI * 2); context.ellipse(x - width * .32, y + 5, width * .38, 12, 0, 0, Math.PI * 2); context.fill(); });
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function createSurfaceTexture(kind) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256; const context = canvas.getContext('2d');
  const isPath = kind === 'path'; context.fillStyle = isPath ? '#cdbb92' : '#438053'; context.fillRect(0, 0, 256, 256);
  for (let index = 0; index < 420; index += 1) { const x = (index * 47) % 256; const y = (index * 89) % 256; context.fillStyle = isPath ? (index % 2 ? 'rgba(113,88,55,.16)' : 'rgba(255,246,211,.16)') : (index % 3 ? 'rgba(23,79,45,.18)' : 'rgba(137,197,91,.16)'); context.fillRect(x, y, isPath ? 4 : 2, isPath ? 2 : 3); }
  if (isPath) { context.strokeStyle = 'rgba(255,249,222,.18)'; context.lineWidth = 2; for (let line = 0; line < 7; line += 1) { context.beginPath(); context.moveTo(0, line * 43); context.lineTo(256, line * 43); context.stroke(); } }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(isPath ? 2 : 8, isPath ? 10 : 6); return texture;
}

function createSignTexture(role) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 170;
  const context = canvas.getContext('2d'); const accent = new THREE.Color(role.campus.accent).getStyle();
  context.fillStyle = '#062631'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = accent; context.lineWidth = 13; context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  context.fillStyle = '#f5fff9'; context.font = '900 66px system-ui, sans-serif'; context.textAlign = 'center'; context.fillText(role.label.toUpperCase(), canvas.width / 2, 103);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function buildScene(canvas, roles, onDoor, onUnavailable) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); let scene; let cleanup = () => renderer.dispose();
  try {
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2); renderer.setPixelRatio(pixelRatio); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .96;
  scene = new THREE.Scene(); scene.background = createSkyTexture(); scene.fog = new THREE.FogExp2(0x92c9d2, .012);
  const { camera: cameraComposition, horizon } = CAMPUS_COMPOSITION;
  const camera = new THREE.PerspectiveCamera(cameraComposition.fov, 1, .1, 100); camera.position.set(...cameraComposition.position); camera.lookAt(...cameraComposition.target);
  scene.add(new THREE.HemisphereLight(0xd9f7ff, 0x28543f, 2.35)); const sun = new THREE.DirectionalLight(0xfff0ce, 3.6); sun.position.set(-12, 16, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.normalBias = .025; sun.shadow.camera.left = -15; sun.shadow.camera.right = 15; sun.shadow.camera.top = 13; sun.shadow.camera.bottom = -10; scene.add(sun);
  const atlas = new THREE.TextureLoader().load('/assets/campus/medical-concrete-glass-atlas.png'); atlas.colorSpace = THREE.SRGBColorSpace; atlas.wrapS = atlas.wrapT = THREE.RepeatWrapping; atlas.repeat.set(2, 2);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(44, 32), new THREE.MeshStandardMaterial({ color: 0x4c925e, map: createSurfaceTexture('grass'), roughness: .98 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 30), new THREE.MeshStandardMaterial({ color: 0xd8c79f, map: createSurfaceTexture('path'), roughness: .9 })); path.name = 'campus-paver-bed'; path.rotation.x = -Math.PI / 2; path.position.y = .018; scene.add(path);
  for (let index = 0; index < 8; index += 1) addLamp(scene, index % 2 ? -2.95 : 2.95, 6.1 - index * 1.78);
  [-1, 1].forEach((side) => { for (let index = 0; index < 3; index += 1) addBench(scene, side * 4.25, 2.75 - index * 3.1, side); });
  const campus = createCampusBuildings(roles, createSignTexture, atlas); campus.buildings.forEach((building) => scene.add(building)); const { doors } = campus;
  [[-10, -5.9, 1], [-8.6, 4.1, .7], [-5.8, -5.5, .9], [-4.7, 4.6, .75], [5.8, -5.2, .85], [8.5, 4.3, .8], [10.2, -4.2, 1.1], [-10.5, .3, .64], [10.4, .1, .72]].forEach(([x, z, scale], index) => addTree(scene, x, z, scale, (index % 3) * .018));
  [[-4.1, 3.55, 1.4], [3.25, 3.7, 1.35], [-6.2, -1.1, 1.1], [6.1, -.6, 1.1], [-3.75, -4.2, 1], [3.8, -4.05, 1], [-7.7, 2.9, .9], [7.7, 2.9, .9]].forEach(([x, z, width]) => addFlowerBed(scene, x, z, width));
  [[-9.2, 1.9, .9, 0x346c4d], [-8.2, -2.4, .8, 0x4c7f42], [8.9, 2.2, .9, 0x3f7750], [9.4, -2.3, .75, 0x557e48], [-5.4, 5.3, .7, 0x3a6d4d], [5.4, 5.2, .7, 0x4d7b4b], [-6.9, 3.5, .7, 0x487a4a], [6.9, 3.5, .7, 0x487a4a], [-4.1, -4.8, .75, 0x4b7f4d], [4.1, -4.8, .75, 0x4b7f4d]].forEach(([x, z, scale, color]) => addShrub(scene, x, z, scale, color));
  [[-7.9, 2.5, .9], [-9.7, -1.3, .7], [8.1, 2.9, .85], [10, -1.9, .7], [-4.6, 5.5, .65], [5.3, 5.4, .65]].forEach(([x, z, scale]) => addRock(scene, x, z, scale));
  let landscapeDisposed = false; addGrassTufts(scene); attachMedicalGardenComposition(scene, { createMountainLayer: addMountainRange, createCloudLayer: addCloud, loadLandscape: (placements) => loadLandscapeKit(scene, () => !landscapeDisposed, placements) });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.045, .09, 6.8, 12), new THREE.MeshBasicMaterial({ color: 0x9effec, transparent: true, opacity: .28 })); beacon.name = 'campus-portal-beacon'; beacon.position.set(0, 3.4, -4.8); scene.add(beacon);
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let hovered = null; let frame = 0;
  const setHighlight = (door) => { if (hovered === door) return; if (hovered) { hovered.userData.doorMaterial.emissiveIntensity = hovered.userData.baseEmissive; setArcadePortalHighlight(hovered, false); } hovered = door; if (hovered) { hovered.userData.doorMaterial.emissiveIntensity = hovered.userData.baseEmissive + 1.4; setArcadePortalHighlight(hovered, true); } };
  const doorAt = (event) => { const bounds = canvas.getBoundingClientRect(); pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1; pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(doors, false)[0]?.object ?? null; };
  const onMove = (event) => { setHighlight(doorAt(event)); canvas.style.cursor = hovered ? 'pointer' : 'default'; }; const onLeave = () => { setHighlight(null); canvas.style.cursor = 'default'; }; const onClick = (event) => { const door = doorAt(event); if (door) onDoor(door.userData.roleId); };
  const resize = () => { const { width, height } = canvas.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
  const render = (time) => { const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2); if (nextPixelRatio !== pixelRatio) { pixelRatio = nextPixelRatio; renderer.setPixelRatio(pixelRatio); resize(); } if (!reducedMotion.matches) beacon.material.opacity = .2 + Math.sin(time / 750) * .12; animateArcadePortals(doors, time, reducedMotion.matches); renderer.render(scene, camera); frame = window.requestAnimationFrame(render); };
  let onContextLost;
  const dispose = () => { landscapeDisposed = true; window.cancelAnimationFrame(frame); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('click', onClick); canvas.removeEventListener('webglcontextlost', onContextLost); window.removeEventListener('resize', resize); disposeObject(scene); scene.background?.dispose?.(); renderer.dispose(); };
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
  disposeCampusHub(); const roles = Object.values(ROLES);
  container.innerHTML = `<div class="view campus-shell"><div class="campus-mobile-notice"><span>MedGame est disponible sur PC</span><p>Le campus interactif demande un écran de 1024 px minimum.</p><nav class="campus-mobile-destinations" aria-label="Parcours disponibles">${roles.map((role) => `<button type="button" data-role="${role.id}">${role.label}<small>${role.unlocked ? 'Parcours jouable' : role.unlockRequirement}</small></button>`).join('')}</nav><button class="btn btn--secondary" data-back>Retour à l’accueil</button></div><main class="campus-scene" aria-label="Campus des professions de santé"><canvas class="campus-canvas" aria-hidden="true"></canvas><nav class="campus-destination-list campus-destination-list--sr-only" aria-label="Destinations du campus">${roles.map((role) => `<button type="button" data-role="${role.id}">${role.label}</button>`).join('')}</nav><p class="campus-scene__feedback" aria-live="polite"></p><button class="campus-scene__escape" type="button" data-back aria-label="Quitter le campus avec Échap">Quitter le campus</button></main></div>`;
  const scene = container.querySelector('.campus-scene'); const canvas = container.querySelector('.campus-canvas'); const destinations = [...container.querySelectorAll('[data-role]')]; const feedback = container.querySelector('.campus-scene__feedback'); let world = null;
  const showFallback = () => { world = null; scene.classList.add('campus-scene--fallback'); feedback.textContent = 'La vue 3D est indisponible : utilisez la liste des parcours.'; };
  const selectRole = (roleId) => { const role = getRole(roleId); if (!role) return; const selection = resolveCampusSelection(role.id, getDoorAction); if (selection.kind === 'levels') { navigate('levels', { roleId: selection.roleId }); return; } feedback.textContent = `${role.label} : ${role.unlockRequirement}.`; };
  const onKeydown = (event) => { if (shouldExitCampusOnEscape(false, event.key)) navigate('menu'); };
  destinations.forEach((destination) => { destination.addEventListener('click', () => selectRole(destination.dataset.role)); destination.addEventListener('focus', () => { world?.setHighlight(world.doors.find((door) => door.userData.roleId === destination.dataset.role)); feedback.textContent = `${destination.textContent.trim()} sélectionné dans le campus.`; }); destination.addEventListener('blur', () => world?.setHighlight(null)); }); container.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => navigate('menu'))); window.addEventListener('keydown', onKeydown);
  if (canInitializeCampus(window.innerWidth)) {
    try { world = buildScene(canvas, roles, (roleId) => selectRole(roleId, destinations.find((destination) => destination.dataset.role === roleId)), showFallback); } catch { showFallback(); }
  }
  campusLifecycle.setSceneDisposer(() => { window.removeEventListener('keydown', onKeydown); world?.dispose(); });
}
