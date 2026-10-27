# Proposed 30-product catalogue

> **Status: proposal, not playable medicine content.** Labels below are therapeutic product entries, not final brand, strength, or dosage instructions. Each entry needs an exact French speciality/form, current official source, age/context rules, counselling rubric, and the 30 × 30 proximity row before implementation.

## Level allocation

| First available at | New entries | Cumulative | Proposed entries |
| --- | ---: | ---: | --- |
| 1 | 3 | 3 | Paracetamol oral; alginate/antacid suspension; oral rehydration solution |
| 2 | 3 | 6 | Cetirizine; macrogol; chlorhexidine antiseptic |
| 3 | 4 | 10 | Ibuprofen oral; loperamide; omeprazole; econazole topical |
| 4 | 5 | 15 | Diclofenac topical gel; nicotine replacement; lubricating eye drops; aciclovir topical; hydrocortisone topical |
| 5 | 5 | 20 | Phloroglucinol; lactulose; ketoconazole shampoo; anti-lice treatment; levonorgestrel emergency contraception |
| 6 | 2 | 22 | Amoxicillin; salbutamol inhaler |
| 7 | 2 | 24 | Levothyroxine; metformin |
| 8 | 2 | 26 | Combined oral contraceptive; sertraline |
| 9 | 2 | 28 | Apixaban; insulin glargine pen |
| 10 | 2 | 30 | Adrenaline auto-injector; methotrexate |

## Rationale

Levels 1–5 teach counter products and basic forms without a diagnostic loop. Levels 6–10 add prescription contexts where the player validates the product from a fictional prescription/renewal scenario and gives relevant dispensing counsel. They do not ask the player to originate a prescription choice.

The proposal covers pain/fever, digestive comfort, hydration, allergy, skin, eye, smoking cessation, sexual health, chronic treatment, respiratory care, anticoagulation, diabetes, and higher-risk speciality handling. The diversity is deliberate: product proximity can be meaningful without every request collapsing into “find the illness.”

## Pairwise proximity contract

For an intended product `A`, every selectable product `B` stores one integer `productScore[A][B]` from 0 to 60:

- `60`: exact intended product.
- `50–59`: same immediate use and compatible form/context, but not the intended entry.
- `25–49`: partially relevant family or use, with a meaningful mismatch.
- `1–24`: superficially related but practically poor match.
- `0`: unrelated or incompatible for the authored case.

The approved values are frozen in [the explicit 900-cell matrix](pharmacy-product-score-matrix.md). The matrix is stored and tested as a complete data table, not generated from these bands at runtime. A reviewer validates every non-zero score and its reason.

## Prescription-only case rule

The ten prescription-context entries are only generated when the fictional client brings a valid, readable prescription or an eligible renewal record. The mission objective is then to select the prescribed item/form from the pharmacy catalogue and give suitable usage counsel. It is not to diagnose, prescribe, alter doses, or override the prescriber.

## Exclusions for the initial catalogue

- Oral pseudoephedrine cold products: current ANSM risk guidance makes them a poor first-game teaching entry.
- Controlled substances, injectable chemotherapy beyond the tightly bounded methotrexate teaching context, and exceptional/off-label prescriptions.
- Products whose use cannot be presented safely without a large clinical decision tree.
