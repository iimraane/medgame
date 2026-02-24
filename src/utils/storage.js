// ─── Storage Manager ─────────────────────────────────────────────
// Handles all localStorage operations for game progress and settings.

const STORAGE_KEY = 'medgame_save';
const SETTINGS_KEY = 'medgame_settings';

const DEFAULT_SAVE = {
    currentLevel: 1,
    maxUnlockedLevel: 1,
    scores: {},       // { levelId: { score, stars, attempts } }
    unlockedCards: [],
    firstTime: true,
};

const DEFAULT_SETTINGS = {
    volume: 0.5,
    soundEnabled: true,
    animationsEnabled: true,
    transcriptionEnabled: false,
};

export function loadSave() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_SAVE };
        return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_SAVE };
    }
}

export function saveSave(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    document.cookie = `medgame_active=true; max-age=${60 * 60 * 24 * 365}; path=/`;
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

export function unlockAllLevels() {
    const save = loadSave();
    save.maxUnlockedLevel = 20; // 20 is the max level
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
