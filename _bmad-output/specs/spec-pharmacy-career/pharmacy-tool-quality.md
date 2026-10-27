# Pharmacy tool quality contract

## Evidence ledger shared by every tool

Every case owns a private evidence ledger. Each entry has a stable fact ID, a semantic role (`need`, `timing`, `existing-use`, `prescription-context`, `treatment-context`, or `handling`), one owning tool, and at least one rendered template ID. A fact may be linked across tools only when the second appearance adds a different, non-duplicated detail.

Every opened tool must contribute two useful facts or one decisive context distinction plus one neutral grounding detail. It may never invent a product relationship, dosage, contraindication, or evaluation criterion.

## Tool cards

| Tool | Semantic job | Render families | Anti-spoiler boundary |
| --- | --- | --- | --- |
| **Carte d’usage** | Makes the everyday need concrete: routine, timing, location, practical constraint, or who will use the product. | Day strip; travel/shift itinerary; household routine card; short client note. | Reveals circumstances, never a product name, drug class, or the intended answer. |
| **Ordonnance & renouvellements** | Establishes the formal prescription/renewal context for prescription-only cases. | E-prescription extract; paper-prescription excerpt; refill chronology; dispensing request slip. | It may show the prescribed medicine or form when that is the lawful task. In that situation, the challenge deliberately shifts to correct form reading and counselling, not diagnosis or independent prescribing. |
| **Armoire à pharmacie** | Shows what is already at home, how it is stored, and what has previously been tried. | Cabinet shelf grid; travel pouch; bathroom-counter photo-style inventory; annotated package list. | Shows existing items and use history but never labels which new product is expected. |
| **Dossier de traitements** | Provides the minimum fictitious history needed to distinguish compatible products. | Timeline; active-treatment cards; allergy/alert strip; previous-dispensation list. | Contains only explicitly authored, case-relevant facts; no full private medical record and no hidden answer. |
| **Fiche de délivrance** | Clarifies one handling dimension needed for quality counsel. | Folded leaflet excerpt; storage/timing card; route/form diagram; short warning label. | Shows one or two non-unique attributes, never the complete counselling rubric or a product-selection answer key. |

## Variation and composition

- Each applicable product/context pair has at least three authored evidence variants **per eligible tool** and two render families for each variant.
- A session chooses an internally coherent bundle through a seeded case fingerprint. It must avoid the same complete tool/evidence/template combination until its compatible pool is exhausted.
- The generator selects only tools whose evidence changes a reasonable player question. A locked or irrelevant tool has a short, honest empty state; it is never filled with generic text.
- No tool may repeat a dialogue fact verbatim. If it corroborates it, it must add a new time, form, practical constraint, or prior-use detail.
- Evidence order cannot be used as a hidden code for the intended product.
- Tool output remains useful at high level: ambiguity comes from competing but compatible context, not missing information or random noise.

## Visual and interaction bar

Each tool opens a purpose-built modern card surface, not a generic text modal. It has a visible title, source/context label, at least one scannable visual hierarchy, keyboard focus, Escape dismissal, reopen support, and a stable narrow-viewport layout. The opened state visibly records that the player consulted it, without replacing the evidence with a checkmark or hiding it on revisit.

## Tests

- Test every tool at its unlock boundary and in at least three render families.
- Assert facts belong to the active case, no forbidden answer field reaches the browser, and revisiting a tool neither duplicates context nor changes the score.
- Test that a prescription tool is absent for counter-only cases and renders only a valid fictional prescription context when it is present.
- Screenshot each distinct tool surface and its locked/empty/reopened states.
