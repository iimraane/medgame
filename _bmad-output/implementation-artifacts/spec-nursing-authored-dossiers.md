---
title: 'Nursing Authored Disease Dossiers'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'e44a623db58aa7ecd51adfa5120a7dedfae0470a'
context:
  - '_bmad-output/implementation-artifacts/spec-nursing-campaign-foundation.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Nursing campaign currently renders five generic document templates which interpolate a disease symptom. This makes the five supports feel interchangeable even though the player is selecting among thirty possible fictional conditions.

**Approach:** Author a complete, server-only dossier for every one of the thirty Nursing conditions. Each dossier contains the five existing document types, with concrete, internally consistent fictional details which add a useful clue without naming the target condition or giving care instructions.

## Boundaries & Constraints

**Always:** Keep the existing thirty IDs, cumulative pools, six replay variants, symptom-pin contract, AI patient prompt, scoring and role-scoped save progression. Preserve the stable document IDs and labels: dossier de visite, constantes de visite, compte rendu biologique, compte rendu d’examen and historique des transmissions. Every disease owns all five authored documents, but the existing level unlock progression still controls visibility: levels 1/2/4/6/8/10 expose 0/1/2/3/4/5 documents respectively. Documents remain repeatedly openable, static, case-specific, and enter the private patient/debrief context only once.

**Never:** Do not generate any runtime medical text with AI. Do not use real patient data. Do not reveal the selected condition in a document, add prescriptions, doses, treatment instructions, or turn a document into real diagnostic advice. Do not modify Dietetics supports or unlock another profession.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open a low-level dossier | Level 2 Nursing case, first tool | The disease’s authored visit dossier appears; other documents remain unavailable | Invalid document ID returns no payload and does not add prompt context |
| Open a full dossier | Level 10 case, any of five tools | Each document is distinct, disease-specific, static and safely phrased | Reopening returns the same facts and does not duplicate context |
| Replay with another variant | Same disease, different case variant | Disease dossier stays coherent while the case chronology/patient presentation can vary | No client can choose another disease’s dossier |
| Validate catalog | All thirty diseases | Each owns exactly five stable documents with non-empty factual content | Startup/test failure identifies missing or mismatched catalog data |

</frozen-after-approval>

## Code Map

- `src/data/nursingCampaign.js` -- Browser-safe list of thirty disease IDs, summaries and symptoms. Keep it free of dossier facts so the active answer remains server-private.
- `server/missions.js` -- `NURSING_DOCUMENTS`, `nursingDocuments`, `makeNursingMission`, `getNursingTools` and `useNursingTool` currently build generic document facts. Replace only this evidence source with an authored keyed catalog while retaining stable tool contracts.
- `server/server.js` -- Authorizes a session’s selected variant and records a document’s facts in its private prompt context; preserve this boundary.
- `server/missionPatient.js`, `server/missionEvaluation.js` -- Consume `promptNotes`; no document-content logic should leak into client output.
- `src/ui/chat.js` -- Already renders `tool.evidence.facts` in the reusable modal. No separate document UI should be introduced.
- `tests/campaign.test.js`, `tests/nursingRoutes.test.js` -- Existing catalog and HTTP-flow coverage; extend it to prove full authored dossier completeness, visibility gates and repeated opening.

## Tasks & Acceptance

**Execution:**
- [x] `server/nursingDossiers.js` -- Add a server-only catalog keyed by all thirty existing disease IDs. Give every entry five stable document objects, each with a concise title and 3–6 authored facts. Use fictional identifiers, dates and values consistently; vary chronology through the existing case index only where it does not weaken the authored content.
- [x] `server/missions.js` -- Replace generic template generation with catalog lookup and mission-order authorization. Ensure the selected variant can return only its own dossier, and that `promptNotes` remain one-time per tool.
- [x] `tests/campaign.test.js` -- Assert exact catalog-to-disease coverage, five unique stable documents per disease, meaningful authored facts and unlock visibility for every level.
- [x] `tests/nursingRoutes.test.js` -- Cover low-level and level-10 API document responses, re-open behavior, selected-disease isolation and invalid-tool handling.

**Acceptance Criteria:**
- Given any of the thirty selected conditions, when its five documents are inspected in a level 10 session, then every document has unique authored details relevant to that condition without naming it.
- Given a level below a document unlock, when its ID is requested, then the server returns no evidence and does not alter the session prompt context.
- Given a document is opened twice, when the player returns to it, then the exact same authored evidence is visible and context is counted once.
- Given a condition has a nearby differential alternative, when both dossiers are compared, then they contain distinguishable factual clues rather than a shared generic template.
- Given a completed Dietetics session or save, when Nursing dossiers are introduced, then existing Dietetics behavior and progress remain unchanged.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| Finding | Severity | Verdict | Evidence / resolution |
| --- | --- | --- | --- |
| The dossier catalog was only shallow-frozen. | Low | Rejected | It is a server-only module with no mutable request path; all consumers read its values. Deep-freezing static literals would not change the product contract. |
| A missing dossier or document would fail unclearly while assembling a mission. | Medium | Fixed | `nursingDocuments` now defensively returns only present authorised documents; catalog validation prevents a partial production catalog. |
| Startup validation did not prove stable labels, exact document IDs, fact quality, or disease-name leakage. | Medium | Fixed | `assertNursingDossierCatalog` now validates exact IDs and labels, 3–6 unique non-empty facts, coverage and target-name non-leakage. |
| Reopening a document was not proven to preserve the private patient/debrief context. | Medium | Fixed | Route tests assert every opened fact appears exactly once in both prompts and that reopening keeps `session.prompt` unchanged. |
| Different conditions could theoretically retain a shared generic document. | Medium | Fixed | Campaign tests now require each of the five document fact structures to vary across all thirty conditions. |
| Stable tool labels were not exercised by the route test. | Low | Fixed | The level-10 route test asserts every returned tool ID/label pair against the canonical definitions. |
| Urgent fictional cases lacked a neutral priority cue in their authored transmissions. | Medium | Fixed | The three high-alert dossiers contain a simulation-only priority-transmission fact; no treatment instruction was added. |

## Design Notes

The catalog is intentionally server-only. The browser receives a document only after the server has selected a case and verified its tool unlock; this keeps the active disease’s evidence private from static client assets. Each document uses the same visual/modal structure already accepted by the user, so the quality lift comes from authored content rather than a second UI system.

## Verification

**Commands:**
- `npm test` -- expected: catalog, role, route and regression tests pass.
- `npm run build -- --emptyOutDir` -- expected: production bundle completes without errors.
- `git diff --check` -- expected: no whitespace errors.
