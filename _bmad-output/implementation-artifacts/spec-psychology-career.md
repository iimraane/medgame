---
title: 'Psychology Formulation Campaign'
type: 'feature'
created: '2026-10-26'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 1
baseline_commit: 'fcfb4768e60dff97a3bf1859d72819b8b19ecff4'
context:
  - '_bmad-output/specs/spec-psychology-career/SPEC.md'
  - '_bmad-output/specs/spec-psychology-career/psychology-campaign.md'
  - '_bmad-output/specs/spec-psychology-career/psychology-tools.md'
  - '_bmad-output/specs/spec-psychology-career/psychology-verification.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Psychology is a locked campus role despite an approved ten-level campaign design. The game needs a replayable fictional consultation loop that teaches attentive questioning, context-based formulation and safe orientation, with the evidence quality and anti-repetition of Nursing.

**Approach:** Open Psychology as a role-scoped campaign with 30 approved French motif cards, cumulative pools of 3/6/10/15/20/22/24/26/28/30, six or more coherent cases per motif, two shared patient traits, and five cumulative supports unlocked at levels 1/3/5/7/9. The player investigates through dialogue and evidence, manages an authorized formulation board, then submits an educational working formulation. As explicitly clarified by the user, Psychology uses Nursing’s binary debrief: the right motif validates the mission and any other motif must be replayed.

## Boundaries & Constraints

**Always:** Keep all people and evidence fictional, authored and server-private until authorized; retain the approved French labels verbatim; use exactly two distinct traits from the shared 38-trait pool; make relevant questions useful even at high difficulty; select case-compatible evidence variants rather than a fixed motif-to-tool bundle; preserve Dietetics and Nursing behavior, saves and role isolation. Psychology progression is binary like Nursing: the correct selected motif advances; an incorrect motif does not. Display the current level’s eligible motifs in a persistent right rail; each public card has a concise description and 3–5 broad possible signs, but no case fact, scoring rule or answer leak. Supports are optional and repeat-openable. Add deterministic rendered-browser screenshots plus semantic interaction tests for the complete Psychology path.

**Never:** Present real diagnosis, treatment, prescription, crisis care or a clinical service; use AI to invent private records; grant mastery for a wrong motif; expose a private blueprint, decisive fact or evaluator rubric to the browser; unlock unrelated roles or redesign the campus.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Start mission | Unlocked Psychology level | Server selects only from its cumulative pool, one fresh compatible blueprint, traits and safe public motif cards | Invalid role/mission returns the existing safe start failure |
| Inspect motif | Short activation on a right-rail card | Public label, description and possible signs open; active case stays secret | Unknown or out-of-pool id cannot change session state |
| Open support | Unlocked authorized support | Its selected case-compatible visual evidence opens repeatedly and adds context once | Locked, forged or cross-session support returns no evidence |
| Add formulation fact | Transcript or support fact already authorized | Fact is visible in the editable board and recorded for evaluation | Client-invented/private fact is rejected |
| Submit formulation | Selected motif | Psychology debrief is binary: correct motif validates, wrong motif is replayed | Invalid/expired submissions fail safely |

</frozen-after-approval>

## Code Map

