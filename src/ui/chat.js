import { navigate } from '../main.js';
import GameEngine from '../game/engine.js';

export async function renderChat(container, missionId) {
  const engine = new GameEngine();
  let data;
  try { data = await engine.startMission(missionId); } catch (error) { container.innerHTML = `<div class="view debrief"><p>${error.message}</p><button class="btn btn--primary" id="back">Carte des missions</button></div>`; container.querySelector('#back').addEventListener('click', () => navigate('levels')); return; }
  const { mission, patient } = data;
  const toolControls = mission.safetyBoundary ? '<button class="btn btn--secondary" id="orient">🧭 Noter l’orientation sécurité</button>' : '<button class="btn btn--secondary" id="goal">🎯 Proposer un objectif réaliste</button>';
  container.innerHTML = `<div class="view chat career-chat"><header class="chat__header"><button class="btn btn--small btn--secondary" id="exit">← Carte</button><div class="chat__patient-info"><div class="chat__patient-name">${patient.name.fullName}</div><div class="chat__patient-status">Consultation éducative fictive</div></div></header><div class="mission-briefing"><p class="career-hub__eyebrow">${mission.icon} Mission de diététique</p><h1>${mission.title}</h1><p>${mission.summary}</p><h2>Objectifs</h2><ul>${mission.objectives.map((objective) => `<li>${objective}</li>`).join('')}</ul><h2>Outils disponibles</h2><p>${mission.permittedTools.join(' · ')}</p><p class="mission-briefing__boundary">${mission.safetyBoundary ? `Limite de sécurité : ${mission.safetyBoundary.explanation}` : 'Gardez le plan réaliste pour la vie concrète de la personne.'}</p><button class="btn btn--primary" id="start">Commencer l’échange</button></div><main class="chat__body" hidden><aside class="mission-objectives"><h2>Objectifs</h2><ul>${mission.objectives.map((objective) => `<li>${objective}</li>`).join('')}</ul><p>Découvrez le rythme, les préférences, les ressources et la disponibilité au changement pendant l’échange.</p></aside><section class="chat__messages-area"><div class="chat__messages" id="messages"><div class="message message--system"><div class="message__bubble">${patient.opening}</div></div></div><div class="chat__input-area"><textarea class="chat__input" id="input" rows="2" placeholder="Écrivez une question respectueuse ou une prochaine étape réaliste…"></textarea><div class="career-chat__actions">${toolControls}<button class="btn btn--secondary" id="voice">🎙️ Voix</button><button class="btn btn--primary" id="send">Envoyer</button><button class="btn btn--secondary" id="finish">Terminer et débriefer</button></div></div></section></main></div>`;
  const briefing = container.querySelector('.mission-briefing'); const body = container.querySelector('.chat__body'); const input = container.querySelector('#input'); const messages = container.querySelector('#messages');
  container.querySelector('#exit').addEventListener('click', () => navigate('levels'));
  container.querySelector('#start').addEventListener('click', () => { briefing.hidden = true; body.hidden = false; input.focus(); });
  const add = (message) => { const item = document.createElement('div'); item.className = `message message--${message.role === 'doctor' ? 'doctor' : 'patient'}`; item.innerHTML = `<div class="message__bubble"></div>`; item.querySelector('.message__bubble').textContent = message.content; messages.appendChild(item); messages.scrollTop = messages.scrollHeight; };
  engine.onMessage = add; engine.onError = (message) => alert(message); engine.onGuardrailFail = (message) => alert(message); engine.onTyping = () => {};
  const send = async () => { const text = input.value.trim(); if (!text) return; input.value = ''; await engine.sendDoctorMessage(text); };
  container.querySelector('#send').addEventListener('click', send); input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } });
  container.querySelector('#voice').addEventListener('click', () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { alert('La saisie vocale n’est pas prise en charge par ce navigateur.'); return; }
    const recognition = new Recognition(); recognition.lang = 'fr-FR'; recognition.interimResults = false;
    recognition.onresult = (event) => { input.value += `${input.value ? ' ' : ''}${event.results[0][0].transcript}`; input.focus(); };
    recognition.onerror = () => alert('La saisie vocale n’a pas pu être transcrite.'); recognition.start();
  });
  const orientation = container.querySelector('#orient');
  if (orientation) orientation.addEventListener('click', () => { engine.recordAction('orientation'); orientation.disabled = true; orientation.textContent = '✓ Orientation sécurité notée'; });
  const goal = container.querySelector('#goal');
  if (goal) goal.addEventListener('click', () => { input.value = `${input.value}${input.value ? ' ' : ''}Quel petit objectif réaliste aimeriez-vous essayer la semaine prochaine ?`; input.focus(); });
  container.querySelector('#finish').addEventListener('click', () => engine.finishMission());
  engine.onFinish = (result) => navigate('debrief', { result });
}
