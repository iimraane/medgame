---
title: 'Baked Campus Panel States'
type: 'feature'
created: '2026-10-21'
status: 'done'
baseline_commit: 'cbdabef89e0eeb80ef3d06025b66414103472cde'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The campus currently redraws the lower-right profession manual with HTML, so the live panel does not perfectly match the supplied art. The user has supplied five matching full-scene images whose lower-right kiosk already contains the intended manual state for each profession.

**Approach:** Keep one pristine campus image as the stable scene and use the five supplied state images as locally clipped layers. Selecting a profession fades only the kiosk area from the default image to that profession’s baked panel state; the courtyard, doors, and all other pixels remain unchanged. The existing image kiosk itself becomes the interaction surface, while the added HTML detail panel is removed.

## Boundaries & Constraints

**Always:** Keep all artwork lossless PNG at its supplied 1672×941 resolution. Use `campus-hub.png` as the default scene and map each supplied state to its matching role: Dietetics (`...46 AM-1`), General Practice (`...47 AM-2`), Nursing (`...48 AM-3`), Psychology (`...49 AM-4`), and Pharmacy (`...50 AM-5`). Preserve the five keyboard-accessible façade hotspots, but show only an accurately shaped color glow on hover/focus—no added profession label. Preserve the full-screen desktop-only contract and the existing Dietetics mission route. Constrain visual crossfades to the lower-right kiosk silhouette/region, with no full-scene fade. The baked CTA remains noninteractive for locked roles despite being visible in the supplied artwork; only Dietetics may navigate into a mission.

**Never:** Do not add a separate digital panel, modal, card, or text overlay for profession details. Do not recompress, resize, filter, or regenerate the supplied images. Do not make locked professions playable, create their API sessions, or change medical content. Do not animate/crossfade the courtyard when a user clicks a profession.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open a profession from its façade | Hover/focus then click a locked façade | Its matching kiosk state fades in locally; no route or API session is created | Missing state asset leaves the default scene active and announces a concise French error |
| Open a profession from the kiosk list | Click a row on the default image kiosk | The matching supplied state replaces only the kiosk region | Invalid role mapping leaves the default kiosk untouched |
| Return to default kiosk | Activate the baked “Retour au panneau” region in a state image | Local kiosk fade returns to the default `campus-hub.png` panel | No scene-wide image transition occurs |
| Enter Dietetics | Activate the Dietetics façade | Existing Dietetics mission map opens | Existing route guard remains authoritative |
| Narrow viewport | Width below 1024px | Existing PC-only notice replaces the campus | No hotspot or image interaction remains available |

</frozen-after-approval>

## Code Map

- `src/public/assets/campus-hub.png` -- current default campus scene; preserve exactly as the base layer.
- `src/public/assets/campus-panel-*.png` -- new lossless copies of the five supplied full-scene detail states; all have the same 1672×941 frame as the base.
- `src/ui/campusHub.js` -- currently creates the HTML manual panel; replace it with state-layer selection, local preloading, kiosk row/back hotspots, and Dietetics-only navigation.
- `src/style.css` -- existing `.campus-scene__image`, façade glow shapes, `.campus-directory-hotspots`, and `.campus-panel-detail`; remove the dynamic detail panel styles and add isolated kiosk clipping/crossfade styles.
- `src/data/roles.js` -- existing role ids, colors, hotspot geometry, unlock state, and manual text; add only a stable state-asset reference if it prevents duplicated role-to-image mapping.
- `tests/roles.test.js` -- existing role and desktop-policy checks; add state-image mapping and locked-action contract coverage without a browser framework.
- `README.md` -- update the campus asset workflow to identify base and state artwork.

## Tasks & Acceptance

