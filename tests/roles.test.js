import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { ROLES, getCampusPanelAction, getDoorAction, getRole } from '../src/data/roles.js';
import { createPanelRequestGuard, createRetryableLoadCache, isCampusDesktop } from '../src/ui/campusPanelState.js';
import { createOriginGuard, getAllowedOrigins, isAllowedOrigin } from '../server/origins.js';

test('the clinic hub exposes all five visible professions', () => {
  assert.deepEqual(Object.keys(ROLES), ['dietetics', 'generalPractice', 'nursing', 'psychology', 'pharmacy']);
  for (const role of Object.values(ROLES)) {
    assert.ok(role.icon);
    assert.ok(role.description);
    assert.ok(role.theme);
    assert.ok(role.manual?.purpose);
    assert.equal(role.manual?.skills.length, 3);
    assert.ok(role.manual?.missions);
    assert.ok(role.hotspot.width > 0 && role.hotspot.height > 0);
  }
});

test('campus storefront hotspots use conservative, scene-relative geometry', () => {
  const expectedHotspots = {
    dietetics: { left: 2.8, top: 12.4, width: 16, height: 51.5 },
    generalPractice: { left: 25, top: 27.6, width: 12, height: 33.4 },
    nursing: { left: 42.8, top: 34.7, width: 10.8, height: 25.5 },
    psychology: { left: 72.7, top: 37.2, width: 8.2, height: 23.4 },
    pharmacy: { left: 85.9, top: 30, width: 11.3, height: 30.4 },
  };
  for (const [roleId, hotspot] of Object.entries(expectedHotspots)) {
    assert.deepEqual(getRole(roleId).hotspot, hotspot);
    assert.ok(hotspot.left >= 0 && hotspot.top >= 0);
    assert.ok(hotspot.left + hotspot.width <= 100 && hotspot.top + hotspot.height <= 100);
  }
});

