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
