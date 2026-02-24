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

        <div class="settings__section" style="margin-top:32px">
          <div class="settings__section-title">À propos</div>
          <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6">
            <strong>MedGame</strong> v2.0 — Jeu de simulation de consultations médicales.<br>
            Les patients sont générés par IA (GPT-4o-mini) avec des personnalités et pathologies aléatoires.<br>
            Ce jeu est à but éducatif et ludique, il ne remplace en aucun cas un avis médical.
          </p>
        </div>

        <div style="margin-top:20px">
          <button class="btn btn--primary" id="btn-save" style="width:100%">
            💾 Sauvegarder les paramètres
          </button>
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
  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      const pwd = prompt('Veuillez entrer le mot de passe administrateur :');
      if (pwd === 'admin123' || pwd === 'harpytech') {
        unlockAllLevels();
        showCustomConfirm('👑 Mode Admin activé. Tous les niveaux sont débloqués !', () => {
          navigate('menu');
        });
      } else if (pwd !== null) {
        alert('Mot de passe incorrect.');
      }
    });
  }

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
