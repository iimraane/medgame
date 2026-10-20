---
title: 'Profession Door Hub'
type: 'feature'
created: '2026-10-20'
status: 'done'
baseline_commit: 'd4ce80b33d2ed217eb4ba40a1e781d08f9fecc2c'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The current career landing page is a compact menu with one button, so it does not convey a living clinic or make future healthcare professions feel like discoverable places. In local development, the API's production-only origin allowlist can also reject requests coming from the Vite browser origin.

**Approach:** Replace the landing page with a stylized, responsive clinic alley hub made from accessible HTML and CSS: a central path, building façades, and clickable profession doors. Dietetics is the one open door and enters the existing mission map; General Practice, Nursing, Psychology, and Pharmacy appear as locked, clearly labeled destinations. Permit only local Vite origins in non-production so the playable door works during development without weakening the production allowlist.

## Boundaries & Constraints

**Always:** Keep the page in French, keyboard-accessible, responsive, and visibly game-like without becoming childish or making vulnerable care scenarios frivolous. Use the existing role metadata as the single source of truth for doors and lock state. Use CSS illustration rather than a required external image asset. Preserve the current Dietetics mission flow and keep non-playable professions unavailable both in UI and server session creation. Allow `http://localhost:5173` and `http://127.0.0.1:5173` only outside production.

**Never:** Do not implement Nursing, Psychology, Pharmacy, or General Practice gameplay, persistence, missions, or server access in this increment. Do not allow arbitrary Origins, disable the existing production checks, add a canvas/game engine, or depend on the referenced blob image, which is not available as a reusable project asset.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Enter an open profession | Player clicks or presses Enter on the Dietetics door | Door has an open visual state and routes to the existing Dietetics mission map | If navigation metadata is missing, remain in the hub and show a concise French status message |
| Inspect a locked profession | Player clicks or focuses a locked profession door | Door remains non-navigable; its profession name and “coming soon” requirement are readable | No request or session is created |
| Local API request | Browser sends `Origin: http://localhost:5173` in non-production | API accepts the origin and mission start continues normally | Unknown origins retain the existing 403 response; production retains the two HTTPS origins only |
| Narrow screen | Hub is rendered on a phone-sized viewport | Door labels, lock status, and controls remain reachable without horizontal overflow | Alley layout stacks or scrolls vertically without clipping the path or controls |

</frozen-after-approval>

## Code Map

