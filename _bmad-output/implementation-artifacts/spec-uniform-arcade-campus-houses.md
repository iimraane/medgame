---
title: 'Uniform Arcade Campus Houses'
type: 'feature'
created: '2026-10-25'
status: 'done'
route: 'dispatch'
baseline_commit: 'e5b519223cff482734d584a343e52a0546d1495e'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current campus relies on translucent glass façades and five different silhouettes. This reads as inconsistent and makes the houses look see-through rather than like a coherent arcade world; the playable-door feedback is also too subtle.

**Approach:** Replace the scene’s landmark variations with five identical, fully opaque stylized houses. Keep only two doors playable, but make them unmistakable with layered, in-world arcade overlays instead of merely changing their colour.

## Boundaries & Constraints

**Always:** Preserve the five role positions, profession-only façade signs, clickable raycast doors, current unlock states, browser-only progression, keyboard semantic controls, locked-role feedback, fallback view, Escape navigation, cleanup, local assets, and desktop breakpoint. Every house uses the same opaque wall, roof, window, and entrance language at the same footprint/height. Arcade highlights for unlocked doors must use overlay geometry and light: a portal frame, raised floor ring, floating chevrons or diamonds, emissive trim and a targeted light. These overlays must not intercept door raycasts, must animate only when reduced motion is not requested, and must intensify on pointer or keyboard focus.

**Never:** Do not use transparent building, roof, window, or sign materials; do not re-add a HUD, bottom panel, account, payment system, remote asset, new rendering dependency, analytics, backend/Worker change, or Cloudflare configuration change. Do not make locked roles navigate to levels.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|----------------------------|----------------|
| Open desktop campus | Five roles at the normal viewport | Five equally sized opaque houses are visible; each retains its own profession sign and door position. | Keep responsive camera fitting every house in view. |
| Find a playable door | Pointer or keyboard focus reaches Diététique or Soins infirmiers | Its portal/ring/chevrons glow above the opaque house and the same door remains clickable. | Decorative overlay meshes never join the raycast door array. |
| Target a locked door | Pointer or keyboard focus reaches another role | House stays opaque; ordinary focus feedback and accessible locked feedback remain without navigation. | Ignore empty-scene clicks. |
| Reduced motion | System requests reduced motion | Static arcade geometry and usable highlights remain; pulse/bob animation stops. | Rendering and teardown continue to work. |

</frozen-after-approval>

## Code Map

- `src/ui/campusHub.js` -- owns `addCampusBuilding()`, shared materials, geometry, door raycasting, highlight state, scene animation and disposal; replace silhouette branches with one opaque house builder and add non-raycast arcade overlay groups.
- `src/data/roles.js` -- holds editable campus footprints/silhouettes; normalize those values without changing role ids, positions, signs, accents or unlock states.
- `tests/roles.test.js` -- currently asserts unique silhouettes; revise it to protect common house metadata and retain interaction/lifecycle invariants.
- `src/style.css` -- desktop canvas and semantic fallback styling; preserve its lack of visible HUD/panel chrome.

## Tasks & Acceptance

**Execution:**

- [x] `src/data/roles.js` -- normalize all five campus records to the same house silhouette and footprint while retaining their position, accent, sign and role identity.
- [x] `src/ui/campusHub.js` -- replace translucent landmark branches with one opaque house composition; remove transparent structural/sign materials and make material texture use consistent across all five houses.
- [x] `src/ui/campusHub.js` -- add layered portal, floor ring, floating arcade markers, emissive trim and focus-pulse behavior to playable doors without expanding the raycast target set.
- [x] `tests/roles.test.js` -- assert uniform-house configuration and preserve role, destination, Escape and lifecycle contracts.

**Acceptance Criteria:**

- Given the loaded desktop campus, when the player scans all five buildings, then every house has the same opaque architecture and none reveals the scene through its walls, roof, windows or sign.
- Given a playable role, when it is idle or highlighted, then it has visible layered arcade geometry beyond a colour change and the effect belongs exactly to its door.
- Given a locked role, when it is targeted, then it does not navigate and no arcade playable portal is shown.
- Given the existing controls and fallback, when a user navigates without the mouse, then all routes and announcements remain available.

## Implementation Notes

- Normalised the five editable campus records to one shared `house` footprint and warm-concrete material language, without changing role ids, positions, signs, routes, or unlock states.
- Replaced translucent structural and sign materials with opaque concrete, roof, porch, windows, and sign surfaces.
- Added unlocked-only arcade portal groups (frame, raised ring, floating diamonds, emissive trim, targeted light) that remain outside the door raycast list; focus increases their intensity.
- Verified locally: `npm test` (67/67), `npm run build`, visual desktop inspection, a playable Diététique route, and locked Psychologie feedback without navigation. The motion guard is covered by the existing source contract test.

## Spec Change Log

## Review Triage Log

- `blind/opaque materials`: **patch** — The central opacity promise was only guarded by metadata/source checks; a constructed-house assertion can catch a structural transparent material regression.
- `blind/portal construction`: **patch** — Portal existence is currently established by source text rather than constructed Three.js objects; test that exactly the unlocked roles own a portal.
- `blind/raycast isolation`: **patch** — The doors array remains correct in code, but a constructed-scene test should lock the portal meshes out of the interactive target collection.
- `blind/reduced motion`: **patch** — The source guard exists, but a runtime helper test should establish that portal transforms remain static when reduced motion is selected.
- `blind/keyboard focus`: **false** — The surrounding code already calls `world.setHighlight()` on each semantic destination `focus` and clears it on `blur`; locked roles simply have no portal to intensify.
- `blind/disposal`: **false** — `disposeObject(scene)` traverses every portal mesh and disposes its geometry/materials; the point light has no disposable GPU resource.
- `blind/sign source`: **false** — The façade deliberately renders `role.label`, matching the approved profession-only signs; the unused legacy campus sign text predates this change and does not affect the rendered outcome.
- `blind/preserved identity coverage`: **patch** — Add explicit assertions that role position, accent, sign, id, and unlock state remain as intended alongside the uniform footprint contract.
- `blind/dist artifact`: **false** — The completed `npm run build` runs the repository’s distribution verifier and produced the referenced hashed asset; a separate bundle-level route test is not needed for this scene-only change.
- `verification/portal behavior`: **patch** — Pre-verified verification gap: exercise portal ownership, excluded decorative meshes, focus intensity, and static reduced-motion updates on constructed objects.
- `verification/opaque rendered house`: **patch** — Pre-verified verification gap: traverse constructed houses and assert their structural/window/sign materials are opaque.

## Design Notes

Use a shared warm concrete house body, dark gable roof, opaque illuminated window panes and a small front porch. Treat unlocked entries as arcade checkpoints: layered geometric frames in each role accent colour, not post-processing bloom. This keeps the result reliable on the current Three.js bundle and visually legible against the blue outdoor scene.

## Verification

**Commands:**

- `npm test` -- expected: all role, route and campus contracts pass.
- `npm run build` -- expected: production bundle and local-asset verifier pass.

**Manual checks:**

- Inspect the desktop scene: five equal opaque houses fit within the camera, only two have arcade portals, and their doors still enter the correct route.
- Inspect a locked destination through the semantic control: it announces availability without navigation or a playable overlay.
