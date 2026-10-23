// ─── Storage Manager ─────────────────────────────────────────────
// Handles all localStorage operations for game progress and settings.

import { MISSIONS, getMissionsForRole } from '../data/missions.js';

const STORAGE_KEY = 'medgame_save';
const SETTINGS_KEY = 'medgame_settings';

export const DEFAULT_SAVE = {
    currentLevel: 1, maxUnlockedLevel: 1, scores: {}, unlockedCards: [], firstTime: true,
    selectedRole: 'dietetics', missionProgress: {}, recentVariantIds: {}, campaignProgressVersion: 1, legacyCampaignUnlockThrough: 1,
};

const DEFAULT_SETTINGS = {
    volume: 0.5,
    soundEnabled: true,
    animationsEnabled: true,
    transcriptionEnabled: false,
};

export function migrateSave(raw) {
    const legacy = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const oldProgress = sanitizeMissionProgress(legacy.missionProgress);
    const migratedProgress = oldProgress && Object.keys(oldProgress).length ? oldProgress : {};
    const campaignMissions = getMissionsForRole('dietetics');
    const hasCampaignProgress = campaignMissions.some((mission) => migratedProgress[mission.id]);
    for (const oldId of ['dietetics-everyday-constraints', 'dietetics-habit-follow-up', 'dietetics-safety-orientation']) {
        if (migratedProgress[oldId]) {
            const prior = migratedProgress['dietetics-rhythm-overflow'] || { attempts: 0, bestScore: 0, mastered: false };
            const legacyEntry = migratedProgress[oldId];
            migratedProgress['dietetics-rhythm-overflow'] = { attempts: prior.attempts + legacyEntry.attempts, bestScore: Math.max(prior.bestScore, legacyEntry.bestScore), mastered: prior.mastered || legacyEntry.mastered, ...((legacyEntry.lastResult || prior.lastResult) ? { lastResult: legacyEntry.lastResult || prior.lastResult } : {}) };
            delete migratedProgress[oldId];
        }
    }
    const storedLegacyBoundary = Number.isFinite(legacy.legacyCampaignUnlockThrough) ? Math.floor(legacy.legacyCampaignUnlockThrough) : null;
    const inferredLegacyBoundary = Number.isFinite(legacy.maxUnlockedLevel) ? Math.floor(legacy.maxUnlockedLevel) : 1;
    const legacyCampaignUnlockThrough = Math.max(1, Math.min(campaignMissions.length, storedLegacyBoundary ?? (hasCampaignProgress ? 1 : inferredLegacyBoundary)));
    return {
        ...DEFAULT_SAVE, ...legacy,
        selectedRole: legacy.selectedRole || 'dietetics',
        missionProgress: migratedProgress,
        campaignProgressVersion: 1,
        legacyCampaignUnlockThrough,
        scores: legacy.scores && typeof legacy.scores === 'object' ? legacy.scores : {},
        unlockedCards: Array.isArray(legacy.unlockedCards) ? legacy.unlockedCards : [], recentVariantIds: sanitizeRecentVariants(legacy.recentVariantIds),
    };
}
function sanitizeRecentVariants(value) { if (!value || typeof value !== 'object' || Array.isArray(value)) return {}; return Object.fromEntries(Object.entries(value).map(([missionId, ids]) => [missionId, Array.isArray(ids) ? [...new Set(ids.filter((id) => typeof id === 'string'))].slice(-6) : []])); }
export function getRecentVariantIds(missionId) { return loadSave().recentVariantIds[missionId] || []; }
export function nextRecentVariantIds(prior, variantId, cycleSize = 6) {
    if (!variantId) return Array.isArray(prior) ? prior : [];
    const uniquePrior = [...new Set((Array.isArray(prior) ? prior : []).filter((id) => typeof id === 'string'))].slice(-cycleSize);
    return uniquePrior.length >= cycleSize ? [variantId] : [...new Set([...uniquePrior, variantId])].slice(-cycleSize);
}
export function recordVariantId(missionId, variantId) { if (!variantId) return loadSave(); const save = loadSave(); save.recentVariantIds[missionId] = nextRecentVariantIds(save.recentVariantIds[missionId], variantId); saveSave(save); return save; }

