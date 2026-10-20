---
title: 'Arcade Kiosk Panel'
type: 'feature'
created: '2026-10-21'
status: 'done'
baseline_commit: '9d68edc3e8f561a0fa51921cb4a203e06d3106ff'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The façade glows now signal a playful, game-like hub, but the lower-right kiosk still reads as a static information screen. Its five interactive rows and the baked detail-state controls need the same visual energy without covering or rewriting the supplied artwork.

**Approach:** Treat the existing kiosk as a futuristic arcade terminal. Give each default-menu row a compact neon frame, a directional light sweep, and a stronger selected/focus state; add matching transparent hit-area treatments for the baked detail screen’s return and Dietetics-enter controls. The result should feel responsive and collectible—bright, crisp, and intentional—rather than retro pixel-art or generic medical UI.

## Boundaries & Constraints

**Always:** Keep the campus, default kiosk, and five profession-state PNGs untouched. Align every effect to the kiosk coordinates already used by the interactive controls and keep it inside the shared campus art plane. Preserve all current click and keyboard routes, including locked roles remaining non-playable. At rest, effects must be restrained enough for all baked labels to remain readable; hover/focus/active must make the individual clickable target unmistakable. Use role colors for default rows, cyan arcade terminal treatment for Return, and blue playable treatment for the Dietetics entry CTA. Honor `prefers-reduced-motion` by showing static emphasis without sweep/pulse motion.

**Never:** Do not add a new HTML panel, rewrite baked text, add pixel fonts, emojis, score counters, sounds, or unrelated animation. Do not make the CTA shown in locked PNG states interactive. Do not animate the whole campus, the baked kiosk image, or the scene transition just to produce the arcade effect.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Default kiosk rests | Five menu rows visible | Each row has a subtle role-colored arcade frame and marker; labels stay readable | No glow leaks outside its row |
| Row hover or keyboard focus | Pointer/focus enters one row | That row gains a bright local sweep/halo and clear focus outline | Other rows remain at resting strength |
| Baked detail state | Any profession panel active | The Return hit area gains a cyan arcade affordance | It remains aligned to the printed Return control |
| Dietetics detail state | Dietetics panel active | Only its Enter hit area gains a blue playable arcade affordance | Locked panels retain no clickable CTA overlay |
| Reduced motion | OS motion preference enabled | Static frames remain visible; sweep/pulse animation is disabled | Interactions and focus remain discoverable |

</frozen-after-approval>

## Code Map

- `src/ui/campusHub.js` -- creates the default role-row buttons and the Return/Enter controls inside `.campus-art-plane`; add semantic state classes only if CSS cannot target current controls safely.
- `src/style.css` -- existing kiosk row geometry, return/enter coordinates, role accents, focus styles, and global reduced-motion rule. Extend these local selectors only; keep the art-plane and kiosk fade geometry unchanged.
- `tests/roles.test.js` -- role/theme and arcade-affordance source contracts; add checks for all default rows, detail controls, and reduced-motion behavior.
- `src/public/assets/campus-*.png` -- immutable visual reference; do not modify.

## Tasks & Acceptance

**Execution:**
- [x] `src/style.css` -- add localized arcade treatments for menu rows and baked detail hit areas, including static reduced-motion variants.
- [x] `src/ui/campusHub.js` -- expose only the state/class hooks necessary to distinguish Return and the Dietetics-only playable CTA from locked detail states.
- [x] `tests/roles.test.js` -- cover role-row themes, detail-control states, and motion-safe arcade declarations.

