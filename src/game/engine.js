import { getMission, getMissionsForRole } from '../data/missions.js';
import { getRole } from '../data/roles.js';
import { startSession, sendMessage, evaluateMission, requestScreening } from './ai.js';
import { loadSave, recordMissionResult, isMissionUnlocked } from '../utils/storage.js';
import { offlineFallbackFeedback } from './evaluation.js';

class GameEngine {
  constructor() { this.sessionId = null; this.mission = null; this.patient = null; this.screenings = []; this.messages = []; this.actions = []; this.isWaiting = false; this.isFinished = false; this.onMessage = null; this.onTyping = null; this.onError = null; this.onGuardrailFail = null; this.onFinish = null; this.onEvaluating = null; this.onScreening = null; }
  async startMission(missionId) {
    const mission = getMission(missionId); if (!mission) throw new Error('Mission introuvable.');
    const save = loadSave(); const missions = getMissionsForRole(mission.roleId);
    if (!getRole(mission.roleId)?.unlocked || !isMissionUnlocked(mission, missions, save)) throw new Error('Cette mission est verrouillée.');
    this.mission = mission; this.messages = []; this.actions = []; this.isFinished = false;
    const data = await startSession({ missionId, roleId: mission.roleId }); this.sessionId = data.sessionId; this.patient = data.patient; this.screenings = data.screenings || [];
    return { mission, patient: data.patient, screenings: this.screenings };
  }
  async sendDoctorMessage(text) {
    if (this.isWaiting || this.isFinished || !text.trim()) return; this.isWaiting = true;
    try { this.messages.push({ role: 'doctor', content: text.trim() }); this.onMessage?.(this.messages.at(-1)); this.onTyping?.(true); const response = await sendMessage(this.sessionId, text.trim()); this.onTyping?.(false); if (response.guardrailFailed) { this.messages.pop(); this.onGuardrailFail?.(response.reason || 'Message unavailable.'); return; } this.messages.push({ role: 'patient', content: response.message }); this.onMessage?.(this.messages.at(-1)); }
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
  async useScreening(screeningId) { if (this.isWaiting || this.isFinished) return; this.isWaiting = true; try { const data = await requestScreening(this.sessionId, screeningId); this.screenings = data.screenings || []; if (data.observation) { this.messages.push({ role: 'observation', content: data.observation.text, label: data.observation.label }); this.onMessage?.(this.messages.at(-1)); } this.onScreening?.(this.screenings); } catch (error) { this.onError?.(error.message); } finally { this.isWaiting = false; } }
  static getMissionsWithStatus(roleId = 'dietetics') { const save = loadSave(); const missions = getMissionsForRole(roleId); return missions.map((mission) => ({ ...mission, unlocked: isMissionUnlocked(mission, missions, save), progress: save.missionProgress[mission.id] || null })); }
}
export default GameEngine;
