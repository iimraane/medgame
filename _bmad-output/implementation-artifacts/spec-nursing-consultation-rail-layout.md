---
title: 'Nursing Consultation Rail Layout'
type: 'bugfix'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Nursing consultation currently places hypotheses, pins and documents inside the left rail. Its fixed width overflows the two-column chat grid, clipping labels and controls as shown in the user screenshot.

**Approach:** Restore the intended desktop hierarchy: reusable documents/tools on the left, conversation in the center, and hypotheses, symptom pins and hypothesis submission on the right.

</frozen-after-approval>

## Implementation Notes

- Split the Nursing consultation into a dedicated left document rail and a dedicated right diagnostic rail; the central chat markup and interaction contracts stay unchanged.
- Added a three-column desktop grid with bounded side rails and retained the existing mobile rule that hides consultation rails below 800 px.
- Removed the non-tool notice from the left rail and added a source-level regression contract for the Nursing rail order.

## Review Triage Log

| Finding | Verdict | Evidence |
| --- | --- | --- |
| Generated `dist/index.html` pointed to ignored hashed build assets. | medium — fixed | The production build rewrote a tracked generated index while its bundles are ignored. Restored that generated file so it cannot enter this source commit. |
| The new spec file was untracked. | false | It is the required BMad implementation artifact and will be included explicitly in the local commit. |
| Hiding the rails below 800 px makes Nursing impossible to complete on mobile. | false | The agreed product constraint is desktop-only play; this preserves the existing mobile non-playable behaviour. |
| Removing the in-chat simulation notice removes the disclaimer. | false | The user previously asked to remove educational-medicine references; this change removes that exact non-tool copy without changing the server safety boundary. |
| Source-level layout assertions do not render the three rails. | low — rejected | No DOM test harness exists in the project; the new layout was exercised in the live browser and automated route tests remain green. Adding a rendering framework is disproportionate to this contained CSS/DOM correction. |

