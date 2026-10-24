import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { ROLES, getCampusHubSummary, getDoorAction, getRole } from '../src/data/roles.js';
import { isCampusDesktop } from '../src/ui/campusPanelState.js';
import { createOriginGuard, getAllowedOrigins, isAllowedOrigin } from '../server/origins.js';

const hub = fs.readFileSync(new URL('../src/ui/campusHub.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

test('the original campus config exposes five editable role-driven destinations', () => {
  assert.deepEqual(Object.keys(ROLES), ['dietetics', 'generalPractice', 'nursing', 'psychology', 'pharmacy']);
  for (const role of Object.values(ROLES)) {
    assert.ok(role.campus.landmark);
    assert.ok(role.campus.preview);
    for (const coordinate of ['left', 'top', 'width', 'height']) assert.ok(role.campus[coordinate] > 0);
    assert.ok(role.campus.left + role.campus.width <= 100);
    assert.ok(role.campus.top + role.campus.height <= 100);
  }
});

test('the hub renders semantic original scene layers without campus raster or kiosk hooks', () => {
  for (const layer of ['campus-sky', 'campus-horizon', 'campus-walkways', 'campus-route-lines', 'campus-beacon', 'campus-destinations']) {
    assert.match(hub, new RegExp(`class="${layer}`));
  }
  assert.doesNotMatch(hub, /campus-hub\.png|campus-panel-|campus-kiosk|campus-directory|new Image\(/);
  assert.match(hub, /style="\$\{buildingStyle\(role\)\}"/);
  assert.match(hub, /data-route-state="\$\{state\}"/);
  assert.match(css, /\.campus-building \{/);
  assert.match(css, /\.campus-building--pharmacy/);
});

test('the HUD and playable destinations derive from role data', () => {
  const summary = getCampusHubSummary();
  assert.equal(summary.playableCount, 2);
  assert.equal(summary.playableLabel, '2 parcours jouables');
  assert.equal(summary.playableShare, '40%');
  assert.deepEqual(summary.roleStates.filter((role) => role.state === 'playable').map((role) => role.id), ['dietetics', 'nursing']);
  assert.match(hub, /Campus MedGame/);
  assert.match(hub, /\$\{hubSummary\.playableLabel\}/);
  assert.match(hub, /role\.unlocked \? 'playable' : 'preview'/);
});

test('locked role previews disable destinations and restore focus to their invoker', () => {
  assert.match(hub, /destinations\.forEach\(\(destination\) => \{ destination\.disabled = true; \}\);/);
  assert.match(hub, /destinations\.forEach\(\(destination\) => \{ destination\.disabled = false; \}\);/);
  assert.match(hub, /previewInvoker\?\.focus\(\);/);
  assert.match(hub, /closePreview\.focus\(\);/);
  assert.match(hub, /data-preview-close/);
});

test('only Dietetics and Nursing doors start gameplay; locked roles remain previews', () => {
  assert.deepEqual(getDoorAction('dietetics'), { roleId: 'dietetics' });
  assert.deepEqual(getDoorAction('nursing'), { roleId: 'nursing' });
  for (const role of Object.values(ROLES).filter((candidate) => !candidate.unlocked)) {
    assert.match(getDoorAction(role.id).feedback, new RegExp(`${role.label}.*Bientôt disponible`));
  }
  assert.match(getDoorAction('missing').feedback, /ne peut pas être ouvert/);
});

test('the campus remains desktop-only and routes/beacon respect reduced motion', () => {
  assert.equal(isCampusDesktop(1023), false);
  assert.equal(isCampusDesktop(1024), true);
  assert.match(css, /@media \(max-width: 1023px\) \{ \.campus-scene \{ display: none;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.campus-route-lines i \{ animation: none;/);
  assert.match(css, /\.campus-building:focus-visible/);
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
