import { navigate } from '../main.js';
const dieteticsLabels = { foodHistory: 'Histoire alimentaire', context: 'Contexte', communication: 'Communication', safePlan: 'Plan sûr et réaliste' };
const nursingLabels = { foodHistory: 'Signes recueillis', context: 'Chronologie et documents', communication: 'Qualité de l’échange', safePlan: 'Priorisation de l’hypothèse' };
const psychologyLabels = { exploration: 'Exploration', formulation: 'Formulation contextualisée', orientation: 'Orientation sûre' };
export function renderDebrief(container, result) {
  const isNursing = result.mission?.roleId === 'nursing';
  const isPsychology = result.mission?.roleId === 'psychology';
  const isBinaryCompletion = isNursing || isPsychology;
  const labels = isPsychology ? psychologyLabels : isNursing ? nursingLabels : dieteticsLabels;
  const rows = isBinaryCompletion ? '' : Object.entries(result.scores || {}).map(([axis, score]) => { const evidence = result.evidence?.[axis]; const text = evidence?.message || 'Aucun élément observable disponible.'; return `<div class="debrief__axis"><span>${labels[axis]}</span><strong>${score}%</strong><div><i style="width:${score}%"></i></div><small>${text}</small></div>`; }).join('');
  const hasNextMission = result.mission?.order < 10;
  const outcome = result.mastery ? 'MISSION RÉUSSIE' : 'À REJOUER';
  const outcomeDetail = isNursing
    ? result.mastery ? 'Hypothèse validée' : 'Hypothèse à revoir'
    : isPsychology ? result.mastery ? 'Formulation validée' : 'Formulation à revoir'
      : result.mastery ? 'Compétence consolidée' : 'Progression en cours';
  const advancement = hasNextMission
    ? `<p class="debrief__advancement${result.mastery ? ' debrief__advancement--success' : ''}">${result.mastery ? 'Niveau suivant déverrouillé.' : isNursing ? 'Trouve la bonne maladie pour déverrouiller le niveau suivant.' : isPsychology ? 'Trouve le bon motif pour déverrouiller le niveau suivant.' : 'Obtiens plus de 70 % pour déverrouiller le niveau suivant.'}</p>`
    : result.mastery ? `<p class="debrief__advancement debrief__advancement--success">Parcours ${isNursing ? 'Soins infirmiers' : isPsychology ? 'Psychologie' : 'Diététique'} terminé.</p>` : '';
  container.innerHTML = `<div class="view debrief debrief--game-result ${result.mastery ? 'debrief--win' : 'debrief--loss'}"><section class="debrief__result-card"><p class="debrief__badge">${outcome}</p><p class="career-hub__eyebrow">Débrief de mission</p><h1>${result.mastery ? isNursing ? 'Bonne maladie identifiée' : isPsychology ? 'Bonne formulation identifiée' : 'Mission maîtrisée' : isNursing ? 'Mauvaise hypothèse' : isPsychology ? 'Mauvais motif' : 'Prochaine pratique utile'}</h1><p class="debrief__outcome-detail">${outcomeDetail}</p><div class="debrief__score"><strong>${result.total}%</strong><span>score de mission</span></div>${isBinaryCompletion ? `<p>${result.feedback}</p>` : ''}${advancement}</section>${rows}<section class="debrief__feedback"><h2>${isBinaryCompletion ? 'Résultat' : 'Prochaine étape'}</h2><p>${result.improvement || ''}</p>${!isBinaryCompletion && !result.safetyAcknowledged ? '<p><strong>Une étape de soutien adaptée n’a pas été enregistrée : la maîtrise ne peut pas être attribuée.</strong></p>' : ''}</section><div class="menu__actions"><button class="btn btn--primary" id="retry">Rejouer cette mission</button><button class="btn btn--secondary" id="map">Retour à la carte</button></div></div>`;
  container.querySelector('#retry').addEventListener('click', () => navigate('game', { missionId: result.mission.id }));
  container.querySelector('#map').addEventListener('click', () => navigate('levels', { roleId: result.mission.roleId }));
}
