---
title: 'Refresh Nursing Document Bundle'
type: 'bugfix'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Nursing document source no longer contains the obsolete “fictif” wording, but the tracked production bundle still serves an older renderer and dossier payload, so the UI can display stale “Température fictive” facts.

**Approach:** Regenerate the shipped frontend bundle from the current source and verify that both the source and resulting bundle no longer contain the obsolete Nursing document wording.

</frozen-after-approval>

## Implementation Notes

- The source catalogue and active renderer already used the corrected Nursing wording. The stale wording in the screenshot was found only in obsolete hashed JavaScript files retained in `dist/assets` because Vite does not empty an output directory outside its root by default.
- Enable explicit output cleanup before rebuilding so the served bundle and the source cannot diverge this way again.
- Make the standard server command rebuild before serving, and make the build fail if its referenced assets contain the obsolete Nursing document copy.

## Review Triage Log

- high — The ignored, stale hashed bundle could remain on disk and be served after a source correction. Fixed by explicitly emptying the external Vite output directory before every build.
- high — `npm run server` served `dist` without rebuilding it, reproducing the user-visible divergence. Fixed by rebuilding before the server starts.
- medium — No shipped-bundle regression guard existed. Fixed with a build-time verifier that inspects the assets referenced by `dist/index.html` for the obsolete document wording.
