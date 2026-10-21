import test from 'node:test';
import assert from 'node:assert/strict';
const data = new Map();
globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
globalThis.document = { cookie: '' };
const storage = await import('../src/utils/storage.js');
const { getMissionsForRole } = await import('../src/data/missions.js');

test('legacy saves migrate without discarding existing progress', () => {
  const migrated = storage.migrateSave({ maxUnlockedLevel: 7, scores: { 2: { score: 100 } }, unlockedCards: ['rhume'] });
  assert.equal(migrated.maxUnlockedLevel, 7); assert.deepEqual(migrated.unlockedCards, ['rhume']); assert.equal(migrated.legacyCampaignUnlockThrough, 7); assert.equal(migrated.missionProgress['dietetics-rhythm-overflow'], undefined);
});
test('prior dietetics mission progress is retained on the first campaign case', () => {
  const lastResult = { total: 82, mastery: true };
  const migrated = storage.migrateSave({ missionProgress: { 'dietetics-habit-follow-up': { attempts: 3, bestScore: 82, mastered: true, lastResult } } });
  assert.equal(migrated.missionProgress['dietetics-rhythm-overflow'].attempts, 3);
  assert.equal(migrated.missionProgress['dietetics-rhythm-overflow'].bestScore, 82);
  assert.equal(migrated.missionProgress['dietetics-rhythm-overflow'].mastered, true);
  assert.deepEqual(migrated.missionProgress['dietetics-rhythm-overflow'].lastResult, lastResult);
});
test('retry retains the best score and increments attempts', () => {
  storage.resetAll(); storage.recordMissionResult('dietetics-rhythm-overflow', { total: 75, mastery: true });
  const save = storage.recordMissionResult('dietetics-rhythm-overflow', { total: 20, mastery: false });
  assert.equal(save.missionProgress['dietetics-rhythm-overflow'].attempts, 2); assert.equal(save.missionProgress['dietetics-rhythm-overflow'].bestScore, 75); assert.equal(save.missionProgress['dietetics-rhythm-overflow'].mastered, true);
});
test('mission unlocks after the preceding mission is attempted', () => {
  storage.resetAll(); const missions = getMissionsForRole('dietetics'); assert.equal(storage.isMissionUnlocked(missions[1], missions), false);
  storage.recordMissionResult(missions[0].id, { total: 75, mastery: true }); assert.equal(storage.isMissionUnlocked(missions[1], missions), true);
});
test('administrator unlock records campaign progress for every Dietetics mission', () => {
  storage.resetAll(); const missions = getMissionsForRole('dietetics');
  const save = storage.unlockAllLevels();
  assert.equal(save.maxUnlockedLevel, missions.length);
  assert.equal(missions.every((mission) => save.missionProgress[mission.id]?.mastered), true);
  assert.equal(missions.every((mission) => storage.isMissionUnlocked(mission, missions, save)), true);
  storage.resetAll(); const reset = storage.loadSave();
  assert.equal(storage.isMissionUnlocked(missions[0], missions, reset), true);
  assert.equal(storage.isMissionUnlocked(missions[1], missions, reset), false);
});
test('legacy numeric progression remains readable by the campaign map', () => {
  const missions = getMissionsForRole('dietetics'); const save = storage.migrateSave({ maxUnlockedLevel: 4 });
  assert.equal(storage.isMissionUnlocked(missions[3], missions, save), true);
  assert.equal(storage.isMissionUnlocked(missions[4], missions, save), false);
  const laterSave = storage.migrateSave({ maxUnlockedLevel: 7 });
  assert.equal(storage.isMissionUnlocked(missions[6], missions, laterSave), true);
  assert.equal(storage.isMissionUnlocked(missions[7], missions, laterSave), false);
});
test('legacy counters never override authoritative campaign progress', () => {
  const missions = getMissionsForRole('dietetics');
  const save = storage.migrateSave({ maxUnlockedLevel: 8, missionProgress: { [missions[0].id]: { attempts: 1, bestScore: 20, mastered: false } } });
  assert.equal(save.legacyCampaignUnlockThrough, 1);
  assert.equal(save.missionProgress[missions[0].id].mastered, false);
  assert.equal(storage.isMissionUnlocked(missions[1], missions, save), false);
});
test('malformed mission progress entries are repaired before recording', () => {
  storage.saveSave({ missionProgress: { broken: { attempts: 'many', bestScore: null, mastered: 'yes' } } });
  const save = storage.recordMissionResult('broken', { total: 40, mastery: false });
  assert.equal(save.missionProgress.broken.attempts, 1); assert.equal(save.missionProgress.broken.bestScore, 40);
});
