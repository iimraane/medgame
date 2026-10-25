---
title: 'Controlled 3D Medical Garden'
type: 'feature'
created: '2026-10-25'
status: 'done'
route: 'dispatch'
baseline_commit: 'c8b7b71bb7e71cc5e18d703e517ec749f3970f9a'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current hub renders the supplied reference as a flat bitmap. It is visually faithful but no longer a scene the product controls, and therefore does not meet the request for a beautiful, realistic, textured 3D campus.

**Approach:** Restore the interactive Three.js garden and enhance its original geometry, physically lit materials, local texture treatment, procedural sky and planted environment so it evokes the supplied reference while staying entirely rendered in WebGL.

## Boundaries & Constraints

**Always:** Render the five pavilions, roofs, glazing, path, trees, garden and background as controlled Three.js geometry and local textures; preserve all existing role ids, routes, unlock states, semantic controls, Escape behavior, clickable door raycasts, lifecycle cleanup and exactly the two arcade portals. Keep all role signs readable and all houses opaque except intentional entry glazing. Use local assets only and retain the failure fallback for local foliage loading.

**Never:** Do not display the supplied reference image anywhere in the hub, replace the scene with a plane/bitmap, add a new HUD/panel, change Cloudflare settings or gameplay, make locked roles playable, or deploy during this implementation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|----------------------------|----------------|
| Desktop campus | Normal desktop viewport | A full WebGL scene shows five landscaped medical pavilions, readable signs, tiled roofs, glass entries, lit path, vegetation and horizon. | Canvas retains responsive fit with all doors reachable. |
| Door interaction | Pointer or semantic control selects a role | Existing route or locked feedback works; only Diététique and Soins infirmiers show arcade portals. | Decorations never enter the door raycast set. |
| Asset failure / teardown | GLB fails or user leaves during loading | Coherent procedural garden remains; late loading cannot mutate a disposed scene. | Preserve guards, fallback and disposal. |

</frozen-after-approval>

## Code Map

- `src/ui/campusHub.js` -- contains the retained Three.js scene builder and was recently switched to the flat reference markup; restore the canvas path and use `buildScene` unchanged for interaction ownership.
- `src/ui/campusBuildings.js` -- five-house builder, opaque structural materials, entry glazing, roof tiles, sconces and arcade portal ownership; refine only visual geometry/materials without changing door data.
- `src/ui/campusGardenComposition.js` -- local paver, curb, horizon and bounded foliage placement composition; use it as the controlled environment contract.
- `src/ui/campusLandscapeAssets.js` -- local GLB cloning, failure and disposal handling which must survive the redesign.
- `src/style.css` -- remove reference-only presentation rules and restore canvas-first scene styling.
- `tests/roles.test.js` -- existing role, building, composition and loader contracts; update the hub assertion to cover canvas rendering rather than reference markup.

## Tasks & Acceptance

**Execution:**

- [x] `src/ui/campusHub.js` -- remove the flat-image branch and reinstate the canvas-based scene initialization while retaining existing pointer/semantic role dispatch.
- [x] `src/ui/campusBuildings.js` -- intensify original pavilion material hierarchy: tiled dark gables, stone piers, wood soffits, framed translucent glazing and warm entrance lighting.
- [x] `src/ui/campusHub.js` and `src/ui/campusGardenComposition.js` -- enrich the controlled environment with a broad paver approach, layered local sky/mountains, dense bounded planting, lamps and benches.
- [x] `src/style.css` -- remove flat-reference visual rules and ensure the WebGL canvas fills the desktop campus cleanly.
- [x] `tests/roles.test.js` -- retain executable house/composition/door tests and assert that the hub builds a canvas, not a reference image.

**Acceptance Criteria:**

- Given a desktop player opens the hub, when the scene renders, then it is visibly a live 3D medical-garden composition rather than a static image.
- Given a player inspects the scene, when looking at façades and environment, then material/lighting/geometry communicate realistic stone, timber, glass, tiled roofing, garden planting and depth.
- Given any existing role interaction, when a user selects it, then routing, locked feedback and the two arcade portal assignments remain unchanged.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- defer — The generated JavaScript entry referenced by `dist/index.html` is ignored and absent from Git, but the baseline used the same generated-output convention and deployment rebuilds `dist`; this is pre-existing repository packaging behavior, not caused by restoring the canvas.
- patch — Opening the hub below 1024px and widening it left the visible canvas uninitialized; viewport changes now initialize the desktop scene and dispose it again when the scene becomes hidden.
- false — The semantic destination buttons remain present and focusable; they continue to announce/highlight the selected role, so removal of the bitmap hotspots did not remove the preserved semantic controls.
- patch — A scene initialized on desktop kept rendering while hidden below 1024px; the viewport handler now disposes the world and its pending landscape guard before it can continue offscreen.
- defer — The Node test suite has no DOM/WebGL runtime, so a rendered canvas test needs a browser or DOM harness; the existing executable scene, building, lifecycle, and loader contracts run in `npm test`, while a browser-level test is deferred with the harness adoption.

## Design Notes

Prioritise the image’s material hierarchy rather than copying it: a single low camera, five pavilion rhythm, dark roof silhouettes, warm facade light, axial path, planted thresholds and distant sky. The result must remain editable through scene code, not image editing.

## Verification

**Commands:**

- `npm test` -- expected: all role, scene and application tests pass.
- `npm run build` -- expected: production WebGL assets build and the distribution verifier passes.

**Manual checks:**

- Inspect the local desktop canvas; confirm it is a Three.js scene with visible depth and that all five doors can still be selected.
