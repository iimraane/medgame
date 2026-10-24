---
title: 'Original Game Campus Hub'
type: 'feature'
created: '2026-10-24'
status: 'in-review'
route: 'dispatch'
baseline_commit: 'c84fb14b7649531e111c8a0d13502e9e2db20b4c'
context:
  - 'User supersedes the baked-image campus direction: recreate the hub as an original, easily adjustable game scene with the same premium medical-campus art direction and no lower-right information panel.'
---

## Intent

### Problem

The current hub is based on a single raster courtyard and a baked lower-right information terminal. Its art direction is attractive but its composition and interaction locations are constrained by pixels that cannot be redesigned independently. The visible terminal occupies a large portion of the scene, competes with the actual destinations, and forces future copy, layout, or progression changes to be aligned to a pre-rendered image. The user wants the campus reproduced as an original experience in the same general visual family, not a refined overlay on the existing image.

### Outcome

Replace the raster-led hub with a fully authored HTML/CSS game scene: an elegant, stylized medical campus at golden hour, composed from modifiable layers. It should feel like a premium game world rather than a dashboard or a realistic architectural mock-up. The player lands in a clear playable space with an immediately legible title, available-route progression, and a small number of distinct destination buildings. The lower-right baked kiosk disappears entirely. Instead, paths advertise themselves through architectural signs, glowing entry portals, an in-world navigation beacon, and a concise HUD. The whole visual system must be adjustable through data and CSS—no external art generation, locked background composition, canvas, or image-editing workflow is required.

### Visual direction

Keep the successful DA: warm cinematic light, dark teal shadows, glassy modern health-campus forms, turquoise/mint illumination, and a controlled neon accent system. Shift it toward a deliberately stylized “expedition map”: layered silhouettes, elevated walkways, panels with slight perspective, luminous wayfinding lines, and individual role landmarks. Do not attempt photorealism. No retro/pixel aesthetic, ambulance imagery, sterile hospital corridor, or generic productivity dashboard. Decorative elements should be inexpensive HTML/CSS shapes (gradients, borders, box-shadows, pseudo-elements) and remain subordinate to the playable buildings.

## Boundaries and constraints

### Always

- Remove the visible base campus raster and all baked kiosk/panel raster states from the rendered hub. The hub must still use semantic DOM controls rather than drawing interactions in a canvas.
- Preserve the five role identities, their existing data, unlock rules, and navigation behavior: Dietetics and Nursing remain immediately playable; the other roles remain previewable but locked.
- Build one scene per hub view from explicit, reusable layers: sky/ambient light, campus horizon, walkways, building cards, route-line accents, HUD, and compact contextual preview information.
- Store all destination placement, label, landmark, and state in role-driven data or a dedicated hub configuration. CSS must own presentation; no independently positioned values may be duplicated across JavaScript and CSS.
- Make each building button accurately match its rendered silhouette. Hover, keyboard focus, and playable state must highlight the same shape, with no generic oversized rectangle or glow detached from the building.
- Keep French interface copy, desktop-only campus behavior under 1024 px, keyboard access, focus restoration, clear reduced-motion behavior, and no account/payment/progress-pressure language.
- Maintain the existing dark menu-to-hub transition and use no new dependencies, remote assets, external fonts, audio, analytics, or backend changes.

### Never

- Do not keep the lower-right “À propos du hub” panel, recreate it as a floating card, or leave its raster/hotspots visible.
- Do not create a new payment, authentication, score, timer, subscription, or social system.
- Do not alter mission content, route slugs, save/cookie behavior, or Cloudflare code.
- Do not make locked routes start gameplay or place a clickable element on decoration that does not communicate what it does.
- Do not replace one opaque hero image with another generated opaque hero image; the durable outcome is an editable scene.

## Interaction and edge-case matrix

