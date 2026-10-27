# Psychology campaign and case assembly

## Campaign map

| Level | Cumulative motifs | Difficulty frame | Newly available support |
| --- | ---: | --- | --- |
| 1 | 3 | One clear concern, direct everyday language and one main context factor. | Daily-life journal |
| 2 | 6 | The concern remains legible but relevant details need an open question. | — |
| 3 | 10 | Two plausible explanations; chronology separates them. | Timeline |
| 4 | 15 | Sensitive facts are disclosed only after respectful, specific questioning. | — |
| 5 | 20 | Context, relationships and habits interact; no single detail settles the case. | Relationship map |
| 6 | 22 | Similar motifs share surface signs; the player must distinguish lived impact and maintaining factors. | — |
| 7 | 24 | The account contains a meaningful apparent contradiction that context can resolve. | Reaction chain |
| 8 | 26 | Multiple stressors overlap; the player must avoid premature conclusions and preserve rapport. | — |
| 9 | 28 | Subtle evidence and safe orientation are both required in sensitive consultations. | Daily-life fragments |
| 10 | 30 | A partial account, competing explanations and resources must be integrated into one careful formulation. | — |

The pool is cumulative. A level chooses one motif from its exact row pool, rather than treating every motif as equally eligible from the start.

## Motif catalogue contract

The authored catalogue contains 30 educational consultation motifs. These approved French labels are the player-facing card labels; they never mean that the fictional patient has confirmed the condition.

1. Trouble anxieux généralisé
2. Trouble panique
3. Phobie sociale
4. Phobie spécifique
5. Trouble obsessionnel-compulsif (TOC)
6. Épisode dépressif
7. Burn-out
8. Trouble de l’adaptation
9. Stress post-traumatique
10. Trouble du sommeil / insomnie
11. Trouble alimentaire
12. Addiction aux écrans
13. Addiction aux jeux vidéo
14. Dépendance affective
15. Trouble de l’attention avec ou sans hyperactivité (TDAH)
16. Trouble dyslexique / difficultés d’apprentissage
17. Trouble du spectre de l’autisme (TSA)
18. Trouble borderline
19. Trouble bipolaire
20. Trouble de la personnalité évitante
21. Deuil compliqué
22. Isolement social
23. Harcèlement scolaire ou professionnel
24. Conflit familial persistant
25. Complexe d’infériorité
26. Manque de confiance en soi
27. Perfectionnisme excessif
28. Procrastination chronique
29. Difficulté à gérer ses émotions
30. Difficulté d’affirmation de soi

Higher-risk themes are educationally framed and must provide the appropriate urgent/professional orientation path. They must not ask a player to identify a psychiatric diagnosis from a single conversation.

## Right-hand motif rail

Like the Nursing differential rail, the Psychology consultation displays the current level’s cumulative motif cards in a persistent right-hand rail. A card has three browser-safe, authored fields: its approved French label, a one- or two-sentence educational description, and three to five broad **signes possibles à explorer**. The signs describe possible lived manifestations or contextual patterns, not diagnostic criteria, private patient facts or a checklist that determines the answer.

Cards are identical for every case that makes them eligible. A brief activation opens the card’s description and signs without altering the session. A deliberate selection marks a working formulation for the final submission; it does not award, reveal or lock the result until the player finishes the consultation. The rail remains useful at high levels by showing overlapping signs across nearby motifs, so the dialogue, supports and formulation board remain necessary to distinguish them.

Authoring validation requires every card to have a non-empty description, exactly three to five distinct broad signs, no treatment advice and no sign wording copied verbatim from a private blueprint’s decisive fact.

## Case assembly

Every motif owns at least six authored private blueprints. A blueprint contains a fictional identity, opening concern, private contextual facts, disclosure gates, approved dialogue facts, response style, safe-orientation expectation and compatible evidence modules. It is the atomic source of truth: facts from separate blueprints must never be randomly mixed.

On start, the server:

1. selects a motif from the current level’s pool;
2. selects a compatible blueprint not present in the local recent-history queue until its set is exhausted;
3. selects two distinct global patient traits and a non-verbal cue;
4. selects one compatible authored variant for each currently unlocked support, excluding recently seen variants when alternatives exist;
5. records the full private case and only browser-safe card metadata in the session.

A case fingerprint includes motif, blueprint, evidence variant IDs and the two trait IDs. The system must avoid an identical fingerprint until the compatible candidate set is exhausted. It may repeat a support type but not show the same complete consultation as a prior replay.

## Dialogue and formulation

The patient speaks in first-person French. The prompt prohibits patient self-diagnosis, coaching the player, invented facts, clinical prescriptions and disclosure of all relevant facts in one reply. A relevant question always receives a usable answer; vague or insensitive questions may receive a brief, guarded or less specific answer consistent with the traits.

The player uses a persistent, editable formulation board containing transcript-confirmed observations, contextual factors, resources and points to clarify. Entries may be pinned only from authorized transcript facts or authorized supports. The final action selects one motif card and a safe next-step statement. The evaluator sees the transcript, private blueprint, opened evidence and board events; the browser never receives the answer or scoring rubric.

Psychology uses the same binary debrief rule as Nursing: selecting the correct educational motif validates the mission; selecting any other motif does not. Exploration, respectful communication, contextual formulation and safe orientation remain part of the learning experience, but do not gate progression.
