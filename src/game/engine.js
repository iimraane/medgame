import { getMission, getMissionsForRole } from '../data/missions.js';
import { getRole } from '../data/roles.js';
import { startSession, sendMessage, evaluateMission, useConsultationTool, recordSecureNextStep, submitNursingHypothesis, submitPsychologyFormulation } from './ai.js';
import { loadSave, recordMissionResult, isMissionUnlocked, getRecentVariantIds, recordVariantId } from '../utils/storage.js';
import { offlineFallbackFeedback } from './evaluation.js';

class GameEngine {
  constructor() { this.sessionId = null; this.mission = null; this.patient = null; this.tools = []; this.differential = []; this.symptomPins = []; this.requiresSecureNextStep = false; this.messages = []; this.actions = []; this.isWaiting = false; this.isFinished = false; this.onMessage = null; this.onTyping = null; this.onError = null; this.onGuardrailFail = null; this.onFinish = null; this.onEvaluating = null; this.onTools = null; this.onNursingSymptoms = null; }
  async startMission(missionId) {
    const mission = getMission(missionId); if (!mission) throw new Error('Mission introuvable.');
    const save = loadSave(); const missions = getMissionsForRole(mission.roleId);
    if (!getRole(mission.roleId)?.unlocked || !isMissionUnlocked(mission, missions, save)) throw new Error('Cette mission est verrouillée.');
    this.mission = mission; this.messages = []; this.actions = []; this.symptomPins = []; this.isFinished = false;
    const data = await startSession({ missionId, roleId: mission.roleId, recentVariantIds: getRecentVariantIds(missionId) }); this.sessionId = data.sessionId; this.patient = data.patient; this.tools = data.tools || []; this.differential = data.differential || []; this.requiresSecureNextStep = Boolean(data.requiresSecureNextStep); recordVariantId(missionId, data.variantId);
    return { mission, patient: data.patient, tools: this.tools, differential: this.differential, requiresSecureNextStep: this.requiresSecureNextStep };
  }
  async sendDoctorMessage(text) {
    if (this.isWaiting || this.isFinished || !text.trim()) return; this.isWaiting = true;
    try { this.messages.push({ role: 'doctor', content: text.trim() }); this.onMessage?.(this.messages.at(-1)); this.onTyping?.(true); const response = await sendMessage(this.sessionId, text.trim()); this.onTyping?.(false); if (response.guardrailFailed) { this.messages.pop(); this.onGuardrailFail?.(response.reason || 'Message unavailable.'); return; } this.messages.push({ role: 'patient', content: response.message }); this.onMessage?.(this.messages.at(-1)); if (response.nursing) { this.symptomPins = response.nursing.pins || []; this.onNursingSymptoms?.(response.nursing.symptoms || [], this.symptomPins); } }
    catch (error) { this.onTyping?.(false); this.onError?.(error.message); } finally { this.isWaiting = false; }
  }
  async finishMission() {
    if (this.isFinished || this.isWaiting) return; this.isFinished = true; this.isWaiting = true; this.onEvaluating?.(true);
    const transcript = this.messages.filter((message) => message.role === 'doctor').map((message) => message.content).join('\n');
    let result;
    try { result = await evaluateMission(this.sessionId); } catch { result = offlineFallbackFeedback(this.mission, transcript, this.actions); }
    let save; try { save = recordMissionResult(this.mission.id, result); } catch { save = loadSave(); }
    this.onEvaluating?.(false); this.onFinish?.({ ...result, mission: this.mission, progress: save.missionProgress[this.mission.id] }); this.isWaiting = false;
  }
  recordAction(action) { if (!this.actions.includes(action)) this.actions.push(action); }
  async useTool(toolId) { if (this.isWaiting || this.isFinished) return; this.isWaiting = true; try { const data = await useConsultationTool(this.sessionId, toolId); this.tools = data.tools || []; if (data.tool) this.onMessage?.({ role: 'tool', ...data.tool }); this.onTools?.(this.tools); } catch (error) { this.onError?.(error.message); } finally { this.isWaiting = false; } }
  async recordSecureAction() { try { const result = await recordSecureNextStep(this.sessionId); if (result.recorded) { this.actions.push('secure-next-step'); return true; } return false; } catch (error) { this.onError?.(error.message); return false; } }
  async submitNursingHypothesis(diseaseId) {
    if (this.isFinished || this.isWaiting || !diseaseId) return;
    this.isWaiting = true; this.onEvaluating?.(true);
    try {
      const result = await submitNursingHypothesis(this.sessionId, diseaseId);
      this.isFinished = true;
      const save = recordMissionResult(this.mission.id, result);
      this.onFinish?.({ ...result, mission: this.mission, progress: save.missionProgress[this.mission.id] });
    } catch (error) { this.onError?.(error.message); }
    finally { this.isWaiting = false; this.onEvaluating?.(false); }
  }
  async submitPsychologyFormulation(motifId, board, nextStep) {
    if (this.isFinished || this.isWaiting || !motifId) return;
    this.isWaiting = true; this.onEvaluating?.(true);
    try {
      const result = await submitPsychologyFormulation(this.sessionId, motifId, board, nextStep);
      this.isFinished = true; const save = recordMissionResult(this.mission.id, result);
      this.onFinish?.({ ...result, mission: this.mission, progress: save.missionProgress[this.mission.id] });
    } catch (error) { this.onError?.(error.message); }
    finally { this.isWaiting = false; this.onEvaluating?.(false); }
  }
  static getMissionsWithStatus(roleId = 'dietetics') { const save = loadSave(); const missions = getMissionsForRole(roleId); return missions.map((mission) => ({ ...mission, unlocked: isMissionUnlocked(mission, missions, save), progress: save.missionProgress[mission.id] || null })); }
}
export default GameEngine;