| Situation | Expected experience | Guardrail |
| --- | --- | --- |
| First visit | Player sees “Campus MedGame”, one direct instruction, and the count of currently playable paths. | It reads within a glance without a terminal or tutorial overlay. |
| Playable building | Dietetics/Nursing has an architectural sign, colored portal/edge, and clear hover/focus response. | Activating it preserves its existing game route. |
| Locked building | A quieter, attractive landmark can reveal its compact preview state. | It never suggests it can be played now. |
| Preview opened | Small contextual panel appears within the authored scene, with purpose, availability, and return action. | It is semantic DOM, does not cover other hit targets, and disables background destination controls. |
| Keyboard traversal | Tab reaches every destination and preview action in a logical order. | Focus contour matches the actual building shape and returns to its invoker after close. |
| Desktop resize | Buildings, route lines, and HUD remain compositionally balanced at common wide desktop ratios. | Scene geometry uses one responsive coordinate system, not viewport-specific JS. |
| Reduced motion | Route/beacon movement is replaced with still light states. | Discoverability and focus remain fully visible. |
| Mobile | Existing desktop notice continues to appear. | The custom scene is not squeezed into a phone layout. |

## Code map

- `src/data/roles.js`: existing role metadata and navigation contracts; add or replace only the data needed to identify configurable campus buildings and a compact preview summary.
- `src/ui/campusHub.js`: replace raster preloading/kiosk state machine with semantic scene rendering and a small, accessible preview state machine.
- `src/style.css`: replace the image-plane/kiosk styling with the original layered campus system, responsive composition, individual building silhouettes, and motion-safe effects.
- `tests/roles.test.js`: remove obsolete raster/kiosk assumptions and assert role-driven scene configuration, playable/preview behavior, DOM contracts, no-raster hub rendering, and reduced-motion safeguards.
- `src/public/assets/campus-*.png`: may remain packaged for unrelated historical content, but the hub must not reference or preload them.

## Execution tasks

- [x] Define the editable campus-building configuration and concise preview copy from the existing role identities; retain role/route functions unchanged.
- [x] Rebuild `renderCampusHub()` around a layered semantic scene, title HUD, route count, in-world destinations, and preview/return controls.
- [x] Replace current raster, hotspot, kiosk, and panel styling with original CSS art direction and per-building geometry.
- [x] Add regression coverage for the generated scene, absence of image/kiosk hooks, role states, preview focus/disabled background contract, and motion-safe styles.
- [x] Verify role tests, full suite, production build, and visual rendering at 16:9 plus a second wide desktop ratio with mouse, keyboard, preview, and reduced-motion inspections.

## Acceptance criteria

- Given a new desktop player, when the hub opens, then it feels like a finished game map and makes the next action unmistakable without the old lower-right terminal.
- Given the source, when a designer needs to alter a building, route, label, color, or layout, then the change is local data/CSS rather than image editing.
- Given each path, when it is hovered or focused, then the visual response precisely follows its own authored building silhouette and accurately signals playable versus preview-only state.
- Given a locked route preview, when it is open, then background destinations are unavailable and closing it restores focus to the originating control.
- Given common desktop dimensions or reduced-motion settings, when the hub is viewed, then hierarchy and usability remain intact.
- Given the deployment code, when the implementation is verified, then existing gameplay routes, persistence, mobile notice, and production build remain unchanged and passing.

## Verification plan

Automated checks will cover all five configured scene destinations, the two playable states, three preview states, generated HUD count, no base campus/kiosk references in hub rendering, preview control-state behavior, and reduced-motion declarations. The existing full suite will protect roles, routes, persistence, and production configuration.

Manual review will inspect the base scene, every building hover/focus, a locked preview and an available route, then desktop 16:9 and a wider ratio. The final test is visual clarity: it should read as a polished game campus first, never as a pasted image with invisible controls.

## Review Triage Log

| Finding | Verdict | Route | Evidence |
| --- | --- | --- | --- |
| The preview resembled the removed lower-right terminal. | medium | patch | It is now a temporary centered route dock, only shown after selecting a locked building. |
| Short desktop viewports could clip controls. | medium | patch | Scene minimum height is constrained by `100dvh`, retaining every control within the visible game view. |
| Decorative scene layers used negative stacking levels. | low | patch | They now use explicit non-negative layers below controls. |
| Keyboard focus did not follow the building silhouette. | medium | patch | The clipped building itself gets the white/accent drop-shadow focus contour. |
| README described the retired raster campus. | medium | patch | Documentation now describes the editable role-driven CSS scene. |
