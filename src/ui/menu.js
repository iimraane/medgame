// ─── Menu View ───────────────────────────────────────────────────

import { navigate } from '../main.js';
import { loadSave, resetAll } from '../utils/storage.js';
import { showCustomConfirm } from '../utils/helpers.js';

export function renderMenu(container) {
  const save = loadSave();
  const hasSave = save.maxUnlockedLevel > 1;

  container.innerHTML = `
    <div class="view menu">
      <div class="menu__logo">🏥</div>
      <h1 class="menu__title">MedGame</h1>
      <p class="menu__subtitle">Simulation de Consultation Médicale</p>
      <div class="menu__actions">
        ${hasSave ? `
          <button class="btn btn--primary" id="btn-continue">
            ▶️ Continuer (Niveau ${save.maxUnlockedLevel})
          </button>
        ` : ''}
        <button class="btn btn--primary" id="btn-play">
          ${hasSave ? '📋 Sélection de niveau' : '🩺 Commencer'}
        </button>
        <button class="btn btn--secondary" id="btn-settings">
          ⚙️ Paramètres
        </button>
      </div>
    </div>
  `;

  // Bind events
  const continueBtn = container.querySelector('#btn-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      navigate('game', { levelId: save.maxUnlockedLevel });
    });
  }

  container.querySelector('#btn-play').addEventListener('click', () => {
    navigate('levels');
  });

  container.querySelector('#btn-settings').addEventListener('click', () => {
    navigate('settings');
  });
}
