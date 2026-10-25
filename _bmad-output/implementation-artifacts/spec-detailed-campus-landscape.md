---
title: 'Detailed Campus Landscape Assets'
type: 'feature'
created: '2026-10-25'
status: 'done'
route: 'dispatch'
baseline_commit: 'c1ccd9a2edb05921f1e209c955e6a1334c8808b6'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The campus foreground still reads as a blockout: trees use cone-and-sphere silhouettes, benches are simple boxes, flowerbeds are spheres, and the path, grass, houses, windows, roofs, doors, porches, sky and distant background lack convincing material detail. That undermines the requested detailed, believable game world even though the five houses and arcade doors are now clear.

**Approach:** Keep the approved five-house layout and arcade portals, but give the entire scene a curated, textured outdoor treatment: varied trees, shrubs, flowers, rocks, benches, lamps, path edging, layered grass, believable house/roof/window/door/porch construction, and a richer distant garden/campus, sky and cloud backdrop. Use a small selected subset of locally bundled, licence-compatible glTF assets rather than runtime URLs, with procedural material/detail fallbacks only where an asset does not improve the result.

## Boundaries & Constraints

**Always:** Preserve the five equal opaque houses, their profession-only signs, positions, door ids, routes, unlock states, browser-only progression, desktop camera, semantic destination controls, accessibility announcements, Escape navigation, and the two arcade portals. Enrich each house consistently with opaque material layers and recognisable roof, window, door and porch construction; add material/detail variation to the path and grass; and make the sky/cloud/distant-campus background deepen the composition without reducing sign or portal legibility. Downloaded assets must be committed locally with their provenance/licence recorded, load from this app’s own static assets, cast/receive sensible shadows, and remain performant on the desktop campus. Use a coherent detailed stylized-realism kit—avoid mixing photoreal scanned assets into the current arcade art direction. Put landscaping outside the clickable door raycast array; retain an attractive procedural fallback if a model fails to load.

**Never:** Do not replace the five buildings with generic asset houses, change the gameplay/UI flows, introduce a third-party runtime/CDN dependency, add accounts/payment/analytics/backend or Cloudflare configuration changes, or publish/deploy as part of this work. Do not bulk-import an entire asset pack when a curated subset satisfies the composition.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|----------------------------|----------------|
| Desktop campus loads | Normal WebGL-capable desktop viewport | Detailed trees, flowerbeds, shrubs, benches, lamps, stones, layered grass, textured path, detailed house surfaces and layered distant scenery/sky make the campus read as a designed place. | Keep the full five-house composition visible and responsive. |
| Asset models load | Local selected GLB/glTF files available | Each selected model appears with its intended scale, materials and shadows; none becomes a click target. | Skip a failed model and show a non-blocking procedural counterpart without breaking navigation. |
| Reduced motion / keyboard navigation | Motion reduced or semantic controls used | Decorative vegetation stays static; arcade feedback and all routes remain usable. | No animation dependency for landscape readability. |
| Smaller desktop / constrained GPU | 1024px width or weaker hardware | Campus remains legible without duplicated high-poly clutter or long blocking loading. | Limit model variants/instances and keep local fallback view intact. |

</frozen-after-approval>

## Code Map

- `src/ui/campusHub.js` -- owns scene composition, light, path, temporary vegetation/benches and disposal; replace placeholder environmental builders while keeping camera, door raycasting, fallback and lifecycle intact.
- `src/ui/campusBuildings.js` -- owns the uniform houses/doors/arcade portals; enrich their opaque architecture consistently without altering raycast ownership, identity or footprint.
- `src/data/roles.js` -- role positions, identities and doors must stay unchanged.
- `src/style.css` -- desktop scene and fallback controls must retain their unobtrusive semantics.
- `tests/roles.test.js` -- extend scene-contract coverage for local asset provenance/fallback and ensure landscaping never enters door interactions.
- `public/assets/campus/` (new as required) -- curated local glTF/GLB models and a provenance/licence record, not an unbounded asset dump.

## Tasks & Acceptance

**Execution:**

- [x] `public/assets/campus/` -- curated seven CC0 Kenney Nature Kit GLBs with the verbatim licence and local provenance record.
- [x] `src/ui/campusHub.js` -- load/clone local models into foreground, midground and background landscaping; replaced primitive blockout props and enriched grass/path/sky/cloud/distant campus while preserving lifecycle and fallback behaviour.
- [x] `src/ui/campusBuildings.js` -- added shared opaque roof, window, door and porch construction detail without changing footprint, sign identity, playable-door ownership or unlock logic.
- [x] `src/ui/campusHub.js` -- added non-blocking local asset loading with complete procedural substitutes and disposal guards.
- [x] `tests/roles.test.js` -- added landscape asset, licence, fallback, raycast and invariant coverage.

