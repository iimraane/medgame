import { navigate } from '../main.js';
const labels = { foodHistory: 'Histoire alimentaire', context: 'Contexte', communication: 'Communication', safePlan: 'Plan sûr et réaliste' };
export function renderDebrief(container, result) {
  const rows = Object.entries(result.scores).map(([axis, score]) => { const evidence = result.evidence?.[axis]; const text = evidence ? `Relevé : ${evidence.matched.join(', ') || 'aucun'} · À explorer : ${evidence.missing.join(', ') || 'rien'}` : 'Aucun élément observable disponible.'; return `<div class="debrief__axis"><span>${labels[axis]}</span><strong>${score}%</strong><div><i style="width:${score}%"></i></div><small>${text}</small></div>`; }).join('');
  container.innerHTML = `<div class="view debrief"><p class="career-hub__eyebrow">Débrief de mission · simulation éducative</p><h1>${result.mastery ? 'Mission maîtrisée' : 'Prochaine pratique utile'}</h1><p>Compétence globale : <strong>${result.total}%</strong></p>${rows}<section class="debrief__feedback"><h2>Prochaine étape</h2><p>${result.improvement}</p>${!result.safetyAcknowledged ? '<p><strong>Limite de sécurité non reconnue : la maîtrise ne peut pas être attribuée.</strong></p>' : ''}</section><div class="menu__actions"><button class="btn btn--primary" id="retry">Rejouer cette mission</button><button class="btn btn--secondary" id="map">Retour à la carte</button></div></div>`;
  container.querySelector('#retry').addEventListener('click', () => navigate('game', { missionId: result.mission.id }));
  container.querySelector('#map').addEventListener('click', () => navigate('levels'));
}
