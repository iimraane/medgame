---
title: 'Randomized Dietetics consultation tools'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'dispatch'
baseline_commit: '1c708e9577e17f4d4b6b840f69fd5d5c9f01d750'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Dietetics missions currently replay one fixed patient truth and expose generic text-only observations. They make consultations predictable and fail to represent the visual material a practitioner can use in a real appointment.

**Approach:** Replace observations with progressively unlocked, static consultation tools and generate each session from a coherent private case variant. A mission remains a difficulty/theme frame, not one answer: its patient need, context, evidence, personality and valid routes vary on each replay.

## Boundaries & Constraints

**Always:** Keep ten ordered Dietetics missions and the strict mastery gate above 70%. Keep all facts, variants, objectives, evaluation criteria, asset evidence and safety requirements server-side. Give each mission at least six coherent case variants and prevent a repeat until its recent variant cycle is exhausted. Make the Gallery available from mission 2, Rhythm Journal from 4, Shopping Receipt from 6, Pantry & Fridge from 8, and Constraints Calendar from 10; acquired tools remain available later. Gallery opens exactly two meal images per session. Use only user-supplied static assets, with no runtime image API. Preserve a secure safety action for missions 9 and 10.

**Never:** Do not retain the words or UI of “observation” or “screening”. Do not expose a hidden objective, a prescribed solution, case truth, full asset catalog, unapproved asset URL, or evaluation rubric to the browser. Do not reuse the disconnected legacy perk system. Do not make a visual tool mandatory or award mastery solely for opening it.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| New session | An unlocked mission is opened | Server chooses a coherent unseen variant, patient personality and eligible tools | Unknown/locked mission is rejected |
| Tool use | Player opens an eligible unused tool | Server returns only this variant’s approved visual metadata and records it once | Unknown, locked, forged or repeated tool returns no evidence |
| Gallery | Mission 2+ and Gallery is opened | Exactly two approved meal images appear | Missing asset degrades to a neutral unavailable card, never another asset |
| Replay | A mission is replayed before its variant pool is exhausted | A prior recent variant is excluded | History resets only after every variant was used |
| Safety case | Mission 9 or 10 is completed | Required safe next-step action remains server-recorded | Missing action cannot award mastery |

</frozen-after-approval>

## Code Map

- `server/missions.js` -- replace fixed rows/screens with mission themes and at least six server-only blueprints each; own tool eligibility, curated asset ids and safe action.
- `server/server.js`, `server/missionPatient.js`, `server/missionEvaluation.js` -- persist selected variant in session; authorize tool use; give only used tool evidence to patient and debrief prompts.
- `src/data/missions.js` -- retain only browser-safe ordered card metadata.
- `src/game/ai.js`, `src/game/engine.js`, `src/ui/chat.js`, `src/style.css` -- replace screening rail and transcript entries with consultation-tool inventory, visual modal and session evidence events.
- `src/utils/storage.js` -- persist recent case variant ids without affecting mastery, migration, reset or admin unlocks.
- `src/public/assets/dietetics/` and `dietetics-visual-assets.md` -- hold user-created images and the static prompt/asset manifest contract.
- `tests/campaign.test.js`, `tests/engine.test.js`, `tests/storage.test.js` -- replace screen contracts with variant, tool, asset, repetition, safety and UI contracts.

## Tasks & Acceptance

**Execution:**
- [x] Define ten theme frames, six or more coherent blueprints per frame, allowed evidence and more than one acceptable outcome route; select and retain a variant server-side per session.
- [x] Implement the five unlockable consultation tools, static asset whitelist, exactly-two Gallery rule, duplicate/forged tool rejection and visual tool UI.
- [x] Remove all old observation/screening API, UI, scoring and prompt language; migrate required safety action to a neutral explicit secure action.
- [x] Store a bounded recent-variant history locally and supply the selected variant to the server on session start without trusting client-selected truth.
- [x] Add user image filenames after the assets are supplied; use the approved prompt deck without generating images at runtime.
- [x] Update tests and production build verification.

**Acceptance Criteria:**
- Given the same mission is played repeatedly, when its variant pool is not exhausted, then its private need/context/evidence combination does not repeat.
- Given a visual tool is available, when it is opened, then its information is relevant to the selected patient but does not state a solution or objective.
- Given a Gallery session, when it opens, then exactly two static, whitelisted meal assets display.
- Given a player completes a discussion through different valid strategies, when the debrief runs, then it evaluates the full exchange rather than an expected phrase or fixed solution.
- Given a player inspects client mission/tool data, then hidden case variants, extra assets and evaluation truth are absent.

## Design Notes

Each case blueprint combines a private presenting need, two or three contextual contributors, a response style, a controlled evidence set and broad success signals. The model receives only that assembled blueprint and evidence already opened. Tool assets are evidence, not rewards: they may support questions, reformulation or a realistic plan but never provide a diagnosis or a required answer.

