---
title: 'Repair administrator settings walkthrough issues'
type: 'bugfix'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The administrator control relies on a native password prompt and a second confirmation, which fails or feels inert in the in-app browser; the obsolete “À propos” section also contradicts the current game positioning.

**Approach:** Replace the native flow with an in-page administrator dialog that gives immediate, observable success feedback after unlocking every Dietetics mission, remove the obsolete settings section, and add focused regression coverage for the resulting interface contract.

</frozen-after-approval>

## Implementation Notes

- Replaced the browser-native administrator prompt and redundant confirmation with an accessible in-page password dialog; success opens the fully unlocked Dietetics map immediately.
- Removed the obsolete settings “About” block and its stale model description.
- Added source-level regression tests for the administrator interaction contract and removed copy.
- Reviewed the UI in the in-app browser: the old About block is absent and the in-page dialog exposes its title, explanation, field and action as expected.

## Review Triage Log

- medium — Production bundle references were changed by the build; the generated `dist` files will be staged with the matching HTML so a clean checkout has no missing assets.
- medium — The matching stylesheet reference has the same generated-output requirement; staging the complete production build resolves it.
- false — Administrator passwords are intentionally a local single-player developer shortcut, not server authentication; it only unlocks the current browser’s saved campaign.
- low — The first dialog lacked focus containment; fixed by making settings inert while it is open and cycling Tab within the dialog.
- low — Escape previously worked only from the password field; fixed with a dialog-level key handler.
- low — Closing did not restore focus; fixed by returning focus to the administrator trigger.
- low — The dialog description was not linked for assistive technology; fixed with `aria-describedby`.
- low — The dialog used hand-wired key handling instead of form semantics; fixed with a required password field and submit handler.
- false — Source-contract tests are intentional for this dependency-free frontend; the in-app browser walkthrough independently confirmed the rendered dialog and visible controls.
- low — The spec had not been finalized; status is now `done`.

