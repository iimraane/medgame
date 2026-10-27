# Pharmacy submission and evaluation contract

## Submission UI

After the player chooses an outcome, submission opens a popup titled **Conseil de délivrance**. It requests a short written answer, with visible prompts such as:

- When should it be used?
- How should it be used?
- What relevant precaution or specific risk should the client know?

The popup must make clear that only relevant advice is expected; it must not imply that every case has all three kinds of information.

## Score model

Final score: **0–100**.

| Component | Range | What it measures |
| --- | ---: | --- |
| Product/action | 0–60 | Exact suitability, accepted authored near alternative, or an appropriate orientation/no-sale action. |
| Counsel | 0–40 | Presence, relevance, and importance of correct timing, administration, or safety information. |

The product score is not binary. The exact intended product scores 60/60. Every other product in the 30-product catalogue has a server-authored score from 0 to 59 against it, based on clinical/functional proximity and compatibility with the generated context. This produces a complete 30 × 30 score matrix (including the 60-point diagonal) before release. The evaluator may read that matrix but may neither change it nor infer a missing relationship.

Counsel weights must be data-driven per case. Each item has an importance class (`critical`, `important`, or `useful`) and expected meaning, not a required literal phrase. Missing or contradicting critical safety information must affect the 0–40 component more than omitted optional detail.

## Model-assisted evaluation

The model evaluates natural-language counsel against a sealed server-side rubric; it does not receive authority to choose clinical facts. Its structured response contains only:

```text
productScore: integer 0..60
counselScore: integer 0..40
matchedCounselIds: string[]
missedCounselIds: string[]
unsafeClaimIds: string[]
playerFacingDebrief: short text
```

Server validation rejects malformed output, unknown item IDs, out-of-range values, and product scores that violate the authored matrix. On rejection, timeout, or unavailable model, a deterministic fallback scores the selected product from catalogue data, marks free-text counsel as unverified, and explains that the detailed evaluation could not be completed. It must never fabricate a favourable result.

The client must receive only the final component scores and concise debrief. The full answer matrix, critical-item weights, and model rubric remain server-side.

## Required verification

- Unit tests for all level pool counts, cumulative membership, and two-trait generation.
- Rule tests that parse all 900 matrix cells, verify values/ranges/diagonals, and prove every selected-product score comes from the authored cell rather than similarity inference.
- Evaluation tests for bounds, schema rejection, fallback, critical omission, irrelevant advice, and unsafe contradiction.
- API tests for session creation, submission, repeated submission, and malformed model responses.
- Browser tests for client questioning, outcome selection, popup entry, success debrief, close-answer debrief, orientation debrief, and evaluator-failure messaging.
- Deterministic visual captures for the counter, selection state, counsel popup, and debrief at desktop and narrow viewport widths.
