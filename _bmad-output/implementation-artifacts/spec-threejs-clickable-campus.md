---
title: 'Three.js Clickable Campus'
type: 'feature'
created: '2026-10-24'
status: 'done'
route: 'dispatch'
baseline_commit: '70ea44ae5e97c946ecb47f1b4f048ba5866127e7'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current hub is an editable CSS illustration, but its flat, composited buildings cannot deliver the depth, lighting, believable perspective, or exact door selection expected from a game world. Its interaction is still governed by 2D rectangular layout data rather than actual architectural geometry.

**Approach:** Replace the CSS campus scene with a locally authored Three.js 3D campus, assembled from reusable procedural architecture and PBR-style materials. Each destination owns a named, visible door mesh that supports hover, keyboard focus, and click selection through raycasting; no player account, remote art runtime, or backend service is introduced.

## Boundaries & Constraints

**Always:** Preserve the existing menu, route behavior, role identities, unlock rules, cookie-backed progression, French copy, desktop-only campus threshold, and keyboard access. Create the scene entirely from application-owned code and assets: a warm, cinematic medical campus with glass, concrete, planted walkways, interior glow, depth fog, and subtly animated wayfinding. A direct door interaction must map only to its corresponding role: Dietetics and Nursing enter their current level routes; the three locked doors open the existing contextual preview. Provide a semantic accessible destination list synchronized with the visual scene so the canvas does not exclude keyboard or assistive-technology users. Respect reduced-motion preferences and clean up renderer, listeners, and animation work when the hub unmounts.

**Never:** Do not add a player account, payment, analytics, remote font, remote texture, Spline embed, image-based hotspot, external scene editor dependency, Worker/API change, or Cloudflare deployment. Do not alter mission content, role IDs, route slugs, cookie semantics, or make locked doors enter gameplay. Do not retain the old CSS buildings or lower-right terminal as visible hub content.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Enter hub | Desktop player reaches `hub` | Canvas reveals a stable, polished 3D campus after the current loading handoff. | Renderer uses an accessible DOM fallback if WebGL cannot be initialized. |
| Select a playable door | Pointer ray or keyboard activates a Dietetics/Nursing destination | The exact door receives a hover/focus highlight, then existing `levels` navigation opens for that role. | Ignore intersections that do not resolve to a known door. |
| Select a locked door | Pointer ray or keyboard activates General Practice, Psychology, or Pharmacy | A contextual French preview opens; routes do not change. | Preview disables competing destinations and restores focus to its invoker when closed. |
| Resize or motion preference | Wide desktop resize, device pixel ratio change, or reduced-motion preference | Camera/renderer stay proportionate; static equivalent affordances remain legible when motion is reduced. | Clamp render pixel density and stop decorative motion where requested. |
| Leave hub | Navigation away from `hub` | Canvas, listeners, and frame loop are disposed so no invisible renderer continues consuming resources. | Cleanup is safe if initialization was incomplete. |

</frozen-after-approval>

## Code Map

- `package.json` and `package-lock.json` -- add the local Three.js runtime used by the Vite frontend; do not alter server or Worker dependencies.
- `src/ui/campusHub.js` -- replace CSS-building rendering with the Three.js lifecycle, raycast door mapping, DOM accessibility controls, and existing preview/navigation behavior.
- `src/data/roles.js` -- keep roles as the source of identity/unlock state; evolve campus metadata from 2D percentage boxes to a stable 3D scene placement and door identifier contract.
- `src/style.css` -- retain shell, HUD, preview, desktop notice, and focus affordances; remove visible CSS-scene geometry and define canvas, accessible-list, and WebGL fallback presentation.
- `src/main.js` -- expose a view teardown boundary so hub resources are disposed before any route replaces the app content.
- `tests/roles.test.js` -- replace 2D layout assertions with 3D destination/door contracts and source-level lifecycle/accessibility guardrails while preserving role-route coverage.
- `README.md` -- document the local Three.js scene architecture, interaction model, and no-account persistence constraint.

## Tasks & Acceptance

**Execution:**

