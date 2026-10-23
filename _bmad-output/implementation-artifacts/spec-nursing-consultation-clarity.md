---
title: 'Nursing Consultation Clarity'
type: 'feature'
created: '2026-10-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: '3d101b916ee75b44c8175555716babd52903c889'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Patient replies still leak inclusive writing and artificial humour, Nursing signs can fail to appear when the patient states the same fact in a different word order, and the right rail presents both cluttering sign-state controls and an inline disease card that does not match the desired consultation flow.

**Approach:** Make every authored mission patient explicitly gendered and prompt the model to use ordinary spoken French without point-median forms or scripted jokes. Make Nursing sign detection deterministic for clear paraphrases while retaining the constrained AI extractor. Simplify collected signs to readable capitalised facts and open disease details in a dedicated popup containing one summary and three symptom cards.

## Boundaries & Constraints

**Always:** Keep all symptoms private and case-authorized; never infer an unspoken sign, diagnosis, treatment, or new medical fact. Retain the existing disease list, three authored symptoms per disease, hypothesis scoring, reusable documents, keyboard-accessible controls, and the existing shared consultation modal behavior. The new gender text must cover Dietetics and Nursing prompts, not only the visible Nursing cases.

**Never:** Do not expose the selected diagnosis, alter the clinical content of any disease, turn signs into user-managed states, reintroduce an inline disease detail panel, or use a second duplicated modal implementation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Spoken sign, reordered | Patient says a case-authorized symptom with its words reordered, e.g. timing before the symptom | The sign is visible after that same patient reply | Ignore any partially matching or negated sign |
| No signs yet | New Nursing chat | A concise empty-state is visible with no state buttons | N/A |
| Hypothesis selected | Player clicks a disease from the right rail | Shared popup shows name, quick description, then exactly three visual symptom cards | If selection is invalid, leave popup closed and submission disabled |
| Gendered patient | Any Dietetics or Nursing case | Prompt calls the person a patient or patiente matching authored metadata and has no point median | Existing sessions keep their current prompt; new sessions receive the correction |

</frozen-after-approval>

## Code Map

- `server/missions.js` -- builds Dietetics and Nursing variants; add stable patient gender metadata and strengthen the transcript-authorized sign matcher without changing disease facts.
- `server/missionPatient.js` -- single prompt builder for campaign patient dialogue; derive ordinary gendered French and forbid point-median forms and scripted humour.
- `server/patientTraits.js` -- shared traits currently contain point-median phrasing; supply neutral or gender-compatible prompt instructions for every role.
- `server/server.js` -- combines constrained extractor with transcript fallback after each Nursing reply; preserve its authorized-ID boundary.
- `src/ui/chat.js` -- creates the Nursing rails and consultation modal; replace inline disease details and sign state controls with modal detail cards and readable collected signs.
- `src/style.css` -- Nursing rail, modal, and symptom-card styling, including contrast and desktop layout.
- `tests/campaign.test.js`, `tests/nursingRoutes.test.js`, `tests/engine.test.js` -- campaign/prompt contracts, reordered sign detection, and client payload behavior.

## Tasks & Acceptance

**Execution:**
- [x] `server/missions.js` and `server/patientTraits.js` -- attach deterministic binary gender metadata to the authored campaign people and remove point-median trait source text; add a conservative normalized phrase matcher that accepts reordered explicit sign terms but rejects negation.
- [x] `server/missionPatient.js` and `server/server.js` -- render a gender-specific patient identity in both campaign prompts, prohibit point-median writing and artificial punchlines, and combine extractor results with the deterministic authorized fallback.
- [x] `src/ui/chat.js` -- make collected Nursing signs display-only with sentence-case labels; route disease buttons to the existing consultation modal with a description and exactly three symptom cards; preserve hypothesis selection and submission.
- [x] `src/style.css` -- style modal disease cards and simplified signs for readable contrast, focus states, and overflow-safe desktop consultation layout.
- [x] `tests/campaign.test.js` and `tests/nursingRoutes.test.js` -- cover gendered prompt output, no point median, immediate reordered sign capture, no client pin controls, and three-card disease modal rendering contract.

