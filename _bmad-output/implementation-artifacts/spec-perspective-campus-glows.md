---
title: 'Perspective Campus Glows'
type: 'feature'
created: '2026-10-21'
status: 'done'
baseline_commit: '784997c975a16d0972c8f1c6f19822457cce442b'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The façade interactions currently use oversized rectangular hit areas with generic beveled glow shapes. In the inspected desktop render, their bounds do not follow the actual storefronts in the supplied campus perspective. The kiosk’s five interactive rows are also functionally clickable but do not advertise that affordance with a visible resting glow.

**Approach:** Recalibrate every profession hotspot to the real architectural footprint in the 1672×941 campus frame, then give each glow a role-colored, perspective-aware polygon that hugs its doorway/frontage. Turn the kiosk list into five subtly lit row targets in their respective profession colors, with a stronger glow on hover and keyboard focus, while retaining the baked artwork as the visual source of truth.

## Boundaries & Constraints

**Always:** Preserve the supplied campus and baked kiosk images without editing, filtering, or adding content over the image except the transparent interactive affordances. Keep the five existing façade buttons and their current routes: Dietetics enters the game; locked professions open their preview state. The glow must be visible only during hover/focus on a façade, must follow each storefront’s perspective rather than a detached rectangle, and must retain an obvious `:focus-visible` indicator. Each default-kiosk list row must have a low-intensity, role-colored clickable glow at rest and a brighter hover/focus state. Keep the existing desktop-only behavior and all keyboard behavior.

**Never:** Do not add labels, icons, cards, text, or a new panel over any façade. Do not alter the kiosk’s baked text/artwork, relocate the five list rows, broaden entry permissions, or use emoji as interaction decoration. Do not create clickable regions outside a frontage or the existing kiosk rows.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Hover a storefront | Pointer enters a profession frontage | A colored glow fits that storefront’s projected shape; no label appears | Leaving restores the untouched image |
| Keyboard façade navigation | A façade receives focus | The same perspective glow is clearly visible and activation retains current role behavior | Focus ring remains distinguishable from the decorative glow |
| Inspect kiosk menu | Default kiosk is visible | All five row targets have a restrained, profession-specific affordance glow | Artwork remains readable and unchanged |
| Hover/focus kiosk row | Pointer or keyboard reaches one row | Its local glow strengthens without affecting other rows or the scene | Selecting it preserves existing state transition |
| Profession state open | A baked detail state hides the list | Kiosk row glows are hidden with their list controls | No invisible control can receive focus |

</frozen-after-approval>

## Code Map

- `src/data/roles.js` -- role ids/themes plus the existing screen-relative hotspot bounds; refine bounds only where required to fit the supplied scene.
- `src/ui/campusHub.js` -- emits five façade and five kiosk-row controls; expose role theme classes/styles for kiosk-specific glow styling without changing actions.
- `src/style.css` -- owns all façade clip paths and kiosk-row hover/focus treatment. Preserve the kiosk state layers, scene vignette, and z-index ordering from the prior hub implementation.
- `tests/roles.test.js` -- existing role/hub coverage; add static guardrails for five per-role storefront shapes and permanent kiosk-row affordances.
- `src/public/assets/campus-hub.png` -- visual calibration reference only; it is immutable.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/roles.js` -- tuned the five hotspot bounding boxes to the real storefront projections in the base campus frame.
- [x] `src/ui/campusHub.js` -- attached each kiosk row to its profession theme so CSS can present the matching persistent affordance without altering selection behavior.
- [x] `src/style.css` -- replaced generic façade polygons with individual perspective silhouettes, and added restrained-at-rest / bright-on-hover-or-focus kiosk-row glows.
- [x] `tests/roles.test.js` -- asserted all roles retain valid tuned hotspot geometry and each kiosk interaction gets a themed affordance contract.

**Acceptance Criteria:**
- Given the desktop hub image, when each façade is hovered, then its glow hugs only that storefront’s visible projection instead of a generic rectangular area.
- Given the default image kiosk, when no row is focused, then all five row controls remain discoverable through subtle role-colored glows.
- Given keyboard navigation, when a façade or kiosk row gains focus, then the focus treatment is unmistakable without masking the supplied artwork.
- Given a kiosk detail state, when the directory is hidden, then no directory glow or interactive row is visible.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence | Route |
|---|---|---|---|
| Object-fit cropping can drift façade geometry at non-source aspect ratios | medium | The image uses `object-fit: cover` while hotspots are currently positioned against the scene container, so horizontal or vertical crop shifts artwork without shifting controls. | patch |
| CSS polygons and role bounds are separate geometry sources | false | Each polygon clips the same button that owns its bounds, so the interactive footprint and visible glow cannot diverge at runtime. | reject |
| Clip-path hides the keyboard focus indicator | false | The live desktop screenshot shows the active nursing façade with its focus glow; the `:focus-visible` outline remains visible within the conservative frontage shape. | reject |
| Color-mix lacks legacy-browser fallbacks | low | The desktop-only experience targets modern browsers that support the existing color-mix styling; expanding fallback CSS is disproportionate to this visual-only risk. | reject |
| Resting kiosk glows can obscure the baked text | false | The inspected desktop render keeps every kiosk label readable beneath the low-opacity outlines and gradients. | reject |
| Row affordance assertions are source-level | low | The declarations are directly tested and the actual desktop render was inspected; adding a browser runtime to this dependency-free unit suite is disproportionate for these static styling contracts. | reject |
| Hotspot numeric test alone cannot prove artwork alignment | low | The test preserves calibrated data and bounds; live visual calibration provides the artwork alignment evidence. | reject |
| Common-aspect-ratio crop behavior is not covered | medium | This is the same coordinate-plane defect as the first finding; a shared image/control plane prevents drift. | patch |
| Tests do not exercise all real keyboard traversal behavior | low | Existing role-action tests cover locked/unlocked routing and the inspected live controls expose keyboard focus; a new end-to-end harness would exceed this focused visual change. | reject |
| Forced-colors mode lacks a custom fallback | low | No forced-colors requirement exists and browser-native focus treatment remains available; additional mode-specific styling is not warranted here. | reject |
| Theme colors are represented in separate CSS selectors | false | Each role theme has a distinct selector and accent, and the test iterates every role to verify that mapping exists. | reject |
| Verification-gap: no rendered campus-control test | low | The gap is real, but the browser render was manually verified and a rendered test requires introducing an otherwise-unused test runtime; source contracts protect the declared style behavior. | reject |

## Design Notes

The source image is displayed with `object-fit: cover`; storefront geometry must therefore be expressed as percentages of the scene container, not hard-coded viewport pixels. The calibration should keep the target inside a storefront at all common desktop aspect ratios, favoring a slightly conservative hit shape over a glow that leaks onto the courtyard.

## Verification

**Commands:**
- `node --test tests/roles.test.js` -- expected: all role, hotspot, and kiosk-affordance contracts pass.
- `npm run build` -- expected: production bundle builds without stylesheet or module errors.

**Manual checks:**
- Inspect each façade with pointer hover and keyboard focus at the current desktop viewport; its colored outline must trace the actual frontage.
- Inspect the kiosk list at rest, hover each row, then tab through it; every row should signal its role without obscuring the baked panel.