- [x] `package.json`, `package-lock.json` -- install Three.js as a pinned application dependency compatible with the existing Vite build.
- [x] `src/data/roles.js` -- define each role's editable world placement, visual accent, and named door contract without modifying role semantics.
- [x] `src/ui/campusHub.js` -- build and dispose a local 3D campus; create named door meshes, raycast hover/click behavior, semantic keyboard controls, and locked-preview handling.
- [x] `src/main.js` -- call the hub cleanup routine before rendering a replacement route.
- [x] `src/style.css` -- make the 3D canvas fill the desktop scene and implement HUD, focus, fallback, and motion-safe states without CSS architectural stand-ins.
- [x] `tests/roles.test.js` and `README.md` -- codify the new contracts and explain the maintainable local scene workflow.

**Acceptance Criteria:**

- Given a desktop hub session, when the player sees the campus, then it reads as a coherent perspective 3D environment rather than flat HTML building cards.
- Given any rendered destination door, when it is hovered, focused, or selected, then the response belongs to that exact door and accurately communicates playable versus locked state.
- Given the app navigates away from the hub, when the next route renders, then no canvas animation or event handler remains active.
- Given WebGL is unavailable, when the hub opens, then the player can still select every destination through an understandable French DOM fallback.

## Implementation Notes

- Added local `three@0.180.0` and procedural architectural meshes so the scene remains editable in source without remote models or image hotspots.
- Confirmed live WebGL raycast selection on the Psychology door, locked preview/focus restoration, and Dietetics route navigation in the local browser.
- Production build warns that the single JavaScript chunk exceeds 500 kB after minification; it remains a non-failing Vite advisory.
- Added a desktop initialization gate, cancellable loading transition, context-loss fallback, transactional WebGL setup, and a testable lifecycle/selection boundary after review.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
| --- | --- | --- | --- |
| The canvas initialized below the desktop breakpoint. | medium | patch | The hidden scene still allocated WebGL at mobile widths; `canInitializeCampus()` now prevents it and is tested. |
| Reduced-motion retained a static render loop. | low | reject | The scene's only motion is frozen; a render loop maintains a functional static WebGL view, and stopping/restarting it adds disproportionate state handling. |
| WebGL context loss had no semantic fallback. | medium | patch | `webglcontextlost` now disposes the scene and exposes the destination-list fallback. |
| A partial WebGL initialization could leak resources. | medium | patch | Setup now disposes allocated resources transactionally before falling back. |
| Preview needed dialog semantics and focus containment. | false | reject | The approved contract disables competing destinations and restores focus; it does not make the compact preview a modal dialog or prohibit the exit control. |
| Canvas preview focus restored to an unrelated control. | false | reject | Canvas selection explicitly passes the matching semantic role control as invoker, so return focus lands on the equivalent destination. |
| Buildings lacked in-world textual labels. | false | reject | The user-facing semantic destination list labels every visible role and the approved contract does not require 3D text meshes. |
| Retired CSS architecture remained in the bundle. | low | patch | The obsolete CSS scene, building, and route rules have been removed. |
| The loading timeout could reopen the hub after navigation. | medium | patch | The lifecycle now owns and cancels the pending handoff timer on route teardown. |
| Door selection lacked runtime coverage. | low | reject | Selection is extracted into executable role-action tests and live raycast click behavior was manually verified; adding a browser framework solely for canvas dispatch is disproportionate. |
| Teardown was protected only by source text. | low | patch | The lifecycle now has executable idempotent teardown and pending-timer tests, while the Three.js disposal wiring stays source-guarded. |
| Canvas clicks could bypass an open preview. | medium | patch | Shared selection now returns an ignore result while preview state is active, with a regression test. |

## Design Notes

The campus will be authored from reusable Three.js meshes rather than a generated opaque backdrop so its geometry, lighting, door positions, and future progression states remain editable in source. A hidden-or-visually-minimal semantic control layer mirrors the five mesh doors; raycast selection calls the same role action function as keyboard activation, preventing separate interaction semantics.

## Verification

**Commands:**

- `npm test` -- expected: all role, persistence, route, and server tests pass.
- `npm run build` -- expected: Vite bundles the Three.js scene and distribution verification succeeds.

**Manual checks:**

- Inspect 16:9 and wide desktop views; hover and click all five doors, then tab through all destinations and open/close a locked preview.
- Inspect reduced-motion and a 1023px viewport; verify the static campus affordances and existing desktop-only notice.
- Use a browser with WebGL disabled; verify the fallback destinations retain all role actions.
