// ─── Chat View ───────────────────────────────────────────────────
// Main game interface: chat with patient, medical cards, perks.

import { navigate } from '../main.js';
import GameEngine from '../game/engine.js';
import { formatPatientMessage, starsHTML, getDifficultyInfo } from '../utils/helpers.js';
import { loadSettings } from '../utils/storage.js';


import {
  sfx_messageSent, sfx_messageReceived, sfx_levelComplete,
  sfx_error, sfx_perkUnlocked, sfx_newCard, sfx_click,
  resumeAudioContext
} from '../utils/sound.js';

let engine = null;
let cardsVisible = true;

export async function renderChat(container, levelId) {
  engine = new GameEngine();

  // No loading spinner — session creation is instant (no AI call)
  let gameData;
  try {
    gameData = await engine.startLevel(levelId);
  } catch (err) {
    container.innerHTML = `
        <div class="view chat" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px">
          <div style="font-size:1.2rem;color:var(--text-secondary)">❌ ${err.message}</div>
          <button class="btn btn--primary" id="btn-back-error">🏠 Retour au menu</button>
        </div>`;
    container.querySelector('#btn-back-error').addEventListener('click', () => navigate('menu'));
    return;
  }

  const { patient, cards, perks, newCards, newPerk, level } = gameData;
  const diff = getDifficultyInfo(level.difficulty);

  const hasFichePatient = perks.some(p => p.id === 'fichePatient');
  const hasReponsesRapides = perks.some(p => p.id === 'reponsesRapides');

  const hasAnalyses = perks.some(p => p.id === 'analysesLaboratoire');
  const hasPhoto = perks.some(p => p.id === 'photoPatient');
  const hasAntecedents = perks.some(p => p.id === 'antecedents');
  const hasIndice = perks.some(p => p.id === 'indiceDiagnostic');
  const hasDossierPartage = perks.some(p => p.id === 'dossierPartage');
  const hasTraitementEpreuve = perks.some(p => p.id === 'traitementEpreuve');

  const { transcriptionEnabled: hasTranscription } = loadSettings();

  let examUsed = false;
  let indiceUsed = false;

  const initial = patient.name.firstName[0];

  // Build cards HTML (with copy protection)
  const cardsHTML = cards.map(c => `
    <div class="medical-card no-select" data-card="${c.id}">
      <div class="medical-card__header">
        <span class="medical-card__emoji">${c.emoji}</span>
        <span class="medical-card__name">${c.name}</span>
        <span class="medical-card__category">${c.category}</span>
      </div>
      <div class="medical-card__details" style="display:none">
        <p>${c.description}</p>
        <div class="medical-card__section">
          <div class="medical-card__section-title">Symptômes</div>
          <ul>${c.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="medical-card__section">
          <div class="medical-card__section-title">Questions à poser</div>
          <ul>${c.questionsToAsk.map(q => `<li>${q}</li>`).join('')}</ul>
        </div>
        <div class="medical-card__treatment">
          <strong>Traitement :</strong> ${c.treatment}
        </div>
        <div class="medical-card__redflags">
          <strong>⚠️ Signaux d'alerte :</strong> ${c.redFlags.join(', ')}
        </div>
      </div>
    </div>
  `).join('');

  // Build perks bar (Initial HTML, cleaned up later)
  let perksBarHTML = '';
  const perkButtons = [];
  if (hasReponsesRapides) perkButtons.push('<button class="perk-btn" id="perk-quick">💬 Réponses rapides</button>');

  if (perkButtons.length) {
    perksBarHTML = `<div class="chat__perks-bar">${perkButtons.join('')}</div>`;
  }

  container.innerHTML = `
    <div class="view chat">
      <div class="chat__header">
        <div class="chat__patient-avatar">${initial}</div>
        <div class="chat__patient-info">
          <div class="chat__patient-name">${hasFichePatient ? patient.name.fullName : 'Patient'}</div>
          <div class="chat__patient-status" id="patient-status">
            ${hasFichePatient ? `${patient.name.gender}, ${patient.name.age} ans` : 'En consultation'}
          </div>
        </div>
        <div class="chat__header-actions">
          <button class="btn btn--small btn--secondary" id="btn-patient-toggle" title="Fiche Patient">📋</button>
          <button class="btn btn--small btn--secondary" id="btn-cards-toggle" title="Cartes médicales">📚</button>
          <button class="btn btn--small btn--secondary" id="btn-restart" title="Recommencer">🔄</button>
          <button class="btn btn--small btn--secondary" id="btn-menu" title="Menu">🏠</button>
        </div>
      </div>

      <div class="chat__hud">
        <div class="chat__hud-item">
          <span style="color:${diff.color}">●</span> Niv. ${level.id} — ${level.name}
        </div>
        <div class="chat__hud-item" id="hud-difficulty" style="color:${diff.color}">
          ${diff.label}
        </div>
      </div>

      <div class="chat__body">
        <div class="chat__messages-area">
          <div class="chat__messages" id="messages-container">
            <div class="message message--system">
              <div class="message__bubble">
                🏥 Le patient entre dans votre cabinet. La consultation commence.
              </div>
            </div>
          </div>

          <div class="chat__input-area">
            <div class="chat__input-wrapper">
              <div class="voice-waveform" id="voice-waveform" style="display: none;">
                <div class="voice-waveform__dot"></div>
                <div class="voice-waveform__time" id="voice-time">0:00</div>
                <div class="voice-waveform__bars">
                  <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                </div>
              </div>
              <textarea class="chat__input" id="chat-input" placeholder="Écrivez votre message au patient..." rows="1"></textarea>
              <button class="chat__send-btn" id="btn-send" title="Envoyer" style="display: none;">➤</button>
              <button class="chat__mic-btn" id="btn-mic" title="Parler">🎙️</button>
              <button class="chat__finish-btn" id="btn-finish" title="Terminer la consultation">✅ Terminer</button>
            </div>
            ${perksBarHTML}
          </div>
        </div>

        <div class="cards-panel cards-panel--hidden" id="cards-panel">
          <div class="cards-panel__header">
            <h3>📚 Cartes Médicales</h3>
            <button class="btn btn--icon btn--secondary btn--small" id="btn-close-cards" style="width:30px;height:30px;font-size:0.8rem">✕</button>
          </div>
          <div class="cards-panel__list">
            ${cardsHTML}
          </div>
        </div>

        <div class="cards-panel cards-panel--hidden" id="patient-panel">
          <div class="cards-panel__header">
            <h3>📋 Dossier Patient</h3>
            <button class="btn btn--icon btn--secondary btn--small" id="btn-close-patient" style="width:30px;height:30px;font-size:0.8rem">✕</button>
          </div>
          <div class="cards-panel__list patient-file__content">
            <div class="patient-file__section">
              <h4>🏥 Identité</h4>
              <p><strong>Nom:</strong> ${patient.name.fullName}</p>
              <p><strong>Âge:</strong> ${patient.name.age} ans</p>
              <p><strong>Sexe:</strong> ${patient.name.gender}</p>
            </div>
            
            <div class="patient-file__section">
              <h4>📝 Symptômes constatés</h4>
              <div id="patient-symptoms-list" class="markdown-body">
                <em style="color:var(--gray-500)">Analyse de la conversation en cours...</em>
              </div>
            </div>

            <div class="patient-file__section">
              <h4>🛠️ Actions & Examens</h4>
              <div class="patient-file__actions" id="patient-file-actions">
                <!-- Actions will be injected here via JS -->
              </div>
            </div>
            
            <div class="patient-file__section" id="patient-file-results">
              <!-- Exam results will go here -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ─── DOM References ────────────────────────────────────────────
  const messagesContainer = container.querySelector('#messages-container');
  const chatInput = container.querySelector('#chat-input');
  const sendBtn = container.querySelector('#btn-send');
  const micBtn = container.querySelector('#btn-mic');
  const waveform = container.querySelector('#voice-waveform');
  const finishBtn = container.querySelector('#btn-finish');
  const patientStatus = container.querySelector('#patient-status');
  const cardsPanel = container.querySelector('#cards-panel');
  const patientPanel = container.querySelector('#patient-panel');

  // Insert perks in patient-file-actions (Except Quick Replies and Soutien Psy which stay on bottom bar)
  const patientActionsContainer = container.querySelector('#patient-file-actions');
  const perksBarContainer = container.querySelector('.chat__perks-bar');
  if (perksBarContainer) perksBarContainer.innerHTML = ''; // Clear default perks bar

  if (hasReponsesRapides && perksBarContainer) {
    perksBarContainer.innerHTML += '<button class="perk-btn" id="perk-quick">💬 Réponses rapides</button>';
  }

  if (hasAnalyses) patientActionsContainer.innerHTML += '<button class="btn btn--secondary" id="btn-action-lab" style="margin-bottom:8px;width:100%;text-align:left">🧪 Bilan Sanguin / Urinaire</button>';
  if (hasPhoto) patientActionsContainer.innerHTML += '<button class="btn btn--secondary" id="btn-action-photo" style="margin-bottom:8px;width:100%;text-align:left">📸 Photo du Patient</button>';
  if (hasAntecedents) patientActionsContainer.innerHTML += '<button class="btn btn--secondary" id="btn-action-history" style="margin-bottom:8px;width:100%;text-align:left">📜 Accéder aux antécédents</button>';
  if (hasIndice) patientActionsContainer.innerHTML += '<button class="btn btn--secondary" id="btn-action-hint" style="margin-bottom:8px;width:100%;text-align:left">🔍 Intuition clinique</button>';
  if (hasDossierPartage) patientActionsContainer.innerHTML += `<button class="btn btn--secondary" id="btn-action-dossier" style="margin-bottom:8px;width:100%;text-align:left">🗂️ Avis des collègues</button>`;
  if (hasTraitementEpreuve) patientActionsContainer.innerHTML += `<button class="btn btn--secondary" id="btn-action-traitement" style="margin-bottom:8px;width:100%;text-align:left">💊 Traitement d'épreuve</button>`;

  if (perksBarContainer && perksBarContainer.innerHTML === '') perksBarContainer.remove();

  // ─── Copy protection on cards ──────────────────────────────────
  cardsPanel.addEventListener('contextmenu', e => e.preventDefault());
  cardsPanel.addEventListener('copy', e => e.preventDefault());

  // ─── Show new perk notification ────────────────────────────────
  if (newPerk) {
    sfx_perkUnlocked();
    showPerkNotification(newPerk);
  }

  // Show new cards notification
  if (newCards.length > 0) {
    setTimeout(() => {
      sfx_newCard();
      showNewCardsNotification(newCards, cards);
    }, newPerk ? 2000 : 500);
  }

  // ─── Show patient info if fichePatient perk ────────────────────
  if (hasFichePatient) {
    showPatientInfo(patient, hasPhoto, () => {
      chatInput.focus();
    });
  }

  // ─── Card toggles ─────────────────────────────────────────────
  container.querySelectorAll('.medical-card').forEach(card => {
    card.addEventListener('click', () => {
      const details = card.querySelector('.medical-card__details');
      const isExpanded = details.style.display !== 'none';
      container.querySelectorAll('.medical-card__details').forEach(d => d.style.display = 'none');
      container.querySelectorAll('.medical-card').forEach(c => c.classList.remove('medical-card--expanded'));
      if (!isExpanded) {
        details.style.display = 'block';
        card.classList.add('medical-card--expanded');
      }
    });
  });

  let cardsVisible = false;
  let patientVisible = false;

  container.querySelector('#btn-cards-toggle').addEventListener('click', () => {
    cardsVisible = !cardsVisible;
    if (cardsVisible) {
      patientVisible = false;
      patientPanel.classList.add('cards-panel--hidden');
    }
    cardsPanel.classList.toggle('cards-panel--hidden', !cardsVisible);
  });

  const closeCardsBtn = container.querySelector('#btn-close-cards');
  if (closeCardsBtn) {
    closeCardsBtn.addEventListener('click', () => {
      cardsVisible = false;
      cardsPanel.classList.add('cards-panel--hidden');
    });
  }

  // ─── Toggle Patient File ────────────────────────────────────────
  let symptomsFetched = false;

  container.querySelector('#btn-patient-toggle').addEventListener('click', async () => {
    patientVisible = !patientVisible;
    if (patientVisible) {
      cardsVisible = false;
      cardsPanel.classList.add('cards-panel--hidden');

      // If we haven't fetched symptoms at least once, fetch them
      if (!symptomsFetched) {
        fetchSymptomsSilent();
        symptomsFetched = true;
      }
    }
    patientPanel.classList.toggle('cards-panel--hidden', !patientVisible);
  });

  const closePatientBtn = container.querySelector('#btn-close-patient');
  if (closePatientBtn) {
    closePatientBtn.addEventListener('click', () => {
      patientVisible = false;
      patientPanel.classList.add('cards-panel--hidden');
    });
  }

  // ─── Navigation ────────────────────────────────────────────────
  container.querySelector('#btn-menu').addEventListener('click', () => {
    showCustomConfirm('Retourner au menu ? La consultation en cours sera perdue.', () => {
      navigate('menu');
    });
  });

  container.querySelector('#btn-restart').addEventListener('click', () => {
    showCustomConfirm('Recommencer ce niveau ? La consultation en cours sera perdue.', () => {
      navigate('game', { levelId });
    });
  });

  let isRecording = false;

  function updateInputButtons() {
    if (isRecording || chatInput.value.trim() === '') {
      sendBtn.style.display = 'none';
      micBtn.style.display = 'flex';
    } else {
      sendBtn.style.display = 'flex';
      micBtn.style.display = 'none';
    }
  }

  // ─── Voice Input (MediaRecorder + OpenAI Whisper) ───────────────
  let mediaRecorder;
  let audioChunks = [];

  let recordingTimer;
  let recordingSeconds = 0;

  function updateTimeDisplay() {
    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const timeEl = container.querySelector('#voice-time');
    if (timeEl) timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function startRecording() {
    await resumeAudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());

        const originalPlaceholder = chatInput.placeholder;
        chatInput.placeholder = "Transcription en cours...";
        chatInput.disabled = true;

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            const res = await fetch('/game/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64data })
            });

            const data = await res.json();
            if (res.ok && data.text) {
              chatInput.value += (chatInput.value ? ' ' : '') + data.text;
              chatInput.dispatchEvent(new Event('input'));
            } else {
              showToast(data.error || 'Erreur de transcription.', 'error');
            }

            chatInput.placeholder = originalPlaceholder;
            chatInput.disabled = false;
            chatInput.focus();
          };
        } catch (err) {
          showToast('Erreur réseau lors de la transcription.', 'error');
          chatInput.placeholder = originalPlaceholder;
          chatInput.disabled = false;
        }
      };

      mediaRecorder.start();
      isRecording = true;
      micBtn.classList.add('chat__mic-btn--recording');
      waveform.style.display = 'flex';

      recordingSeconds = 0;
      updateTimeDisplay();
      clearInterval(recordingTimer);
      recordingTimer = setInterval(() => {
        recordingSeconds++;
        updateTimeDisplay();
      }, 1000);

      updateInputButtons();
    } catch (err) {
      showToast('Microphone non autorisé ou introuvable.', 'error');
    }
  }

  function stopRecording() {
    if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording = false;
    micBtn.classList.remove('chat__mic-btn--recording');
    waveform.style.display = 'none';
    clearInterval(recordingTimer);
    updateInputButtons();
  }

  micBtn.addEventListener('click', () => {
    if (isRecording) stopRecording();
    else startRecording();
  });

  // ─── Auto-resize input ────────────────────────────────────────
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    updateInputButtons();
  });

  // ─── Send message ─────────────────────────────────────────────
  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text || engine.isWaiting || engine.isFinished) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    updateInputButtons();
    sendBtn.disabled = true;
    micBtn.disabled = true;
    finishBtn.disabled = true;
    await engine.sendDoctorMessage(text);
    sendBtn.disabled = false;
    micBtn.disabled = false;
    finishBtn.disabled = false;
    chatInput.focus();
  }

  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  finishBtn.addEventListener('click', () => {
    if (engine.messages.length < 4) {
      showToast('Échangez un peu plus avec le patient avant de terminer.', 'error');
      return;
    }
    const hasAvisSpecialiste = perks.some(p => p.id === 'avisSpecialiste');
    showDiagnosisSelection(cards, engine, levelId, hasAvisSpecialiste);
  });

  // Helper to fetch symptoms silently and update the UI
  async function fetchSymptomsSilent() {
    if (!hasFichePatient) return;
    const symptomsContainer = container.querySelector('#patient-symptoms-list');
    if (!symptomsContainer) return;

    if (symptomsContainer.innerHTML.includes('Aucun symptôme') || symptomsContainer.innerHTML.includes('Analyse de la conversation en cours')) {
      symptomsContainer.innerHTML = '<div class="rp-loading">Analyse des signes cliniques en temps réel</div>';
    }

    try {
      const res = await fetch('/game/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: engine.sessionId })
      });
      const data = await res.json();
      if (data.symptoms) {
        symptomsContainer.innerHTML = data.symptoms.replace(/(\\r\\n|\\n|\\r)/gm, "<br>");
      }
    } catch {
      console.error("Erreur d'analyse des symptômes");
    }
  }

  // ─── Engine callbacks ─────────────────────────────────────────
  engine.onMessage = (msg) => {
    addMessage(msg.role, msg.content);
    if (msg.role === 'doctor') {
      sfx_messageSent();
    } else {
      sfx_messageReceived();
      fetchSymptomsSilent(); // Automatically rethink symptoms on new patient message
    }
  };

  engine.onTyping = (isTyping) => {
    if (isTyping) {
      patientStatus.textContent = 'écrit...';
      showTyping();
    } else {
      patientStatus.textContent = hasFichePatient ? `${patient.name.gender}, ${patient.name.age} ans` : 'En consultation';
      hideTyping();
    }
  };

  engine.onError = (error) => {
    sfx_error();
    showToast(error, 'error');
  };

  engine.onGuardrailFail = (reason) => {
    sfx_error();
    showToast(`⛔ ${reason}`, 'error');
  };

  engine.onEvaluating = (isEvaluating) => {
    if (isEvaluating) {
      showEvaluationLoading();
    } else {
      hideEvaluationLoading();
    }
  };

  engine.onFinish = (result) => {
    sfx_levelComplete();
    showResults(result, levelId);
  };

  // ─── Shared Helper to Hide Empty Actions Panel ────────────────
  function checkEmptyActions() {
    if (!patientActionsContainer) return;
    const visibleActions = Array.from(patientActionsContainer.children).some(btn => btn.style.display !== 'none');
    if (!visibleActions && patientActionsContainer.parentElement) {
      patientActionsContainer.parentElement.style.display = 'none';
    }
  }

  // ─── Image Modal Helper ────────────────────────────────────────
  function openImageModal(url) {
    let modal = document.getElementById('fiche-image-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'fiche-image-modal';
      modal.className = 'image-modal';
      modal.innerHTML = `<img src="" alt="Full size photo">`;
      document.body.appendChild(modal);
      modal.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
      });
    }
    const img = modal.querySelector('img');
    img.src = url;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // ─── Patient File Perks ────────────────────────────────────────
  const resultsContainer = container.querySelector('#patient-file-results');

  const btnActionHistory = container.querySelector('#btn-action-history');
  if (btnActionHistory) {
    btnActionHistory.addEventListener('click', () => {
      btnActionHistory.style.display = 'none';
      checkEmptyActions();
      sfx_click();

      const div = document.createElement('div');
      div.className = 'exam-result-box';
      div.innerHTML = `<h4>📜 ANTÉCÉDENTS</h4><div class="exam-result-content"><div class="rp-loading">Récupération des dossiers auprès des anciens hôpitaux</div></div>`;
      resultsContainer.appendChild(div);
      resultsContainer.scrollTop = resultsContainer.scrollHeight;

      setTimeout(() => {
        div.querySelector('.exam-result-content').innerHTML = `<div class="markdown-body">${patient.antecedentsHtml || 'Aucun antécédent notable.'}</div>`;
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
      }, 1500);
    });
  }

  const btnActionHint = container.querySelector('#btn-action-hint');
  if (btnActionHint) {
    btnActionHint.addEventListener('click', async () => {
      if (indiceUsed) return;
      indiceUsed = true;
      btnActionHint.style.display = 'none';
      checkEmptyActions();
      sfx_click();

      const div = document.createElement('div');
      div.className = 'exam-result-box';
      div.innerHTML = `<h4>💡 INTUITION CLINIQUE</h4><div class="exam-result-content"><div class="rp-loading">Réflexion clinique en cours</div></div>`;
      resultsContainer.appendChild(div);

      try {
        const res = await fetch('/game/api/hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: engine.sessionId })
        });
        const data = await res.json();
        if (data.hint) {
          div.querySelector('.exam-result-content').innerHTML = `💡 ${data.hint}`;
        } else {
          div.querySelector('.exam-result-content').innerHTML = `Erreur.`;
        }
      } catch (err) {
        div.querySelector('.exam-result-content').innerHTML = `Erreur.`;
      }
    });
  }

  const btnActionLab = container.querySelector('#btn-action-lab');
  if (btnActionLab) {
    btnActionLab.addEventListener('click', async () => {
      btnActionLab.style.display = 'none';
      checkEmptyActions();
      sfx_click();

      const div = document.createElement('div');
      div.className = 'exam-result-box card-lab';
      div.innerHTML = `<h4>🧪 BILAN SANGUIN / URINAIRE</h4><div class="exam-result-content"><em style="color:var(--gray-500)">Envoi au laboratoire... <span class="loading-dots"></span></em></div>`;
      resultsContainer.appendChild(div);

      const results = await engine.getLabResults();

      if (results) {
        div.querySelector('.exam-result-content').innerHTML = `<div class="markdown-body">${results}</div>`;
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
      }
    });
  }

  const btnActionPhoto = container.querySelector('#btn-action-photo');
  if (btnActionPhoto) {
    btnActionPhoto.addEventListener('click', async () => {
      btnActionPhoto.style.display = 'none';
      checkEmptyActions();
      sfx_click();

      const div = document.createElement('div');
      div.className = 'exam-result-box card-radio';
      div.innerHTML = `<h4>📸 PHOTO DU PATIENT</h4><div class="exam-result-content"><div class="rp-loading">Développement de la photographie en cours</div></div>`;
      resultsContainer.appendChild(div);

      try {
        const res = await fetch('/game/api/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: engine.sessionId })
        });
        const data = await res.json();
        if (data.imageUrl) {
          div.querySelector('.exam-result-content').innerHTML = `
                <img src="${data.imageUrl}" alt="Photo du patient" style="width: 100%; border-radius: 8px; margin-top: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: zoom-in;" onclick="document.body.dispatchEvent(new CustomEvent('open-image', {detail: '${data.imageUrl}'}))">
                <p style="margin-top: 10px; font-size: 0.9em; color: var(--gray-600);">Observez attentivement les signes cliniques (coloration de la peau, fatigue, rougeurs...).</p>
              `;
          resultsContainer.scrollTop = resultsContainer.scrollHeight;

          // Attach listener loosely so we don't pollute global scope inside string template
          document.body.addEventListener('open-image', (e) => {
            if (e.detail === data.imageUrl) openImageModal(data.imageUrl);
          });

          addMessage('system', '📸 La photo du patient a été ajoutée dans son dossier médical.');
        } else {
          div.querySelector('.exam-result-content').innerHTML = `<p style="color:red">Erreur lors de la génération de la photo.</p>`;
        }
      } catch (err) {
        div.querySelector('.exam-result-content').innerHTML = `<p style="color:red">Erreur lors de la génération de la photo.</p>`;
      }
    });
  }

  const btnActionDossier = container.querySelector('#btn-action-dossier');
  if (btnActionDossier) {
    btnActionDossier.addEventListener('click', async () => {
      btnActionDossier.style.display = 'none';
      checkEmptyActions();
      sfx_click();

      const div = document.createElement('div');
      div.className = 'exam-result-box';
      div.innerHTML = `<h4>🗂️ AVIS DES COLLÈGUES</h4><div class="exam-result-content"><div class="rp-loading">Collégiale en cours avec les chefs de clinique</div></div>`;
      resultsContainer.appendChild(div);

      try {
        const res = await fetch('/game/api/dossier-partage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: engine.sessionId })
        });
        const data = await res.json();
        if (data.diagnoses) {
          const formatted = data.diagnoses.replace(/(\r\n|\n|\r)/gm, "<br>");
          div.querySelector('.exam-result-content').innerHTML = `
                <p style="margin-bottom: 8px; font-size: 0.9em; color: var(--gray-600);">Diagnostics les probables suggérés par l'équipe :</p>
                <div>${formatted}</div>
              `;
          resultsContainer.scrollTop = resultsContainer.scrollHeight;
          addMessage('system', "🗂️ L'avis collégial a été ajouté au dossier médical.");
        } else {
          div.querySelector('.exam-result-content').innerHTML = `<p style="color:red">Erreur d'analyse.</p>`;
        }
      } catch (err) {
        div.querySelector('.exam-result-content').innerHTML = `<p style="color:red">Erreur d'analyse.</p>`;
      }
    });
  }

  const btnActionTraitement = container.querySelector('#btn-action-traitement');
  if (btnActionTraitement) {
    btnActionTraitement.addEventListener('click', async () => {
      btnActionTraitement.style.display = 'none';
      checkEmptyActions();
      sfx_click();

      const div = document.createElement('div');
      div.className = 'exam-result-box card-lab';
      div.innerHTML = `<h4>💊 TRAITEMENT D'ÉPREUVE</h4>
        <div class="exam-result-content">
          <p style="margin-bottom: 8px; font-size: 0.9em; color: var(--gray-600);">Choisissez un traitement à administrer pour observer la réaction :</p>
          <select class="treatment-select" id="treatment-dropdown">
            <option value="">-- Sélectionner un médicament --</option>
            <option value="Paracétamol (Antalgique)">Paracétamol (Antalgique)</option>
            <option value="Ibuprofène (AINS)">Ibuprofène (AINS)</option>
            <option value="Amoxicilline (Antibiotique)">Amoxicilline (Antibiotique)</option>
            <option value="Trinitrine (Dérivé nitré)">Trinitrine (Dérivé nitré)</option>
            <option value="Salbutamol / Ventoline (Bronchodilatateur)">Salbutamol / Ventoline</option>
            <option value="Corticoïdes (Anti-inflammatoire)">Corticoïdes (Anti-inflammatoire)</option>
            <option value="Oméprazole (IPP)">Oméprazole (IPP)</option>
            <option value="Furosémide (Diurétique)">Furosémide (Diurétique)</option>
            <option value="Aspirine">Aspirine</option>
            <option value="Antihistaminique">Antihistaminique</option>
          </select>
          <button class="btn btn--primary" id="btn-confirm-treatment" style="width: 100%;">Administrer</button>
        </div>`;
      resultsContainer.appendChild(div);
      resultsContainer.scrollTop = resultsContainer.scrollHeight;

      const confirmBtn = div.querySelector('#btn-confirm-treatment');
      confirmBtn.addEventListener('click', async () => {
        const select = div.querySelector('#treatment-dropdown');
        const medication = select.value;
        if (!medication) return;

        confirmBtn.disabled = true;
        select.disabled = true;
        sfx_click();

        const contentDiv = div.querySelector('.exam-result-content');
        contentDiv.innerHTML = `<div class="rp-loading">Administration de ${medication} en cours d'observation</div>`;
        resultsContainer.scrollTop = resultsContainer.scrollHeight;

        try {
          const res = await fetch('/game/api/traitement-epreuve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: engine.sessionId, medication })
          });
          const data = await res.json();
          if (data.evolution) {
            contentDiv.innerHTML = `
              <p style="margin-bottom: 8px; font-size: 0.9em; color: var(--gray-600);"><strong>Médicament administré :</strong> ${medication}</p>
              <div class="markdown-body"><strong>Réaction observée :</strong> ${data.evolution}</div>
            `;
            resultsContainer.scrollTop = resultsContainer.scrollHeight;
            addMessage('system', `💊 Le traitement ( ${medication} ) a été administré. Observez la réaction dans la fiche patient.`);
          } else {
            contentDiv.innerHTML = `<p style="color:red">Le patient n'a présenté aucune réaction observable à ce médicament.</p>`;
          }
        } catch (err) {
          contentDiv.innerHTML = `<p style="color:red">Erreur lors de l'administration du traitement.</p>`;
        }
      });
    });
  }

  // ─── Button for Quick Replies ───────────────────────────
  // (We handle perkQuick separately below)

  const perkQuick = container.querySelector('#perk-quick');
  if (perkQuick) {
    perkQuick.addEventListener('click', () => {
      showQuickReplies(chatInput);
    });
  }



  const btnLab = container.querySelector('#perk-lab');
  if (btnLab) {
    btnLab.addEventListener('click', async () => {
      if (btnLab.disabled) return;
      btnLab.disabled = true;
      btnLab.style.opacity = '0.5';
      sfx_click();

      addMessage('system', '🧪 Envoi des prélèvements au laboratoire en cours... <span class="loading-dots"></span>');
      const results = await engine.getLabResults();

      // Remove loading message
      const lastMsg = messagesContainer.lastElementChild;
      if (lastMsg && lastMsg.classList.contains('message--system')) {
        messagesContainer.removeChild(lastMsg);
      }

      if (results) {
        const div = document.createElement('div');
        div.className = 'message message--system';
        div.innerHTML = `<div class="exam-result-box card-lab">
          <h4>🧪 RÉSULTATS DU LABORATOIRE</h4>
          <div class="exam-result-content markdown-body">${results}</div>
        </div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  const btnImaging = container.querySelector('#perk-imaging');
  if (btnImaging) {
    btnImaging.addEventListener('click', async () => {
      if (btnImaging.disabled) return;
      btnImaging.disabled = true;
      btnImaging.style.opacity = '0.5';
      sfx_click();

      addMessage('system', '☢️ Le patient passe ses examens d\'imagerie... <span class="loading-dots"></span>');
      const report = await engine.getImagingReport();

      // Remove loading message
      const lastMsg = messagesContainer.lastElementChild;
      if (lastMsg && lastMsg.classList.contains('message--system')) {
        messagesContainer.removeChild(lastMsg);
      }

      if (report) {
        const div = document.createElement('div');
        div.className = 'message message--system';
        div.innerHTML = `<div class="exam-result-box card-radio">
          <h4>☢️ RAPPORT D'IMAGERIE MÉDICALE</h4>
          <div class="exam-result-content markdown-body">${report}</div>
        </div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  // ─── Helper functions ─────────────────────────────────────────
  function addMessage(role, content) {
    const div = document.createElement('div');
    const roleClass = role === 'doctor' ? 'message--doctor' : role === 'patient' ? 'message--patient' : 'message--system';
    div.className = `message ${roleClass}`;

    const formatted = role === 'patient' ? formatPatientMessage(content) : content;
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div class="message__bubble">${formatted}</div>
      ${role !== 'system' ? `<div class="message__time">${time}</div>` : ''}
    `;

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    let typing = messagesContainer.querySelector('.typing-indicator');
    if (!typing) {
      typing = document.createElement('div');
      typing.className = 'typing-indicator';
      typing.innerHTML = `
        <div class="typing-indicator__dot"></div>
        <div class="typing-indicator__dot"></div>
        <div class="typing-indicator__dot"></div>
      `;
      messagesContainer.appendChild(typing);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    const typing = messagesContainer.querySelector('.typing-indicator');
    if (typing) typing.remove();
  }
}

// ─── Evaluation Loading Overlay ──────────────────────────────────
function showEvaluationLoading() {
  const existing = document.querySelector('.evaluation-overlay');
  if (existing) return;

  const overlay = document.createElement('div');
  overlay.className = 'evaluation-overlay';
  overlay.innerHTML = `
    <div class="evaluation-loading">
      <div class="evaluation-loading__spinner"></div>
      <div class="evaluation-loading__text">Vérification du diagnostic en cours...</div>
      <div class="evaluation-loading__sub">Veuillez patienter</div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideEvaluationLoading() {
  const overlay = document.querySelector('.evaluation-overlay');
  if (overlay) overlay.remove();
}

// ─── Toast notification ──────────────────────────────────────────
function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type ? `toast--${type}` : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Custom Confirm Dialog ───────────────────────────────────────
function showCustomConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-confirm-overlay';

  overlay.innerHTML = `
    <div class="custom-confirm-box shadow-xl">
      <div class="custom-confirm-message">${message}</div>
      <div class="custom-confirm-actions">
        <button class="btn btn--secondary" id="confirm-cancel">Annuler</button>
        <button class="btn btn--primary" id="confirm-ok">Oui</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#confirm-ok').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
}

// ─── Patient Info Modal ──────────────────────────────────────────
function showPatientInfo(patient, showPhoto, onClose) {
  const modal = document.createElement('div');
  modal.className = 'patient-info';

  const initial = patient.name.firstName[0];
  const modifierTags = patient.modifiers
    .map(m => `<span class="modifier-tag">${m.categoryIcon} ${m.name}</span>`)
    .join('');

  const desc = showPhoto ? generatePatientDescription(patient) : '';

  modal.innerHTML = `
    <div class="patient-info__card">
      <div class="patient-info__avatar">${initial}</div>
      <div class="patient-info__name">${patient.name.fullName}</div>
      <div class="patient-info__meta">${patient.name.gender}, ${patient.name.age} ans</div>
      ${showPhoto ? `<div class="patient-info__desc">${desc}</div>` : ''}
      <div class="patient-info__modifiers">${modifierTags}</div>
      <button class="btn btn--primary patient-info__start-btn" id="btn-start-consult">
        🩺 Commencer la consultation
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#btn-start-consult').addEventListener('click', () => {
    modal.remove();
    if (onClose) onClose();
  });
}

// ─── Diagnosis Selection Modal ───────────────────────────────────
function showDiagnosisSelection(cards, engine, levelId, hasAvisSpecialiste) {
  const overlay = document.createElement('div');
  overlay.className = 'diagnosis-overlay';

  // Custom styles for this overlay
  overlay.style.position = 'fixed';
  overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.width = '100%'; overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
  overlay.style.display = 'flex'; overlay.style.justifyContent = 'center'; overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';

  const content = document.createElement('div');
  content.style.backgroundColor = 'var(--surface)';
  content.style.padding = '2rem';
  content.style.borderRadius = 'var(--radius-lg)';
  content.style.width = '90%';
  content.style.maxWidth = '600px';
  content.style.maxHeight = '90vh';
  content.style.overflowY = 'auto';
  content.style.textAlign = 'center';

  let html = `
    <h2 style="font-size: 1.5rem; color: var(--text-primary); margin-bottom: 0.5rem;">Diagnostic Final</h2>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Sélectionnez la pathologie exacte du patient :</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; text-align: left;">
  `;

  // Sort cards alphabetically by name
  const sortedCards = [...cards].sort((a, b) => a.name.localeCompare(b.name));

  sortedCards.forEach(card => {
    html += `
      <button class="btn btn--secondary diag-btn styled-diag-btn" data-id="${card.id}">
        <div class="diag-btn-emoji">${card.emoji}</div>
        <div class="diag-btn-name">${card.name}</div>
      </button>
    `;
  });

  html += `
    </div>
    <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
      ${hasAvisSpecialiste ? `<button class="btn btn--primary" id="btn-avis-specialiste" style="background-color: var(--purple-500); border-color: var(--purple-500)">🔬 Demander un Avis Spécialiste</button>` : ''}
      <button class="btn btn--secondary" id="btn-cancel-diag">Retour à la consultation</button>
    </div>
  `;

  content.innerHTML = html;
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  if (hasAvisSpecialiste) {
    const btnAvis = overlay.querySelector('#btn-avis-specialiste');
    if (btnAvis) {
      btnAvis.addEventListener('click', () => {
        const wrongCards = cards.filter(c => c.id !== engine.condition);
        const shuffled = wrongCards.sort(() => 0.5 - Math.random());
        const toEliminate = shuffled.slice(0, 3).map(c => c.id);

        overlay.querySelectorAll('.diag-btn').forEach(btn => {
          if (toEliminate.includes(btn.dataset.id)) {
            btn.style.opacity = '0.3';
            btn.style.pointerEvents = 'none';
            btn.style.textDecoration = 'line-through';
          }
        });

        btnAvis.disabled = true;
        btnAvis.style.opacity = '0.5';
        btnAvis.textContent = '🔬 Avis utilisé';
      });
    }
  }

  overlay.querySelector('#btn-cancel-diag').addEventListener('click', () => {
    overlay.remove();
  });

  const buttons = overlay.querySelectorAll('.diag-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedId = btn.getAttribute('data-id');
      overlay.remove();
      engine.finishConsultation(selectedId);
    });
  });
}

