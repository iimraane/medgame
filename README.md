# MedGame 🥕

MedGame is an interactive health role-playing game. It is not medical advice and never provides patient-specific clinical guidance.

## Current career-mode loop

The shipped role is Dietetics. Its ten-mission campaign moves from everyday food history to complex contextual consultations. Choose an unlocked mission, use optional in-world observations, conduct a respectful AI-patient conversation, then receive a competency debrief. Case facts, safety gates and scoring remain server-side; later safety-bound consultations require a server-recorded support step before mastery. Missions can be replayed without losing the best recorded result.

Case constraints, scoring rubrics, and evaluation logic remain server-side. If verified evaluation is unavailable, the client shows a non-mastering fallback rather than inventing a score.

## Local setup

Requires Node.js 18+ and `OPENAI_API_KEY` in `.env` for AI conversation. `OPENAI_MODEL` is optional and defaults to `gpt-5.6-luna`; it can be overridden for an account-supported Chat Completions model. This role-playing game is non-diagnostic and never provides individualized advice.

```bash
npm install
npm run worker:dev
```

Open the Wrangler URL shown in the terminal. Run `npm run build` and `npm test` before a deployment.

## Cloudflare production deployment

The Vite application and API are served together at `https://alimni.tv/`. Game progress remains only in browser storage; each active consultation is an expiring Durable Object session.

Authenticate Wrangler, store the key outside source control, then deploy:

```bash
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

`wrangler.jsonc` binds `alimni.tv` and `www.alimni.tv` as custom domains. Never commit `.env`, `.dev.vars`, or a secret value.

## Clinique des parcours

La page d’accueil présente une allée de clinique avec cinq portes de profession. La Diététique est le seul parcours ouvert et mène aux missions existantes. Les portes de médecine générale, soins infirmiers, psychologie et pharmacie indiquent clairement qu’elles arrivent bientôt et ne créent aucune session.

En développement, l’API accepte uniquement les origines Vite `http://localhost:5173` et `http://127.0.0.1:5173`, en plus de `https://alimni.tv` et `https://www.alimni.tv`. En production, seules les deux origines HTTPS `alimni.tv` restent autorisées.

## Campus interactif

Le campus est une expérience desktop : sous 1024 px, l’application affiche un avis indiquant que le jeu est disponible sur PC. La scène locale Three.js est assemblée à partir des métadonnées `campus` de chaque rôle (`position`, `footprint`, `accent`, `doorId`, `silhouette` et `sign`) dans `src/data/roles.js`. Chaque porte est un mesh nommé, sélectionné par raycasting, et possède un contrôle HTML équivalent pour le clavier et les lecteurs d’écran. Les contrôles sont visuellement masqués dans la scène mais éclairent le bâtiment correspondant au focus ; dans le fallback WebGL, ils réapparaissent avec une action de retour. Échap revient à l’accueil lorsqu’aucun aperçu verrouillé n’est ouvert.

Les matériaux du campus n’effectuent aucune requête distante. `src/public/assets/campus/medical-concrete-glass-atlas.png` est un atlas local réutilisable, détenu par ce dépôt, chargé uniquement par la scène Three.js pour donner du grain aux façades. Les enseignes lisibles sont rendues sur des textures procédurales locales afin de rester contrastées même si l’atlas décoratif ne se charge pas.

Les interactions de la scène et de la liste passent par la même action : seuls les parcours déverrouillés ouvrent leurs niveaux ; les autres affichent leur aperçu. Aucun compte ni service distant n’est nécessaire : la progression reste dans le stockage navigateur existant. Le rendu, ses écouteurs et sa boucle d’animation sont libérés à chaque changement de vue. Le bouton **Jouer** affiche une courte transition, puis ouvre directement le hub.
