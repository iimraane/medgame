# Psychology consultation supports

## Unlock and interaction rules

| Support | Unlock level | Player value | Authorized evidence contract |
| --- | ---: | --- | --- |
| Daily-life journal | 1 | Reveals a short sequence of mood, sleep, activity and notable moments. | One authored day or week excerpt compatible with the selected blueprint. It reveals a pattern, never a labelled answer. |
| Timeline | 3 | Orders life events and changes to expose onset, persistence or a contextual turning point. | A concise authored chronology whose dates and ordering match the private case. |
| Relationship map | 5 | Shows support, distance, conflict and practical dependency around the patient. | A fictional map of named/role-based relationships with only case-authorized relationship facts. |
| Reaction chain | 7 | Lets the player inspect a situation → interpretation → emotion → response sequence. | One authored chain grounded in a concrete case event; it may contain uncertainty and must not claim a diagnosis. |
| Daily-life fragments | 9 | Supplies carefully chosen ordinary traces such as an agenda item, note, task list or message excerpt. | Two to four authored fragments that fit the case chronology and expose context without violating fictional privacy. |

All five supports remain available after unlock. They are optional, repeat-openable and add their private facts to the patient/debrief context once only. A forged, locked, unknown or wrong-case support request returns no evidence and changes no session state.

## Anti-repetition and relevance requirements

- A motif does **not** own one immutable “tool set.” Each blueprint references multiple compatible evidence variants per unlocked support wherever that support is relevant.
- The session selects one coherent evidence variant per available support. Variants may clarify, qualify or expose a context-dependent tension; they must never contradict the selected blueprint.
- A support may be absent only when its absence is itself neutral and the UI explains that no additional material is available. It cannot be omitted to obscure required information or make a case unsolvable.
- Supports must not state the target motif, a diagnosis, a treatment or the evaluation criteria. They are clues to discuss, not answer keys.
- Authoring validation rejects duplicate evidence IDs, incomplete chronology links, facts that do not belong to the selected blueprint, and two blueprints with the same full replay fingerprint.

## Presentation requirements

Each support has a distinct visual form rather than a generic bullet modal: journal uses a readable day/week rhythm; timeline uses ordered events; relationship map uses a legible network; reaction chain uses a directional four-step sequence; fragments use clearly separated source-like cards. Every support is keyboard reachable, reopenable, dismissible with Escape and understandable without color alone.

## Tool quality contract

### Private evidence ledger

Each blueprint owns a private evidence ledger. An entry has a stable fact ID, semantic role, owning support, variant ID and render-template ID. A fact can be linked across supports only if the second display adds a genuinely new detail; no support repeats dialogue facts verbatim or turns a case into an answer key.

Every opened support contributes either two useful contextual facts or one meaningful distinction plus one neutral grounding fact. It cannot introduce a diagnosis-like label, target motif, treatment, evaluation criterion or a fact outside the selected blueprint.

### Support-specific depth

| Support | Required authored depth | Render families | Must never reveal |
| --- | --- | --- | --- |
| Daily-life journal | 4–6 time-anchored entries with mood/activity/context variation. | Single-day rhythm, week strip, handwritten-style note. | A conclusion about the motif. |
| Timeline | 4–6 ordered milestones with a before/after or persistence relation. | Dated line, relative-time line, life-chapter cards. | A causal certainty the case does not support. |
| Relationship map | 4–7 role-based nodes with support, distance, tension or dependency. | Network map, concentric circles, household/work clusters. | A judgement about any person or relationship. |
| Reaction chain | One concrete situation and four authored steps: situation → interpretation → emotion → response. | Flow cards, vertical chain, compact annotated sequence. | That one reaction proves a specific motif. |
| Daily-life fragments | 2–4 distinct everyday traces with source/context labels. | Agenda, message extract, task note, voice-note transcript, object label. | Private facts unrelated to the active case or a diagnosis-like answer. |

### Variation rules

- Each applicable blueprint/support pair has at least three authored evidence variants and two render families per variant.
- A seeded replay fingerprint covers blueprint, evidence IDs, render template IDs, trait IDs and opening style; it cannot repeat until compatible alternatives are exhausted.
- A support may be unavailable only with a truthful, neutral empty state. Absence must never conceal a required clue.
- One support may deepen another only through a new dimension: time, relationship, concrete setting, or reaction. It may not merely paraphrase it.
- Evidence order, template choice and support availability must not encode the correct motif.

### Interaction and visual bar

Supports open as purpose-built modern information surfaces, never one generic text modal. Each has a clear source label, a distinct scannable layout, visible consulted state, keyboard focus, Escape dismissal, reopen behaviour and a stable narrow-viewport layout. Screenshot tests must cover every support’s normal, locked/empty and reopened states.
