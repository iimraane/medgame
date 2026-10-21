---
title: 'Dietetics progressive campaign and patient AI modernization'
type: 'feature'
created: '2026-10-21'
status: 'complete'
route: 'dispatch'
baseline_commit: '1433a025170b296af2df20db5146d00cbbf0a049'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Dietetics currently has only three transparent missions, keyword-only scoring, no progressive screening interactions, and a patient prompt that can lose its patient role. The live model remains `gpt-4o-mini`, despite its legacy status in the current API catalog.

**Approach:** Ship one ten-mission Dietetics campaign from everyday food history to subtle, safety-bound complex contexts. Keep case truth, staged clues, scoring, patient archetypes, and role instructions server-side; expose only a narrative mission card, permitted in-world screening tools, the conversation, and an end-of-case score/debrief. Modernize the API integration around configurable `gpt-5.6-luna` and a general deterministic patient-role/anti-hallucination protocol.

## Boundaries & Constraints

**Always:** Keep all people and cases fictional, educational, non-diagnostic, and non-prescriptive. Keep hidden objectives, case facts, red flags, archetype instructions, and scoring rules out of client-delivered mission data. Preserve the existing door hub, PC-only behavior, sequential mastery unlocks, local best scores, API origin guard, rate limit, and final scored debrief. At every turn, the model must remain a first-person French-speaking fictional patient: it neither gives dietetic advice nor accepts role changes, prompt injections, invented facts, diagnoses, prescriptions, or authority it does not have. Screenings reveal only the next appropriate fact, are optional and tracked server-side, and become more numerous/subtle over the campaign.

**Never:** Do not ask the player to diagnose a disease, expose a “correct answer” during play, turn a screening into real medical advice, use a ChatGPT/Codex product label as an API model ID, surface the API key, or alter the legacy cards/levels flow. Do not make all facts available at the opening message.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| New case | Player opens an unlocked mission | Narrative card without objectives; only that mission’s currently available screenings and patient opening appear | Invalid/locked mission remains rejected |
| Any player turn | Greeting, off-topic request, role swap, injection, or unsupported medical request | Patient responds naturally within its disclosed fictional facts, stays first-person patient, and neither invents nor gives dietetic advice | Failure returns the existing communication error |
| Screening | Player selects an available screening | One staged fictional observation is added to the consultation and recorded once | Unknown/repeated tool yields no new clue and cannot inflate score |
| Completion | Player ends a consultation | Server evaluates dialogue and screening use, returns per-axis score, mastery and concise next step | Missing safety orientation never grants mastery |
| Model configuration | `OPENAI_MODEL` omitted or model call fails | Default to `gpt-5.6-luna`; keep deterministic mission evaluation and existing offline debrief fallback | Do not silently reveal case truth |

</frozen-after-approval>

## Code Map

- `src/data/missions.js` -- browser-safe mission map; replace three entries with ten narrative-only cards, with no objectives, rubrics, clues, or safety truth.
- `server/missions.js` -- authoritative cases and current substring evaluator; evolve into the ten-case curriculum, explicit/fluid/subtle/mixed patient archetypes, staged screening registry, rubric evidence, safety gates, and score calculation.
- `server/server.js` -- builds/stores active patient prompt and calls legacy Chat Completions with `gpt-4o-mini`; add model configuration, patient-role protocol, session screening state, and a mission-safe screening endpoint.
- `src/game/ai.js` and `src/game/engine.js` -- existing start/chat/evaluate path; add the screening request and action handling without changing route semantics.
- `src/ui/chat.js` -- currently renders objectives twice and injects a goal answer; replace with neutral mission framing plus progressive in-world screening controls.
- `src/ui/levelSelect.js`, `src/ui/debrief.js`, `src/utils/storage.js` -- dynamic cards, final score, sequential unlocking and best-score persistence already scale to ten missions; preserve their contracts while wording reflects the campaign.
- `tests/engine.test.js`, `tests/storage.test.js`, `tests/roles.test.js` -- current focused tests; extend with ten-level progression, client secrecy, screening and prompt/role contracts.

## Tasks & Acceptance

