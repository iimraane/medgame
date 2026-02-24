// ─── AI Communication ────────────────────────────────────────────
// Handles all API calls to the backend. Sessions are managed server-side.

const API_BASE = '/game/api';

/**
 * Start a new game session on the server
 */
export async function startSession(levelId) {
    const res = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelId }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data; // { sessionId, patient }
}

/**
 * Send a doctor message (guardrail + AI response handled server-side)
 */
export async function sendMessage(sessionId, message) {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data; // { message } or { guardrailFailed, reason }
}

/**
 * Guess the diagnosis (Endgame flow)
 */
export async function guessDiagnosis(sessionId, guessedConditionId) {
    const res = await fetch(`${API_BASE}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, guessedConditionId }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
}

/**
 * Request exams from the AI (lab or radio)
 */
export async function requestExams(sessionId, examType) {
    const res = await fetch(`${API_BASE}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, examType }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
}
