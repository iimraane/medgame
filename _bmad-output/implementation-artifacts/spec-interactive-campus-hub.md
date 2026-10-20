---
title: 'Interactive Campus Hub'
type: 'visual-feature'
created: '2026-10-20'
status: 'done'
context: []
---

## Intent

Replace the temporary CSS-only profession hub with a premium, desktop-first interactive campus. The supplied `Futuristic Healthcare Campus Courtyard.png` becomes the scene artwork: players see a complete courtyard, discover professions through the real façades, and enter an available career through its illuminated door. The right-side directory is a live information panel integrated into the scene, not a generic menu layered on a background.

The existing welcome screen stays as the game entry point. Pressing Play must preload the campus artwork before navigation, show a deliberate short loading transition, and reveal the completed hub only after the scene is ready. Mobile is intentionally unsupported in this increment and receives a clear French desktop-only notice.

## Experience Contract

- Use the second supplied campus image as the source asset, stored in the project under a stable application asset path during implementation.
- Keep the hub limited to desktop (`min-width: 1024px`). At narrower widths, show no clipped or partially interactive campus; show a French “available on PC” view instead.
- Use semantic, keyboard-reachable hotspot controls aligned with the five door façades. Their default state is visually embedded in the artwork; hover/focus adds a restrained bloom, edge highlight, and profession label without obscuring the scene.
- Dietetics is the only playable door. Activating it opens the existing Dietetics mission map.
- General Practice, Nursing, Psychology, and Pharmacy stay locked. Door activation and the directory can open their information only; neither route nor session is created.
- The right directory initially presents all professions. Selecting one replaces the panel with a detailed profession manual containing its purpose, learning objectives, expected mission types, and availability. A back control restores the directory.
- Preserve the existing safety-oriented framing: educational simulation, no individualized medical advice, and no promise of unimplemented gameplay.

## Visual Direction

Use the image as a full-window environment, not as a card or illustration behind a new grid. Position the live panel at the right edge in the footprint suggested by the image’s embedded directory. Build transparent hotspot layers with carefully tuned glow/shadow pseudo-elements instead of visible rectangular buttons. The selected profession uses the same color family as its sign in the artwork. Keep typography compact, legible, and calm; avoid emoji as primary UI or decoration.

The loading view should share the campus palette and use a concise status such as “Préparation du campus…”, an unobtrusive progress treatment, and a minimum display duration so the handoff feels intentional rather than a flash.

## Code Map

- `public/assets/campus-hub.png` — optimized copy of the supplied courtyard artwork.
- `src/ui/menu.js` — keep the welcome actions, add the preloading/loading handoff to the hub.
- `src/ui/campusHub.js` — render desktop scene, semantic door hotspots, directory, and profession-manual state.
- `src/data/roles.js` — extend each visible role with manual content and image hotspot geometry while retaining unlock metadata as the source of truth.
- `src/main.js` — add hub/loading routes and preserve existing Dietetics levels navigation.
- `src/style.css` — desktop campus composition, hotspot focus/hover treatment, panel states, loading view, and desktop-only notice.
- `tests/roles.test.js` — cover role manual data, hotspot contract, playable versus locked door actions, and narrow-screen policy.
- `README.md` — document desktop-only access and the campus asset workflow.

## Acceptance Criteria

- Given a desktop player presses Play, when campus artwork is not yet ready, then a French loading view appears and the hub is not rendered partially.
- Given the campus has loaded at 1024px or wider, when the player hovers, focuses, or activates a door, then the corresponding door is visibly highlighted and keyboard-operable.
- Given the Dietetics door is activated, when navigation succeeds, then the existing Dietetics mission map opens.
- Given a locked profession door or its directory entry is activated, when the player explores it, then its manual opens and no playable route or API session is created.
- Given a manual is open, when the player uses its return control, then the complete profession directory is restored.
- Given a viewport narrower than 1024px, when the app starts or resizes, then a desktop-only French notice replaces the hub and all campus interactions are unavailable.
- Given the campus scene is rendered, when visual UI is inspected, then no emoji is used as the primary representation of a profession.

## Verification

- `npm run build`
- `node --test tests/roles.test.js tests/engine.test.js tests/storage.test.js`
- Manual desktop check: verify the five aligned hotspots, hover/focus glow, the Dietetics route, every locked manual, directory back behavior, and the loading transition with cache disabled.
- Manual narrow-width check: at 1023px, verify that the PC-only notice replaces the campus rather than cropping it.
