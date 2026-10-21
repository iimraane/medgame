# MedGame 🥕

MedGame is an interactive health role-playing game. It is not medical advice and never provides patient-specific clinical guidance.

## Current career-mode loop

The shipped role is Dietetics. Its ten-mission campaign moves from everyday food history to complex contextual consultations. Choose an unlocked mission, use optional in-world observations, conduct a respectful AI-patient conversation, then receive a competency debrief. Case facts, safety gates and scoring remain server-side; later safety-bound consultations require a server-recorded support step before mastery. Missions can be replayed without losing the best recorded result.

Case constraints, scoring rubrics, and evaluation logic remain server-side. If verified evaluation is unavailable, the client shows a non-mastering fallback rather than inventing a score.

## Local setup

Requires Node.js 18+ and `OPENAI_API_KEY` in `.env` for AI conversation. `OPENAI_MODEL` is optional and defaults to `gpt-5.6-luna`; it can be overridden for an account-supported Chat Completions model. This role-playing game is non-diagnostic and never provides individualized advice.

```bash
npm install
npm run start
```

Open `http://localhost:5173`. Run `npm run build` for a production bundle and `node --test tests/engine.test.js tests/storage.test.js tests/roles.test.js tests/campaign.test.js` for the focused test suite.

## Clinique des parcours

La page d’accueil présente une allée de clinique avec cinq portes de profession. La Diététique est le seul parcours ouvert et mène aux missions existantes. Les portes de médecine générale, soins infirmiers, psychologie et pharmacie indiquent clairement qu’elles arrivent bientôt et ne créent aucune session.

En développement, l’API accepte uniquement les origines Vite `http://localhost:5173` et `http://127.0.0.1:5173`, en plus des origines de production existantes. Avec `NODE_ENV=production`, seules les deux origines HTTPS de production restent autorisées.

## Campus interactif

Le campus est une expérience desktop : sous 1024 px, l’application affiche un avis indiquant que le jeu est disponible sur PC. `src/public/assets/campus-hub.png` est la scène de base, publiée par Vite sous `/game/assets/campus-hub.png`. Les cinq fichiers lossless `campus-panel-*.png` sont des images complètes au même format (1672×941), mais sont superposés et découpés localement au seul kiosque inférieur droit : ils ne doivent jamais être redimensionnés, recompressés ou remplacés par du contenu HTML. Le bouton **Jouer** précharge la scène, puis le hub précharge les états de kiosque.
