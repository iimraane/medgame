---
title: 'MedGame Career Mode Foundation'
type: 'feature'
created: '2026-10-20'
status: 'done'
route: 'dispatch'
baseline_commit: 'ce89cfe9b301e4ecbd40440d70cf3e80ea82ff40'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** MedGame already delivers an engaging AI patient consultation, but its linear diagnosis-only campaign, binary scoring, and clinical-dashboard visual language make sessions repetitive and do not reflect the distinct learning objectives of healthcare professions. The current loop rewards guessing the condition rather than demonstrating a safe, observable care process.

**Approach:** Establish a career-mode foundation around profession-specific clinical missions while preserving the reusable AI-patient consultation engine. Ship dietetics as the reference vertical slice for health students and interested non-professionals, with pedagogical scaffolding that can be turned off or condensed. The initial campaign contains three compact cases: everyday constraints around food, a sustainable habit-change follow-up, and a safety-boundary/orientation case. The game will use a hybrid identity: a warm clinic hub with compact, replayable case missions, a competency-based debrief, and an expressive presentation that stays credible.

## Boundaries & Constraints

**Always:** Keep MedGame explicitly educational and fictional; never present generated content as patient-specific clinical guidance. Treat dietetics as personalized assessment, education, prevention, and realistic goal setting, not a calorie-counting contest. Use plain language with optional pedagogical definitions so students learn correct terms and interested players can follow them. Preserve the existing chat, voice input, AI patient, modifier, and local-save foundations where they fit. Score observable actions and feedback by role-specific competencies, including safety and communication, not just the final answer. Keep all clinical truth and model prompts server-side.

**Never:** Do not build all proposed professions in the initial increment; do not introduce a database, accounts, multiplayer, payments, or a large frontend framework. Do not make humour, collectible mechanics, or a high-energy visual direction diminish the seriousness of urgent, mental-health, or vulnerable-patient scenarios.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| New career session | Player selects an unlocked mission for the selected role | The game opens a role-relevant briefing, patient interaction, available tools, and concrete objectives | Locked roles/missions remain visibly unavailable with their unlock requirement |
| Consultation resolution | Player completes or exits a mission | A multi-axis debrief explains evidence, missed risks, communication, and next practice action; progression is calculated transparently | AI feedback failure preserves the outcome and returns deterministic fallback feedback |
| Repeated case | A player retries a previously completed mission | The player can improve competency scores without losing prior progress; case framing varies without invalidating learning objectives | Invalid or expired session shows the existing recoverable error state |

</frozen-after-approval>

## Code Map

