---
title: 'Nursing Differential Diagnosis Campaign'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'a5adaae02ab175e17cdf93c56ff568ca235498bf'
context:
  - '_bmad-output/implementation-artifacts/dietetics-level-framework.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Soins infirmiers is visible in the campus but cannot be played. The original repository has a diagnosis-guessing prototype, while the current game has a robust campaign, patient-role prompting, replay prevention, and AI debrief. Neither alone provides the intended experience: an IDEL-style fictional home visit where the player investigates symptoms, consults evidence, and identifies a disease from an increasingly large differential list.

**Approach:** Open a ten-level Nursing campaign. Every session randomly selects one disease from the level pool and a compatible patient variant/personality. The patient describes lived symptoms but never knows or names the disease. The player uses a persistent symptom-pin board, optional clinical documents, and a right-rail differential list before submitting one simulated clinical hypothesis. The debrief scores reasoning and communication as well as correctness; it labels this as fictional learning, not real diagnosis.

**Decisions:** Nursing opens from the campus on release. Pools contain 3, 6, 10, 15, 20, 22, 24, 26, 28, then 30 cumulative diseases. Level 4 is **The Forgotten Notebook**: a patient’s ordinary complaint conceals a discriminating symptom in a personal chronology. Existing and new patient personalities are global across every profession.

## Boundaries & Constraints

**Always:** Preserve Dietetics data, saves, and the 70% campaign unlock rule; use six coherent variants per Nursing mission and exclude recently played variants; keep medical data fictional, static, curated, and internally consistent; patient prompts must enforce first-person patient identity, staged disclosure, and no disease name; let players re-open documents and differential cards; make all visible medical language clearly educational.

**Never:** Do not present the game as medical advice or a real diagnostic tool; do not let an AI fabricate lab/imaging results on click; do not expose treatment prescriptions, doses, or instructions; do not award success from a random final click; do not unlock Medicine, Psychology, or Pharmacy; do not add a compulsory side-panel safety button.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior | Error Handling |
|---|---|---|---|
| Start Nursing level | Unlocked mission and valid role | Server chooses a disease from exactly that mission's cumulative pool, one case variant, and global traits; patient opens first | Invalid role/mission keeps safe error-and-return behavior |
| Inspect differential | Player clicks a disease in the right rail | Brief educational card opens without case-specific clues or treatment advice | Unknown disease id is rejected server-side |
| Capture a symptom | Patient has stated a symptom in the transcript | Player can pin it, mark it to verify, or unpin it; pins persist for the session | No symptom may be invented from a client request |
| Open a document | Tool is unlocked and chosen | A static, case-specific document opens repeatedly and adds its facts once to patient/debrief context | Tool outside mission unlock is refused |
| Submit hypothesis | One disease selected after conversation | Result combines correct hypothesis, relevant elicited/pinned symptoms, chronology, communication, and appropriate escalation | Missing/invalid selection explains the action without ending session |

</frozen-after-approval>

## Code Map

- `src/data/cards.js`, `src/data/levels.js`, `server/server.js` -- Legacy diagnosis data and endpoints. Reuse only disease identifiers, descriptions, symptom vocabulary, and the random-condition concept; retire AI-generated exams/treatment trial from the new Nursing path.
- `src/data/roles.js`, `src/data/missions.js` -- Open Nursing and publish ten browser-safe Nursing mission cards while retaining Dietetics cards and all other locks.
- `server/missions.js` -- Current server-only campaign catalog, six-case selection, replay safety, evidence authorisation, and fallback. Generalize role-aware case construction rather than replacing Dietetics.
- `server/missionPatient.js`, `server/missionEvaluation.js` -- Strict patient identity and full-transcript scoring. Add Nursing symptom-disclosure and hypothesis reasoning contracts without weakening Dietetics.
- `server/patientTraits.js` -- Global trait pool and non-verbal cues. Add approved traits here, not in profession-specific content.
- `src/ui/chat.js`, `src/style.css` -- Add the Nursing right rail: disease cards, symptom pins, static-document tools, and final hypothesis action; retain Dietetics tool UI unchanged.
- `src/game/engine.js`, `src/game/ai.js`, `src/utils/storage.js`, `src/ui/levelSelect.js`, `src/ui/campusHub.js` -- Role-scoped routing, session state, result persistence, and unlocked Nursing entry.
- `tests/campaign.test.js`, `tests/roles.test.js`, `tests/storage.test.js`, `tests/engine.test.js` -- Extend regression coverage for role isolation, pool sizes, no-repeat cases, server-authorized symptoms/tools, hypothesis scoring, and save migration.

## Tasks & Acceptance

