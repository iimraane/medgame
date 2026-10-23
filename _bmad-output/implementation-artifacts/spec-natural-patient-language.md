---
title: 'Natural Patient Language'
type: 'bugfix'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The simulated patient can produce self-aware, artificial wording such as offering to reveal information when prompted, and can use long dashes that make the conversation read like generated text instead of a real consultation.

**Approach:** Strengthen the shared patient prompts so every simulated patient uses natural spoken French, stays in their lived experience, reveals facts without explaining the game mechanic, and never emits long dashes or double hyphens. Preserve the authored facts, progressive disclosure, safety rules and Nursing sign extraction contract.

</frozen-after-approval>

## Implementation Notes

- Strengthened both Nursing and Dietetics patient prompt branches; the Nursing branch retains exact authored-sign wording for the live-sign extractor but requires it to be embedded in ordinary speech.
- Added a prompt-source regression contract for natural language, no consultation meta-commentary and no long-dash instruction.
- Preserved the authored Nursing response style in the prompt and normalized long/double dashes in returned patient text so the user-visible guarantee does not rely only on model compliance.

## Review Triage Log

- `medium — patch` The Nursing prompt did not previously use the authored response style. It is now injected as a natural tone constraint.
- `medium — patch` The no-dash rule relied only on model compliance. Server-side normalization now removes long and double dashes before display and persistence.
- `low — patch` Prompt checks were static only. Tests now build both Nursing and Dietetics prompts from real campaign variants.

