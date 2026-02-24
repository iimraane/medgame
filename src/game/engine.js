// ─── Game Engine ─────────────────────────────────────────────────
// Core game logic: manages game state, chat flow, scoring, and level progression.
// NO message limit — difficulty comes from the AI patient behavior.

import { getLevel, LEVELS } from '../data/levels.js';
import { getCardsForLevel } from '../data/cards.js';
import { getUnlockedPerks, getPerkUnlockedAtLevel } from '../data/perks.js';
import { startSession, sendMessage, guessDiagnosis, requestExams } from './ai.js';
import { loadSave, updateLevelScore, unlockCards } from '../utils/storage.js';

class GameEngine {
    constructor() {
        this.currentLevel = null;
        this.sessionId = null;
        this.patient = null;
        this.messages = [];       // { role: 'doctor'|'patient', content: string }
        this.isWaiting = false;
        this.isFinished = false;
        this.messageCount = 0;
        this.onMessage = null;
        this.onTyping = null;
        this.onError = null;
        this.onFinish = null;
        this.onGuardrailFail = null;
        this.onEvaluating = null;
        this.perksUsed = {
            lab: false,
            coffee: false,
            imaging: false,
        };
    }

    /**
     * Start a new level — creates session on server
     */
    async startLevel(levelId) {
        const level = getLevel(levelId);
        if (!level) throw new Error(`Level ${levelId} not found`);

        this.currentLevel = level;
        this.messages = [];
        this.isWaiting = false;
        this.isFinished = false;
        this.messageCount = 0;

        // Create session on server (prompt/patient generated server-side)
        const { sessionId, patient } = await startSession(levelId);
        this.sessionId = sessionId;
        this.patient = patient;

        // Unlock new cards for this level
        const newCards = unlockCards(level.cardPool);

        // Get available cards and perks
        const save = loadSave();
        const cards = getCardsForLevel(save.unlockedCards);
        const perks = getUnlockedPerks(save.maxUnlockedLevel);
        const newPerk = getPerkUnlockedAtLevel(levelId);

        return {
            patient: this.patient,
            cards,
            perks,
            newCards,
            newPerk,
            level,
        };
    }

    /**
     * Send a doctor message
     */
    async sendDoctorMessage(text) {
        if (this.isWaiting || this.isFinished) return;

        const trimmed = text.trim();
        if (!trimmed) return;

        this.isWaiting = true;

        try {
            // Add doctor message to local display
            this.messages.push({ role: 'doctor', content: trimmed });
            this.messageCount++;
            if (this.onMessage) this.onMessage({ role: 'doctor', content: trimmed });

            // Show typing indicator
            if (this.onTyping) this.onTyping(true);

            // Send to server (guardrail + AI in one call)
            const response = await sendMessage(this.sessionId, trimmed);

            if (this.onTyping) this.onTyping(false);

            // Check if guardrail blocked it
            if (response.guardrailFailed) {
                // Remove the doctor message we added
                this.messages.pop();
                this.messageCount--;
                if (this.onGuardrailFail) {
                    this.onGuardrailFail(response.reason || 'Message inapproprié.');
                }
                this.isWaiting = false;
                return;
            }

            // Add patient message
            this.messages.push({ role: 'patient', content: response.message });
            this.messageCount++;
            if (this.onMessage) this.onMessage({ role: 'patient', content: response.message });

        } catch (error) {
            if (this.onTyping) this.onTyping(false);
            if (this.onError) this.onError(error.message);
        }

        this.isWaiting = false;
    }

    /**
     * Finish the consultation and get evaluation/guess result
     */
    async finishConsultation(guessedConditionId) {
        if (this.isFinished) return;
        this.isFinished = true;
        this.isWaiting = true;

        if (this.onEvaluating) this.onEvaluating(true);

        try {
            const result = await guessDiagnosis(this.sessionId, guessedConditionId);

            // Save score (100 if correct, 0 if false) to unlock next level
            const score = result.isCorrect ? 100 : 0;
            const stars = result.isCorrect ? 3 : 0;

            const save = updateLevelScore(this.currentLevel.id, score, stars);

            if (this.onEvaluating) this.onEvaluating(false);

            if (this.onFinish) {
                this.onFinish({
                    ...result,
                    score,
                    stars,
                    levelId: this.currentLevel.id,
                    newMaxLevel: save.maxUnlockedLevel,
                });
            }
        } catch (error) {
            if (this.onEvaluating) this.onEvaluating(false);
            if (this.onError) this.onError('Erreur lors du diagnostic : ' + error.message);
            if (this.onFinish) {
                this.onFinish({
                    score: 0,
                    stars: 0,
                    feedback: 'Impossible de vérifier le diagnostic.',
                    isCorrect: false,
                    levelId: this.currentLevel.id,
                });
            }
        }

        this.isWaiting = false;
    }

    /**
     * Perk: Get laboratory results
     */
    async getLabResults() {
        if (this.perksUsed.lab) return null;
        this.perksUsed.lab = true;
        try {
            const data = await requestExams(this.sessionId, 'lab');
            return data.report;
        } catch (e) {
            console.error(e);
            return "Erreur lors de l'obtention des résultats du labo.";
        }
    }

    /**
     * Perk: Coffee Pause (reduces message count)
     */
    useCoffeePause() {
        if (this.perksUsed.coffee) return false;
        this.perksUsed.coffee = true;
        this.messageCount = Math.max(0, this.messageCount - 5);
        return true;
    }

    /**
     * Perk: Imaging Report
     */
    async getImagingReport() {
        if (this.perksUsed.imaging) return null;
        this.perksUsed.imaging = true;
        try {
            const data = await requestExams(this.sessionId, 'radio');
            return data.report;
        } catch (e) {
            console.error(e);
            return "Erreur lors de l'obtention du rapport d'imagerie.";
        }
    }

    /**
     * Get all levels with their status
     */
    static getLevelsWithStatus() {
        const save = loadSave();
        return LEVELS.map((level) => ({
            ...level,
            unlocked: level.id <= save.maxUnlockedLevel,
            score: save.scores[level.id] || null,
        }));
    }
}

export default GameEngine;
