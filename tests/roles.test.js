import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { ROLES, getCampusHubSummary, getDoorAction, getRole } from '../src/data/roles.js';
import { isCampusDesktop } from '../src/ui/campusPanelState.js';
import { canInitializeCampus, createCampusLifecycle, resolveCampusSelection, shouldExitCampusOnEscape } from '../src/ui/campusHubState.js';
import { createOriginGuard, getAllowedOrigins, isAllowedOrigin } from '../server/origins.js';

const hub = fs.readFileSync(new URL('../src/ui/campusHub.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

test('the campus config exposes five editable 3D door destinations', () => {
  assert.deepEqual(Object.keys(ROLES), ['dietetics', 'generalPractice', 'nursing', 'psychology', 'pharmacy']);
  for (const role of Object.values(ROLES)) {
    assert.ok(role.campus.landmark);
    assert.ok(role.campus.preview);
    assert.match(role.campus.doorId, /^door-/);
    assert.equal(role.campus.position.length, 3);
    assert.equal(role.campus.footprint.length, 3);
    assert.match(role.campus.accent, /^#/);
    assert.ok(['greenhouse', 'clinic', 'atelier', 'conservatory', 'tower'].includes(role.campus.silhouette));
    assert.ok(role.campus.sign);
    assert.ok(role.campus.materialAccent);
  }
  assert.equal(new Set(Object.values(ROLES).map((role) => role.campus.silhouette)).size, 5);
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
  assert.match(hub, /door\.name = doorId/);
  assert.match(css, /\.campus-canvas/);
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
