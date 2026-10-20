# MedGame 🥕

MedGame is a fictional educational simulation. It is not medical advice and never provides patient-specific clinical guidance.

## Current career-mode loop

The shipped role is Dietetics. Choose an unlocked mission, read its objectives and available tools, conduct a respectful AI-patient conversation, then receive a competency debrief. The three missions practise food-history gathering, contextual understanding, communication, and safe/realistic planning. The safety-boundary mission requires an explicit orientation action; factual language alone cannot award mastery. Missions can be replayed without losing the best recorded result.

Case constraints, scoring rubrics, and evaluation logic remain server-side. If verified evaluation is unavailable, the client shows a non-mastering fallback rather than inventing a score.

## Local setup

Requires Node.js 18+ and `OPENAI_API_KEY` in `.env` for AI conversation.

```bash
npm install
npm run start
```

Open `http://localhost:5173`. Run `npm run build` for a production bundle and `node --test tests/engine.test.js tests/storage.test.js` for the focused test suite.

## Clinique des parcours

La page d’accueil présente une allée de clinique avec cinq portes de profession. La Diététique est le seul parcours ouvert et mène aux missions existantes. Les portes de médecine générale, soins infirmiers, psychologie et pharmacie indiquent clairement qu’elles arrivent bientôt et ne créent aucune session.

En développement, l’API accepte uniquement les origines Vite `http://localhost:5173` et `http://127.0.0.1:5173`, en plus des origines de production existantes. Avec `NODE_ENV=production`, seules les deux origines HTTPS de production restent autorisées.

## Campus interactif

Le campus est une expérience desktop : sous 1024 px, l’application affiche un avis indiquant que le jeu est disponible sur PC. L’illustration source est stockée dans `src/public/assets/campus-hub.png` afin que Vite la publie sous `/game/assets/campus-hub.png`. Le bouton **Jouer** la précharge avant d’afficher le hub.