- `src/data/roles.js`, `src/data/missions.js`, `src/ui/campusHub.js`, `src/ui/levelSelect.js` -- role unlock, generic campus routing and ordered role missions; add Psychology without special routes.
- `src/data/nursingCampaign.js` -- browser-safe card, pool and cumulative-pool pattern; add `src/data/psychologyCampaign.js` with only public motif-card fields.
- `server/missions.js`, `server/nursingDossiers.js` -- Nursing’s six-case factory, replay selection, evidence authorization and dossier pattern; add Psychology’s server-only blueprint/evidence catalogue and role-specific helpers without leaking it to `src/data`.
- `server/missionPatient.js`, `server/missionEvaluation.js`, `server/server.js` -- patient prompting, role-safe evaluation, session lifecycle and Nursing API dispatch; add Psychology branches/endpoints and preserve current roles.
- `server/patientTraits.js` -- shared 38-trait pool; reuse unchanged for Psychology.
- `src/game/ai.js`, `src/game/engine.js`, `src/ui/chat.js`, `src/ui/debrief.js`, `src/style.css` -- generic consultation flow plus Nursing rail/modal; add Psychology tool renderers, formulation-board state, right rail, submission and role-aware debrief copy.
- `src/utils/storage.js` -- generic role progress and recent variant IDs; retain its role-scoped sequencing and extend replay data only if needed for full Psychology fingerprints.
- `tests/campaign.test.js`, `tests/psychologyRoutes.test.js`, `tests/engine.test.js` -- catalog, authorization, HTTP and client-state regression coverage.
- `package.json`, `package-lock.json`, `playwright.config.js`, `tests/visual/` -- add browser/visual test scripts, deterministic fixtures and reviewed screenshot snapshots.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/psychologyCampaign.js`, `src/data/missions.js`, `src/data/roles.js` -- define all 30 approved cards, exact pools and ten missions; open only Psychology.
- [x] `server/psychologyDossiers.js`, `server/missions.js` -- author six private blueprints per motif, five compatible evidence types and no-repeat selection/fingerprint validation.
- [x] `server/missionPatient.js`, `server/missionEvaluation.js`, `server/server.js` -- add staged Psychology patient dialogue, tool/formulation authorization and evaluated safe submission without weakening existing routes.
- [x] `src/game/ai.js`, `src/game/engine.js`, `src/ui/chat.js`, `src/ui/debrief.js`, `src/style.css` -- render the accessible right motif rail, five distinct supports, editable authorized formulation board and Psychology results.
- [x] `tests/campaign.test.js`, `tests/psychologyRoutes.test.js`, `tests/engine.test.js` -- prove pools, cards, variants, traits, evidence gates, forged-request rejection, scoring and role isolation.
- [x] `package.json`, `package-lock.json`, `playwright.config.js`, `tests/visual/` -- add deterministic browser fixtures and screenshot tests for campus, map, opening, all supports, rail, board, selection and debrief states.

**Acceptance Criteria:**
- Given any Psychology level, when it starts repeatedly, then every selected motif belongs to exactly that level’s cumulative pool and no identical case fingerprint repeats before exhaustion.
- Given a right-rail card, when the player opens it, then its French label, short description and 3–5 possible signs appear without identifying the active case.
- Given a relevant question or authorized support, when it reveals a fact, then the player can add it to the formulation board; a forged fact cannot be stored or credited.
- Given two compatible sessions for one motif, when replayed, then their opening and evidence differ while their private facts remain internally coherent.
- Given a correct Psychology motif selection, when the consultation is submitted, then the mission is validated; a wrong motif is always replayed.
- Given each required visual state, when browser tests run from deterministic fixtures, then semantic assertions and screenshot snapshots pass.

## Implementation Notes

- Added a role-scoped Psychology campaign and server-only dossier catalogue; public motif cards retain only labels, summaries and broad signs.
- Added deterministic API-intercepted Playwright fixtures and reviewed local screenshot baselines without any live-model dependency.

## Spec Change Log

- Review loop 1: reviewers found that the implementation needs an explicit result contract, structured authorized board facts, motif-specific case discriminators and non-fixed evidence variants. Re-derive the implementation from these preserved requirements; avoid the known-bad state where a successful Psychology submission crashes in debrief or a generic replay makes the motif a guess.

## Review Triage Log

| Finding | Verdict | Route | Evidence |
| --- | --- | --- | --- |
| Real Psychology result lacks the debrief fields. | high | patch | `renderDebrief` reads `scores`, `improvement` and `safetyAcknowledged`; the server evaluator omits them. |
| Support strings added by the UI are rejected by server substring authorization. | high | patch | UI formats `Matin : …` while server searches JSON serialization; a real support-derived board entry fails. |
| Motif detail reads `summary` while public cards use `description`. | medium | patch | The required concise description renders empty in production. |
| Initial Psychology opening is not rendered into the chat. | medium | patch | The initial bubble is empty and `patient.opening` is never inserted as a message. |
| Cases and supports are generic across motifs, evidence is a fixed all-tools bundle, replay is only six IDs, and the board is not editable/structured. | high | bad_spec | The accepted intent requires distinguishable coherent variants, non-fixed case-compatible evidence, fingerprint anti-repeat and an editable authorized board; the implementation plan needs concrete data/state contracts before re-derivation. |
| Exploration, communication and safe orientation are too permissive. | high | bad_spec | Counting arbitrary messages, duplicate substrings and a keyword regex cannot meet the approved exploration, respectful communication and safe-orientation contract. |

## Design Notes

The right rail is a differential-learning aid, not an answer key. Its broad signs deliberately overlap; only dialogue, supports and the player’s formulation make one card more appropriate than another. The support set has five visibly distinct forms: journal, timeline, relationship map, reaction chain and daily-life fragments.

## Verification

**Commands:**
- `npm test` -- expected: all existing and Psychology Node/API tests pass.
- `npm run build` -- expected: production bundle and distribution verification pass.
- `npm run test:browser` -- expected: deterministic interaction and accessibility tests pass.
- `npm run test:visual` -- expected: reviewed screenshot snapshots pass.
- `git diff --check` -- expected: no whitespace errors.