// ─── Results Overlay ─────────────────────────────────────────────
function showResults(result, levelId) {
  const overlay = document.createElement('div');
  overlay.className = 'results-overlay';

  const isWin = result.isCorrect;
  const title = isWin ? '✅ Diagnostic Correct !' : '❌ Mauvais Diagnostic';
  const color = isWin ? 'var(--success)' : 'var(--error)';

  overlay.innerHTML = `
    <div class="results-card" style="border-top: 4px solid ${color};">
      <div class="results-card__title" style="color: ${color};">${title}</div>
      ${!isWin ? `<div class="results-card__condition" style="font-size: 1.1rem; margin-top: 1rem;">Le patient souffrait en réalité de : <strong>${result.correctConditionName || '?'}</strong></div>` : ''}
      
      <div style="text-align: left; background: var(--surface-hover); padding: 1.5rem; border-radius: var(--radius-md); margin: 1.5rem 0;">
        <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Feedback du Chef de Clinique :</h4>
        <p style="color: var(--text-secondary); line-height: 1.5;">${result.feedback || 'Pas de feedback disponible.'}</p>
      </div>

      <div class="results-card__actions">
        ${!isWin ? `<button class="btn btn--primary" id="result-retry">🔄 Recommencer le niveau</button>` : ''}
        ${isWin ? `<button class="btn btn--primary" id="result-next">▶️ Niveau suivant</button>` : ''}
        <button class="btn btn--secondary" id="result-menu">🏠 Menu</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const retryBtn = overlay.querySelector('#result-retry');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      overlay.remove();
      navigate('game', { levelId });
    });
  }

  const nextBtn = overlay.querySelector('#result-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      overlay.remove();
      navigate('game', { levelId: levelId + 1 });
    });
  }

  overlay.querySelector('#result-menu').addEventListener('click', () => {
    overlay.remove();
    navigate('menu');
  });
}

// ─── Perk Notification ───────────────────────────────────────────
function showPerkNotification(perk) {
  const notif = document.createElement('div');
  notif.className = 'perk-unlock';
  notif.innerHTML = `
    <div class="perk-unlock__title">🎁 Nouvel atout débloqué !</div>
    <div class="perk-unlock__desc">${perk.emoji} ${perk.name} — ${perk.description}</div>
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}

