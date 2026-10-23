---
title: 'Nursing Hold To Select Hypothesis'
type: 'feature'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
baseline_commit: 'f4165491935aaa26611ed38fcc35f7b8090e5512'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A disease hypothesis is selected by the same simple click that opens its information card, making the confirmation action too easy to trigger accidentally.

**Approach:** Keep a short click as an information-only popup. Require a sustained pointer or keyboard hold to select an hypothesis, with a visible progressive fill animation; only this completed hold enables the final validation button.

</frozen-after-approval>

## Implementation Notes

- Hypotheses use a short 850ms press duration; release, cancellation, or leaving the button resets the visual progress.
- Pointer and keyboard holds select the hypothesis, while an ordinary click only opens its disease popup.
- The fill overlay sits above the button background and below its label, so its progress remains visible without reducing label contrast.

## Review Triage Log

- **Fixed — P2:** A completed hold could suppress a later click on a different hypothesis if the original pointer release did not emit a click. Suppression is now scoped to the held button and cleared on cancellation or after its own pointer release.
- **Deferred — P3:** The Node suite has no browser/DOM runtime for executing pointer and keyboard interactions end-to-end. The existing deferred DOM-test follow-up remains the appropriate place for this coverage.

