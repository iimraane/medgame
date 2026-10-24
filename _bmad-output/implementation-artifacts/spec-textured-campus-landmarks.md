---
title: 'Textured Campus Landmarks'
type: 'feature'
created: '2026-10-24'
status: 'done'
route: 'dispatch'
baseline_commit: 'b7e9367bfbc684ce8d3c7560e5a31dc4d2d643f1'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The initial Three.js conversion provides clickable geometry but looks like a greybox: five generic block buildings share almost the same construction, have little surface detail, and do not communicate which health profession they represent. The visible destination strip at the bottom and framed quit control at top right also make the world read like a prototype UI rather than a polished game hub.

**Approach:** Turn the campus into a richly authored 3D environment with five unmistakable medical landmarks, durable local material/texture work, profession-only illuminated in-world signs, and door-level interaction. Remove all desktop HUD, bottom destination/preview controls, and top-right exit frame; retain equivalent keyboard and fallback behavior without leaving dashboard-like chrome in the world.

## Boundaries & Constraints

**Always:** Preserve existing roles, unlock states, cookies, route behavior, desktop breakpoint, WebGL fallback, and resource cleanup. Give each role a different readable building language: a greenhouse/nutrition pavilion, primary-care clinic, care atelier, quiet psychology conservatory, and pharmacy tower. Use local, repository-owned assets and/or procedural textures only, with no remote runtime requests. Render only the profession label on an actual 3D sign fixed to the corresponding façade. Make playable doors visibly game-like through in-world highlighting. Keep a visually hidden but keyboard-accessible semantic destination control set; announce unavailable roles without opening an overlay. Replace visual exit chrome with an unobtrusive keyboard escape route and fallback-only return action.

**Never:** Do not use the old CSS buildings, a lower-right panel, a bottom row of visible destination buttons, a top-right framed button, player account, payment system, external scene hosting, analytics, backend/Worker change, or Cloudflare deployment. Do not make locked professions launch a route or hide their availability.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Read the world | Hub opens at desktop width | Five visually distinct façades have readable, profession-only in-world signs and clearly highlighted playable doors. | Preserve high-contrast signage if decorative texture loading fails. |
| Choose a door | Pointer ray or keyboard targets a role | The matching door/sign gains a local highlight; only open roles navigate and locked roles announce their availability without an overlay. | Ignore empty-scene hits and keep keyboard feedback available. |
| Keyboard user | Tab/Shift+Tab moves through destinations | Focus is reachable without a visible permanent button bar; the active building gains a clear in-world state. | Escape returns to the menu only when no preview is active; preview keeps its current close behavior. |
| Small/fallback view | Width below 1024px or WebGL unavailable | No canvas is initialized; the existing notice/fallback exposes usable text controls, including a return action. | No decorative scene UI is left visible. |
| Viewport change | Desktop canvas resizes | Signage, door positions, and perspective stay legible without control overlap. | Clamp DPR and retain current renderer cleanup. |

</frozen-after-approval>

## Code Map

- `src/ui/campusHub.js` -- contains the procedural Three.js scene, door meshes, raycast path, semantic controls, preview, and renderer lifecycle; replace generic `addCampusBuilding()` composition with role-specific landmarks and mounted 3D signage.
- `src/ui/campusHubState.js` -- keep role-selection and lifecycle contracts; add only testable keyboard escape/visibility decisions if needed.
- `src/data/roles.js` -- existing `campus` data is the editable source of door placement, accent, and identity; extend it with landmark model/sign configuration rather than duplicating role labels in scene branches.
- `src/style.css` -- remove visual destination strip and top-right exit styling; supply visually-hidden controls, in-world interaction feedback support, and fallback-only controls.
- `src/public/assets/campus/` -- add any generated project-owned texture atlas or material maps, referenced locally by the Three.js loader only.
- `tests/roles.test.js` -- preserve route/lifecycle checks and add contracts for role-specific landmark/sign configuration plus non-visible desktop controls.
- `README.md` -- explain the new local asset/material workflow without implying remote content or account use.

## Tasks & Acceptance

**Execution:**

- [x] `src/public/assets/campus/` -- add one or more locally generated, reusable texture assets appropriate for modern medical architecture; document ownership and use.
- [x] `src/data/roles.js` -- describe each role's 3D landmark silhouette, sign treatment, and material accent in editable data.
- [x] `src/ui/campusHub.js` -- create distinct detailed landmarks, texture/material maps, façade signs, better lighting/environment treatment, and coherent raycast interaction.
- [x] `src/ui/campusHubState.js`, `src/style.css` -- remove visible desktop control chrome, preserve keyboard/fallback controls, and support Escape/back without a top-right frame.
- [x] `tests/roles.test.js`, `README.md` -- protect landmark identity, non-visible control contract, routes, and asset behavior.

**Acceptance Criteria:**

- Given the desktop canvas, when the player scans the campus, then each building can be identified as its profession without consulting any screen UI.
- Given a destination is hovered or focused, when its door is highlighted, then the glow and sign belong to the same façade and the interaction remains exact.
- Given normal desktop play, when the hub is open, then no visible HUD, bottom destination/preview control, or top-right framed exit control appears.
- Given keyboard-only or fallback play, when a role or return path is needed, then every former action remains reachable and clearly announced.

## Implementation Notes

- Added a repository-owned medical concrete/glass material atlas plus procedural sign textures; the production build resolves the public asset locally.
- Added data-driven landmark silhouettes and façade signs for the five professions, with raycasted doors, objective rings, point-light highlights, a blue sky, planted foreground, path lights, mountains, and soft shadows.
- Desktop controls are now visually hidden while remaining keyboard-accessible; a user-directed refinement removes all in-scene HUD/preview cards and reduces every sign to the profession name alone.
- Verification matrix: unit/integration contracts cover role identity, selection, escape behavior, lifecycle and fallback contracts; the local browser covered normal desktop signage, a clickable open door, and a locked-role preview; `npm test` (67/67) and `npm run build` passed.

## Spec Change Log

## Review Triage Log

- `low / patch` — generated material and canvas textures were not released on scene disposal; disposal now de-duplicates and disposes every material texture plus the sky texture.
- `false` — review references to desktop/mobile preview resize behavior no longer apply: the user-directed revision removed both preview panels and keeps unavailable-role feedback in the live region.
- `false` — the alleged hidden-mobile invoker path no longer applies because `selectRole` no longer receives or uses an invoker.
- `false` — current mobile routing no longer promises a locked-role overlay; it announces availability accessibly, which is covered by the same role action contract.
- `false` — Escape is wired directly in the rendered hub and its predicate is covered; no overlay state remains to suppress it.
- `low / rejected` — tab visibility throttling is a performance enhancement rather than a defect in the requested campus result.
- `low / rejected` — the locally owned atlas is intentionally retained at its authored quality to meet the requested textured environment; it has no remote request or runtime dependency.

## Design Notes

Use a common campus material vocabulary—weathered pale concrete, dark anodized metal, softly emissive glass, planted foreground—but vary massing and façades deliberately. Name signage belongs in the 3D world, mounted above or beside the exact door, rather than placed in HUD coordinates.

## Verification

**Commands:**

- `npm test` -- expected: all role and campus contracts pass.
- `npm run build` -- expected: local assets resolve and the production bundle verifies.

**Manual checks:**

- Inspect the hub at 16:9 and a wider desktop viewport; verify five readable building identities, texture quality, pointer door selection, keyboard focus, locked preview, and Escape return.
- Inspect 1023px and a forced-WebGL-fallback session; verify no canvas work and usable text-only actions.
