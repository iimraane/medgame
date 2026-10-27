import test from 'node:test';
import assert from 'node:assert/strict';
import viteConfig from '../vite.config.js';

test('the local Vite API proxy preserves the browser /api contract', () => {
  const proxy = viteConfig.server.proxy['/api'];
  assert.equal(proxy.target, 'http://localhost:3001');
  assert.equal(proxy.rewrite('/api/start'), '/game/api/start');
  assert.equal(proxy.rewrite('/api/psychology-formulation'), '/game/api/psychology-formulation');
});