Mission complexity grows from legible routine constraints (1–2), through competing practical contexts (3–5), nuanced or stigmatized concerns (6–8), to uncertainty and coordinated safe follow-up (9–10). The prompt deck is deliberately grouped by this curve, not by a single patient identity.

## Implementation Notes

- Added six server-only case directions for each of the ten mission frames; a selected variant is retained in the server session and excluded from the client’s bounded recent replay history.
- Replaced the retired text clue rail and endpoint with five progressively unlocked consultation tools, an optional visual modal, and a server whitelist for all asset URLs.
- Copied all 20 user-supplied meal assets into `src/public/assets/dietetics/`; Gallery returns exactly two approved images and sends private image context only to the patient/debrief prompts.
- Preserved the level 9–10 safe-next-step gate as a dedicated server-recorded action. The deterministic evaluation fallback can no longer award mastery; only the AI debrief can.
- Verified `npm test`, production build, and whitespace checks after implementation.

## Review Triage Log

| Finding | Verdict | Route | Evidence |
|---|---|---|---|
| `recordVariantId` retains an exhausted six-case set, so the next cycle can immediately repeat a case. | medium | patch | Verified: a `Set` of all six ids remains full after the server resets its selection pool, so the next replay has no exclusion. Resetting the local cycle when it is exhausted is a direct correction. |
| Browser-provided replay history can be forged. | false | rejected | The app has no account or cross-device player identity and this value affects only the player’s own replay variety; it cannot reveal a case truth, rubric, or unreturned evidence. The server still chooses the variant and owns all private data. |
| The safe-next-step action can be sent as a bare request. | false | rejected | The explicit server-recorded action is the agreed safety gate; the current product does not model a free-text next-step object, and mastery also requires the AI debrief’s complete-transcript assessment. |
| The safety control appears in every mission and reports success after a false response. | medium | patch | Verified: the control is unconditional and its handler disables it regardless of `recorded`. It should only render for safety missions and only confirm a successful server recording. |
| Consultation controls disappear on narrow screens. | false | rejected | The intended product is desktop-only; mobile is intentionally not playable, so hiding consultation controls there is consistent with the stated constraint. |
| Four consultation supports render as generic text bullets rather than their real-world form. | medium | patch | Verified: non-gallery evidence is placed in one unordered list. The user asked for practical, text-only-game-value supports, so each kind needs a small dedicated visual representation. |
| `responseStyle` is never applied to the patient prompt. | medium | patch | Verified: only the independently selected archetype is interpolated. Passing the case style to the prompt is a small, private-context correction. |
| `successSignals` never reach the debrief evaluator. | medium | patch | Verified: the evaluator receives contributors, need, and used-tool evidence only. Supplying the case’s alternative route signals preserves flexible, case-specific grading. |
| A failed AI debrief cannot award campaign mastery. | false | rejected | This is deliberate integrity behavior: the user requested an AI that reads the whole conversation for scoring. The deterministic fallback cannot honestly validate a mastery gate. |
| Deterministic fallback axes are assigned by turn order rather than message quality. | medium | patch | Verified: validated turns are tagged mechanically in `server.js`. Since the fallback cannot evaluate semantic quality, it must not present invented axis scores. |
| Static asset filenames can be requested directly once guessed. | false | rejected | Static user-supplied web assets are intentionally deployable public files; the app never returns an unapproved URL or an asset catalog in a session payload. Asset access is not a confidentiality boundary for an offline-friendly static game. |
| Edge review: forged replay ids can influence selection. | false | rejected | Carried: this is the player’s own local replay preference in an anonymous game; private variant content is never client-selected or exposed. |
| Edge review: a direct POST can start a locked mission. | low | rejected | The browser’s progression gate is the defined local save model. Without authentication, a server lock would be cosmetic; direct API use does not alter other players or disclose the evaluator rubric. |
| Edge review: mobile loses tool controls. | false | rejected | Carried: mobile play is explicitly out of scope and intentionally blocked. |
| Edge review: the safety control disables after a rejected request. | medium | patch | Carried: the event handler ignores the API result; the same UI-state fix covers this failure path. |
| Verification-gap layer | maybe-false | deferred | The layer could not run because the workspace ran out of credits. The primary verification suite will be run locally after the review fixes. |

## Verification

**Commands:**
- `npm test` -- expected: variant, tool, safety, storage and existing campaign tests pass.
- `npm run build -- --emptyOutDir` -- expected: production bundle succeeds with no server-only truth bundled.
- `git diff --check` -- expected: no whitespace errors.

**Manual checks:**
- Replay one mission until a different patient bundle and visual evidence appear; confirm no repeat before cycle exhaustion.
- Open each newly earned tool, confirm it is relevant, visual, optional and records only one event.
- Complete a safety case without its next-step action and confirm it cannot unlock the next mission.
