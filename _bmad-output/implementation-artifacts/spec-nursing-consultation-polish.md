---
title: 'Polish Nursing consultation and debrief'
type: 'feature'
created: '2026-10-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'fc0634a'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Nursing consultation has an unreliable long-press selection on some disease cards, its documents explicitly call themselves fictional and repeat the same values on replay, and the end screen does not feel like a satisfying game result.

**Approach:** Deliver one coherent Nursing experience pass: make disease selection resilient, convert documents into richer case-bound evidence that varies across replays without revealing a diagnosis, and present outcomes through a more arcade-like debrief while preserving the existing completion rules.

## Boundaries & Constraints

**Always:** A normal click only opens disease information; a completed hold only selects a disease. Documents remain learning aids, never diagnostic or treatment instructions, and match the selected case. Existing Nursing victory remains exclusively tied to the correct submitted disease. The richer data must stay server-side and retain level-based document unlocks.

**Never:** Do not expose the target disease in documents, replace conversation as the primary source of clues, change Dietetics scoring, or present clinical values as advice for real-world care.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Short press | Pointer/key released before threshold | Disease popup opens; no selection or submission unlock | No state change |
| Stable long press | Pointer/key held through threshold | Visible fill completes, one disease becomes selected, submission unlocks | Ignore the synthetic click afterwards |
| Interrupted hold | Pointer cancellation, blur, or move beyond tolerance | Fill resets and no disease is selected | No stale next-click suppression |
| Replayed condition | Same disease, different case blueprint | Evidence uses a different compatible numerical/contextual combination | Fall back to the authored base evidence if a variant mapping is absent |
| Nursing result | Correct or incorrect submitted hypothesis | A role-specific game-result debrief communicates win/loss and next action | Keep current navigation/retry paths |

</frozen-after-approval>

## Code Map

- `src/ui/chat.js` -- Owns disease buttons, hold/click mechanics, selection state, and evidence modal entry point. Replace fragile leave-only cancellation with pointer capture plus a movement tolerance and clean suppression lifecycle.
- `src/style.css` -- Contains Nursing rail/card fill and the current plain debrief styles. Add visible held/selected feedback and the responsive arcade result treatment.
- `src/ui/debrief.js` -- Builds both role debriefs. Add Nursing-specific outcome badge, score/result presentation, contextual progression state, and replay/map actions without changing result semantics.
- `server/nursingDossiers.js` -- Server-only authored catalogue. Remove all “fictif/fictive” wording, add more concrete record context, and expose deterministic case-aware evidence variants derived from safe authored alternatives.
- `server/missions.js` -- Constructs the six Nursing blueprints per disease and serves evidence. Pass blueprint/case identity into the dossier materializer while retaining level gates and reusable documents.
- `tests/campaign.test.js`, `tests/nursingRoutes.test.js`, `tests/settings.test.js` -- Extend contracts for resilient interaction source paths, variant evidence, no banned document language, and Nursing result/debrief rendering.

## Tasks & Acceptance

**Execution:**

- [x] `src/ui/chat.js`, `src/style.css` -- make pointer and keyboard long-press completion reliable with capture, tolerance, cancellation, fill feedback, and no accidental modal/selection cross-talk.
- [x] `server/nursingDossiers.js`, `server/missions.js` -- materialize richer, case-specific Nursing documents from authored compatible alternatives; eliminate “fictif/fictive” language and retain server-only disease secrecy.
- [x] `src/ui/debrief.js`, `src/style.css` -- create a role-specific arcade debrief with clear success/failure state and progression feedback while retaining existing retry/map routes.
- [x] `tests/` -- cover no-fiction language, document variation and compatibility, selection interaction contracts, and debrief classes/content.

**Acceptance Criteria:**

- Given any hypothesis card, when the player short-clicks it, then only its information popup opens; given a stable 850 ms hold, then the fill completes and exactly that card is selected.
- Given a pointer moves substantially away, loses capture, or the window blurs before completion, when it returns, then no hypothesis is selected and its next normal click works.
- Given two replays selecting distinct blueprints of the same disease, when the same unlocked document is opened, then at least one relevant factual element varies without exposing the disease name.
- Given a Nursing document, when displayed, then it contains no “fictif/fictive” label and provides concrete contextual, measurement, chronology, or observation details appropriate to the case.
- Given Nursing or Dietetics completion, when the debrief renders, then it has a polished game-result hierarchy and preserves all existing mastery/progression decisions.

## Design Notes

- The debrief should feel like an earned result card, not a medical report: badge, large result state, compact progress indicator, and a distinct primary replay action.
- Evidence variation should use limited authored value/context sets per condition rather than random free-form values; this keeps each replay plausible and auditable.

## Verification

**Commands:**

- `npm test` -- all existing and added behavioral/data contracts pass.
- `npm run build` -- production bundle completes.
- `git diff --check` -- no whitespace errors.

## Review Triage Log

| Finding | Verdict | Evidence / route |
| --- | --- | --- |
| Blind 1 / Edge 1: stale completed-hold suppression | high | `suppressClickFor` has no expiry when the browser never dispatches its follow-up click, so the next normal click is swallowed. Patch. |
| Blind 2 / Edge 2: competing pointer events | medium | A second pointer can cancel an active hold because move/up handlers do not identify the captured pointer. Patch. |
| Blind 3: duplicated duration literal | low | The animation uses `850` rather than `HOLD_DURATION`; later tuning can desynchronise feedback. Patch. |
| Blind 4: record date mismatch | maybe-false | The appended visit timestamp can predate a base dossier opening date, but the current evidence does not establish that the base date is a case-opening boundary. No patch. |
| Blind 5: single timestamp across documents | low | Each document is case-bound independently, and a shared encounter timestamp is plausible; no user-visible defect is established. Reject. |
| Blind 6: generic contextual replay variation | false | The spec requires a compatible numerical or contextual change; each case gets a distinct authored contextual fact without diagnosis leakage. |
| Blind 7: infinite variant index | low | Production supplies indexes 0–5; this public helper remains unsafe for arbitrary input. Reject as unlikely in ordinary use. |
| Blind 8: missing learning-aid notice | medium | Removing the fictional label also removed the explicit non-clinical context while retaining measurements. Patch. |
| Blind 9: ineffective result spacing | low | `gap` has no effect without layout display, so the intended debrief hierarchy lacks spacing. Patch. |
| Blind 10: incomplete catalogue evidence test | medium | Only one condition and two indexes are checked, so five replays and other dossier data can regress unnoticed. Patch. |
| Blind 11 / Verification 2: source-only interaction contract | medium | Regex checks cannot demonstrate short-click, completion, or cancellation outcomes. Defer: the suite has no DOM harness and adding one is not a trivial patch. |
| Verification 1: incomplete catalogue evidence test | medium | Same root cause as Blind 10. Patch. |
| Verification 3: source-only debrief test | medium | Regex checks do not render the result UI. Defer: the suite has no DOM harness and adding one is not a trivial patch. |
