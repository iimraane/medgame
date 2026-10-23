---
title: 'Nursing Live Signs and Hypothesis Cards'
type: 'feature'
created: '2026-10-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '6d26a70dcd345252bf0061621334211bcf169bc6'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nursing signs only appear after a manual refresh and the left Documents rail remains visible but empty for early missions. Hypotheses expose only a short summary, so the player cannot inspect the signs attached to a selected disease.

**Approach:** After every Nursing patient reply, have a constrained AI extraction update the authorized signs in the right rail without another player action. Keep the player-controlled pin state, expose each hypothesis through a compact expandable fact card, and remove the empty Documents rail from missions with no documents.

## Boundaries & Constraints

**Always:** Keep every discovered sign server-authorized from the selected fictional case; never accept signs or disease data supplied by the browser. A failed extraction must preserve the conversation and fall back to authorized transcript matching. Hypothesis cards show only the selected hypothesis’s authored summary and three authored signs. Document tools remain reusable. The Nursing UI remains desktop-first, consistent with the existing desktop-only game constraint.

**Never:** Do not diagnose real users, expose the hidden selected disease, add a manual sign-refresh workflow, or include the separate admin-unlock change in this iteration.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Patient reply reveals an authorized sign | Successful Nursing `/chat` turn | Response includes the cumulative authorized signs and existing pin states; the right rail renders them immediately | No second browser request is required |
| Extraction service fails or returns invalid IDs | Successful patient reply, failed/invalid sign extraction | Conversation still renders; only signs matched against the selected case are returned | Use deterministic authorized transcript matching; never leak a foreign sign |
| Pin state exists before another reply | Player marked an already discovered sign | Later live update retains the chosen pin state | Sanitize against the discovered authorized set |
| No Nursing documents | Mission 1 start | No Documents rail or empty-state text; conversation and right rail use the available width | No blank grid column remains |
| Player opens an hypothesis | Click a disease in the right rail | A compact card expands with its summary and its three authored signs; selecting a new disease replaces it | Submission still targets the selected disease only |

</frozen-after-approval>

## Code Map

- `server/server.js` -- owns `/game/api/start`, `/game/api/chat` and Nursing session state; return live sign payloads only after storing the patient reply.
- `server/missions.js` -- constructs authorized per-case symptom IDs, sanitizes pin state and scores Nursing submissions; preserve it as the authority boundary.
- `server/missionPatient.js` -- supplies the configured model and Nursing patient prompt; reuse its model selection for constrained sign extraction.
- `src/game/ai.js` and `src/game/engine.js` -- propagate the optional Nursing payload from the chat endpoint to a UI callback while keeping non-Nursing responses unchanged.
- `src/ui/chat.js` -- owns the three-rail Nursing DOM, selected-hypothesis display, tool controls and sign pin controls.
- `src/style.css` -- owns desktop rail grid, contrast and the expandable hypothesis-card states.
- `tests/nursingRoutes.test.js` and `tests/campaign.test.js` -- route-level authority/regression coverage and lightweight UI-source contracts.

## Tasks & Acceptance

**Execution:**
- [x] `server/server.js`, `server/missions.js`, and a focused Nursing-sign helper if needed -- extract and normalize signs after every Nursing patient response, preserve valid pin states and return the cumulative state in the chat response.
- [x] `src/game/ai.js` and `src/game/engine.js` -- carry Nursing live-sign data to the UI without a follow-up refresh request or regression to Dietetics.
- [x] `src/ui/chat.js` and `src/style.css` -- hide a zero-document left rail, improve rendered document contrast, remove the refresh action, and render an accessible expandable hypothesis card with the authored signs.
- [x] `tests/nursingRoutes.test.js` and `tests/campaign.test.js` -- cover live cumulative signs, extraction fallback/foreign-sign isolation, pin preservation, conditional rail layout and disease-card sign rendering.

**Acceptance Criteria:**
- Given a Nursing patient message, when it discloses a relevant authored sign, then that sign appears on the right before the player sends another message.
- Given a level-one Nursing mission, when it has no documents, then the desktop conversation grid has no blank left rail.
- Given an hypothesis selection, when the player opens it, then its card displays exactly that hypothesis’s authored signs and does not alter the selected hidden case.
- Given an existing pin state, when a later patient response adds signs, then the prior state remains available and the new state is safe by default.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- `high — patch` Live-extracted signs were not credited by hypothesis scoring; scoring now uses the same cumulative authorized set.
- `medium — patch` Extraction parsing could reject ordinary JSON formatting; the request now requires JSON-object output.
- `medium — patch` A stalled extraction could delay the chat response indefinitely; extraction now falls back after three seconds.
- `medium — patch` Changing one pin silently confirmed unpinned signs; only explicit pins plus the selected change are now sent.
- `low — patch` Concurrent pin clicks could race; pin synchronization is serialized in the rail.
- `medium — patch` Duplicate pin entries could produce contradictory states; server sanitization now deduplicates by symptom ID.
- `high — patch` The live `/chat` contract had no end-to-end coverage; route tests now mock the server client for valid, foreign, and failed extraction outcomes.
- `medium — defer` Runtime DOM coverage for card rendering and no-document layout is absent; the project has no DOM test harness, while source contracts and the production build verify the wiring.
- `low — false` A null patient reply no longer reaches transcript matching; the chat route rejects non-string completions before appending them.
- `low — maybe-false` Explicit linguistic denial remains dependent on the constrained extractor rather than a French negation parser; the authored patient prompt only emits exact labels when revealing a sign.

## Design Notes

Use an inline expandable card rather than a blocking modal: it keeps the differential, discovered signs and submit action visible together in the right diagnostic rail.

## Verification

**Commands:**
- `npm test` -- expected: all server and source-contract tests pass.
- `npm run build` -- expected: production build completes without errors.

**Manual checks (if no CLI):**
- Start Nursing levels 1 and 2, send a relevant question, then verify live signs, pin-state persistence, hypothesis-card contents, rail contrast and reusable documents in the browser.