**Acceptance Criteria:**
- Given a female or male authored case, when a new conversation starts in Dietetics or Nursing, then its private prompt uses the matching ordinary French patient form and contains no `·` character.
- Given a patient explicitly states a case-authorized sign in a reordered but unambiguous sentence, when the reply returns, then the sign is listed once immediately; a negation does not list it.
- Given one or more collected signs, when displayed, then each label begins with a capital letter and no `Confirmé`, `À vérifier`, or `Écarté` button is rendered.
- Given a Nursing disease button, when clicked, then a single modal displays its short description followed by exactly its three authored symptom cards, and the selected disease remains usable for submission.

## Implementation Notes

- Authored campaign people now carry stable `Femme` or `Homme` metadata; all shared traits and campaign prompt material avoid point-median forms.
- The transcript fallback recognizes a case-authorized sign when all of its meaningful words appear in any order. Exact labels retain the existing nearby-negation protection; the AI extractor remains constrained to the same authorized IDs.
- The existing consultation modal is reused for disease information. The right rail keeps the selected hypothesis, while collected signs are display-only and capitalised.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
|---|---|---|---|
| Dietetics prompt introduced a patiente then said `Tu es un patient`. | medium | patch | Verified in `server/missionPatient.js`; the identity rule now says `la personne qui consulte`. |
| The Dietetics fallback phrase used masculine agreement (`rester cohérent`). | low | patch | Verified in the private prompt; replaced with a neutral formulation. |
| Dietetics response styles were feminine while variants can select a male patient. | medium | patch | Verified in `server/missions.js`; all six authored styles now avoid gender agreement. |
| The `rushed` trait called every person `impoli`. | low | patch | Verified in `server/patientTraits.js`; instruction is now gender-neutral. |
| The `humorous` trait invited humour despite the natural, sober dialogue rule. | medium | patch | Verified in the shared random trait; it now permits warmth without jokes. |
| A fallback could combine symptom words from unrelated clauses. | medium | patch | Verified in the normalized word-set matcher; matching is now bounded to one local clause and span. |
| A negated reordered sign could still be accepted. | high | patch | Verified in the fallback matcher; local negation checks now cover the matched span, with unit and route regression cases. |
| A sign followed by a denial of its timing could be accepted. | medium | patch | Verified because timing words were ignored; they now participate in matching and a regression test covers `mais pas depuis ce matin`. |
| The retired pin API still allowed a direct client to affect evaluation. | medium | patch | Verified in the route and evaluator; the state-changing route is retired with a 410 response and evaluation now uses only collected signs. |
| Disease popup opening did not manage focus, Escape, or restoration. | medium | patch | Verified in `src/ui/chat.js`; shared modal now focuses its close button, traps Tab, closes on Escape, and restores the opener focus. |
| The modal accessible name stayed `Support de consultation` for disease cards. | low | patch | Verified in `src/ui/chat.js`; the label now names the selected hypothesis. |
| Three fixed symptom columns became cramped in a narrow desktop window. | low | patch | Verified in `src/style.css`; a narrow-width one-column fallback is added. |
| No route regression covered a negated reordered paraphrase. | medium | patch | Verified by the verification layer; `tests/nursingRoutes.test.js` now asserts that the denied sign is not returned. |
| The Nursing rail/popup did not have an automated DOM test. | low | defer | Real test-coverage gap, but the project has no DOM test runtime and adding one is not a direct correction; the user-facing flow was exercised manually in the local browser and static contract tests remain. |
| Random shared traits were absent from the prompt regression test. | medium | patch | Verified by the verification layer; every `PATIENT_TRAITS` entry is now rendered through both prompt branches and checked for point-median text. |
| Local-span matching lacked an explicit guard. | medium | patch | Verified; the fallback now rejects terms outside one short clause span. |
| Negation detection omitted `ne … plus`. | medium | patch | Verified; the local negation matcher now recognizes `plus` only as part of a `ne/n’ … plus` construction. |
| A malformed disease button selection could leave an unusable state. | low | patch | Verified defensively in the click handler; invalid data leaves submission disabled and the popup closed. |

## Design Notes

Reuse the existing consultation modal for disease details so the player has one predictable dismissal and focus behavior. The selected disease remains a right-rail choice; the popup is an informational overlay, not a separate diagnostic action.

## Verification

**Commands:**
- `npm test` -- expected: all unit and route tests pass.
- `npm run build` -- expected: Vite production build succeeds.

**Manual checks:**
- Start Nursing level 1, ask a question that produces a stated sign, and verify it appears after the first reply; open an hypothesis and verify the modal has one description plus three cards.
