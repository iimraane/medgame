// ─── Level Select View ───────────────────────────────────────────

import { navigate } from '../main.js';
import GameEngine from '../game/engine.js';
import { getDifficultyInfo, starsHTML } from '../utils/helpers.js';
import { getPerkUnlockedAtLevel } from '../data/perks.js';
import { sfx_click } from '../utils/sound.js';

export function renderLevelSelect(container) {
    const levels = GameEngine.getLevelsWithStatus();

    const grid = levels.map((level) => {
        const diff = getDifficultyInfo(level.difficulty);
        const perk = getPerkUnlockedAtLevel(level.id);
        const stars = level.score ? starsHTML(level.score.stars) : starsHTML(0);

        return `
      <div class="level-card ${level.unlocked ? '' : 'level-card--locked'}" data-level="${level.id}">
        <div class="level-card__number" style="color: ${diff.color}">
          Niveau ${level.id}
        </div>
        <div class="level-card__name">${level.name}</div>
        <div class="level-card__desc">${level.description}</div>
        <div class="level-card__footer">
          <span class="level-card__difficulty" style="background: ${diff.bg}; color: ${diff.color}">
            ${diff.label}
          </span>
          <span class="level-card__stars">${stars}</span>
        </div>
        ${perk ? `
          <div class="level-card__perk">
            🎁 Débloque : ${perk.emoji} ${perk.name}
          </div>
        ` : ''}
      </div>
    `;
    }).join('');

    container.innerHTML = `
    <div class="view level-select">
      <div class="level-select__header">
        <button class="btn btn--icon btn--secondary" id="btn-back">←</button>
        <h1>Sélection du Niveau</h1>
      </div>
      <div class="level-select__grid">
        ${grid}
      </div>
    </div>
  `;

    // Back button
    container.querySelector('#btn-back').addEventListener('click', () => {
        navigate('menu');
    });

    // Level cards
    container.querySelectorAll('.level-card:not(.level-card--locked)').forEach((card) => {
        card.addEventListener('click', () => {
            sfx_click();
            const levelId = parseInt(card.dataset.level);
            navigate('game', { levelId });
        });
    });
}