// ─── New Cards Notification ──────────────────────────────────────
function showNewCardsNotification(newCardIds, allCards) {
  const newCards = allCards.filter(c => newCardIds.includes(c.id));
  if (newCards.length === 0) return;

  const notif = document.createElement('div');
  notif.className = 'new-cards-notif';
  notif.innerHTML = `
    <div class="new-cards-notif__title">📚 ${newCards.length > 1 ? 'Nouvelles cartes' : 'Nouvelle carte'} débloquée${newCards.length > 1 ? 's' : ''} !</div>
    <div class="new-cards-notif__list">
      ${newCards.map(c => `<span class="new-cards-notif__card">${c.emoji} ${c.name}</span>`).join('')}
    </div>
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}



// ─── Quick Replies ───────────────────────────────────────────────
function showQuickReplies(input) {
  const replies = [
    'Pouvez-vous me décrire vos symptômes en détail ?',
    'Depuis quand ressentez-vous ces symptômes ?',
    'Avez-vous des antécédents médicaux ou des allergies ?',
    'Prenez-vous des médicaments actuellement ?',
    'Y a-t-il quelque chose qui aggrave ou améliore vos symptômes ?',
    'Comment est votre sommeil et votre appétit récemment ?',
  ];

  const existing = document.querySelector('.quick-replies');
  if (existing) { existing.remove(); return; }

  const div = document.createElement('div');
  div.className = 'quick-replies';
  div.style.cssText = 'position:fixed;bottom:180px;left:50%;transform:translateX(-50%);display:flex;flex-wrap:wrap;gap:6px;justify-content:center;z-index:50;max-width:700px;animation:slideUp 0.2s ease';

  replies.forEach(reply => {
    const btn = document.createElement('button');
    btn.className = 'perk-btn';
    btn.textContent = reply;
    btn.style.cssText = 'background:white;box-shadow:0 2px 8px rgba(0,0,0,0.1);white-space:nowrap';
    btn.addEventListener('click', () => {
      input.value = reply;
      input.dispatchEvent(new Event('input'));
      input.focus();
      div.remove();
    });
    div.appendChild(btn);
  });

  document.body.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.remove(); }, 8000);
}

// ─── Generate patient description (client-side visual only) ──────
function generatePatientDescription(patient) {
  const builds = patient.name.isMale
    ? ['corpulence moyenne', 'plutôt mince', 'assez costaud', 'légèrement en surpoids']
    : ['corpulence moyenne', 'plutôt mince', 'silhouette sportive', 'légèrement ronde'];

  const hairColors = ['cheveux bruns', 'cheveux noirs', 'cheveux blonds', 'cheveux grisonnants'];
  const features = ['lunettes', 'air fatigué', 'regard fuyant', 'yeux cernés', 'teint pâle', 'air soucieux'];

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return `${patient.name.gender}, ${patient.name.age} ans, ${pick(builds)}, ${pick(hairColors)}, ${pick(features)}.`;
}
