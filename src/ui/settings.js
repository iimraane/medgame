// ─── Settings View ───────────────────────────────────────────────

import { navigate } from '../main.js';
import { loadSettings, saveSettings, resetAll, unlockAllLevels } from '../utils/storage.js';
import { setVolume, setSoundEnabled, sfx_click } from '../utils/sound.js';
import { showCustomConfirm } from '../utils/helpers.js';

export function renderSettings(container) {
  const settings = loadSettings();

  container.innerHTML = `
    <div class="view settings">
      <div class="settings__header">
        <button class="btn btn--icon btn--secondary" id="btn-back">←</button>
        <h1>⚙️ Paramètres</h1>
      </div>
      <div class="settings__content">
        <div class="settings__section">
          <div class="settings__section-title">Audio</div>
          <div class="settings__field">
            <label class="settings__label">Volume des effets sonores</label>
            <div class="settings__range-wrapper">
              <span>🔇</span>
              <input
                type="range"
                class="settings__range"
                id="volume-slider"
                min="0"
                max="100"
                value="${Math.round(settings.volume * 100)}"
              >
              <span>🔊</span>
              <span id="volume-value" style="font-size:0.85rem;font-weight:600;min-width:35px">${Math.round(settings.volume * 100)}%</span>
            </div>
          </div>
          <div class="settings__toggle">
            <span class="settings__label" style="margin:0">Sons activés</span>
            <div class="toggle-switch ${settings.soundEnabled ? 'toggle-switch--active' : ''}" id="toggle-sound"></div>
          </div>
        </div>

        <div class="settings__section" style="margin-top:16px">
          <div class="settings__toggle">
            <span class="settings__label" style="margin:0">Transcription Vocale</span>
            <div class="toggle-switch ${settings.transcriptionEnabled ? 'toggle-switch--active' : ''}" id="toggle-transcription"></div>
          </div>
        </div>

        <div class="settings__section" style="margin-top:16px">
          <div class="settings__toggle">
            <span class="settings__label" style="margin:0">Animations activées</span>
            <div class="toggle-switch ${settings.animationsEnabled ? 'toggle-switch--active' : ''}" id="toggle-anims"></div>
          </div>
        </div>

        <div class="settings__section" style="margin-top:32px">
          <div class="settings__section-title">Données</div>
          <button class="btn btn--danger" id="btn-reset" style="width:100%">
            🗑️ Réinitialiser toute la progression
          </button>
          <button class="btn btn--secondary" id="btn-admin" style="width:100%; margin-top: 10px; border-color: var(--purple-500); color: var(--purple-600);">
            👑 Devenir Admin (Tout débloquer)
          </button>
        </div>

        <div style="margin-top:20px">
          <button class="btn btn--primary" id="btn-save" style="width:100%">
            💾 Sauvegarder les paramètres
          </button>
        </div>
      </div>
      <div class="settings-admin-dialog" id="admin-dialog" hidden>
        <div class="settings-admin-dialog__card" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" aria-describedby="admin-dialog-description">
          <button class="settings-admin-dialog__close" id="admin-cancel" type="button" aria-label="Fermer">×</button>
          <p class="settings-admin-dialog__eyebrow">ACCÈS ADMINISTRATEUR</p>
          <h2 id="admin-dialog-title">Débloquer le parcours</h2>
          <p id="admin-dialog-description">Le mode administrateur ouvre toutes les missions des parcours disponibles sur cet appareil.</p>
          <form id="admin-form">
            <label for="admin-password">Mot de passe</label>
            <input id="admin-password" type="password" autocomplete="off" placeholder="Mot de passe administrateur" required>
            <p class="settings-admin-dialog__feedback" id="admin-feedback" role="alert"></p>
            <button class="btn btn--primary" id="admin-confirm" type="submit">Débloquer les parcours</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // ─── Bindings ──────────────────────────────────────────────────
  container.querySelector('#btn-back').addEventListener('click', () => {
    navigate('menu');
  });

  const volumeSlider = container.querySelector('#volume-slider');
  const volumeValue = container.querySelector('#volume-value');
  const toggleSound = container.querySelector('#toggle-sound');
  const toggleAnims = container.querySelector('#toggle-anims');
  const toggleTranscription = container.querySelector('#toggle-transcription');

  volumeSlider.addEventListener('input', () => {
    const v = parseInt(volumeSlider.value);
    volumeValue.textContent = v + '%';
    setVolume(v / 100);
  });

  volumeSlider.addEventListener('change', () => sfx_click());

  toggleSound.addEventListener('click', () => {
    toggleSound.classList.toggle('toggle-switch--active');
    sfx_click();
  });

  toggleAnims.addEventListener('click', () => {
    toggleAnims.classList.toggle('toggle-switch--active');
    sfx_click();
  });

  toggleTranscription.addEventListener('click', () => {
    toggleTranscription.classList.toggle('toggle-switch--active');
    sfx_click();
  });

  container.querySelector('#btn-reset').addEventListener('click', () => {
    showCustomConfirm('⚠️ Réinitialiser toute votre progression et vos paramètres ?', () => {
      resetAll();
      navigate('menu');
    });
  });

  const btnAdmin = container.querySelector('#btn-admin');
  const adminDialog = container.querySelector('#admin-dialog');
  const adminPassword = container.querySelector('#admin-password');
  const adminFeedback = container.querySelector('#admin-feedback');
  const adminForm = container.querySelector('#admin-form');
  const settingsContent = container.querySelector('.settings__content');
  const closeAdminDialog = () => { adminDialog.hidden = true; settingsContent.inert = false; adminPassword.value = ''; adminFeedback.textContent = ''; btnAdmin.focus(); };
  const openAdminDialog = () => { adminDialog.hidden = false; settingsContent.inert = true; adminPassword.focus(); };
  const unlockAdmin = () => {
    if (adminPassword.value !== 'admin123' && adminPassword.value !== 'harpytech') {
      adminFeedback.textContent = 'Mot de passe incorrect.';
      adminPassword.select();
      return;
    }
    unlockAllLevels();
    navigate('hub');
  };
  btnAdmin.addEventListener('click', openAdminDialog);
  container.querySelector('#admin-cancel').addEventListener('click', closeAdminDialog);
  adminForm.addEventListener('submit', (event) => { event.preventDefault(); unlockAdmin(); });
  adminDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeAdminDialog(); }
    if (event.key !== 'Tab') return;
    const focusable = [...adminDialog.querySelectorAll('button, input')].filter((element) => !element.disabled);
    const current = focusable.indexOf(document.activeElement);
    const next = event.shiftKey ? (current <= 0 ? focusable.length - 1 : current - 1) : (current === focusable.length - 1 ? 0 : current + 1);
    event.preventDefault(); focusable[next].focus();
  });

  container.querySelector('#btn-save').addEventListener('click', () => {
    const newSettings = {
      volume: parseInt(volumeSlider.value) / 100,
      soundEnabled: toggleSound.classList.contains('toggle-switch--active'),
      animationsEnabled: toggleAnims.classList.contains('toggle-switch--active'),
      transcriptionEnabled: toggleTranscription.classList.contains('toggle-switch--active'),
    };
    saveSettings(newSettings);
    setVolume(newSettings.volume);
    setSoundEnabled(newSettings.soundEnabled);

    const saveBtn = container.querySelector('#btn-save');
    saveBtn.textContent = '✅ Sauvegardé !';
    saveBtn.style.background = 'linear-gradient(135deg, var(--green-600), var(--green-500))';
    setTimeout(() => {
      saveBtn.textContent = '💾 Sauvegarder les paramètres';
      saveBtn.style.background = '';
    }, 2000);
  });
}