test('campus controls provide per-role perspective and kiosk affordance contracts', () => {
  const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  const hub = fs.readFileSync(new URL('../src/ui/campusHub.js', import.meta.url), 'utf8');
  for (const role of Object.values(ROLES)) {
    assert.match(css, new RegExp(`\\.campus-hotspot--${role.theme} \\{ --facade-shape: polygon\\(`));
    assert.match(css, new RegExp(`\\.campus-directory-hotspot--${role.theme}`));
    assert.match(hub, new RegExp(`campus-directory-hotspot--\\$\\{role\\.theme\\}`));
  }
  assert.match(css, /\.campus-directory-hotspot::after[^}]*opacity: \.33/);
  assert.match(css, /\.campus-directory-hotspot:hover::after, \.campus-directory-hotspot:focus-visible::after[^}]*opacity: \.94/);
  assert.match(css, /\.campus-directory-hotspots\[hidden\] \{ display: none;/);
  assert.match(css, /\.campus-hotspot:focus-visible \{ outline: 3px solid #fff/);
});

test('arcade kiosk affordances stay local, role-coloured, and motion-safe', () => {
  const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  const hub = fs.readFileSync(new URL('../src/ui/campusHub.js', import.meta.url), 'utf8');
  for (const role of Object.values(ROLES)) {
    assert.match(css, new RegExp(`\\.campus-directory-hotspot--${role.theme} \\{ --campus-accent:`));
  }
  assert.match(css, /\.campus-directory-hotspot::after, \.campus-kiosk-return::after, \.campus-kiosk-enter::after/);
  assert.match(css, /\.campus-directory-hotspot:hover::before, \.campus-directory-hotspot:focus-visible::before[\s\S]*?animation: campus-kiosk-sweep/);
  assert.match(css, /\.campus-directory-hotspot:hover::after, \.campus-directory-hotspot:focus-visible::after[\s\S]*?animation: campus-kiosk-pulse/);
  assert.match(css, /\.campus-directory-hotspot:active::after, \.campus-kiosk-return:active::after, \.campus-kiosk-enter:active::after/);
  assert.match(css, /\.campus-directory-hotspot:active::before, \.campus-kiosk-return:active::before, \.campus-kiosk-enter:active::before \{ opacity: 1; animation: none; transform: translateX\(0\); \}/);
  assert.match(css, /\.campus-directory-hotspot:focus-visible, \.campus-kiosk-return:focus-visible, \.campus-kiosk-enter:focus-visible \{ outline: 3px solid #fff; outline-offset: -3px;/);
  assert.match(css, /\.campus-kiosk-return \{ --terminal-accent: #70efff;/);
  assert.match(css, /\.campus-kiosk-enter \{ --terminal-accent: #69a9ff;/);
  assert.match(hub, /enterButton\.hidden = roleId !== 'dietetics';/);
  assert.match(hub, /if \(activeRoleId === 'dietetics'\) navigate\('levels', \{ roleId: 'dietetics' \}\);/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.campus-directory-hotspot::before, \.campus-kiosk-return::before, \.campus-kiosk-enter::before \{ display: none;[\s\S]*?animation: none;/);
});

test('campus artwork and its interactive controls share one centered source-ratio cover plane', () => {
  const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  const hub = fs.readFileSync(new URL('../src/ui/campusHub.js', import.meta.url), 'utf8');
  assert.match(hub, /<div class="campus-art-plane"><img class="campus-scene__image"[\s\S]*?<\/nav><button class="campus-kiosk-return"[\s\S]*?<button class="campus-kiosk-enter"[\s\S]*?<\/div><p class="campus-scene__feedback"/);
  assert.match(css, /\.campus-art-plane \{[^}]*top: 50%;[^}]*left: 50%;[^}]*width: max\(100%, calc\(100vh \* 1\.776833\)\);[^}]*height: max\(100%, calc\(100vw \* \.562799\)\);[^}]*transform: translate\(-50%, -50%\)/);
});

test('dietetics and Nursing are the only open roles', () => {
  assert.equal(getRole('dietetics').unlocked, true);
  assert.deepEqual(Object.values(ROLES).filter((role) => role.unlocked).map((role) => role.id), ['dietetics', 'nursing']);
});

test('every profession maps to a stable baked campus panel image', () => {
  const expectedAssets = {
    dietetics: 'campus-panel-dietetics.png',
    generalPractice: 'campus-panel-general-practice.png',
    nursing: 'campus-panel-nursing.png',
    psychology: 'campus-panel-psychology.png',
    pharmacy: 'campus-panel-pharmacy.png',
  };
  for (const [roleId, asset] of Object.entries(expectedAssets)) {
    assert.equal(getRole(roleId).panelAsset, asset);
    assert.deepEqual(getCampusPanelAction(roleId), { roleId, panelAsset: asset });
    const image = fs.readFileSync(new URL(`../src/public/assets/${asset}`, import.meta.url));
    assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(image.subarray(12, 16).toString('ascii'), 'IHDR');
    assert.equal(image.readUInt32BE(16), 1672);
    assert.equal(image.readUInt32BE(20), 941);
  }
  const baseImage = fs.readFileSync(new URL('../src/public/assets/campus-hub.png', import.meta.url));
  assert.equal(baseImage.readUInt32BE(16), 1672);
  assert.equal(baseImage.readUInt32BE(20), 941);
  assert.match(getCampusPanelAction('missing').feedback, /panneau ne peut pas être chargé/);
});

test('locked roles retain a visible coming-soon requirement', () => {
  for (const role of Object.values(ROLES).filter((role) => !role.unlocked)) {
    assert.match(role.unlockRequirement, /Bientôt disponible/);
  }
});

test('only Dietetics and Nursing doors produce mission-map actions', () => {
  assert.deepEqual(getDoorAction('dietetics'), { roleId: 'dietetics' });
  assert.deepEqual(getDoorAction('nursing'), { roleId: 'nursing' });
  for (const role of Object.values(ROLES).filter((candidate) => !candidate.unlocked)) {
    const action = getDoorAction(role.id);
    assert.equal(action.roleId, undefined);
    assert.match(action.feedback, new RegExp(`${role.label}.*Bientôt disponible`));
  }
  assert.match(getDoorAction('missing').feedback, /ne peut pas être ouvert/);
});

test('local Vite origins are allowed only outside production', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173', 'development'), true);
  assert.equal(isAllowedOrigin('http://127.0.0.1:5173', 'test'), true);
  assert.equal(isAllowedOrigin('http://localhost:5173', 'production'), false);
  assert.deepEqual(getAllowedOrigins('production'), ['https://whatsapp.immo.harpytech.fr', 'https://medgame.harpytech.fr']);
  assert.equal(isAllowedOrigin('https://untrusted.example', 'development'), false);
});

async function requestGuard(environment, headers = {}) {
  const guard = createOriginGuard(environment);
  const server = http.createServer((req, res) => {
    const response = {
      status(code) { res.statusCode = code; return this; },
      json(body) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); },
    };
    guard(req, response, () => { res.statusCode = 204; res.end(); });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port, path: '/', headers }, (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode));
      });
      req.on('error', reject);
      req.end();
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('origin guard admits local Vite only in development and rejects unknown browser sources', async () => {
  assert.equal(await requestGuard('development', { origin: 'http://localhost:5173' }), 204);
  assert.equal(await requestGuard('production', { origin: 'http://localhost:5173' }), 403);
  assert.equal(await requestGuard('development', { origin: 'https://untrusted.example' }), 403);
  assert.equal(await requestGuard('development', { referer: 'not a URL' }), 403);
});

test('the campus replaces the scene with a desktop-only notice below 1024px', () => {
  const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(max-width: 1023px\).*?\.campus-scene \{ display: none;/s);
  assert.match(css, /\.campus-mobile-notice \{ height: 100%; display: grid;/);
});

test('campus panel requests only resolve the latest selection or return action', async () => {
  assert.equal(isCampusDesktop(1023), false);
  assert.equal(isCampusDesktop(1024), true);
  const guard = createPanelRequestGuard();
  const firstRequest = guard.request();
  const secondRequest = guard.request();
  assert.equal(guard.isCurrent(firstRequest), false);
  assert.equal(guard.isCurrent(secondRequest), true);
  guard.cancel();
  assert.equal(guard.isCurrent(secondRequest), false);

  let attempts = 0;
  const loads = createRetryableLoadCache(async (asset) => {
    attempts += 1;
    if (attempts === 1) throw new Error('missing');
    return asset;
  });
  await assert.rejects(loads.load('panel.png'), /missing/);
  assert.equal(await loads.load('panel.png'), 'panel.png');
  assert.equal(attempts, 2);
});
