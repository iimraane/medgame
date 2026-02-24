# MedGame 🩺

MedGame est une simulation médicale interactive et immersive où vous incarnez un médecin en consultation. Échangez avec un patient généré par Intelligence Artificielle (GPT-4o), menez l'interrogatoire clinique, prescrivez des examens et posez le bon diagnostic ! Ce jeu se veut formateur, amusant et exigeant.

## 🌟 Présentation du Gameplay

Le but du jeu est de trouver de quelle pathologie souffre le patient qui se présente dans votre cabinet. Chaque consultation est générée dynamiquement avec un niveau de difficulté croissant et des patients aux traits de caractère spécifiques (les "Modificateurs").

### Mécaniques Principales
1. **L'Interrogatoire (Chat)** : Discutez librement avec le patient via une interface de chat. Posez les bonnes questions sur ses antécédents, ses douleurs, la localisation, l'intensité, etc. Vous pouvez même lui parler au microphone !
2. **Difficulté et Comportements** : Les patients ne vous donnent pas la solution sur un plateau. Selon la difficulté du niveau, ils peuvent se montrer évasifs, honteux, amnésiques sur leurs symptômes, ou au contraire très (trop) bavards. Leurs antécédents sont générés de façon contextuelle et réaliste pour brouiller les pistes ou vous aider.
3. **Extraction de Symptômes** : L'IA agit également en tant qu'assistant de clinique. Si le patient confirme un symptôme, il apparaît dans l'interface sur la droite pour garder une trace de l'avancée clinique.
4. **Prescriptions d'Examens (Avancés)** :
   - **Labo & Ratio** : Prescrivez des tests sanguins, urinaires, ou des imageries médicales. Une IA automate vous retournera les valeurs de constantes vitales et physiologiques. *Attention : la conclusion des examens est toujours très factuelle et vague. C'est à vous, médecin, d'en tirer le diagnostic clinique.*
   - **Dossier Partagé** : Si vous êtes perdu, un chef de clinique IA peut lister des diagnostics différentiels probables à partir de l'état actuel de votre consultation.
   - **Traitement d'épreuve** : Tentez d'administrer un médicament et observez la réaction immédiate des symptômes du patient.
5. **Score et Feedback** : Si vous posez le mauvais diagnostic, l'IA évaluatrice sanctionne votre démarche et vous prodigue un conseil clinique personnalisé pour vous améliorer. Si vous réussissez, vous passez au niveau suivant pour faire face à un cas clinique plus complexe.

## 🛠 Technique & Architecture

Le projet est divisé en deux parties : **Front-end** (Vite + Vanilla JS) et **Back-end** (Serveur Express + OpenAI).

### Frontend (Client)
- **Framework** : Vite.js, léger, rapide pour le développement.
- **UI/UX** : HTML5, Vanilla JavaScript, CSS3. L'interface imite une véritable messagerie de consultation avec un tableau de bord médical.
- **Audio** : Enregistrement micro via l'API Web et encodage base64 pour envoyer les pistes vocales (Whisper) à retranscrire.

### Backend (Serveur API)
- **Serveur** : [Node.js](https://nodejs.org/) avec [Express.js](https://expressjs.com/).
- **IA (OpenAI API)** :
    - **GPT-4o / GPT-4o-mini** : Moteur derrière la discussion du patient, la modération (guardrail), le résumé de symptômes, la génération d'examens et l'évaluation finale. Un soin méticuleux a été porté aux System Prompts pour confiner l'IA strictement dans un RP médical (le patient ignore sa maladie, il évite les "prompt injections").
    - **Whisper** : Pour la transcription audio (de la voix (Speech-to-Text) vers l'input du chat).
    - **DALL-E 3** : Pour générer le portrait ultra-réaliste du patient en salle d'attente à l'ouverture de la session, basé sur sa carte maladie (âge, sexe, signes cliniques apparents).
- **Session in-memory** : Sauvegarde des contextes de discussion pour chaque joueur localement sur le backend afin d'éviter la prolifération excessive de requêtes à OpenAI, avec un Time-To-Live configuré.
- **Securité / Rate Limiting** : Protection intégrée pour éviter le spam API OpenAI et la vérification Origin CORS (bloquée aux domaines HarpyTech dans la configuration de production).

## 🚀 Installation locale

### Prérequis
- **Node.js** (v18+)
- Une clé API **OpenAI** (renseignée dans la variable d'environnement `OPENAI_API_KEY`).

### Démarrage
1. Clonez le projet ou récupérez le dossier `med-game`.
2. Ouvrez un terminal à la racine et installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine si ce n'est pas déjà fait et ajoutez votre clé OpenAI :
   ```env
   OPENAI_API_KEY=sk-xxxx...
   ```
4. Lancez l'application en mode "développement" (démarre le backend et le frontend simultanément via `concurrently`) :
   ```bash
   npm run start
   ```
   L'application sera accessible sur `http://localhost:5173` (ou le port défini par Vite), et l'API sur `http://localhost:3001/game/api`.

## 🌍 Déploiement en Production (Serveur AWS EC2)

Ce jeu est conçu pour tourner sur un serveur Linux (AWS EC2 avec Amazon Linux ou Ubuntu) derrière un répartiteur de charge Nginx.

### Structure serveur
Le serveur écoute sur un environnement de production. Le trafic de `medgame.harpytech.fr` arrive sur l'instance EC2.

1. **Génération du build Frontend**
   ```bash
   npm run build
   ```
   Cela va générer un dossier `dist/` avec le site statique prêt pour la prod.

2. **Mise en service via PM2**
   [PM2](https://pm2.io/) est utilisé pour garder le serveur backend Node.js en vie.
   ```bash
   # Sur le serveur distant
   pm2 start server/server.js --name medgame
   pm2 save
   ```

3. **Nginx (Reverse Proxy)**
   Un fichier de configuration `deploy_nginx.conf` est souvent joint, demandant à rediriger les appels HTTP de domaine vers :
   - Le chemin statique `/game` pour le dossier dist `Alias /var/www/...`
   - Les appels `domain.com/game/api` vers le port Express interne (ex: 3001).

---
*Ce projet est maintenu dans le cadre des expérimentations IA médicales "HarpyTech". L'IA peut parfois "halluciner" ; ce jeu est une fiction sérieuse et ne constitue **pas un véritable avis médical.** Mangez au moins 5 fruits et légumes par jour.*
# medgame