function sanitizeMissionProgress(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return Object.fromEntries(Object.entries(value).map(([id, entry]) => [id, {
        attempts: Number.isFinite(entry?.attempts) && entry.attempts >= 0 ? entry.attempts : 0,
        bestScore: Number.isFinite(entry?.bestScore) && entry.bestScore >= 0 ? entry.bestScore : 0,
        mastered: Boolean(entry?.mastered),
        ...(entry?.lastResult && typeof entry.lastResult === 'object' ? { lastResult: entry.lastResult } : {}),
    }]));
}

export function loadSave() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY); const parsed = raw ? JSON.parse(raw) : {};
        const save = migrateSave(parsed);
        if (raw && (parsed.campaignProgressVersion !== save.campaignProgressVersion || parsed.legacyCampaignUnlockThrough !== save.legacyCampaignUnlockThrough)) localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
        return save;
    }
    catch { return migrateSave({}); }
}

export function saveSave(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrateSave(data)));
    if (typeof document !== 'undefined') document.cookie = `medgame_active=true; max-age=${60 * 60 * 24 * 365}; path=/`;
}

export function recordMissionResult(missionId, result) {
    const save = loadSave();
    const prior = save.missionProgress[missionId] || { attempts: 0, bestScore: 0, mastered: false };
    save.missionProgress[missionId] = { attempts: prior.attempts + 1, bestScore: Math.max(prior.bestScore, result.total || 0), mastered: prior.mastered || Boolean(result.mastery), lastResult: result };
    save.firstTime = false;
    saveSave(save);
    return save;
}

export function isMissionUnlocked(mission, missions, save = loadSave()) {
    if (mission.order === 1) return true;
    if (mission.roleId === 'dietetics' && mission.order <= (save.legacyCampaignUnlockThrough || 1)) return true;
    const previous = missions.find((item) => item.roleId === mission.roleId && item.order === mission.order - 1);
    return Boolean(previous && save.missionProgress[previous.id]?.mastered);
}

export function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export function saveSettings(data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

export function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    document.cookie = 'medgame_active=; max-age=0; path=/';
}

export function unlockAllLevels(missionIds = MISSIONS.map((mission) => mission.id)) {
    const save = loadSave();
    const dieteticsMissionIds = new Set(getMissionsForRole('dietetics').map((mission) => mission.id));
    const knownMissionIds = new Set(MISSIONS.map((mission) => mission.id));
    save.maxUnlockedLevel = dieteticsMissionIds.size;
    save.legacyCampaignUnlockThrough = dieteticsMissionIds.size;
    for (const missionId of new Set(missionIds.filter((id) => knownMissionIds.has(id)))) {
        const prior = save.missionProgress[missionId] || { attempts: 0, bestScore: 0, mastered: false };
        save.missionProgress[missionId] = { ...prior, mastered: true };
    }
    save.firstTime = false;
    saveSave(save);
    return save;
}

export function updateLevelScore(levelId, score, stars) {
    const save = loadSave();
    const existing = save.scores[levelId];
    if (!existing || score > existing.score) {
        save.scores[levelId] = { score, stars, attempts: (existing?.attempts || 0) + 1 };
    } else {
        save.scores[levelId].attempts += 1;
    }
    // Unlock next level
    if (stars >= 1 && levelId >= save.maxUnlockedLevel) {
        save.maxUnlockedLevel = levelId + 1;
    }
    saveSave(save);
    return save;
}

export function unlockCards(cardIds) {
    const save = loadSave();
    const newCards = cardIds.filter((id) => !save.unlockedCards.includes(id));
    save.unlockedCards = [...save.unlockedCards, ...newCards];
    save.firstTime = false;
    saveSave(save);
    return newCards;
}
