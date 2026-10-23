import { navigate } from '../main.js';
const dieteticsLabels = { foodHistory: 'Histoire alimentaire', context: 'Contexte', communication: 'Communication', safePlan: 'Plan sûr et réaliste' };
const nursingLabels = { foodHistory: 'Signes recueillis', context: 'Chronologie et documents', communication: 'Qualité de l’échange', safePlan: 'Priorisation de l’hypothèse' };
export function renderDebrief(container, result) {
  const isNursing = result.mission?.roleId === 'nursing';
  const labels = isNursing ? nursingLabels : dieteticsLabels;
  const rows = Object.entries(result.scores).map(([axis, score]) => { const evidence = result.evidence?.[axis]; const text = evidence?.message || 'Aucun élément observable disponible.'; return `<div class="debrief__axis"><span>${labels[axis]}</span><strong>${score}%</strong><div><i style="width:${score}%"></i></div><small>${text}</small></div>`; }).join('');
  const hasNextMission = result.mission?.order < 10;
  const advancement = hasNextMission
    ? `<p class="debrief__advancement${result.mastery ? ' debrief__advancement--success' : ''}">${result.mastery ? 'Niveau suivant déverrouillé.' : isNursing ? 'Trouve la bonne maladie pour déverrouiller le niveau suivant.' : 'Obtiens plus de 70 % pour déverrouiller le niveau suivant.'}</p>`
    : result.mastery ? `<p class="debrief__advancement debrief__advancement--success">Parcours ${result.mission?.roleId === 'nursing' ? 'Soins infirmiers' : 'Diététique'} terminé.</p>` : '';
  container.innerHTML = `<div class="view debrief"><p class="career-hub__eyebrow">Débrief de mission</p><h1>${result.mastery ? isNursing ? 'Bonne maladie identifiée' : 'Mission maîtrisée' : isNursing ? 'Mauvaise hypothèse' : 'Prochaine pratique utile'}</h1>${isNursing ? `<p>${result.feedback}</p>` : `<p>Compétence globale : <strong>${result.total}%</strong></p>`}${advancement}${isNursing ? '' : rows}<section class="debrief__feedback"><h2>${isNursing ? 'Résultat' : 'Prochaine étape'}</h2><p>${result.improvement}</p>${!result.safetyAcknowledged ? '<p><strong>Une étape de soutien adaptée n’a pas été enregistrée : la maîtrise ne peut pas être attribuée.</strong></p>' : ''}</section><div class="menu__actions"><button class="btn btn--primary" id="retry">Rejouer cette mission</button><button class="btn btn--secondary" id="map">Retour à la carte</button></div></div>`;
  container.querySelector('#retry').addEventListener('click', () => navigate('game', { missionId: result.mission.id }));
  container.querySelector('#map').addEventListener('click', () => navigate('levels', { roleId: result.mission.roleId }));
}