- `src/data/cards.js` -- canonical condition cards; refactor toward reusable case data plus profession-specific objectives, actions, and feedback criteria rather than duplicating disease content.
- `src/data/levels.js` -- current 20-level linear campaign; replace or adapt into role mission maps and unlock metadata.
- `src/data/modifiers.js` -- patient behavioral traits; preserve and make their effects legible as mission constraints and communication consequences.
- `src/data/perks.js` -- current information shortcuts; evolve into role tools with explicit cost, purpose, and availability.
- `src/game/engine.js` -- state, level progress, and binary completion; owns the new mission state, competency outcome, and safe fallback behavior.
- `src/utils/storage.js` -- browser-only progress schema; migrate existing saves defensively and retain reset/settings behavior.
- `src/ui/menu.js`, `src/ui/levelSelect.js`, `src/ui/chat.js`, `src/style.css` -- current menu, linear level selection, consultation UI, and clinical visual system; build the career map, briefing, debrief, and game-oriented visual language without reducing accessibility.
- `server/server.js` -- session creation and every AI interaction; add role-aware prompts and structured, server-validated learning feedback while retaining secret case data server-side.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/roles.js`, `src/data/missions.js`, `src/data/cards.js` -- define a role-agnostic mission contract and three dietetics cases: everyday food constraints, habit-change follow-up, and safety-boundary/orientation. Express food-history objectives, realistic goal setting, adherence barriers, safety flags, scoring rubric, and unlocks as data.
- [x] `src/game/engine.js`, `src/utils/storage.js` -- replace binary-only level resolution with mission progress and multi-axis competency results; migrate the legacy save shape without discarding it.
- [x] `server/server.js` -- create role-aware session and evaluation flows with structured output validation and deterministic fallback feedback.
- [x] `src/ui/menu.js`, `src/ui/levelSelect.js`, `src/ui/chat.js`, `src/ui/debrief.js`, `src/style.css` -- introduce the selected game identity, career map, mission briefing, in-session objectives, and role-aware debrief.
- [x] `tests/engine.test.js`, `tests/storage.test.js` -- cover role availability, legacy save migration, success/failure scoring, retry behavior, and AI-feedback fallback.
- [x] `README.md` -- document the educational boundary, supported role, local setup, and the revised core loop.

**Acceptance Criteria:**
- Given a new player, when they choose the implemented role and an unlocked mission, then they receive a role-specific briefing and can identify the mission objectives before interacting with the patient.
- Given a completed mission, when the player resolves it correctly or incorrectly, then the debrief reports distinct competency results, explains at least one actionable improvement, and awards progression without relying only on the diagnosis guess.
- Given a dietetics mission, when the player proposes a plan that ignores stated budget, culture, time, preferences, or readiness to change, then the communication and plan-realism results make that mismatch explicit even if nutritional facts are correct.
- Given a mission with a predefined safety boundary, when the player fails to acknowledge the boundary or select an orientation/escalation action, then the mission cannot award a mastery result and the debrief explains why.
- Given an existing local save, when the updated app loads it, then existing progress remains usable and no JSON/storage error blocks entry to the game.
- Given a case involving urgency or psychological vulnerability, when the game presents feedback and rewards, then safety/escalation and respectful communication remain explicit and the presentation is not frivolous.

## Implementation Notes

## Spec Change Log

- Server-owned case privacy — the initial implementation exposed private case constraints and fallback scoring rubrics through client mission data. The design now requires a public mission manifest for UI copy and a server-only case definition for prompts, constraints, rubrics, and evaluation; offline failure must return a safe non-mastery fallback without private case data. This avoids revealing hidden scenario truth while preserving the visible mission briefing and deterministic recoverability.

## Review Triage Log

- high/patch — Safety keywords alone could grant credit; evaluation now requires the recorded `orientation` action for the boundary mission.
- medium/defer — Deterministic keyword scoring can be gamed by stuffing terms; this is an intentionally safe fallback rather than clinical model judgment and needs a future semantic evaluator.
- medium/patch — English-only keywords would miss normal French play; French equivalents are now included in every dietetics rubric.
- low/false — Mission progression after any attempt was not an explicit product defect, but was tightened to require previous mastery.
- medium/patch — The in-session panel disclosed case constraints; it now directs the learner to discover them in conversation.
- medium/patch — Role tools were only descriptive; the goal prompt and an explicit safety-orientation control are now interactive and recorded.
- medium/patch — Debrief lacked traceability; every competency now reports whether observable evidence was recorded.
- medium/patch — Guardrail rejection lacked visible feedback; the chat now reports the rejection reason.
- medium/patch — Legacy saves were structurally preserved but unused; migrated progress now opens the first career mission.
- medium/patch — A storage write error could block the debrief; completion now falls back to the readable save state.
- false — The edge-case review referenced an `onMessageRemoval` implementation that is not present in this diff; guardrail rejection already removes the transient message.
- false — The edge-case review referenced helper functions not present in this diff; the verified safety implementation is the explicit action check above.
- low/patch — Array-shaped mission progress could not be persisted correctly; migration now rejects arrays.
- high/bad_spec — `src/data/missions.js` delivers hidden patient constraints and scoring rubrics to the browser even though the frozen boundary requires clinical truth and prompts to remain server-side; the current client fallback design must be re-derived without those secrets.
- false — The safety-orientation button records an explicit learner action, which is exactly the selected orientation/escalation action required by the approved scope; the spec does not require free-text proof of that choice.
- false — Directly calling `/game/api/start` can bypass a UI lock only for a browser-local game with no account or server-owned progress; locked missions remain visibly unavailable as specified and no protected data or shared progression is exposed.
- medium/patch — `finishMission()` evaluates while a message request can still be in flight, so the server can omit the learner's final response; completion must wait until the active request has settled.
- false — Session cleanup already iterates the in-memory map and removes sessions older than `SESSION_TTL`; `createdAt` is used by that existing cleanup.
- carried medium/defer — `src/game/evaluation.js` still awards deterministic fallback points through broad substring matches, so keyword stuffing remains possible; this is the previously logged future semantic-evaluation limitation.
- medium/patch — Generic per-axis evidence does not identify the observed evidence or the missing factor, weakening the transparent debrief promised by the spec; return concise matched and missing evidence per axis.
- medium/patch — Context feedback is identical for every low context score and cannot explain which real-life factor was missed; derive the missing factors from the mission rubric.
- carried medium/defer — A plan can name constraints without accommodating them because fallback scoring is keyword-based; this is the same carried semantic-evaluation limitation.
- medium/patch — Malformed persisted mission-progress entries can make completion fail to retain a result; sanitize each progress record before read/write.
- medium/patch — README retains a doctor-diagnosis narrative that conflicts with the shipped dietetics career loop and educational boundary; replace it with current product documentation.
- medium/patch — Tests do not prove that a recorded orientation action is serialized into the evaluation request; add an engine completion-flow test with a mocked fetch.
- medium/patch — Tests do not prove the evaluation-failure branch produces a persisted, renderable deterministic fallback; add an engine completion-flow test for a rejected evaluation request.
- medium/patch — Edge-case tracing confirms the in-flight-message race can omit the final response from evaluation; block or disable completion until the pending request resolves.
- false — The reported `sanitizeProgress` guard does not exist in the current source, and a null entry does not crash the hub because the menu checks `mission.progress` before property access; persistence sanitization remains tracked separately above.
- carried medium/defer — Keyword-only fallback scoring cannot establish that a proposed plan accommodates constraints; this is the same carried semantic-evaluation limitation.

## Design Notes

The reusable unit is a `mission`, not a disease. A mission binds a patient case to a role, setting, objectives, permitted tools, evaluation rubric, and debrief. The same patient condition can later support different missions without copying its clinical facts: a GP assesses and forms hypotheses; a nurse observes and escalates; a pharmacist reconciles treatment.

The first release should emphasize mastery over grinding: a small number of clear, replayable dietetics missions with four transparent score axes: food-history gathering, contextual understanding, communication, and safe/realistic planning. Facts alone cannot compensate for an unsafe or unworkable plan. The hub provides an inviting team-and-clinic fantasy; compact missions provide the pace. The visual direction can be playful and confidently stylized, but claims, risks, and patient interaction remain grounded.

The reference cases represent the professional scope rather than medical prescription: (1) a patient whose budget, schedule, and preferences complicate balanced eating; (2) a follow-up in which adherence is more valuable than perfection; (3) a conversation where the appropriate achievement is recognizing a boundary and directing the person to the right care pathway. Case data must make the expected safe action explicit so evaluation never relies on model improvisation alone.

Mission data is split by trust boundary. The browser receives only the public identity, briefing, visible objectives, permitted tool labels, and unlock order. The server owns patient context, hidden constraints, safety requirements, prompts, scoring rubrics, matched-evidence explanations, and final evaluation. If the browser cannot reach evaluation, it produces a deterministic, non-mastery fallback without revealing private case data.

## Verification

**Commands:**
- `npm run build` -- expected: Vite creates the production bundle without errors.
- `node --test tests/engine.test.js tests/storage.test.js` -- expected: mission progression, migration, retry, and fallback cases pass.

**Manual checks:**
- Start a first mission, resolve it both correctly and incorrectly, retry it, and inspect the briefing/debrief, unlock state, and fallback feedback with the browser network disabled after session creation.
