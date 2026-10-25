---
title: 'Medical Garden Reference Fidelity'
type: 'feature'
created: '2026-10-25'
status: 'done'
route: 'dispatch'
baseline_commit: '39456814932f79b7ae7470c5e8b1812861d28645'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current campus has the right five destinations but still reads as a low-poly blockout. It does not approach the supplied Medical Garden reference’s composed row of warm, credible medical pavilions, tiled roofs, clear storefront doors, paved arrival path, lush planting, lamplight, and cinematic mountain-and-cloud depth.

**Approach:** Recompose the interactive Three.js campus around the supplied reference: a continuous five-pavilion medical garden with lower eye-level camera, warm stone/wood façades, dark tiled gables, deep framed glass entries, individual illuminated signs, a broad paver path, dense planted borders, real local foliage assets, ornamental lamps/benches, and a layered blue-sky mountain background. Keep the existing playable portals integrated at their own doors rather than replacing the game with a flat reference image.

## Boundaries & Constraints

**Always:** Preserve five equal opaque houses, role order/ids/labels/sign ownership, positions as far as compatible with the continuous reference composition, role routes/unlock states, browser-only progress, semantic controls, Escape/fallback/lifecycle, clickable doors only, and exactly the two arcade portals. Use local assets/materials only, retain Kenney provenance and error fallback, keep signs profession-only and readable, and make every landscape mesh non-interactive. Match reference cues through original WebGL geometry/materials rather than embedding or serving the supplied image as a scene background.

**Never:** Do not copy the reference image into the app, change gameplay or Cloudflare configuration, add remote/CDN runtime assets, add a HUD/panel, make locked roles playable, remove accessibility controls, or publish/deploy in this work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|----------------------------|----------------|
| Desktop open | Standard desktop canvas | Five aligned medical pavilions read as a single composed garden frontage, with signs, dark tiled roofs, bright entry glazing, path and gardens in one camera view. | Keep every door and sign visible; preserve responsive fitting. |
| Scan foreground/background | Player views path, borders and horizon | Pavers, curbs, lampposts, benches, planted beds, trees and mountains/clouds create depth comparable in spirit to the reference. | Local asset failure leaves a coherent procedural garden. |
| Use a door | Pointer or semantic control targets each role | Door routes/locked feedback are unchanged; only Diététique and Soins infirmiers retain arcade portal treatment. | No decorative object joins `doors` raycast list. |
| Reduced motion / teardown | Reduced motion or leave campus during asset load | Garden remains static and legible; late asset callbacks cannot mutate a disposed scene. | Preserve existing loader guard and disposal path. |

</frozen-after-approval>

## Code Map

- `src/ui/campusHub.js` -- scene camera, path, environment lighting, foliage placement, sky and local GLB loading; replace its sparse composition while preserving raycasting, lifecycle and fallback.
- `src/ui/campusBuildings.js` -- shared five-house construction and arcade portals; refine façade/roof/entry language consistently without changing door ownership, ids or footprint contract.
- `src/ui/campusLandscapeAssets.js` -- local asset loader/failure/disposal behavior; reuse its injected-loader tests.
- `src/public/assets/campus/` -- existing CC0 local vegetation source; retain manifest/licence and add only lightweight required assets.
- `tests/roles.test.js` -- protect house, garden and loader contracts plus routes/raycast isolation.

## Tasks & Acceptance

**Execution:**

- [x] `src/ui/campusBuildings.js` -- reshape shared visual detailing into warm clinic pavilions: stone side piers, timber soffit band, properly tiled dark gable, framed glazed entry, sconce lights and stepped threshold.
- [x] `src/ui/campusHub.js` -- set a lower centered camera and compose the broad paver path, edged curbs, symmetrical planted beds, benches and lamps around the five-pavilion frontage.
- [x] `src/ui/campusHub.js` -- build local procedural sky/cloud/mountain layers and distribute existing local foliage assets as dense but bounded garden vegetation.
- [x] `src/ui/campusLandscapeAssets.js` -- retain bounded cloning, failure fallback and disposal safety as the new composition reuses local models.
- [x] `tests/roles.test.js` -- assert reference-composition hooks, unchanged door invariants and executable local-loader fallback behavior.

**Acceptance Criteria:**

- Given the campus opens on desktop, when compared with the supplied reference, then the scene clearly reads as five warm medical pavilions around a polished garden arrival rather than five plain cubes on a lawn.
- Given the player inspects a pavilion, when they scan roof, sign and entrance, then tiled gables, timber/stone façade layers, illuminated framed glazing, sconces and steps are recognisable and opaque.
- Given the player scans the grounds and horizon, when looking from path to background, then patterned pavers, dense planting, lamps, benches, blue sky/clouds and mountain silhouettes provide intentional depth.
- Given existing semantic or pointer interactions, when selecting any role, then all current routes, locked feedback and arcade portal ownership remain unchanged.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- `medium` / patch — Roof-tile positions rose toward the eaves and could visibly detach from the gable; the roof-tile helper will place them on the matching slope and tests will assert representative transforms.
- `medium` / patch — The physical pavers left repeated gaps and did not cover the full approach even though the underlying textured path remained; the approach will become continuous across the path extent.
- `medium` / patch — Locked entrances received a warm emissive material, weakening their non-playable distinction; their material will remain visibly glazed but non-emissive.
- `medium` / patch — The GLB placement map was unchanged, so the required dense bounded local foliage was not actually expanded; placements will be added around the garden borders.
- `low` / patch — 125 individual shadow-casting paver meshes add avoidable interactive-scene draw/shadow work; pavers will be batched while preserving their layout.
- `medium` / patch — Detail tests only counted roof meshes, so a detached tiled roof could pass; tests will inspect tile transforms.
- `false` — Cloud puff transparency uses a shared material and stable scene order with small depth offsets; no reproducible blend fault is established by the diff, and a speculative billboard layer is not warranted.
- `medium` / patch — Garden composition assertions were source-text regexes only; deterministic composition will be executable and inspected by the campus tests.
- `medium` / patch — The verification review confirmed that paver/curb/mountain/cloud/camera configuration could be removed from the scene while source regexes still passed; this is covered by the executable composition test patch.
- `medium` / patch — The verification review confirmed that roof-tile object counts could remain correct while tiles were off-plane; this is covered by the transform test and geometry correction.

## Design Notes

Reference cues to prioritise: five dark hipped/gabled roofs forming a rhythm across the top third; warm wood canopy beneath each roof; bright glazed doors set between stone piers; high-contrast profession plaques; an axial warm paver path; soft border planting; lamps and benches at pedestrian scale; mountains deliberately low on the horizon so the sky remains bright and open. The reference is inspiration for composition and material hierarchy, never a texture or embedded image.

## Verification

**Commands:**

- `npm test` -- expected: campus/role/asset loader tests all pass.
- `npm run build` -- expected: production build includes only local assets and passes the distribution verifier.

**Manual checks:**

- Inspect the local canvas at desktop width: compare composition, façade hierarchy, path and garden depth to the supplied reference while confirming all five signs/doors remain visible.
- Open a playable and a locked role from semantic controls; confirm route/feedback and no garden mesh captures the interaction.
