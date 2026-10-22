import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/ui/settings.js', import.meta.url), 'utf8');

test('administrator unlock uses an in-page dialog instead of a native prompt', () => {
  assert.match(source, /id="admin-dialog"/);
  assert.match(source, /id="admin-password"/);
  assert.match(source, /<form id="admin-form">/);
  assert.match(source, /aria-describedby="admin-dialog-description"/);
  assert.doesNotMatch(source, /\bprompt\s*\(/);
  assert.match(source, /unlockAllLevels\(\);\s*\n\s*navigate\('levels', \{ roleId: 'dietetics' \}\)/);
});

test('administrator dialog keeps focus in the dialog and restores it on dismissal', () => {
  assert.match(source, /settingsContent\.inert = true/);
  assert.match(source, /settingsContent\.inert = false/);
  assert.match(source, /btnAdmin\.focus\(\)/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /event\.key !== 'Tab'/);
});

test('settings no longer render the obsolete about section', () => {
  assert.doesNotMatch(source, /À propos/);
  assert.doesNotMatch(source, /GPT-4o-mini/);
});