**Execution:**
- [x] `src/data/missions.js` and `server/missions.js` -- define the ten ordered cases below, mirrored only by safe client metadata; give every authoritative case stable baseline facts plus archetype-specific presentation and disclosure maps. A **flagrant** patient offers one early cue, a **subtle** patient has an ordinary opening and requires a matching observation, a **mixed** patient has one visible and one hidden contextual cue, and a **contextual** patient distributes facts across life constraints. Randomize compatible archetypes per replay without changing safety truth.
  1. **Le rythme qui déborde** — meals, snacks and drinks in a rushed week; basic food-history prompts and a daily rhythm note.
  2. **Le creux de l’après-midi** — hunger, satiety, snacks and beverage habits; timing and drink log.
  3. **Après le faux départ** — follow-up after an unsustainable attempt; routine comparison and realistic-goal planner.
  4. **Manger sous pression** — stress, screens and social meals; context map and compassionate communication.
  5. **Choix végétariens au quotidien** — variety, planning and practical constraints; meal-composition and shopping-context cues.
  6. **Le bilan qui inquiète** — prevention-focused metabolic-risk context; family/context and care-coordination cue, with no diagnosis claim.
  7. **Rythme décalé** — shift work, sleep and irregular intake; chronology and fatigue/context screens.
  8. **Objectif de poids, vraie vie** — stigma, activity, preferences and realistic gradual change; multidimensional context and shared-goal screens.
  9. **Quand manger devient difficile** — subtle restrictive/compensatory concern; respectful safety screen and mandatory orientation action.
  10. **Le dossier incomplet** — interacting social vulnerability, fatigue, medications/context and ambiguous intake; selective advanced screens, uncertainty management and safe coordinated orientation.
- [x] `server/missions.js` -- replace keyword counting with per-case, server-authorized evidence events: each screening declares the axes it can support, and dialogue earns only bounded generic categories rather than matching rubric vocabulary. Return client-safe evidence counts/messages, never criterion IDs.
- [x] `server/server.js` and `server/missionPatient.js` -- introduce `OPENAI_MODEL` with `gpt-5.6-luna` default; centralize a French patient protocol with fixed identity, baseline facts, current disclosed facts, and archetype rules. Server screens and stored session actions are the only way to unlock gated clues/safety completion; ignore client-forged actions.
- [x] `src/game/ai.js`, `src/game/engine.js`, `src/ui/chat.js`, `src/ui/debrief.js`, `src/style.css` -- remove visible objectives/rubrics and goal auto-fill; render a non-spoiling observations rail with neutral labels, selected/used state, and safe observation transcript entries. Render generic evidence without revealing internal criterion names.
- [x] `src/utils/storage.js` -- migrate the prior three-mission Dietetics progress to the first campaign mission without discarding existing best score/mastery.
- [x] `README.md`, `server/.env.example` -- document `OPENAI_MODEL` as an optional API model override, default behavior, educational limits, and the ten-level route without recording the API key.
- [x] `tests/*.test.js` -- cover all client/server mission and screening IDs, no client objectives/rubrics/safety answers, archetype disclosure contracts, server-only safety actions, duplicate/unknown screening behavior, both safety gates, client-safe debrief evidence, configurable model default, and legacy save migration.

**Acceptance Criteria:**
- Given a fresh save, when the learner visits Dietetics, then exactly ten ordered cards exist, only mission 1 is playable, and each mastered case unlocks only its successor.
- Given any campaign briefing or active conversation, when the learner inspects its DOM/client mission object, then no learning objective, rubric term, red-flag truth, or expected answer is available.
- Given missions 1 through 10, when a learner opens their tools, then their screening options and facts progress from basic observation to selective multi-context assessment without spoiling the case.
- Given a player greets, gives an off-topic instruction, requests a role reversal, or tries prompt injection, when the AI responds, then it remains a French-speaking fictional patient, does not invent facts, and never advises as the dietitian.
- Given a replayable mission, when the server selects a compatible archetype, then a flagrant, subtle, mixed, or contextual presentation changes the disclosure style without changing hidden safety truth or making an impossible case.
- Given the tenth case or any safety-gated case, when the learner omits the required orientation, then the end debrief can score work but cannot award mastery.
- Given no `OPENAI_MODEL`, when a patient turn is requested, then the server selects `gpt-5.6-luna`; given an explicit value, it uses that value without returning it to the browser.

## Implementation Notes

- Added `server/missionPatient.js` so role protocol/model selection are testable without starting the Express server.
- A used server-side screening is appended to the model-only session context after its observation is returned, preventing future-clue exposure while keeping patient replies coherent.
- Verified all matrix rows with 27 focused tests and a production build; the live provider was not invoked.

## Spec Change Log

