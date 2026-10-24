import * as THREE from 'three';
import { getDoorAction, getRole, ROLES } from '../data/roles.js';
import { navigate } from '../main.js';
import { canInitializeCampus, createCampusLifecycle, resolveCampusSelection, shouldExitCampusOnEscape } from './campusHubState.js';

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
function addBox(group, size, position, material) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; }
function addGableRoof(group, width, depth, roofHeight, position, material) {
  const shape = new THREE.Shape(); shape.moveTo(-width / 2, 0); shape.lineTo(0, roofHeight); shape.lineTo(width / 2, 0); shape.lineTo(-width / 2, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), material); roof.position.set(position[0], position[1], position[2] - depth / 2); roof.castShadow = true; roof.receiveShadow = true; group.add(roof); return roof;
}
function addTree(scene, x, z, scale = 1) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.1 * scale, .14 * scale, .85 * scale, 7), new THREE.MeshStandardMaterial({ color: 0x5c4636, roughness: .96 }));
  trunk.position.y = .42 * scale; trunk.castShadow = true; tree.add(trunk);
  const foliage = new THREE.Mesh(new THREE.ConeGeometry(.62 * scale, 1.7 * scale, 9), new THREE.MeshStandardMaterial({ color: 0x27684f, roughness: .88 }));
  foliage.position.y = 1.42 * scale; foliage.castShadow = true; foliage.receiveShadow = true; tree.add(foliage);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(.5 * scale, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3d855f, roughness: .9 }));
  crown.position.y = 1.86 * scale; crown.castShadow = true; tree.add(crown);
  tree.position.set(x, 0, z); scene.add(tree);
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

function addCampusSign(building, role, width, height, depth) {
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(2.55, width * .95), .5), new THREE.MeshBasicMaterial({ map: createSignTexture(role), transparent: true, opacity: .98 }));
  sign.position.set(0, Math.min(height - .55, 2.85), depth / 2 + .17); building.add(sign); return sign;
}

function addCampusBuilding(scene, role, doors, atlas) {
  const { position, footprint, accent, doorId, silhouette } = role.campus; const [width, height, depth] = footprint;
  const building = new THREE.Group(); building.position.set(...position); const accentColor = new THREE.Color(accent);
  const concrete = new THREE.MeshStandardMaterial({ color: 0xd7d2c4, roughness: .77, metalness: .12, bumpMap: atlas, bumpScale: .075 });
  const cladding = new THREE.MeshStandardMaterial({ color: 0x71848a, map: atlas, roughness: .68, metalness: .2 });
  const glass = new THREE.MeshStandardMaterial({ color: accentColor.clone().lerp(new THREE.Color(0xffffff), .4), emissive: accentColor, emissiveIntensity: .45, roughness: .08, metalness: .44, transparent: true, opacity: .76 });
  const trim = new THREE.MeshStandardMaterial({ color: accentColor.clone().lerp(new THREE.Color(0x15272b), .38), roughness: .25, metalness: .72 });
  const planted = new THREE.MeshStandardMaterial({ color: 0x2f6d50, roughness: .95 });
  if (silhouette === 'greenhouse') {
    addBox(building, [width, 1.1, depth], [0, .55, 0], concrete); addBox(building, [width * .94, height - 1.05, depth * .9], [0, (height + 1.05) / 2, 0], glass);
    addGableRoof(building, width * .98, depth * .96, .72, [0, height, 0], new THREE.MeshStandardMaterial({ color: 0x7bbfc3, transparent: true, opacity: .62, roughness: .12, metalness: .45 }));
    for (let column = -1; column <= 1; column += 1) addBox(building, [.13, height - .5, .13], [column * width * .3, height / 2 + .2, depth / 2 + .04], trim);
    for (let plant = -1; plant <= 1; plant += 1) addBox(building, [.5, .38, .5], [plant * width * .24, .19, depth / 2 + .18], planted);
  } else if (silhouette === 'clinic') {
    addBox(building, [width, height, depth], [0, height / 2, 0], concrete); addGableRoof(building, width + .28, depth + .24, .65, [0, height + .08, 0], trim);
    addBox(building, [width * .9, .35, depth * .72], [0, 2.15, depth / 2 + .28], trim);
    addBox(building, [.22, 1.05, .12], [width * .33, height - .7, depth / 2 + .13], glass); addBox(building, [.75, .22, .12], [width * .33, height - .7, depth / 2 + .14], glass);
  } else if (silhouette === 'atelier') {
    addBox(building, [width, height * .72, depth], [0, height * .36, 0], concrete);
    for (let bay = -1; bay <= 1; bay += 1) { const roof = addBox(building, [width * .34, .13, depth], [bay * width * .31, height * .75, 0], trim); roof.rotation.z = bay % 2 ? -.19 : .19; addBox(building, [.11, height * .84, .16], [bay * width * .31, height * .42, depth / 2 + .06], trim); }
  } else if (silhouette === 'conservatory') {
    const round = new THREE.Mesh(new THREE.CylinderGeometry(width * .43, width * .5, height, 18), glass); round.position.y = height / 2; round.castShadow = true; round.receiveShadow = true; building.add(round);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(width * .45, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass); dome.position.y = height; dome.castShadow = true; dome.receiveShadow = true; building.add(dome);
    for (let fin = 0; fin < 7; fin += 1) { const angle = fin / 7 * Math.PI * 2; addBox(building, [.12, height * .86, .15], [Math.cos(angle) * width * .43, height / 2, Math.sin(angle) * depth * .43], trim); }
  } else {
    addBox(building, [width * .66, height, depth * .68], [0, height / 2, 0], concrete); addBox(building, [width * .92, 1.2, depth], [0, .6, 0], glass);
    for (let floor = 1; floor < 4; floor += 1) addBox(building, [width * .74, .1, depth * .76], [0, floor * height / 4, 0], trim);
    addGableRoof(building, width * .72, depth * .76, .55, [0, height + .05, 0], trim);
  }
  for (let row = 0; row < Math.max(1, Math.floor(height / 1.35)); row += 1) {
    for (let column = -1; column <= 1; column += 1) addBox(building, [width * .17, .33, .045], [column * width * .25, 1.37 + row * 1.02, depth / 2 + .05], row % 2 ? glass : cladding);
  }
  for (let column = -1; column <= 1; column += 1) addBox(building, [width * .18, .38, .035], [column * width * .25, 1.35, depth / 2 + .025], glass);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: role.unlocked ? 1.2 : .35, roughness: .2, metalness: .38 });
  const door = addBox(building, [Math.min(width * .31, 1.25), 1.75, .13], [0, .88, depth / 2 + .12], doorMaterial);
  const marker = new THREE.Mesh(new THREE.RingGeometry(.57, .78, 32), new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: role.unlocked ? .82 : .24, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2; marker.position.set(0, .045, depth / 2 + .68); building.add(marker);
  if (role.unlocked) { const objectiveLight = new THREE.PointLight(accentColor, 1.7, 5.2); objectiveLight.position.set(0, 1.65, depth / 2 + .75); building.add(objectiveLight); const halo = new THREE.Mesh(new THREE.TorusGeometry(.88, .045, 8, 36), new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: .88 })); halo.position.set(0, 1.08, depth / 2 + .22); building.add(halo); }
  const sign = addCampusSign(building, role, width, height, depth); door.name = doorId; door.userData = { roleId: role.id, doorMaterial, sign, baseEmissive: doorMaterial.emissiveIntensity }; doors.push(door); scene.add(building);
}

