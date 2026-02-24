// ─── Main Entry Point ────────────────────────────────────────────
// Router and view manager for the MedGame application.

import { renderMenu } from './ui/menu.js';
import { renderLevelSelect } from './ui/levelSelect.js';
import { renderChat } from './ui/chat.js';
import { renderSettings } from './ui/settings.js';
import { loadSettings } from './utils/storage.js';
import { setVolume, setSoundEnabled, sfx_click } from './utils/sound.js';

const app = document.getElementById('app');
let currentView = null;

// Initialize sound settings
const settings = loadSettings();
setVolume(settings.volume);
setSoundEnabled(settings.soundEnabled);

// ─── Router ──────────────────────────────────────────────────────
export function navigate(view, params = {}) {
    sfx_click();
    currentView = view;
    app.innerHTML = '';

    switch (view) {
        case 'menu':
            renderMenu(app);
            break;
        case 'levels':
            renderLevelSelect(app);
            break;
        case 'game':
            renderChat(app, params.levelId);
            break;
        case 'settings':
            renderSettings(app);
            break;
        default:
            renderMenu(app);
    }
}

// Start with menu
navigate('menu');