**Execution:**
- [ ] `src/data/nursingCampaign.js` and `src/data/missions.js` -- Define the 30 curated educational disease cards and ten cumulative pools. Mission themes: first triage (3), fever/head/abdomen (6), fatigue and breathing (10), The Forgotten Notebook (15), several credible paths (20), the decisive detail (22), delayed symptoms (24), false friends (26), weak warning signal (28), and decisive visit (30).
- [ ] `server/missions.js`, `server/server.js` -- Build six disease-compatible cases per mission, select a disease randomly on each start, authorize static evidence, extract only transcript-confirmed symptoms, and validate one final hypothesis.
- [ ] `server/missionPatient.js`, `server/missionEvaluation.js`, `server/patientTraits.js` -- Add role-safe staged symptom disclosure, complete-transcript reasoning evaluation, and the approved global traits: over-prepared, minimising, exhausted, post-bad-experience distrust, embarrassed, highly informed, involved entourage, disorganised, control-seeking, low-health-literacy, and apparently contradictory.
- [ ] `src/ui/chat.js`, `src/style.css`, `src/game/engine.js`, `src/game/ai.js` -- Build the Nursing-only rail with educational disease summaries, confirmed/verify symptom pins, re-openable documents, and hypothesis submission.
- [ ] `src/data/roles.js`, `src/utils/storage.js`, `src/ui/campusHub.js`, `src/ui/levelSelect.js` -- Open Nursing, preserve role-specific progression, and keep all other professions locked.
- [ ] `tests/*.test.js` -- Verify every pool size, random disease selection, six variant rotation, no client-forged symptom/document, correct diagnostic scoring, role isolation, and unchanged Dietetics progression.

**Evidence progression:**
- [ ] Level 2: Patient file (history, declared treatments, allergies, context).
- [ ] Level 4: Visit observations (chronological static vital signs and reported discomfort).
- [ ] Level 6: Laboratory report (case-specific, concise, no automatic interpretation).
- [ ] Level 8: Examination report (static imaging/ECG/specialist note, never a revealed answer).
- [ ] Level 10: Care and transmission history (chronology of visits, calls, and conflicting facts).

**Acceptance Criteria:**
- Given a Nursing level, when it starts twice, then its disease can differ while always belonging to exactly its defined pool.
- Given a Nursing conversation, when a symptom is not present in the patient transcript, then it cannot be pinned or credited by the server.
- Given a player who randomly selects the correct disease without relevant exploration, when they submit it, then they do not receive mastery solely from correctness.
- Given a completed, well-reasoned Nursing consultation, when the selected hypothesis is correct and total exceeds 70%, then only the next Nursing level unlocks.
- Given a Dietetics save, when the Nursing campaign is introduced, then all Dietetics attempts, scores, tools, and unlocks remain intact.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- Blind Hunter — `high` — patched: urgent fictional scenarios now require an explicit escalation/transmission statement before mastery; no compulsory side-panel action was added.
- Blind Hunter — `medium` — patched: a new mission clears prior symptom pins, and dismissed pins no longer receive exploration credit.
- Blind Hunter — `medium` — patched: the final Nursing score uses a full-transcript AI evaluation when available, while the deterministic fallback keeps a conservative gate.
- Blind Hunter — `medium` — rejected: the six variants intentionally vary patient profile, opening and traits; disease-compatible sign sets remain stable so a card cannot become internally contradictory.
- Blind Hunter — `low` — rejected: transcript matching uses exact, prompt-required symptom phrases; an untrusted model response is already bounded by the fictional patient prompt and cannot add a client-forged pin.
- Blind Hunter — `low` — rejected: the retired Dietetics-language test was narrowed to its actual Dietetics scope; Nursing visit observations are an approved feature.
- Edge Case Hunter — `medium` — patched: malformed pin entries are ignored rather than dereferenced, and the requested role must match the server mission role.
- Edge Case Hunter — `low` — rejected: one pin update at a time is a normal UI interaction; each server response is authoritative and a later refresh restores it.
- Edge Case Hunter — `medium` — patched: the staged patient file, visit observations and transmission history now contain the required fictional allergies/context, timed constants, calls and conflicting facts; the examination report remains deliberately non-diagnostic.
- Verification Gap Reviewer — `medium` — patched: `tests/nursingRoutes.test.js` starts an Express Nursing session and covers its start, document, pin, final-hypothesis and expired-session HTTP flow.

## Design Notes

The permanent symptom board is the player’s evidence ledger, not an AI diagnosis. Pins have three states: confirmed, to verify, and dismissed. Five documents are optional supports and deliberately reveal information in stages. Disease cards are broad educational summaries and are identical regardless of the active case; only the patient conversation and authorized documents can narrow the differential.

## Verification

**Commands:**
- `npm test` -- expected: campaign, role, hypothesis, and regression tests pass.
- `npm run build -- --emptyOutDir` -- expected: production bundle completes without errors.
- `git diff --check` -- expected: no whitespace errors.