**Acceptance Criteria:**

- Given the desktop campus, when the player scans the foreground and sides of the path, then they see recognisable detailed trees, layered shrubs, individual flowers, proper benches, lamps and stones rather than primitive balls/cones/boxes, with visibly richer grass and a constructed path surface.
- Given the whole view, when the player looks at a house or beyond it, then textured opaque roof/window/door/porch details and layered vegetation, distant campus scenery, sky and clouds create depth without obscuring signs or doors.
- Given an unlocked or locked door, when the player clicks it or uses its semantic destination, then it retains the existing route/feedback and landscaping never captures that interaction.
- Given a missing landscape asset, when the campus opens, then it remains usable and visually complete through the fallback rather than failing to render.

## Implementation Notes

- Imported a small CC0 Kenney Nature Kit subset (two trees, grass, two flowers and two rocks) as local GLBs; async loads clone only bounded instances and cannot mutate a disposed scene.
- Retained the more detailed procedural environment as an immediate visual layer and full failure fallback, including branched trees, shrub clusters, flowerbeds, slatted benches, lanterns, rocks and grass clumps.
- Refined the five shared houses with gable-aligned roof trim, window muntins, entry surrounds, posts and stepped porches; retained the opaque construction and separate arcade portals.
- Browser inspection confirmed the corrected roof silhouette, richer landscaping and intact semantic destination list.

## Spec Change Log

## Review Triage Log

- `blind/dist bundle`: **patch** — The successful build rewrote the tracked distribution entrypoint, so the generated `dist/index.html` must be force-staged with its matching bundle before the local commit.
- `blind/inactive GLB callback`: **patch** — A callback after disposal currently returns without releasing the decoded scene; dispose that unattached scene before returning.
- `blind/shared clone disposal`: **false** — Three.js `dispose()` is idempotent for these cloned geometries/materials and the scene teardown already traverses every attached instance; no duplicate visible or GPU outcome was demonstrated.
- `blind/procedural plus GLB scenery`: **false** — The procedural composition is intentionally a complete immediate layer and load-error fallback; the added GLBs are bounded accents at distinct placement coordinates rather than a replacement contract.
- `blind/grass shadow cost`: **patch** — Fine grass blades need not cast shadows; disable that flag to reduce the extra shadow work on constrained desktop GPUs.
- `blind/roof battens`: **false** — The current roof detail uses two thin gable-aligned trim rails, and the fresh browser inspection shows an unobscured roof silhouette; the reported broad slabs were already removed.
- `blind/upper-window muntins`: **patch** — Add the same restrained muntin treatment to the upper windows so each façade opening receives the promised construction detail.
- `blind/Quaternius versus Kenney`: **false** — The non-binding Design Notes say Quaternius is preferred; the frozen intent requires licence-compatible local assets, which the documented CC0 Kenney subset satisfies.
- `blind/provenance detail`: **patch** — Record the canonical Kenney Nature Kit URL, archive name/version and selected source paths in the local provenance README.
- `blind/static loader tests`: **patch** — Add an executed controlled-loader test covering configured paths, success cloning, load failure and post-disposal behavior.
- `verification/loader execution`: **patch** — Pre-verified gap: extract an injectable landscape loader helper and assert successful placement, failure fallback and disposed-scene safety at runtime.

## Design Notes

Use the Quaternius Stylized Nature MegaKit free glTF subset as the preferred source: its documented outdoor variety matches the current stylized game language and its licence allows incorporation into a product. Curate only the few model categories that materially improve the view; use instancing/cloning for repetition rather than dozens of unique models. Arrange composition as a landscaped arrival path: hero trees at the side edges, shrubs and flower clusters at the pedestrian scale, benches/lights to frame the path, and softer vegetation/rocks behind the houses for parallax-like depth. Give the shared houses layered facade, roof, window, entry and step materials; build sky/cloud depth from local procedural texture work so it stays cohesive and light.

## Verification

**Commands:**

- `npm test` -- expected: all existing role, route, lifecycle and landscape contracts pass.
- `npm run build` -- expected: production asset verification and bundle build pass.

**Manual checks:**

- Inspect the local desktop campus for recognisable, textured landscape objects, full house/sign visibility, arcade portal legibility and believable shadows.
- Open both playable roles and a locked role through the semantic destination controls; verify routes/feedback and no decorative mesh intercepts clicks.
