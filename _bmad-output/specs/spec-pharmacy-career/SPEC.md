---
id: SPEC-pharmacy-career
companions:
  - pharmacy-campaign.md
  - pharmacy-catalogue-proposal.md
  - pharmacy-product-score-matrix.md
  - pharmacy-tools-proposal.md
  - pharmacy-tool-quality.md
  - pharmacy-evaluation.md
  - pharmacy-research.md
sources: []
---

> **Canonical contract.** This SPEC and its companions are the complete contract for Pharmacy Career. The medication catalogue and consultation tools are intentionally deferred for a later decision.

# Pharmacy Career

## Why

This is a new game career built around a pharmacy-counter decision rather than disease diagnosis: a player must turn a client's everyday need and context into a safe, understandable dispensing response. It should reuse the variety already established by the shared client trait system while making the product choice and the quality of counsel both matter.

## Capabilities

- **CAP-1**
  - **intent:** A player can progress through ten Pharmacy levels with cumulative product pools.
  - **success:** Level pools contain exactly 3, 6, 10, 15, 20, 22, 24, 26, 28, and 30 products respectively.
- **CAP-2**
  - **intent:** A player can conduct a counter consultation about an everyday need without being asked to diagnose a disease.
  - **success:** Each generated client combines case facts with the complete existing personality stack: shared behavioural traits, active modifier categories, scenario presentation style, and non-verbal cues.
- **CAP-3**
  - **intent:** A player can select the most suitable product, or a safe alternative action when the request requires it.
  - **success:** The available outcomes come only from the server-authored product and safety catalog for the generated case.
- **CAP-4**
  - **intent:** A player can provide a concise dispensing counsel when submitting their decision.
  - **success:** Submission opens a counsel popup that captures guidance about when to use it, how to use it, and any relevant specific risk.
- **CAP-5**
  - **intent:** A player receives a nuanced final score that recognises both product selection and useful counsel.
  - **success:** The score is the sum of a 0–60 product component and a 0–40 counsel component, with a readable debrief for both components.
- **CAP-6**
  - **intent:** The team can validate the career’s content, evaluation, API, and browser experience before release.
  - **success:** Automated catalog/rule/API tests and deterministic browser flows cover correct, close, unsafe, and evaluation-fallback outcomes.
- **CAP-7**
  - **intent:** Developers can inspect and test every authored product-proximity score.
  - **success:** The server contains exactly 900 explicit product-score cells, all in range, with a 60-point exact-product diagonal and no runtime similarity inference.

## Constraints

- The game is educational only: it must not diagnose, prescribe, or substitute for real professional care.
- Product equivalence, contraindications, and expected counsel are authored server-side; a model cannot freely invent them.
- Model output is schema-validated, constrained to the 60/40 score bounds, and replaced by a deterministic safe fallback on failure.
- Product content must be sourced, age/context-aware, and reviewed before it becomes playable.
- Near alternatives use a complete authored product-pair matrix, never open-ended semantic similarity. The exact product is 60/60; every other catalogue product has a defined 0–59 score.
- Prescription-only cases include a valid fictional prescription or authorised renewal context. No case asks the player to independently choose a prescription-only medicine.
- Orientation or refusal is not a scoreable winning action. The generator excludes any unsafe or unsuitable context that lacks a valid catalogue product.
- Mastery and level progression require a score of at least 70%.

## Non-goals

- Recreating a real prescription-dispensing workflow or giving a user live medical advice.
- Treating an exact phrase as the only acceptable counselling answer.

## Success signal

A player can handle a varied everyday counter request, choose a defensible product or orientation, write a short useful piece of counsel, and understand precisely why their result passed or failed. A test run can prove that a correct product with missing critical counsel scores lower than the same product with the relevant counsel, without ever relying on an unconstrained model response.

