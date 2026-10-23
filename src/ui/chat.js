import { navigate } from '../main.js';
import GameEngine from '../game/engine.js';

export async function renderChat(container, missionId) {
  const engine = new GameEngine(); let data;
  try { data = await engine.startMission(missionId); } catch (error) { container.innerHTML = `<div class="view debrief"><p>${error.message}</p><button class="btn btn--primary" id="back">Carte des missions</button></div>`; container.querySelector('#back').addEventListener('click', () => navigate('levels', { roleId: 'dietetics' })); return; }
  const { mission, patient } = data;
  const displaySymptom = (label) => `${label.charAt(0).toLocaleUpperCase('fr-FR')}${label.slice(1)}`;
  container.innerHTML = `<div class="view chat career-chat"><div class="career-chat__debrief-loading" id="debrief-loading" role="status" aria-live="assertive" hidden><div><span class="career-chat__debrief-spinner" aria-hidden="true"></span><p>Préparation du débrief…</p><small>L’analyse de l’échange est en cours.</small></div></div><div class="consultation-modal" id="tool-modal" hidden><div class="consultation-modal__content" role="dialog" aria-modal="true" aria-label="Support de consultation"><button class="btn btn--small" id="close-tool">Fermer</button><div id="tool-content"></div></div></div><header class="chat__header"><button class="btn btn--small btn--secondary" id="exit">← Carte</button><div class="chat__patient-info"><div class="chat__patient-name">${patient.name.fullName}</div></div></header><main class="chat__body"><aside class="consultation-tools"><h2>Outils de consultation</h2><div id="tools"></div></aside><section class="chat__messages-area"><div class="chat__messages" id="messages"><div class="message message--patient"><div class="message__bubble"></div></div></div><div class="chat__input-area"><div class="career-chat__composer"><textarea class="chat__input" id="input" rows="2" placeholder="Message…"></textarea><button class="career-chat__voice" id="voice" type="button" aria-label="Dicter un message" title="Dicter un message"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"></path><path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"></path></svg></button></div><div class="career-chat__actions"><button class="btn btn--primary" id="send">Envoyer</button><button class="btn btn--secondary" id="finish">Terminer et débriefer</button></div></div></section></main></div>`;
  let showDiseaseDetails = () => {};
  if (mission.roleId === 'nursing') {
    const chatBody = container.querySelector('.chat__body');
    const toolsRail = container.querySelector('.consultation-tools');
    toolsRail.className = 'consultation-tools nursing-tools-rail';
    toolsRail.innerHTML = `<h2>Documents</h2><div id="nursing-tools" class="nursing-tools"></div>`;
    const rail = document.createElement('aside');
    rail.className = 'nursing-rail nursing-rail--right';
    rail.innerHTML = `<h2>Hypothèses</h2><div id="differential"></div><h2>Signes recueillis</h2><div id="symptoms" class="nursing-symptoms" role="status" aria-live="polite">Aucun signe n’a encore été formulé clairement par le patient.</div><button class="btn btn--primary nursing-submit" id="submit-hypothesis" disabled>Soumettre l’hypothèse</button>`;
    chatBody.classList.add('chat__body--nursing');
    chatBody.append(rail);
    let selectedDisease;
    const differential = rail.querySelector('#differential');
    const symptoms = rail.querySelector('#symptoms');
    const renderSymptoms = (found = []) => {
      symptoms.replaceChildren();
      if (!found.length) { symptoms.textContent = 'Aucun signe n’a encore été formulé clairement par le patient.'; return; }
      found.forEach((symptom) => {
        const item = document.createElement('article'); item.className = 'nursing-pin';
        const title = document.createElement('strong'); title.textContent = displaySymptom(symptom.label); item.append(title); symptoms.append(item);
      });
    };
    const renderNursingTools = (tools) => { const toolsNode = toolsRail.querySelector('#nursing-tools'); toolsNode.innerHTML = tools.map((tool) => `<button class="btn btn--secondary consultation-tool" data-tool="${tool.id}">${tool.label}</button>`).join(''); toolsNode.querySelectorAll('[data-tool]').forEach((button) => button.addEventListener('click', () => engine.useTool(button.dataset.tool))); };
    differential.innerHTML = data.differential.map((disease) => `<button class="nursing-disease" data-disease="${disease.id}">${disease.name}</button>`).join('');
    differential.querySelectorAll('[data-disease]').forEach((button) => { button.setAttribute('aria-haspopup', 'dialog'); button.addEventListener('click', () => {
      selectedDisease = button.dataset.disease; const disease = data.differential.find((item) => item.id === selectedDisease);
      if (!disease) { selectedDisease = undefined; rail.querySelector('#submit-hypothesis').disabled = true; return; }
      differential.querySelectorAll('button').forEach((item) => item.classList.toggle('is-selected', item === button));
      showDiseaseDetails(disease, button);
      rail.querySelector('#submit-hypothesis').disabled = false;
    }); });
    if (data.tools?.length) { renderNursingTools(data.tools); engine.onTools = renderNursingTools; } else { toolsRail.remove(); chatBody.classList.add('chat__body--nursing-no-documents'); }
    engine.onNursingSymptoms = (found) => renderSymptoms(found);
    rail.querySelector('#submit-hypothesis').addEventListener('click', () => engine.submitNursingHypothesis(selectedDisease));
    container.querySelector('#finish').hidden = true;
  }
  const input = container.querySelector('#input'); const messages = container.querySelector('#messages');
  const renderText = (bubble, content, supportsCues = false) => {
    if (!supportsCues) { bubble.textContent = content; return; }
    for (const part of String(content).split(/(\*[^*\n]{1,140}\*)/g)) {
      if (/^\*[^*\n]{1,140}\*$/.test(part)) { const cue = document.createElement('em'); cue.className = 'message__cue'; cue.textContent = part.slice(1, -1); bubble.appendChild(cue); }
      else bubble.appendChild(document.createTextNode(part));
    }
  };
  renderText(messages.querySelector('.message__bubble'), patient.opening, true);
  const modal = container.querySelector('#tool-modal'); const modalDialog = modal.querySelector('[role="dialog"]'); const closeTool = container.querySelector('#close-tool'); const toolContent = container.querySelector('#tool-content'); let modalOpener;
  const openModal = (label, opener) => { modalDialog.setAttribute('aria-label', label); modalOpener = opener; modal.hidden = false; closeTool.focus(); };
  const closeModal = () => { modal.hidden = true; modalOpener?.focus(); modalOpener = undefined; };
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...modalDialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((item) => !item.disabled);
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  showDiseaseDetails = (disease, opener) => {
    toolContent.replaceChildren();
    const title = document.createElement('h2'); title.textContent = disease.name; toolContent.append(title);
    const description = document.createElement('p'); description.className = 'nursing-disease-modal__summary'; description.textContent = disease.summary; toolContent.append(description);
    const cards = document.createElement('section'); cards.className = 'nursing-disease-modal__symptoms';
    disease.symptoms.forEach((sign, index) => { const item = document.createElement('article'); item.className = 'nursing-disease-modal__symptom'; item.innerHTML = `<span>Symptôme ${index + 1}</span><p></p>`; item.querySelector('p').textContent = displaySymptom(sign); cards.append(item); });
    toolContent.append(cards); openModal(`Détails de l’hypothèse : ${disease.name}`, opener);
  };
  const showTool = (tool) => {
    toolContent.replaceChildren(); const title = document.createElement('h2'); title.textContent = tool.label; toolContent.append(title);
    if (tool.evidence.images) {
      const grid = document.createElement('div'); grid.className = 'consultation-gallery'; tool.evidence.images.forEach((image) => { if (image.status === 'available') { const element = document.createElement('img'); element.src = image.src; element.alt = image.alt; grid.append(element); } else { const unavailable = document.createElement('div'); unavailable.className = 'consultation-unavailable'; unavailable.textContent = image.label; grid.append(unavailable); } }); toolContent.append(grid);
    } else if (tool.kind === 'receipt') {
      const receipt = document.createElement('section'); receipt.className = 'consultation-receipt';
      receipt.innerHTML = `<header><strong>${tool.evidence.store}</strong><span>${tool.evidence.date}</span><small>Reçu de courses · prix masqués</small></header><div class="consultation-receipt__items"></div><footer>${tool.evidence.items.length} articles distincts</footer>`;
      const items = receipt.querySelector('.consultation-receipt__items'); tool.evidence.items.forEach((entry) => { const row = document.createElement('div'); row.className = 'consultation-receipt__item'; row.innerHTML = `<span class="consultation-receipt__brand"></span><span class="consultation-receipt__name"></span><strong class="consultation-receipt__quantity"></strong>`; row.querySelector('.consultation-receipt__brand').textContent = entry.brand; row.querySelector('.consultation-receipt__name').textContent = entry.item; row.querySelector('.consultation-receipt__quantity').textContent = entry.quantity; items.append(row); }); toolContent.append(receipt);
    } else if (tool.kind === 'journal') {
      const journal = document.createElement('section'); journal.className = 'consultation-journal'; journal.innerHTML = `<header>Journal alimentaire · ${tool.evidence.dayLabel}</header><ol></ol>`;
      const timeline = journal.querySelector('ol'); tool.evidence.entries.forEach((entry) => { const item = document.createElement('li'); item.innerHTML = '<time></time><div><strong></strong><p></p></div>'; item.querySelector('time').textContent = entry.time; item.querySelector('strong').textContent = entry.entry; item.querySelector('p').textContent = entry.context; timeline.append(item); }); toolContent.append(journal);
    } else if (tool.kind === 'pantry') {
      const pantry = document.createElement('section'); pantry.className = 'consultation-pantry'; pantry.innerHTML = '<div class="consultation-pantry__shelf"><h3>Réserve</h3><ul></ul></div><div class="consultation-pantry__fridge"><h3>Réfrigérateur</h3><ul></ul></div>';
      [['.consultation-pantry__shelf ul', tool.evidence.pantry], ['.consultation-pantry__fridge ul', tool.evidence.fridge]].forEach(([selector, entries]) => entries.forEach((entry) => { const item = document.createElement('li'); item.innerHTML = '<span></span><strong></strong>'; item.querySelector('span').textContent = entry.item; item.querySelector('strong').textContent = entry.quantity; pantry.querySelector(selector).append(item); })); toolContent.append(pantry);
    } else if (tool.kind === 'calendar') {
      const calendar = document.createElement('section'); calendar.className = 'consultation-calendar'; calendar.innerHTML = `<header><strong>Agenda de la semaine</strong><span>${tool.evidence.weekLabel}</span></header><div class="consultation-calendar__week"></div>`;
      const week = calendar.querySelector('.consultation-calendar__week'); tool.evidence.days.forEach((entry) => { const day = document.createElement('article'); day.className = 'consultation-calendar__day'; day.innerHTML = `<h3>${entry.day} <span>${entry.date}</span></h3><ul></ul>`; entry.slots.forEach((slot) => { const slotElement = document.createElement('li'); slotElement.textContent = slot; day.querySelector('ul').append(slotElement); }); week.append(day); }); toolContent.append(calendar);
    } else if (tool.kind === 'nursing-document') {
      const docPanel = document.createElement('section'); docPanel.className = 'consultation-evidence consultation-evidence--nursing-document';
      const label = document.createElement('p'); label.className = 'consultation-evidence__disclaimer'; label.textContent = 'Support fictif de simulation'; docPanel.append(label);
      tool.evidence.facts.forEach((fact) => { const item = document.createElement('p'); item.textContent = fact; docPanel.append(item); }); toolContent.append(docPanel);
    } else {
      const panel = document.createElement('div'); panel.className = `consultation-evidence consultation-evidence--${tool.kind}`; tool.evidence.notes.forEach((note, index) => { const item = document.createElement('div'); item.className = 'consultation-evidence__item'; item.innerHTML = `<span>${tool.kind === 'journal' ? ['Matin', 'Après-midi'][index] : ['Réserve', 'Réfrigérateur'][index]}</span><p></p>`; item.querySelector('p').textContent = note; panel.append(item); }); toolContent.append(panel);
    }
    openModal(`Support de consultation : ${tool.label}`);
  };
  const renderTools = (tools) => { const rail = container.querySelector('#tools'); rail.innerHTML = tools.length ? tools.map((tool) => `<button class="btn btn--secondary consultation-tool" data-tool="${tool.id}">${tool.label}</button>`).join('') : '<p class="consultation-tool__empty">Tous les outils disponibles ont été consultés.</p>'; rail.querySelectorAll('[data-tool]').forEach((button) => button.addEventListener('click', () => engine.useTool(button.dataset.tool))); };
  if (mission.roleId !== 'nursing') { renderTools(data.tools || []); engine.onTools = renderTools; } closeTool.addEventListener('click', closeModal);
  container.querySelector('#exit').addEventListener('click', () => navigate('levels', { roleId: mission.roleId }));
  const add = (message) => { if (message.role === 'tool') { showTool(message); return; } const item = document.createElement('div'); item.className = `message message--${message.role === 'doctor' ? 'doctor' : 'patient'}`; item.innerHTML = `<div class="message__bubble"></div>`; renderText(item.querySelector('.message__bubble'), message.content, message.role === 'patient'); messages.appendChild(item); messages.scrollTop = messages.scrollHeight; };
  engine.onMessage = add; engine.onError = (message) => alert(message); engine.onGuardrailFail = (message) => alert(message); engine.onTyping = () => {}; engine.onEvaluating = (active) => { container.querySelector('#debrief-loading').hidden = !active; };
  const send = async () => { const text = input.value.trim(); if (!text) return; input.value = ''; await engine.sendDoctorMessage(text); };
  container.querySelector('#send').addEventListener('click', send); input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } });
  container.querySelector('#voice').addEventListener('click', () => { const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Recognition) { alert('La saisie vocale n’est pas prise en charge par ce navigateur.'); return; } const recognition = new Recognition(); recognition.lang = 'fr-FR'; recognition.interimResults = false; recognition.onresult = (event) => { input.value += `${input.value ? ' ' : ''}${event.results[0][0].transcript}`; input.focus(); }; recognition.onerror = () => alert('La saisie vocale n’a pas pu être transcrite.'); recognition.start(); });
  container.querySelector('#finish').addEventListener('click', () => engine.finishMission()); engine.onFinish = (result) => navigate('debrief', { result });
}