**Execution:**
- [x] `src/public/assets/campus-panel-*.png` -- added the five supplied state images losslessly under stable, role-specific filenames.
- [x] `src/data/roles.js`, `src/ui/campusHub.js` -- mapped every profession to its state asset, preloaded layers, and replaced HTML details with state selection plus kiosk back/list controls.
- [x] `src/style.css` -- removed the added visual panel, clipped opacity crossfades to the lower-right image kiosk, and retained façade-only glow/focus shapes without hover text.
- [x] `tests/roles.test.js`, `README.md` -- covered the role/state contract and documented the base-plus-state asset system.

**Acceptance Criteria:**
- Given the default campus is visible, when a kiosk row or locked façade is activated, then only its lower-right kiosk content fades to the matching supplied image state.
- Given any state transition, when it completes, then the campus outside the kiosk has not visually changed or faded.
- Given a façade is hovered or focused, when its highlight appears, then it follows the storefront shape without a label or detached UI rectangle.
- Given a player returns from a profession state, when they activate the kiosk’s return region, then the default panel is restored through the same local fade.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence | Route |
|---|---|---|---|
| State artwork downloads while the campus is hidden below 1024px | medium | The hub inserts all five state `<img>` elements before the CSS desktop gate; mobile visitors fetch the full artwork despite the PC-only screen. | patch |
| Kiosk state sits above the scene vignette | medium | `.campus-kiosk-state` has `z-index: 1` while `.campus-scene::after` is auto-stacked, so its selected pixels bypass the base-scene shading. | patch |
| Rapid selections can resolve out of order | medium | Each `openPanel()` unconditionally applies its role after `await`; an earlier request can overwrite a later selection. | patch |
| Return does not invalidate a pending selection | medium | Returning calls `setPanelState()` but a previously awaited preload can still call `setPanelState(action.roleId)` later. | patch |
| Rejected preloads cannot be retried | low | A rejected Promise remains in `campusStateLoads`, so later attempts reuse the failure for the life of the hub. | patch |
| Locked façade labels promise entry rather than a preview | medium | All façade controls use `aria-label="Entrer dans …"`, though locked controls only open their baked information panel. | patch |
| Focus can stay on a hidden kiosk control | medium | Selecting from a directory row hides its focused ancestor and return hides its own focused button without restoring focus. | patch |
| Dietetics is hard-coded as the enterable role | false | The frozen intent explicitly requires only Dietetics to enter a mission; no current behavior diverges. | reject |
| Panel interactions have only source-text tests | medium | The verified test evidence shows no rendered interaction test for selection, return, controls, or locked CTA behavior. | patch |
| Asset test omits image-frame validation | medium | Existence checks do not detect an incorrectly framed PNG, despite the clipping guarantee relying on the common 1672×941 coordinate frame. | patch |
| Obsolete HTML-manual CSS remains | low | `.campus-panel`, `.campus-directory`, and `.campus-manual` selectors no longer have a rendered consumer; direct deletion prevents stale parallel styling. | patch |
| Edge-case review: activated state can be replaced by an older preload | medium | Verified independently: the older `await preloadCampusState()` continuation has no request/version guard. | patch |
| Verification-gap review: hub transition test is not behavioral | medium | Verified gap reviewer traced no test that renders the hub or dispatches kiosk/door interactions. | patch |
| Verification-gap review: baked-image frame compatibility is not verified | medium | Verified gap reviewer found only filename/existence assertions, not PNG-header dimension checks. | patch |

## Design Notes

The stacked state images deliberately share the full 1672×941 coordinate system. A clipped, rounded lower-right layer can therefore crossfade perfectly without compositing or altering the base scene. The kiosk crop must be conservatively aligned inside the physical frame to avoid a visible seam at the rounded edge.

## Verification

**Commands:**
- `npm run build` -- expected: all six PNG assets resolve in the production bundle.
- `node --test tests/roles.test.js tests/engine.test.js tests/storage.test.js` -- expected: role/state mappings and existing game contracts pass.

**Manual checks:**
- On desktop, inspect all five façade glows, the default kiosk rows, all five local kiosk fades, and the return region with browser cache disabled.
- Resize below 1024px and confirm the PC-only notice replaces the complete scene.
