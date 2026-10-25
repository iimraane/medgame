import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import * as THREE from 'three';
import { ROLES, getCampusHubSummary, getDoorAction, getRole } from '../src/data/roles.js';
import { animateArcadePortals, createCampusBuildings, setArcadePortalHighlight } from '../src/ui/campusBuildings.js';
import { loadLocalLandscapeModels } from '../src/ui/campusLandscapeAssets.js';
import { CAMPUS_COMPOSITION, createPaverApproach } from '../src/ui/campusGardenComposition.js';
import { isCampusDesktop } from '../src/ui/campusPanelState.js';
import { canInitializeCampus, createCampusLifecycle, resolveCampusSelection, shouldExitCampusOnEscape } from '../src/ui/campusHubState.js';
import { createOriginGuard, getAllowedOrigins, isAllowedOrigin } from '../server/origins.js';

const hub = fs.readFileSync(new URL('../src/ui/campusHub.js', import.meta.url), 'utf8');
const landscapeAssets = fs.readFileSync(new URL('../src/ui/campusLandscapeAssets.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

test('the campus config exposes five uniform opaque house destinations', () => {
  assert.deepEqual(Object.keys(ROLES), ['dietetics', 'generalPractice', 'nursing', 'psychology', 'pharmacy']);
  for (const role of Object.values(ROLES)) {
    assert.ok(role.campus.landmark);
    assert.ok(role.campus.preview);
    assert.match(role.campus.doorId, /^door-/);
    assert.equal(role.campus.position.length, 3);
    assert.equal(role.campus.footprint.length, 3);
    assert.match(role.campus.accent, /^#/);
    assert.equal(role.campus.silhouette, 'house');
    assert.ok(role.campus.sign);
    assert.ok(role.campus.materialAccent);
  }
  assert.equal(new Set(Object.values(ROLES).map((role) => JSON.stringify(role.campus.footprint))).size, 1);
  assert.equal(new Set(Object.values(ROLES).map((role) => role.campus.materialAccent)).size, 1);
  assert.deepEqual(Object.values(ROLES).map(({ id, unlocked, campus }) => [id, campus.position, campus.accent, campus.sign, unlocked]), [
    ['dietetics', [-7.2, 0, 1.4], '#8ee6a9', 'SERRE NUTRITION', true], ['generalPractice', [-3.7, 0, -2.2], '#8dc7ff', 'CLINIQUE · SOINS PRIMAIRES', false], ['nursing', [0, 0, 1.1], '#c5a7ff', 'ATELIER DU SOIN', true], ['psychology', [4, 0, -2], '#fa9bb5', 'CONSERVATOIRE · ÉCOUTE', false], ['pharmacy', [7.3, 0, 1.2], '#77e9cb', 'PHARMACIE · REMÈDES', false],
  ]);
});

test('constructed campus houses stay opaque and attach arcade portals only to playable doors', () => {
  const { doors, buildings } = createCampusBuildings(Object.values(ROLES), () => new THREE.Texture());
  assert.equal(buildings.length, 5); assert.equal(doors.length, 5);
  for (const building of buildings) {
    for (const name of ['campus-house-wall', 'campus-house-roof', 'campus-house-window', 'campus-profession-sign']) assert.equal(building.getObjectByName(name).material.transparent, false);
    assert.equal(building.getObjectsByProperty('name', 'campus-house-window-muntin').length, 12);
    assert.equal(building.getObjectsByProperty('name', 'campus-stone-pier').length, 2);
    assert.equal(building.getObjectsByProperty('name', 'campus-roof-tile').length, 14);
    assert.equal(building.getObjectsByProperty('name', 'campus-entry-sconce').length, 2);
    assert.ok(building.getObjectByName('campus-timber-soffit'));
    assert.ok(building.getObjectByName('campus-glazed-entry-frame'));
    const tiles = building.getObjectsByProperty('name', 'campus-roof-tile'); const roofWidth = 3.8 + .22; const slope = Math.atan2(.82, roofWidth / 2);
    assert.ok(tiles[0].position.x < 0); assert.ok(tiles[7].position.x > 0);
    assert.ok(Math.abs(tiles[0].rotation.z - slope) < 1e-9); assert.ok(Math.abs(tiles[7].rotation.z + slope) < 1e-9);
    assert.ok(Math.abs(tiles[0].position.y - (4.2 + .82 - Math.abs(tiles[0].position.x) * (.82 / (roofWidth / 2)))) < 1e-9);
    assert.ok(Math.abs(tiles[7].position.y - (4.2 + .82 - Math.abs(tiles[7].position.x) * (.82 / (roofWidth / 2)))) < 1e-9);
  }
  const portalDoors = doors.filter((door) => door.userData.portal); assert.deepEqual(portalDoors.map((door) => door.userData.roleId), ['dietetics', 'nursing']);
  assert.equal(portalDoors.every((door) => !doors.includes(door.userData.portal.portal)), true);
  const portal = portalDoors[0].userData.portal; setArcadePortalHighlight(portalDoors[0], true); assert.equal(portal.light.intensity, 3.5); assert.equal(portal.portal.scale.x, 1.09);
  animateArcadePortals(portalDoors, 520, true); assert.equal(portal.chevrons.position.y, 0); assert.equal(portal.portal.rotation.y, 0);
});

test('the hub uses local Three.js doors with a semantic destination list', () => {
  assert.match(hub, /import \* as THREE from 'three'/);
  assert.match(hub, /new THREE\.WebGLRenderer/);
  assert.match(hub, /new THREE\.Raycaster/);
  assert.match(hub, /class="campus-canvas"/);
  assert.match(hub, /class="campus-destination-list/);
  assert.match(hub, /campus-destination-list--sr-only/);
  assert.match(hub, /createSignTexture/);
  assert.match(hub, /medical-concrete-glass-atlas\.png/);
  assert.match(hub, /shouldExitCampusOnEscape/);
  assert.doesNotMatch(hub, /campus-hub\.png|campus-panel-|campus-kiosk|campus-directory|new Image\(/);
  assert.match(hub, /createCampusBuildings/);
  assert.match(hub, /GLTFLoader/);
  for (const filename of ['tree_detailed.glb', 'tree_oak.glb', 'grass_large.glb', 'flower_yellowB.glb', 'flower_purpleB.glb', 'rock_largeA.glb', 'rock_smallE.glb']) assert.match(hub, new RegExp(filename.replace('.', '\\.')));
  assert.match(hub, /addFlowerBed|addShrub|addBench|addLamp|addRock/);
  assert.match(hub, /createPaverApproach|campus-paver-approach|campus-path-curb/);
  assert.match(hub, /addMountainRange|campus-mountain-layer|addCloud/);
  assert.match(hub, /CAMPUS_COMPOSITION/);
  assert.match(hub, /intersectObjects\(doors, false\)/);
  assert.doesNotMatch(hub, /silhouette ===/);
  assert.match(css, /\.campus-canvas/);
});

test('the medical garden composition has an executable continuous approach and configured horizon', () => {
  assert.deepEqual(CAMPUS_COMPOSITION.camera.position, [0, 4.35, 22.8]);
  assert.deepEqual(CAMPUS_COMPOSITION.camera.target, [0, 1.95, -.35]);
  assert.equal(CAMPUS_COMPOSITION.horizon.mountains.length, 3);
  assert.equal(CAMPUS_COMPOSITION.horizon.clouds.length, 4);
  const pavers = createPaverApproach();
  assert.equal(pavers.isInstancedMesh, true);
  assert.equal(pavers.count, CAMPUS_COMPOSITION.pavers.columns * CAMPUS_COMPOSITION.pavers.rows);
  assert.equal(pavers.castShadow, false);
  const first = new THREE.Matrix4(); const last = new THREE.Matrix4(); const firstPosition = new THREE.Vector3(); const lastPosition = new THREE.Vector3();
  pavers.getMatrixAt(0, first); pavers.getMatrixAt(pavers.count - 1, last); firstPosition.setFromMatrixPosition(first); lastPosition.setFromMatrixPosition(last);
  assert.ok(firstPosition.z - lastPosition.z > 20);
  assert.ok(CAMPUS_COMPOSITION.pavers.depth >= CAMPUS_COMPOSITION.pavers.pitch);
});

test('campus landscape assets are local, licensed, and have a procedural fallback', () => {
  const assetRoot = new URL('../src/public/assets/campus/', import.meta.url);
  const manifest = fs.readFileSync(new URL('README.md', assetRoot), 'utf8');
  const assetNames = ['tree_detailed.glb', 'tree_oak.glb', 'grass_large.glb', 'flower_yellowB.glb', 'flower_purpleB.glb', 'rock_largeA.glb', 'rock_smallE.glb'];
  assert.match(manifest, /provenance|licence manifest/i);
  assert.match(manifest, /Kenney/);
  assert.match(manifest, /Creative Commons Zero \(CC0\)/);
  assert.match(fs.readFileSync(new URL('KENNEY-NATURE-KIT-LICENSE.txt', assetRoot), 'utf8'), /License: \(Creative Commons Zero, CC0\)/);
  for (const filename of assetNames) assert.ok(fs.statSync(new URL(filename, assetRoot)).size > 1024, `${filename} is a committed local model`);
  assert.match(hub, /loadLandscapeKit\(scene,/);
  assert.match(landscapeAssets, /gltf\.scene\.clone\(true\)/);
  assert.match(landscapeAssets, /disposeDecodedLandscape/);
  assert.match(hub, /addGrassTufts\(scene\)/);
});

test('local landscape loader clones loaded assets, records failures, and disposes late decoded scenes', () => {
  const calls = []; const loader = { load(url, loaded, progress, failed) { calls.push({ url, loaded, failed }); } }; const target = new THREE.Group();
  const result = loadLocalLandscapeModels({ scene: target, loader, placements: { 'tree.glb': [[1, 2, .5], [3, 4, .25]] } });
  const decoded = new THREE.Group(); const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()); decoded.add(mesh);
  calls[0].loaded({ scene: decoded });
  assert.equal(target.children.length, 2); assert.equal(target.children[0].position.x, 1); assert.equal(mesh.castShadow, true); assert.equal(mesh.receiveShadow, true);
  calls[0].failed(); assert.deepEqual(result.failedFiles, ['tree.glb']);
  let geometryDisposed = false; let materialDisposed = false; const inactive = new THREE.Group(); const lateMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()); lateMesh.geometry.dispose = () => { geometryDisposed = true; }; lateMesh.material.dispose = () => { materialDisposed = true; }; inactive.add(lateMesh);
  const later = []; loadLocalLandscapeModels({ scene: target, loader: { load(...args) { later.push(args); } }, isActive: () => false, placements: { 'late.glb': [[0, 0, 1]] } });
  later[0][1]({ scene: inactive });
  assert.equal(target.children.length, 2); assert.equal(geometryDisposed, true); assert.equal(materialDisposed, true);
});

test('playable destination data remains available without visible scene chrome', () => {
  const summary = getCampusHubSummary();
  assert.equal(summary.playableCount, 2);
  assert.equal(summary.playableLabel, '2 parcours jouables');
  assert.equal(summary.playableShare, '40%');
  assert.deepEqual(summary.roleStates.filter((role) => role.state === 'playable').map((role) => role.id), ['dietetics', 'nursing']);
  assert.doesNotMatch(hub, /class="campus-hud"/);
  assert.match(hub, /role\.unlocked \? 'Parcours jouable' : role\.unlockRequirement/);
});

test('locked destinations announce availability without opening a screen panel', () => {
  assert.match(hub, /feedback\.textContent = `\$\{role\.label\} : \$\{role\.unlockRequirement\}\.`;/);
  assert.doesNotMatch(hub, /class="campus-preview"/);
  assert.doesNotMatch(hub, /class="campus-hud"/);
});

test('role selection enters only playable routes and previews locked doors', () => {
  assert.deepEqual(getDoorAction('dietetics'), { roleId: 'dietetics' });
  assert.deepEqual(getDoorAction('nursing'), { roleId: 'nursing' });
  for (const role of Object.values(ROLES).filter((candidate) => !candidate.unlocked)) {
    assert.match(getDoorAction(role.id).feedback, new RegExp(`${role.label}.*Bientôt disponible`));
  }
  assert.match(getDoorAction('missing').feedback, /ne peut pas être ouvert/);
  assert.deepEqual(resolveCampusSelection('dietetics', getDoorAction), { kind: 'levels', roleId: 'dietetics' });
  assert.deepEqual(resolveCampusSelection('nursing', getDoorAction), { kind: 'levels', roleId: 'nursing' });
  assert.deepEqual(resolveCampusSelection('psychology', getDoorAction), { kind: 'preview', feedback: 'Psychologie : parcours verrouillé. Bientôt disponible.' });
  assert.deepEqual(resolveCampusSelection('nursing', getDoorAction, true), { kind: 'ignore' });
});

test('campus lifecycle cancels pending loading and tears down a scene once', () => {
  let nextTimer = 0;
  const callbacks = new Map();
  const cleared = [];
  const lifecycle = createCampusLifecycle(
    (callback) => { const id = ++nextTimer; callbacks.set(id, callback); return id; },
    (id) => { cleared.push(id); callbacks.delete(id); },
  );
  let opened = 0;
  let disposed = 0;
  lifecycle.scheduleLoading(() => { opened += 1; }, 850);
  lifecycle.setSceneDisposer(() => { disposed += 1; });
  lifecycle.dispose();
  assert.deepEqual(cleared, [1]);
  assert.equal(opened, 0);
  assert.equal(disposed, 1);
  lifecycle.dispose();
  assert.equal(disposed, 1);
});

test('the campus remains desktop-only and routes/beacon respect reduced motion', () => {
  assert.equal(isCampusDesktop(1023), false);
  assert.equal(isCampusDesktop(1024), true);
  assert.equal(canInitializeCampus(1023), false);
  assert.equal(canInitializeCampus(1024), true);
  assert.match(css, /@media \(max-width: 1023px\) \{ \.campus-scene \{ display: none;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.campus-destination-list button:focus-visible/);
  assert.match(css, /\.campus-destination-list--sr-only/);
  assert.match(css, /\.campus-scene--fallback \.campus-destination-list/);
  assert.doesNotMatch(css, /\.campus-scene__exit/);
});

test('Escape returns only outside an open preview', () => {
  assert.equal(shouldExitCampusOnEscape(false, 'Escape'), true);
  assert.equal(shouldExitCampusOnEscape(true, 'Escape'), false);
  assert.equal(shouldExitCampusOnEscape(false, 'Enter'), false);
});

test('the Three.js lifecycle cancels rendering and removes hub listeners', () => {
  assert.match(hub, /window\.cancelAnimationFrame\(frame\)/);
  assert.match(hub, /renderer\.dispose\(\)/);
  assert.match(hub, /removeEventListener\('pointermove'/);
  assert.match(hub, /export function disposeCampusHub/);
});

test('role identities and manual content remain intact', () => {
  for (const role of Object.values(ROLES)) {
    assert.ok(role.icon);
    assert.ok(role.description);
    assert.ok(role.manual?.purpose);
    assert.equal(role.manual?.skills.length, 3);
    assert.ok(role.manual?.missions);
  }
  assert.equal(getRole('dietetics').unlocked, true);
  assert.equal(getRole('generalPractice').unlockRequirement, 'Bientôt disponible');
});

test('local Vite origins are allowed only outside production', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173', 'development'), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:5173', 'test'), true);
  assert.equal(isAllowedOrigin('http://localhost:5173', 'production'), false);
  assert.deepEqual(getAllowedOrigins('production'), ['https://alimni.tv', 'https://www.alimni.tv']);
  assert.equal(isAllowedOrigin('https://untrusted.example', 'development'), false);
});

async function requestGuard(environment, headers = {}) {
  const guard = createOriginGuard(environment);
  const server = http.createServer((req, res) => {
    const response = { status(code) { res.statusCode = code; return this; }, json(body) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); } };
    guard(req, response, () => { res.statusCode = 204; res.end(); });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await new Promise((resolve, reject) => {
      const request = http.request({ host: '127.0.0.1', port, path: '/', headers }, (response) => { response.resume(); response.on('end', () => resolve(response.statusCode)); });
      request.on('error', reject);
      request.end();
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('origin guard admits local Vite only in development and rejects unknown browser sources', async () => {
  assert.equal(await requestGuard('development', { origin: 'http://localhost:5173' }), 204);
  assert.equal(await requestGuard('development', { origin: 'http://localhost:5174' }), 204);
  assert.equal(await requestGuard('development', { origin: 'http://127.0.0.1:4173' }), 204);
  assert.equal(await requestGuard('development', { origin: 'http://[::1]:4173' }), 204);
  assert.equal(await requestGuard('development', { origin: 'http://localhost' }), 204);
  assert.equal(await requestGuard('production', { origin: 'http://localhost:5173' }), 403);
  assert.equal(await requestGuard('production', { origin: 'http://localhost:5174' }), 403);
  assert.equal(await requestGuard('development', { origin: 'http://localhost.evil.example:5173' }), 403);
  assert.equal(await requestGuard('development', { origin: 'http://localhost:5174/game' }), 403);
  assert.equal(await requestGuard('development', { origin: 'https://untrusted.example' }), 403);
  assert.equal(await requestGuard('development', { referer: 'not a URL' }), 403);
  assert.equal(await requestGuard('development', { referer: 'http://127.0.0.1:4173/game' }), 204);
  assert.equal(await requestGuard('development', { referer: 'http://[::1]:4173/game' }), 204);
});
