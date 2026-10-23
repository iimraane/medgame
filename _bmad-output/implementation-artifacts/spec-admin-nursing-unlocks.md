---
title: 'Apply administrator unlocks to Nursing'
type: 'bugfix'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
baseline_commit: 'db82f0c0f26fb8ecda0086e4315618b1aaf1a9cc'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Administrator unlock currently validates and marks only Dietetics missions as mastered, leaving the Nursing campaign locked.

**Approach:** Make the same administrator action unlock every currently open campaign mission, including Nursing, without changing ordinary progression or fabricating scores.

</frozen-after-approval>

## Implementation Notes

- Reuse the central mission catalog so the override cannot drift from visible campaigns.
- Keep normal role-specific prerequisite checks unchanged for players who do not activate administrator mode.
- Return to the profession hub after activation so the player can immediately choose either unlocked campaign.

## Review Triage Log

- **Fixed — low UX:** The former post-admin redirect forced Dietetics even though Nursing is unlocked too. It now returns to the profession hub.