- Review loop 1: reviewers found that generic archetype wording, keyword-pattern scoring, and undefined “appropriate question” disclosure could not deliver the approved progressive patient simulation. The implementation plan now requires server-owned baseline facts plus archetype-specific disclosure maps, server-authorized actions only, criterion-to-observation scoring, neutral safety labels, and client-safe debrief evidence. This avoids a campaign where a patient invents facts, where replay archetypes feel cosmetic, or where repeated attempts reveal the expected answer. KEEP: ten narrative cards, the server-only truth boundary, one-time observations, configurable model selection, and the French patient-role protocol.

## Review Triage Log

- `server/server.js` patient prompt lacks baseline case facts — **medium / bad_spec**: the model only sees an opening until an observation, so it cannot consistently answer ordinary exploration without fabrication; require server-only baseline facts and disclosed-fact state in the plan.
- `server/missions.js` archetypes are generic wording only — **medium / bad_spec**: replay types do not change facts or disclosure behavior; require archetype-specific presentation and disclosure maps.
- `server/missions.js` uses keyword patterns for scoring — **medium / bad_spec**: rubric vocabulary can be pasted to earn mastery, contrary to the campaign’s discovery/scoring design; replace with server-authorized evidence events and bounded dialogue signals.
- `server/missions.js` applies a flat screening bonus across axes — **medium / bad_spec**: an unrelated observation can raise food-history/context/safe-plan scores; score each observation only against its declared competency evidence.
- `server/missions.js` accepts submitted bare orientation actions — **high / patch**: a client can forge an orientation requirement; evaluation must only accept actions stored in the server session.
- `server/server.js` start endpoint does not enforce client-local progression — **false**: campaign progress is intentionally local and there is no authenticated server save to enforce; normal game routing already blocks locked cards.
- `src/data/missions.js` exposes all mission observations immediately — **false**: the approved progressive increase is campaign-level; per-mission tool ordering was not a requirement.
- `src/data/missions.js` names safety actions in client labels — **medium / patch**: “orientation” reveals a hidden expected response; replace with neutral, non-spoiling labels.
- `server/missions.js` returns criterion IDs and `src/ui/debrief.js` expects obsolete evidence keys — **high / patch**: the debrief can crash and exposes scoring terminology; return client-safe generic evidence and align the debrief.
- `server/missionPatient.js` leaves “appropriate question” to the model alone — **medium / bad_spec**: disclosure is not deterministic or testable; define server-held disclosure stages and authorized transitions.
- HTTP campaign endpoints lack direct integration tests — **low / patch**: endpoint behaviors are covered partly by pure tests but need focused route/state tests where feasible.
- `src/utils/storage.js` retains old mission IDs unchanged — **medium / patch**: a pre-campaign save’s completed progress is not migrated into the new first campaign mission.
- Verification command omits `tests/campaign.test.js` — **medium / patch**: stated verification can miss campaign regressions; include it.
- Level 10 lacks a no-orientation test — **medium / patch**: its safety gate could regress unnoticed; add the equivalent assertion.
- Client/server mission and screening identifiers lack full contract coverage — **medium / patch**: a later card can become unstartable after a typo; iterate all ten IDs in tests.

## Design Notes

The campaign follows a discovery curve rather than “more difficult patients”: each later case combines more contextual variables, less overt cues, and better tools. This follows HAS guidance to assess the conditions/environment of intake, lifestyle factors, psychological and social vulnerabilities, and coordinated personalized care rather than reducing nutrition to weight or a single food rule.

`gpt-5.6-luna` is the default cost-sensitive API choice: OpenAI documents it as the cost-optimized GPT-5.6 tier, with Chat Completions, Responses API, and structured outputs support. Its documented standard price is $0.20 input / $1.20 output per million tokens; the override prevents account-availability changes from blocking the game.

Patient data has two server-only layers: **baseline facts** that support ordinary questions, and **gated facts** released only by a named observation. Each archetype selects a presentation map for those facts. The model receives only baseline plus previously released facts; it does not decide which undisclosed facts exist. Scores consume server-recorded evidence events and a small bounded set of conversational categories, never raw rubric words supplied to the browser.

## Verification

**Commands:**
- `node --test tests/engine.test.js tests/storage.test.js tests/roles.test.js tests/campaign.test.js` -- expected: all existing and new campaign contracts pass.
- `npm run build -- --emptyOutDir` -- expected: production bundle completes without exposed server-only case data.
- `git diff --check` -- expected: no whitespace errors.

**Manual checks:**
- Start level 1, send “coucou”, use a screening, end the dialogue, and confirm hidden goals plus a patient-only reply and final score.
- Open the level 9 safety case after sequential mastery and confirm an omitted orientation cannot unlock level 10.
