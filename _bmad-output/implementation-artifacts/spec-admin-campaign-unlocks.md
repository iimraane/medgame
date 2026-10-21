---
title: 'Repair admin campaign unlocks'
type: 'bugfix'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The administrator control writes the retired numeric progression field, while the active Dietetics campaign derives unlock state solely from per-mission progress. A successful admin activation therefore leaves campaign missions locked.

**Approach:** Make the admin unlock use the campaign’s authoritative mission progression while retaining legacy save compatibility. Audit the adjacent storage paths so reset, migration, normal mastery, and the admin override read compatible state.

</frozen-after-approval>

## Implementation Notes

- Centralized the Dietetics mission catalog inside storage so the administrator override validates and marks every current campaign mission as mastered.
- Preserved legacy numeric saves as an explicit access boundary rather than manufacturing earned campaign scores; the boundary is persisted on first load and cannot expand when future missions are added.
- Added regression coverage for administrator unlock, reset, legacy access boundaries, and protection of existing campaign progress.
- Added the standard `npm test` command and verified the complete suite and production build.

## Review Triage Log

- fixed — Generated bundle references were staged with the build output so a clean checkout does not reference a missing asset.
- fixed — `unlockAllLevels` now defaults to the validated current Dietetics mission catalog.
- fixed — Legacy numeric values no longer overwrite existing campaign progress and are persisted as a bounded access migration.
- fixed — Legacy access does not create fabricated campaign mastery or expand to future missions.
- fixed — Removed the hard-coded campaign maximum and ignored invalid mission identifiers.
- rejected low — The explicit admin override intentionally records unlocked missions without inventing scores or a debrief result; no current consumer requires a distinct marker.
- rejected low — The settings handler delegates to the now-tested no-argument storage API; an additional DOM wiring test would duplicate that contract.
- fixed — Added `npm test` so the regression suite is available through the normal project command.