function buildScene(canvas, roles, onDoor, onUnavailable) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); let scene; let cleanup = () => renderer.dispose();
  try {
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2); renderer.setPixelRatio(pixelRatio); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .96;
  scene = new THREE.Scene(); scene.background = createSkyTexture(); scene.fog = new THREE.FogExp2(0x92c9d2, .014);
  const camera = new THREE.PerspectiveCamera(49, 1, .1, 100); camera.position.set(0, 5.2, 22.2); camera.lookAt(0, 2.15, 0);
  scene.add(new THREE.HemisphereLight(0xd9f7ff, 0x28543f, 2.35)); const sun = new THREE.DirectionalLight(0xfff0ce, 3.6); sun.position.set(-12, 16, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.normalBias = .025; sun.shadow.camera.left = -15; sun.shadow.camera.right = 15; sun.shadow.camera.top = 13; sun.shadow.camera.bottom = -10; scene.add(sun);
  const atlas = new THREE.TextureLoader().load('/assets/campus/medical-concrete-glass-atlas.png'); atlas.colorSpace = THREE.SRGBColorSpace; atlas.wrapS = atlas.wrapT = THREE.RepeatWrapping; atlas.repeat.set(2, 2);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(44, 32), new THREE.MeshStandardMaterial({ color: 0x4c925e, map: createSurfaceTexture('grass'), roughness: .98 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4.7, 30), new THREE.MeshStandardMaterial({ color: 0xd8c79f, map: createSurfaceTexture('path'), roughness: .9 })); path.rotation.x = -Math.PI / 2; path.position.y = .018; scene.add(path);
  [-2.46, 2.46].forEach((x) => { const curb = new THREE.Mesh(new THREE.BoxGeometry(.13, .07, 30), new THREE.MeshStandardMaterial({ color: 0xf6eedb, roughness: .68 })); curb.position.set(x, .06, 0); curb.castShadow = true; curb.receiveShadow = true; scene.add(curb); });
  for (let index = 0; index < 7; index += 1) { const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.035, .06, .78, 8), new THREE.MeshStandardMaterial({ color: 0x3a5a5f, metalness: .7, roughness: .28 })); lamp.position.set(index % 2 ? -2.85 : 2.85, .4, 5.6 - index * 1.95); lamp.castShadow = true; scene.add(lamp); const glow = new THREE.PointLight(0x8fffe5, .42, 3.2); glow.position.set(lamp.position.x, .82, lamp.position.z); scene.add(glow); }
  [-1, 1].forEach((side) => { for (let index = 0; index < 3; index += 1) { const bench = new THREE.Group(); const wood = new THREE.MeshStandardMaterial({ color: 0x9b724f, map: atlas, roughness: .72 }); addBox(bench, [.9, .09, .28], [0, .45, 0], wood); [-.34, .34].forEach((x) => addBox(bench, [.08, .42, .08], [x, .22, 0], new THREE.MeshStandardMaterial({ color: 0x3f5153, metalness: .7, roughness: .3 }))); bench.position.set(side * 4.05, 0, 2.8 - index * 3.1); bench.rotation.y = side * .28; scene.add(bench); } });
  const doors = []; roles.forEach((role) => addCampusBuilding(scene, role, doors, atlas));
  [[-10, -5.9, 1], [-8.6, 4.1, .7], [-5.8, -5.5, .9], [-4.7, 4.6, .75], [5.8, -5.2, .85], [8.5, 4.3, .8], [10.2, -4.2, 1.1], [-10.5, .3, .64], [10.4, .1, .72]].forEach(([x, z, scale]) => addTree(scene, x, z, scale));
  for (let index = 0; index < 16; index += 1) { const bed = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), new THREE.MeshStandardMaterial({ color: index % 2 ? 0xf0a5ba : 0xf3d36e, roughness: .72, emissive: index % 2 ? 0x35101c : 0x362400, emissiveIntensity: .18 })); bed.position.set(index < 8 ? -4.1 + (index % 4) * .55 : 2.5 + (index % 4) * .55, .12, index < 8 ? 3.4 + Math.floor(index / 4) * .34 : 3.6 + Math.floor(index / 4) * .34); bed.castShadow = true; scene.add(bed); }
  for (let index = 0; index < 7; index += 1) { const distant = new THREE.Mesh(new THREE.BoxGeometry(1.1 + (index % 2) * .4, 1.4 + (index % 3) * .5, .8), new THREE.MeshStandardMaterial({ color: index % 2 ? 0x547a88 : 0x6e8490, map: atlas, roughness: .76 })); distant.position.set(-10.5 + index * 3.5, .8 + (index % 3) * .18, -8.4); distant.castShadow = true; distant.receiveShadow = true; scene.add(distant); }
  const ridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x5e8da0, roughness: .96 });
  [-11, -4, 4, 11].forEach((x, index) => { const ridge = new THREE.Mesh(new THREE.ConeGeometry(4.8 + (index % 2), 6 + index % 2, 4), ridgeMaterial); ridge.position.set(x, 2.5, -10); ridge.rotation.y = Math.PI / 4; ridge.receiveShadow = true; scene.add(ridge); });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.06, .11, 7.8, 12), new THREE.MeshBasicMaterial({ color: 0x9effec, transparent: true, opacity: .42 })); beacon.position.set(0, 3.9, -4.8); scene.add(beacon);
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let hovered = null; let frame = 0;
  const setHighlight = (door) => { if (hovered === door) return; if (hovered) { hovered.userData.doorMaterial.emissiveIntensity = hovered.userData.baseEmissive; hovered.userData.sign.material.opacity = .94; } hovered = door; if (hovered) { hovered.userData.doorMaterial.emissiveIntensity = hovered.userData.baseEmissive + 1.4; hovered.userData.sign.material.opacity = 1; } };
  const doorAt = (event) => { const bounds = canvas.getBoundingClientRect(); pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1; pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(doors, false)[0]?.object ?? null; };
  const onMove = (event) => { setHighlight(doorAt(event)); canvas.style.cursor = hovered ? 'pointer' : 'default'; }; const onLeave = () => { setHighlight(null); canvas.style.cursor = 'default'; }; const onClick = (event) => { const door = doorAt(event); if (door) onDoor(door.userData.roleId); };
  const resize = () => { const { width, height } = canvas.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
  const render = (time) => { const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2); if (nextPixelRatio !== pixelRatio) { pixelRatio = nextPixelRatio; renderer.setPixelRatio(pixelRatio); resize(); } if (!reducedMotion.matches) beacon.material.opacity = .2 + Math.sin(time / 750) * .12; renderer.render(scene, camera); frame = window.requestAnimationFrame(render); };
  let onContextLost;
  const dispose = () => { window.cancelAnimationFrame(frame); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('click', onClick); canvas.removeEventListener('webglcontextlost', onContextLost); window.removeEventListener('resize', resize); disposeObject(scene); scene.background?.dispose?.(); renderer.dispose(); };
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
