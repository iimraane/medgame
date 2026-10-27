import { test, expect } from '@playwright/test';

const motifs = [
  { id: 'generalized-anxiety', label: 'Trouble anxieux généralisé', description: 'Une inquiétude qui prend beaucoup de place dans plusieurs domaines du quotidien.', signs: ['Tension fréquente', 'Anticipation du pire', 'Sommeil perturbé'] },
  { id: 'panic-disorder', label: 'Trouble panique', description: 'Des épisodes de peur intense qui peuvent modifier les habitudes.', signs: ['Crainte d’un nouvel épisode', 'Évitement de certains lieux', 'Sensations physiques inquiétantes'] },
  { id: 'social-phobia', label: 'Phobie sociale', description: 'La peur du regard des autres peut réduire les échanges et les sorties.', signs: ['Évitement social', 'Peur d’être jugé', 'Préparation excessive'] },
];
const supports = [
  ['daily-life-journal', 'Journal de vie', 'psychology-journal', { entries: [{ moment: 'Matin', text: 'Réveil tendu.' }, { moment: 'Soir', text: 'Marche apaisante.' }] }],
  ['timeline', 'Frise chronologique', 'psychology-timeline', { events: ['Avant : rythme stable.', 'Changement : nouvelle responsabilité.', 'Aujourd’hui : fatigue accrue.'] }],
  ['relationship-map', 'Carte relationnelle', 'psychology-relationships', { people: [{ name: 'Un proche', link: 'soutien présent' }, { name: 'Collègue', link: 'relation tendue' }] }],
  ['reaction-chain', 'Chaîne des réactions', 'psychology-chain', { steps: ['Situation : réunion.', 'Interprétation : je vais échouer.', 'Émotion : anxiété.', 'Réponse : évitement.'] }],
  ['daily-life-fragments', 'Fragments du quotidien', 'psychology-fragments', { fragments: ['Agenda : pause avant réunion.', 'Note : appeler un proche.', 'Liste : marche du soir.'] }],
];

async function installFixtureApi(page) {
  await page.route('**/api/start', async (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ sessionId: 'psychology-fixture', variantId: 'psychology-fixture-1', patient: { name: { fullName: 'Camille', firstName: 'Camille', age: 28 }, opening: 'J’aimerais comprendre ce qui rend mes journées plus difficiles.' }, tools: supports.map(([id, label, kind]) => ({ id, label, kind })), differential: motifs, requiresSecureNextStep: false }) }));
  await page.route('**/api/consultation-tool', async (route) => {
    const { toolId } = route.request().postDataJSON(); const support = supports.find(([id]) => id === toolId);
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ tool: support && { id: support[0], label: support[1], kind: support[2], evidence: support[3] }, tools: supports.map(([id, label, kind]) => ({ id, label, kind })) }) });
  });
  await page.route('**/api/psychology-formulation', async (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total: 100, mastery: true, feedback: 'Bonne formulation identifiée.', axes: {}, improvement: 'Les éléments recueillis vont dans le même sens.', safetyAcknowledged: true }) }));
}

async function unlockPsychology(page) {
  await page.addInitScript(() => {
    const missionProgress = {}; for (let index = 1; index < 10; index += 1) missionProgress[`psychology-${index}`] = { attempts: 1, bestScore: 100, mastered: true };
    localStorage.setItem('medgame_save', JSON.stringify({ campaignProgressVersion: 1, legacyCampaignUnlockThrough: 1, missionProgress, recentVariantIds: {} }));
  });
}
async function openPsychologyMap(page) {
  await page.getByRole('button', { name: 'Jouer' }).click(); await page.waitForTimeout(900);
  await page.locator('button[data-role="psychology"]').last().dispatchEvent('click');
  await expect(page.getByRole('heading', { name: 'Carte des missions' })).toBeVisible();
}

test('Psychology campus and mission-map visual states', async ({ page }) => {
  await unlockPsychology(page); await page.goto('/');
  await expect(page.locator('body')).toHaveScreenshot('psychology-campus.png', { animations: 'disabled' });
  await openPsychologyMap(page);
  await expect(page.locator('.level-select')).toHaveScreenshot('psychology-map-unlocked.png', { animations: 'disabled' });
});

test('Psychology consultation shows the right rail and five distinct supports', async ({ page }) => {
  await installFixtureApi(page); await unlockPsychology(page); await page.goto('/'); await openPsychologyMap(page);
  await page.locator('[data-mission="psychology-9"]').click(); await expect(page.locator('.psychology-rail')).toBeVisible();
  await expect(page.locator('.chat__body')).toHaveClass(/chat__body--psychology/);
  await expect(page.locator('.chat__body')).toHaveCSS('grid-template-columns', /250px.*320px/);
  await expect(page.locator('.career-chat')).toHaveScreenshot('psychology-consultation-opening.png', { animations: 'disabled' });
  for (const [id] of supports) {
    await page.locator(`[data-tool="${id}"]`).click(); await expect(page.locator('#tool-modal')).toBeVisible();
    await expect(page.locator('#tool-modal')).toHaveScreenshot(`psychology-support-${id}.png`, { animations: 'disabled' });
    await page.getByRole('button', { name: 'Fermer' }).click();
  }
  await page.locator('[data-motif="generalized-anxiety"]').click(); await expect(page.locator('#tool-modal')).toHaveScreenshot('psychology-motif-detail.png', { animations: 'disabled' });
  await page.getByRole('button', { name: 'Fermer' }).click();
  const motif = page.locator('[data-motif="generalized-anxiety"]');
  await motif.hover(); await page.mouse.down(); await page.waitForTimeout(900); await page.mouse.up();
  await expect(motif).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.psychology-board')).toHaveCount(0);
  await expect(page.locator('#psychology-next-step')).toHaveCount(0);
  await expect(page.locator('.psychology-rail')).toHaveScreenshot('psychology-formulation-board.png', { animations: 'disabled' });
  await page.getByRole('button', { name: 'Soumettre la formulation' }).click();
  await expect(page.locator('.debrief')).toBeVisible();
  await expect(page.locator('.debrief')).toHaveScreenshot('psychology-debrief-success.png', { animations: 'disabled' });
});
