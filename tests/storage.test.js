import test from 'node:test';
import assert from 'node:assert/strict';
const data = new Map();
globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
globalThis.document = { cookie: '' };
const storage = await import('../src/utils/storage.js');
const { getMissionsForRole } = await import('../src/data/missions.js');

test('legacy saves migrate without discarding existing progress', () => {
  const migrated = storage.migrateSave({ maxUnlockedLevel: 7, scores: { 2: { score: 100 } }, unlockedCards: ['rhume'] });
  assert.equal(migrated.maxUnlockedLevel, 7); assert.deepEqual(migrated.unlockedCards, ['rhume']); assert.equal(migrated.missionProgress['dietetics-everyday-constraints'].attempts, 1);
});
test('retry retains the best score and increments attempts', () => {
  storage.resetAll(); storage.recordMissionResult('dietetics-everyday-constraints', { total: 75, mastery: true });
  const save = storage.recordMissionResult('dietetics-everyday-constraints', { total: 20, mastery: false });
  assert.equal(save.missionProgress['dietetics-everyday-constraints'].attempts, 2); assert.equal(save.missionProgress['dietetics-everyday-constraints'].bestScore, 75); assert.equal(save.missionProgress['dietetics-everyday-constraints'].mastered, true);
});
test('mission unlocks after the preceding mission is attempted', () => {
  storage.resetAll(); const missions = getMissionsForRole('dietetics'); assert.equal(storage.isMissionUnlocked(missions[1], missions), false);
  storage.recordMissionResult(missions[0].id, { total: 75, mastery: true }); assert.equal(storage.isMissionUnlocked(missions[1], missions), true);
});
test('malformed mission progress entries are repaired before recording', () => {
  storage.saveSave({ missionProgress: { broken: { attempts: 'many', bestScore: null, mastered: 'yes' } } });
  const save = storage.recordMissionResult('broken', { total: 40, mastery: false });
  assert.equal(save.missionProgress.broken.attempts, 1); assert.equal(save.missionProgress.broken.bestScore, 40);
});