**Acceptance Criteria:**
- Given the default kiosk, when it is idle, then all five rows look interactive through restrained role-colored terminal treatments without hiding their supplied labels.
- Given a user hovers or tabs to one row, when it becomes active, then only that row receives the stronger arcade response and a visible keyboard indicator.
- Given a profession detail is shown, when the Return control is available, then its exact baked-control region is visibly interactive; when Dietetics is shown, its exact Enter region additionally looks playable.
- Given a locked profession detail, when its baked CTA remains visible, then no enabled arcade CTA treatment or navigation target appears over it.
- Given reduced motion, when the terminal controls are displayed, then their static visual hierarchy remains intact without animated sweeps or pulses.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence |
| --- | --- | --- |
| Missing `:active` kiosk feedback | medium | The original CSS had no pressed-state selector despite the frozen interaction requirement; a localized `:active` treatment was added and source-contract coverage updated. |
| Missing local emphasis pulse | medium | The original interaction only swept; a brief local pulse now accompanies hover/focus and is disabled under reduced motion. |
| `color-mix()` lacks a fallback | low | The claim is technically true, but browser-support requirements were not part of the intent and a fallback would duplicate the visual system without evidence of an affected target. Rejected. |
| No forced-colors treatment | low | The intent explicitly requires reduced motion, not a new high-contrast treatment; adding one is outside the established visual contract. Rejected. |
| Focus outline extends outside control bounds | medium | The positive outline offset could cross the local hit area; it was changed to an inset offset and covered by the source contract. |
| No rendered hover/focus browser test | low | The project’s prescribed test surface is a source contract and has no browser-test harness; the requested browser setup is not a trivial patch. Manual visual checks remain listed in Verification. Rejected. |
| Locked Enter CTA lacks behavioral test | low | `setPanelState` sets the button hidden except for Dietetics and the source contract asserts that exact route; adding a DOM harness is not a direct correction. Rejected. |
| Return transition/focus restoration lacks behavioral test | low | The pre-existing route restores `activeInvoker` focus and remains unchanged; a browser test framework is outside this small visual slice. Rejected. |
| No visual coordinate regression test | low | Coordinates stay on the pre-existing shared art plane and are manually checkable as specified; adding visual-regression infrastructure is not a direct correction. Rejected. |
| Obsolete hashed build bundles retained | low | The generated `index.html` references only the new hashes; the two obsolete tracked bundles were removed to avoid stale build-artifact accumulation. |
| Arcade effects have only source-text verification | low | The absence of rendered-DOM coverage is real, but the required smallest fix would introduce a browser-testing harness absent from the repository; existing contracts and specified manual verification remain. Rejected. |
| Reduced-motion behavior has only source-text verification | low | The stylesheet contract asserts sweep removal and static emphasis; an emulated browser test needs the same out-of-scope harness. Rejected. |
| Coarse-pointer controls only receive `:active` emphasis | false | The kiosk is desktop-only and the idle frames are continuously visible; a touch press also receives the stronger active frame, so the affordance does not disappear. |
| Pressed sweep does not settle | low | `:hover`/`:focus-visible` assigns an animation to `::before`, which takes precedence over the active transform; disable that animation during `:active` so the existing press position applies. |
| Focus pulse is not persistent | false | The bright focus frame, inset focus outline, and halo persist after the deliberately brief emphasis pulse, satisfying the required durable keyboard indicator. |
| Fixed 7px marker is not proportional | false | The marker lives in the controls’ shared art plane and is intentionally a compact terminal marker; its local pixel size does not move it outside a row or misalign the hit area. |
| No `:focus-visible` fallback | low | Supporting browsers without `:focus-visible` is a real compatibility gap, but the requested current keyboard route already exposes focus where the selector is supported and the broader fallback is not a direct correction. Rejected. |
| Negative-z pseudo-elements lack rendered verification | low | The pseudo-elements sit in isolated stacking contexts with transparent controls; an added visual harness would be disproportionate to this localized CSS change. Rejected. |
| Arcade visuals have only source-text checks | low | The gap is real, but the repository has no browser harness; adding one is not a direct correction to the feature and manual checks are explicitly prescribed. Rejected. |

## Design Notes

The arcade language is “neon terminal,” not pixel art: thin corner cuts, an internal scan/sweep on interaction, small light markers, and a brief emphasis pulse only where the pointer or focus sits. Effects must be made with pseudo-elements on existing transparent controls so the supplied images remain visually authoritative.

## Verification

**Commands:**
- `node --test tests/roles.test.js` -- expected: all arcade control contracts and existing role behavior pass.
- `npm run build` -- expected: production build completes without CSS or module errors.

**Manual checks:**
- Inspect the idle kiosk, each hovered/focused row, a locked detail state, and Dietetics detail state at desktop size; the arcade layer must be local and readable.
- Enable reduced motion and confirm all terminal controls remain visible but do not animate.
