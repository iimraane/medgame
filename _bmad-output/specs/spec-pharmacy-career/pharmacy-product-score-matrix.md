# Product score matrix — 900 explicit cells

> **Game-scoring data only.** A non-zero score records how close a wrong selection is to the intended answer in this fictional game case. It is **not** a real-world substitution recommendation, an interchangeability rule, or medication advice.

## Contract

- The rows are intended products; the columns are player selections.
- There are exactly **30 × 30 = 900** explicit score cells.
- Every diagonal cell is `60`; every other cell is an authored integer from `0` to `59`.
- This approved version is numerically symmetric, but both directions are present explicitly. The evaluator reads the cell directly and never derives proximity from product names, drug class, embeddings, or a model.
- A non-zero pair needs a human-readable audit reason in implementation data. The number alone is insufficient for future clinical review.

## Product keys

01. `PAR` — Paracétamol oral
02. `ALG` — Alginate/antiacide
03. `ORS` — Solution de réhydratation orale
04. `CET` — Cétirizine
05. `MAC` — Macrogol
06. `CHX` — Chlorhexidine antiseptique
07. `IBU` — Ibuprofène oral
08. `LOP` — Lopéramide
09. `OME` — Oméprazole
10. `ECO` — Éconazole topique
11. `DIC` — Diclofénac gel
12. `NIC` — Substitut nicotinique
13. `EYE` — Larmes artificielles
14. `ACY` — Aciclovir topique
15. `HYD` — Hydrocortisone topique
16. `PHL` — Phloroglucinol
17. `LAC` — Lactulose
18. `KET` — Kétoconazole shampooing
19. `LICE` — Traitement anti-poux
20. `LNG` — Lévonorgestrel urgence
21. `AMO` — Amoxicilline
22. `SAL` — Salbutamol inhalé
23. `LEV` — Lévothyroxine
24. `MET` — Metformine
25. `COC` — Contraceptif oral combiné
26. `SER` — Sertraline
27. `API` — Apixaban
28. `INS` — Insuline glargine
29. `EPI` — Adrénaline auto-injecteur
30. `MTX` — Méthotrexate

## Matrix

~~~csv
intended_product,PAR,ALG,ORS,CET,MAC,CHX,IBU,LOP,OME,ECO,DIC,NIC,EYE,ACY,HYD,PHL,LAC,KET,LICE,LNG,AMO,SAL,LEV,MET,COC,SER,API,INS,EPI,MTX
PAR,60,0,0,0,0,0,30,0,0,0,18,0,0,0,0,14,0,0,0,0,0,5,0,0,0,0,0,0,0,0
ALG,0,60,0,0,0,0,0,0,50,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0
ORS,0,0,60,0,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
CET,0,0,0,60,0,0,0,0,0,0,0,0,16,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
MAC,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,55,0,0,0,0,0,0,0,0,0,0,0,0,0
CHX,0,0,0,0,0,60,0,0,0,8,0,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0
IBU,30,0,0,0,0,0,60,0,0,0,45,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0
LOP,0,0,26,0,0,0,0,60,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0
OME,0,50,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
ECO,0,0,0,0,0,8,0,0,0,60,0,0,0,8,15,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0
DIC,18,0,0,0,0,0,45,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
NIC,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
EYE,0,0,0,16,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
ACY,0,0,0,0,0,0,0,0,0,8,0,0,0,60,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
HYD,0,0,0,10,0,12,0,0,0,15,0,0,0,5,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
PHL,14,12,0,0,0,0,15,7,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0
LAC,0,0,0,0,55,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0
KET,0,0,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,60,8,0,0,0,0,0,0,0,0,0,0,0
LICE,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,8,60,0,0,0,0,0,0,0,0,0,0,0
LNG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,24,0,0,0,0,0
AMO,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,3
SAL,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,12,0
LEV,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0
MET,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,18,0,0
COC,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,60,0,0,0,0,0
SER,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0
API,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0
INS,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,60,0,0
EPI,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,60,0
MTX,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,60
~~~

## Implementation checks

- Parse exactly 30 column keys and 30 row keys; reject duplicates or unknown keys.
- Assert 900 numeric cells, integer values in the inclusive range 0–60, and `60` on every diagonal.
- Assert the runtime evaluator returns the stored row/column value for every pair.
- Keep this matrix server-only; the client receives only the final component score and explanation.

## Review boundary

Before content is playable, each entry still needs its precise French product/form, a current official source, and an age/context-safe counselling rubric. This matrix is frozen evaluation data, not sufficient medical content on its own.

