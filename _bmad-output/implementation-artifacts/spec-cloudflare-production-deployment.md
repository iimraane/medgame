---
title: 'Deploy MedGame on Cloudflare Workers'
type: 'feature'
created: '2026-10-24'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: '7653c619e76be5b521876adb1f514cb1f1fa5b09'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** MedGame currently depends on a separate Express process to serve its Vite bundle and its OpenAI-backed API, so it cannot be published as a managed Cloudflare application. Its production origin list also targets retired domains instead of `alimni.tv`.

**Approach:** Package the Vite client and API together as a Cloudflare Worker, serve the application directly at `https://alimni.tv/`, keep OpenAI credentials as a Cloudflare runtime secret, and preserve anonymous browser-only game progression.

## Boundaries & Constraints

**Always:** Serve only same-origin `/api/*` traffic, retain server-side case facts and evaluation logic, maintain the current French error contract, preserve `localStorage` game progress with its functional activity cookie, and keep OpenAI credentials out of source control and client code.

**Never:** Add player accounts, collect personal profiles, commit `.env` or Cloudflare secrets, or publish before the Worker build and regression suite pass.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Production play | `https://alimni.tv` API request with a valid active session | The Worker returns the same JSON contract as the current API and static assets load from the same deployment | A missing/expired session returns the existing French session error |
| Cross-origin API request | `Origin` outside the production allowlist | Request is rejected before game handling | 403 JSON origin error |
| Missing OpenAI secret | Worker runs without `OPENAI_API_KEY` | Non-AI fallback behavior remains available where it exists | Existing configuration error or fallback response is returned without exposing a secret |
| Browser progression | Anonymous player records campaign progress | Progress remains in browser storage; no user account or remote player profile is created | Existing reset action removes browser progress and functional cookie |

</frozen-after-approval>

## Code Map

- `vite.config.js` -- currently builds a `/game/`-based static bundle and proxies API calls only in local development; must move to the root deployment path while remaining compatible with Worker static assets.
- `src/game/ai.js` -- browser API calls must move from `/game/api` to root-relative `/api` while remaining same-origin and without browser credentials.
- `src/utils/storage.js` -- owns anonymous local progression and the functional `medgame_active` cookie; retain as the client persistence boundary.
- `server/server.js` -- Express entry point containing all 14 API routes, in-memory rate/session maps, Node-only filesystem audio handling, and OpenAI calls; source for the Worker API port.
- `server/origins.js` -- production allowlist currently contains obsolete domains and needs a Worker-safe `alimni.tv` policy.
- `server/missions.js`, `server/missionPatient.js`, `server/missionEvaluation.js`, `server/patientTraits.js`, `server/nursingDossiers.js` -- server-owned game rules and prompts to reuse rather than exposing to the browser.
- `tests/nursingRoutes.test.js`, `tests/roles.test.js` -- route-contract regression coverage to preserve or adapt for a Worker runtime.
- `package.json`, `.gitignore` -- deployment commands/dependencies and secret-local-file exclusions.

## Tasks & Acceptance

**Execution:**
- [x] `worker/index.js` and server rule modules -- implement the Worker API, preserve all supported routes and error contracts, and route static assets through Wrangler.
- [x] `wrangler.jsonc`, `package.json`, `vite.config.js`, `.gitignore` -- define reproducible build/dev/deploy commands, static asset routing, custom domain configuration, and ignored local Cloudflare secret files.
- [x] `server/origins.js` and tests -- permit the selected `alimni.tv` production origin while retaining local-development tests and rejecting foreign origins.
- [x] `tests/worker*.test.js` and existing route tests -- exercise session expiry, origin guard, API behavior, and static-asset deployment configuration without calling OpenAI.
- [x] Cloudflare account -- authenticate through OAuth, upload `OPENAI_API_KEY` interactively as a Worker secret, create required state storage, deploy the verified Worker, and bind the selected custom domain.

**Acceptance Criteria:**
- Given a production browser at the selected `alimni.tv` URL, when it starts and completes a supported mission, then all API calls remain same-origin and the browser receives the established payload shapes.
- Given a player has no account, when they make progress or reset it, then persistence exists only in browser storage and its functional cookie; no player record or login is required.
- Given Cloudflare deployment credentials are present, when the verified deploy command runs, then the Worker and its Vite assets are published and reachable through the selected `alimni.tv` URL.
- Given the Worker has no `OPENAI_API_KEY`, when an AI endpoint is called, then no credential is exposed and the existing safe fallback/error behavior is returned.

## Implementation Notes

- Published Worker version `1d43b542-14d1-4b15-9f65-4a3e3ab627a8` serves `alimni.tv` and `www.alimni.tv`; the final secret update was then applied directly to the active Worker version.
- Production verification confirmed `GET /` returns the Vite application, `POST /api/start` returns a live session, and `POST /api/chat` returns an OpenAI-backed Nursing reply.

## Spec Change Log

## Review Triage Log

## Design Notes

The API cannot use module-memory sessions in a multi-isolate Worker. A TTL-bound Durable Object is the smallest reliable server-side mechanism for the current authoritative consultation transcript and hidden rubric state; it is not a user account and its storage is removed on expiry. Long-term campaign progress remains client-only.

## Verification

**Commands:**
- `npm test` -- expected: all game and Worker route regressions pass.
- `npm run build` -- expected: Vite output and deployment configuration are valid.
- `npm run deploy` -- expected: Wrangler reports a deployed Worker and custom-domain route.

**Manual checks:**
- Visit the selected `alimni.tv` entry URL and begin a mission; verify the site assets, API response, mission conversation, and browser progression survive navigation as designed.
