---
id: SPEC-psychology-career
companions:
  - psychology-campaign.md
  - psychology-tools.md
  - psychology-verification.md
  - ../../implementation-artifacts/spec-nursing-campaign-foundation.md
  - ../../implementation-artifacts/spec-nursing-authored-dossiers.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# Psychology Career Campaign

## Why

MedGame needs a playable Psychology profession with the same replayable, evidence-led campaign quality as Nursing, while teaching attentive interviewing, contextual formulation and safe orientation instead of presenting a real diagnostic service.

## Capabilities

- **CAP-1**
  - **intent:** A player can enter Psychology from the campus and progress through ten role-scoped missions.
  - **success:** Psychology is selectable and playable without changing Dietetics or Nursing routing, saves, unlocks or sessions.
- **CAP-2**
  - **intent:** A player can investigate a randomly selected, fictional consultation motif from an increasingly broad cumulative pool.
  - **success:** Levels contain exactly 3, 6, 10, 15, 20, 22, 24, 26, 28 and 30 eligible motifs, respectively; each session selects only a compatible private case.
- **CAP-3**
  - **intent:** A player can build rapport and uncover a patient’s context through useful but progressively less explicit dialogue.
  - **success:** Patient replies remain truthful, case-authorized and responsive to relevant questions; traits affect disclosure style rather than case truth.
- **CAP-4**
  - **intent:** A player can consult cumulative, case-compatible supports that add clues without revealing an answer.
  - **success:** Five optional supports unlock at levels 1, 3, 5, 7 and 9, return only authorized evidence and vary across compatible cases.
- **CAP-5**
  - **intent:** A player can submit one educational working formulation and receive feedback on exploration, communication, contextual reasoning and safe next steps.
  - **success:** Psychology uses Nursing’s binary debrief rule: a correct final motif validates the mission and a wrong motif does not.
- **CAP-6**
  - **intent:** The campaign handles sensitive fictional consultations respectfully and directs urgent cases toward appropriate real-world help.
  - **success:** No patient, support or feedback presents medical advice, a real diagnosis, a prescription or an unsafe crisis response; safe orientation remains educational guidance, not a mastery gate.
- **CAP-7**
  - **intent:** Developers can verify the psychology experience through data/API tests and deterministic rendered-browser visual tests.
  - **success:** CI verifies campaign rules and user-visible states using browser screenshots plus semantic and interaction assertions.
- **CAP-8**
  - **intent:** A player can inspect concise educational cards for the current level’s eligible motifs in a right-hand rail.
  - **success:** Every eligible card provides its approved French label, a brief description and possible signs to explore, but never identifies the active case or replaces the consultation.

## Constraints

- Keep all people, histories, relationship maps, messages and documents fictional, authored and server-private until authorized for the active session.
- Reuse `server/patientTraits.js`: each consultation selects two distinct traits from the shared 38-trait pool; Psychology owns no parallel personality system.
- Use coherent authored case blueprints, never independent random facts or AI-generated records. A motif is not bound to one fixed evidence bundle.
- Preserve the existing role isolation, local progress model, session authorization and replay avoidance; Psychology follows Nursing’s binary correct-motif mastery behavior.
- Patient text may become more indirect with difficulty but must never become unhelpful, deceptive or an arbitrary guessing game.
- The right-hand motif rail is public educational information: its cards are stable across cases and cannot expose a private case fact, evaluation rule or selected answer.
- Browser visual tests must run at a deterministic viewport, font setup, locale, reduced-motion setting, seed/fixture and API state; visual snapshots must be reviewed when intentionally updated.

## Non-goals

- Delivering psychotherapy, screening, medical diagnosis, clinical assessment, treatment plans or emergency care to real people.
- Unlocking General Practice or Pharmacy, redesigning the campus, or replacing existing Dietetics/Nursing mechanics.
- Solving a case automatically by opening supports, selecting a card at random or following one mandatory dialogue script.

## Success signal

A player can complete varied fictional Psychology consultations in which patient style, life context, evidence and dialogue differ meaningfully on replay, while the interface and feedback make it clear why a careful, safe formulation succeeded or needs improvement. Automated browser screenshots catch visual regressions in every major Psychology state before release.

## Assumptions

- “Motif” is the player-facing educational formulation selected at the end of a consultation, not a real-world diagnosis.
- Psychology uses the established mission map, chat shell, local campaign persistence and AI debrief architecture unless an implementation constraint requires a narrow role-scoped extension.

