# Psychology verification plan

## Automated functional coverage

Add Node/API tests for:

- exact cumulative pool sizes and no Psychology item in another role’s pool;
- 30 complete browser-safe motif cards and server-private blueprint/evidence catalogues;
- every eligible right-rail motif card has its approved French label, a concise description and three to five distinct possible signs; the card facts remain public, stable and cannot identify the active case;
- at least six coherent blueprints per motif, fingerprint uniqueness and replay rotation before repetition;
- exactly two distinct traits selected from the shared 38-trait pool;
- each support unlock gate, selected-case authorization, repeat-open behavior and one-time prompt-context recording;
- rejection of forged motif, support, board-entry and cross-role/session requests;
- transcript/support authorization for formulation-board entries;
- dialogue prompt constraints: first person, staged disclosure, no answer leak, no invented facts and useful responses to relevant questions;
- scoring: correct motif alone fails, contextual exploration plus safe orientation can master, and urgent cases require orientation;
- Psychology save migration/progression without changes to Dietetics or Nursing;
- safe fallback behavior when model extraction or evaluation is unavailable.

## Required rendered-browser and vision suite

Introduce a browser test runner with screenshot support and run it in CI. It must start the local app, seed the server with deterministic fixture cases and capture reference screenshots at a fixed desktop viewport, French locale, loaded project fonts and `prefers-reduced-motion: reduce`. Each test combines semantic/interaction assertions with a visual snapshot. Snapshot updates require human review of the image diff.

The suite must cover:

1. Campus: Psychology changes from preview-only to playable while the other locked-role behavior and existing playable doors remain visually intact.
2. Mission map: levels 1, a mid-campaign level and level 10 show correct availability, cumulative progress and the current tool inventory.
3. Consultation opening: a patient opening with traits is legible, safe-language framing is visible and the formulation board is empty.
4. Each of the five supports: its real visual form opens, has readable content, correct title, close control and no target-motif reveal.
5. Locked versus unlocked support states at levels 1, 3, 5, 7 and 9.
6. Right-hand motif rail: the current cumulative pool is visible; a card opens its short description and possible signs; overlapping cards do not disclose the active motif.
7. Formulation board: adding a confirmed dialogue fact, a contextual factor and a support fact is visible and does not permit an unapproved entry.
8. Final choice: a short click only previews a motif card; the deliberate selection flow, pending state, debrief success, debrief non-mastery and required-orientation feedback all render correctly.
9. Replay: two seeded compatible variants visibly differ in patient opening and evidence while remaining internally coherent.
10. Accessibility visual states: keyboard focus, Escape dismissal, reduced motion and narrow-but-supported desktop layout.

Visual comparisons must mask only genuinely nondeterministic content. They may not mask patient text, evidence, tool state, button state, score, focus indicator or result feedback. Test fixtures must be fictional and checked into the repository; no test calls a live model.

## Release gate

`npm test`, production build, browser interaction suite and visual snapshot suite must pass. A reviewer manually inspects changed screenshot diffs and a representative live level-10 consultation before release. `git diff --check` must pass.
