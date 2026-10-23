---
title: 'Nursing Diagnosis Win Condition'
type: 'bugfix'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
baseline_commit: '322d2fa56991ccf8f7150429ebe801d5c8d8f5a2'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nursing missions still gate victory on a computed score, consultation activity, escalation wording, and an optional AI debrief. That contradicts the intended game rule: identifying the selected fictional condition is the only win condition.

**Approach:** Make a correct submitted hypothesis immediately produce mastery and progression, regardless of tools, exchanged messages, score, or AI availability. An incorrect hypothesis remains unsuccessful.

</frozen-after-approval>

## Implementation Notes

- `evaluateNursingHypothesis` now maps the submitted disease directly to mastery and a binary result; signs and messages remain informative only.
- The Nursing hypothesis endpoint no longer runs an AI debrief, and the Nursing debrief presents the binary outcome instead of score axes.

## Review Triage Log

- false — The generated `dist/index.html` mismatch was a local build artifact only; it is restored before commit, so no broken tracked production bundle is introduced.
- medium — An incorrect hypothesis ends the current simulation, so the retry wording now explicitly says to replay the mission rather than choose another disease in the same case.
- low — The Nursing loading message incorrectly described exchange analysis; it now says that the selected disease is being validated.
- medium — The unused Nursing AI scoring prompt and its test were real contradictory paths; both were removed and the route test asserts the binary `100/mastery` result.