- `src/ui/menu.js` -- current career entry view; replace its single CTA with role-derived, semantic door controls and local feedback.
- `src/data/roles.js` -- role metadata used by the hub; expand it to the five visible professions with icon, description, theme, unlock state, and requirement.
- `src/main.js` -- route dispatcher currently drops level-view parameters; carry the selected open role into the mission map.
- `src/ui/levelSelect.js` -- consumes the chosen role and must render the Dietetics map while guarding non-playable roles.
- `src/style.css` -- reuse base palette, buttons, and career styles; add the illustrated alley, buildings, door states, and responsive rules.
- `server/server.js` -- origin middleware and session guard; add development-only Vite origins while retaining production restrictions and Dietetics-only sessions.
- `vite.config.js` -- already proxies `/game/api` without rewriting; preserve this correction so Vite paths match Express routes.
- `tests/roles.test.js` -- add focused coverage for visible professions, the Dietetics unlock, and locked-role state; no UI framework is installed.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/roles.js` -- model all five visible professions and their door-facing metadata; retain Dietetics as the sole unlocked role.
- [x] `src/ui/menu.js`, `src/style.css` -- render the CSS clinic alley and role doors from metadata, with open, locked, hover, focus, and mobile states.
- [x] `src/main.js`, `src/ui/levelSelect.js` -- pass the role selected by the open door and keep unavailable roles from entering a mission map.
- [x] `server/server.js`, `vite.config.js` -- make local Vite API calls valid only in non-production while preserving the route path and production allowlist.
- [x] `tests/roles.test.js`, `README.md` -- verify the role-door contract and document the hub plus local-origin behavior.

**Acceptance Criteria:**
- Given a player opens the app, when the hub appears, then they can identify five profession doors arranged as a clinic alley and the Dietetics door is visibly open.
- Given a player activates the Dietetics door, when routing succeeds, then the existing Dietetics mission map opens without a new gameplay implementation.
- Given a player activates a locked door, when they use mouse, touch, or keyboard, then it remains unavailable, communicates why, and does not create an API session.
- Given a local browser sends an allowed Vite Origin, when it starts a Dietetics mission in non-production, then the API does not return “Origine non autorisée.”
- Given production mode or any unrecognized Origin, when it requests the API, then the origin middleware continues to reject it.
- Given a narrow viewport, when the hub is viewed at 320px width, then every door label and lock indicator remains visible and usable without horizontal scrolling.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
|---|---|---|---|
| Generated `dist/index.html` references untracked hashed assets | low | defer | This is a pre-existing build-output tracking convention exposed by `npm run build`; source delivery and Vite’s production build pass, while generated artifacts are outside this feature’s source changes. |
| Permissive default CORS header preceded the allowlist middleware | medium | patch | The browser could receive `Access-Control-Allow-Origin: *` before a 403; CORS is now configured with `isAllowedOrigin` while the explicit 403 guard remains authoritative. |
| Requests with no Origin or Referer pass the middleware | false | reject | This behavior existed before the change and is expressly retained for non-browser requests; the frozen requirements only constrain recognized browser origins. |
| Malformed Referer is caught and passes through | low | defer | This pre-existing handling is outside the local-Vite addition; browser requests with an Origin are still checked by the new allowlist. |
| Alley could clip between 701px and its five-door minimum width | medium | patch | The five-column layout required more width than the old 700px breakpoint; the stacking breakpoint is now 800px. |
| Settings button had no visible keyboard focus | medium | patch | Global styles suppress button outlines; the hub now supplies a high-contrast `.btn:focus-visible` outline. |
| Locked door had `aria-disabled` but intentionally handled clicks for feedback | medium | patch | The state conflicted with its required informational interaction; `aria-disabled` was removed while the visible locked status and non-navigation behavior remain. |
| Tests do not exercise every browser/UI path | low | reject | No UI framework is installed and the requested focused role tests cover metadata and origin policy; build and existing mission-flow tests passed. |
| README duplicated the top-level project heading | low | patch | The repeated `# MedGame` was removed so the setup and hub documentation share one document hierarchy. |
| Locked doors exposed `aria-disabled` while intentionally responding to activation | medium | patch | The attribute was removed; the doors remain real buttons so keyboard and pointer activation can announce the locked state. |
| Door status could be announced twice through inline text and `aria-describedby` | low | patch | The redundant `aria-describedby` reference was removed while the visible status remains button content. |
| Locked feedback used a gendered French adjective for every profession | low | patch | Feedback now uses gender-neutral wording: `parcours verrouillé`. |
| Missing role metadata defaulted to Dietetics | medium | patch | The level view redirects invalid or missing role metadata to the hub with a French status message. |
| Session authorization duplicated the Dietetics role id instead of metadata | medium | patch | The server now checks `role?.unlocked`, keeping the UI and API gate tied to the same role metadata. |
| Malformed Referer values could bypass the explicit allowlist guard | medium | patch | The origin guard now rejects malformed Referer values with a 403. |
| API bodies were parsed before browser-origin validation | low | patch | JSON parsing now follows the `/game/api` origin guard. |
| Origin policy was only covered as a pure helper | medium | patch | An HTTP-level guard test now verifies development acceptance and production, unknown-origin, and malformed-Referer rejection. |
| Door activation lacked executable interaction coverage | low | patch | Focused role-action tests now assert Dietetics routes while every locked role returns feedback without a route. |
| Role themes were only checked for a non-empty string | low | reject | The role data and rendered class name share the same `theme` value; a missing stylesheet variant safely falls back to the base façade rather than breaking interaction. |
| Full browser rendering was not exercised in Node tests | low | defer | The project has no DOM test runtime; the role-action, HTTP guard, responsive-CSS, build, and manual browser checks cover the contract without adding a test framework. |

## Design Notes

The scene should feel like an evening clinic street rather than a sterile dashboard: a perspective-like central alley, warm window light, varied building silhouettes, and one distinctive door per profession. Door color, sign, icon, and small environmental details differentiate roles while the lock state carries the honest product boundary. The Dietetics building is the visual focal point; locked buildings create anticipation without pretending to be playable.

Use buttons for doors, not clickable decorative containers. The CSS scene must respect reduced motion and preserve enough contrast for text placed over illustrated façades.

## Verification

**Commands:**
- `npm run build` -- expected: production bundle builds without errors.
- `node --test tests/roles.test.js tests/engine.test.js tests/storage.test.js` -- expected: door-role contract and existing career tests pass.

**Manual checks:**
- With the app at `http://localhost:5173/game/`, activate each door by mouse and keyboard; confirm only Dietetics enters a mission map and local mission start is accepted.
- Resize the hub to 320px and inspect both normal and reduced-motion preferences; confirm every door remains legible, focusable, and unclipped.
