import { NURSING_DISEASES } from '../src/data/nursingCampaign.js';

// This catalogue deliberately lives on the server: the browser receives one
// document only after its selected case and unlock have been authorised.
export const NURSING_DOCUMENT_DEFINITIONS = Object.freeze([
  ['nursing-document-2', 2, 'Dossier de visite'],
  ['nursing-document-4', 4, 'Constantes de visite'],
  ['nursing-document-6', 6, 'Compte rendu biologique'],
  ['nursing-document-8', 8, 'Compte rendu d’examen'],
  ['nursing-document-10', 10, 'Historique des transmissions'],
]);

// Authored, case-specific evidence.  It deliberately contains no formatter:
// every line is part of the fictional learning case selected by the server.
export const NURSING_DOSSIERS = Object.freeze({
  'viral-syndrome': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif VS-184 ouvert le 17 octobre.', 'Courbatures diffuses signalées au réveil.', 'Un collègue était fébrile vendredi dernier.', 'La gêne a débuté après une journée de travail normale.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,9 °C.', 'Pouls régulier noté à 92 par minute.', 'La fatigue gêne surtout la fin de journée.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Prélèvement fictif daté du 17 octobre.', 'CRP fictive mesurée à 14 mg/L.', 'La numération ne présente pas d’écart saillant.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Gorge légèrement rouge décrite à l’examen.', 'Aucun foyer respiratoire n’est consigné.', 'Les douleurs musculaires restent diffuses.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-3 : contact rapproché au bureau rapporté.', 'J-1 : frissons brefs en soirée mentionnés.', 'Aujourd’hui : les courbatures dominent le récit.'] },
  },
  migraine: {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif MG-207 ouvert le 9 octobre.', 'Une douleur pulsatile revient du côté gauche.', 'Un épisode comparable avait eu lieu au printemps.', 'La nausée est apparue après la sensibilité à la lumière.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,8 °C.', 'La pièce sombre est préférée pendant l’entretien.', 'Les nausées augmentent avec les écrans lumineux.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['NFS fictive sans anomalie signalée.', 'Glycémie fictive relevée à 0,91 g/L.', 'Le prélèvement date du début de la crise.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Examen visuel fictif noté sans écart.', 'La lumière directe est difficilement tolérée.', 'La douleur reste localisée au même côté.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-2 : gêne visuelle brève devant l’ordinateur.', 'J-1 : douleur rythmée devenue plus marquée.', 'Aujourd’hui : le calme réduit la gêne ressentie.'] },
  },
  gastroenteritis: {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif GE-219 ouvert le 21 octobre.', 'Crampes abdominales intermittentes depuis ce matin.', 'Un repas partagé a précédé le début des signes.', 'Les selles ont changé d’aspect avant la consultation.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,6 °C.', 'La bouche paraît sèche dans la note d’accueil.', 'Les boissons sont mal tolérées depuis midi.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Ionogramme fictif : sodium à 137 mmol/L.', 'Créatinine fictive relevée à 78 µmol/L.', 'Prélèvement réalisé après plusieurs selles liquides.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Abdomen souple entre les épisodes de crampe.', 'Les bruits digestifs sont décrits comme présents.', 'Aucune douleur localisée n’est notée au repos.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Samedi : repas commun lors d’un anniversaire.', 'Ce matin : selles devenues plus fréquentes.', 'Aujourd’hui : les crampes suivent les prises de boisson.'] },
  },
  'urinary-infection': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif UI-233 ouvert le 13 octobre.', 'Gêne basse décrite depuis deux nuits.', 'Les passages aux toilettes sont rapprochés.', 'La sensation apparaît surtout à la fin de chaque miction.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,7 °C.', 'La personne reste confortable en position assise.', 'Aucune douleur lombaire n’est déclarée ce jour.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Bandelette fictive : leucocytes notés ++.', 'Nitrites fictifs relevés positifs sur l’échantillon.', 'Prélèvement recueilli avant la consultation.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Sensibilité sus-pubienne légère mentionnée.', 'Les fosses lombaires ne sont pas sensibles.', 'L’examen reste limité au scénario éducatif.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-2 : gêne apparue lors des premières mictions.', 'J-1 : réveils nocturnes plus nombreux rapportés.', 'Aujourd’hui : sensation de brûlure plus nette.'] },
  },
  sinusitis: {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif SN-246 ouvert le 15 octobre.', 'Pression des pommettes décrite depuis quatre jours.', 'Un rhume a commencé la semaine précédente.', 'Les sécrétions nasales sont devenues plus épaisses.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,4 °C.', 'Le nez reste bouché malgré le repos.', 'Se pencher rend la pression plus sensible.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['CRP fictive mesurée à 9 mg/L.', 'Leucocytes fictifs relevés à 8,6 G/L.', 'Échantillon étiqueté SN-246 le 15 octobre.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Cavités faciales sensibles à la pression.', 'Sécrétions épaisses visibles dans la narration.', 'La gorge ne présente pas de signe remarquable.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-7 : début d’un nez qui coule abondamment.', 'J-3 : pression du visage devenue plus présente.', 'Aujourd’hui : douleur accentuée au penchement.'] },
  },
  reflux: {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif RG-258 ouvert le 11 octobre.', 'Brûlure derrière le sternum après le dîner.', 'Une soirée tardive a précédé l’épisode récent.', 'Un goût acide persiste parfois au moment du coucher.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,7 °C.', 'La gêne augmente lorsque la personne s’allonge.', 'Aucun essoufflement n’est rapporté à l’accueil.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Bilan fictif standard sans écart signalé.', 'Hémoglobine fictive relevée à 13,4 g/dL.', 'Le prélèvement ne cible pas la sensation décrite.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Auscultation fictive sans note particulière.', 'La douleur est décrite comme ascendante.', 'La palpation abdominale reste souple au scénario.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Mardi soir : repas tardif suivi d’une brûlure.', 'J-1 : goût acide au coucher mentionné.', 'Aujourd’hui : l’inconfort suit surtout les repas.'] },
  },
  'iron-deficiency': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif ID-271 ouvert le 8 octobre.', 'Fatigue installée progressivement depuis la rentrée.', 'Les escaliers demandent davantage de pauses.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,6 °C.', 'Fréquence cardiaque fictive relevée à 96 par minute.', 'Teint plus pâle observé sous lumière naturelle.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Hémoglobine fictive mesurée à 10,4 g/dL.', 'Ferritine fictive relevée à 9 µg/L.', 'Prélèvement daté du 8 octobre au matin.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Pâleur conjonctivale discrète consignée.', 'Les jambes ne présentent pas de gonflement.', 'La marche reste possible mais moins endurante.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Il y a un mois : fatigue après les cours.', 'J-5 : souffle court dans un escalier habituel.', 'Aujourd’hui : repos recherché dès le milieu d’après-midi.'] },
  },
  asthma: {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif AS-284 ouvert le 19 octobre.', 'Toux nocturne signalée lors de deux réveils.', 'Un rangement poussiéreux a précédé les symptômes.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Saturation fictive relevée à 96 %.', 'Température fictive stable à 36,8 °C.', 'L’expiration est parfois accompagnée d’un sifflement.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Éosinophiles fictifs relevés à 0,52 G/L.', 'CRP fictive basse à 3 mg/L.', 'Prélèvement étiqueté AS-284 après une nuit agitée.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Sifflement expiratoire intermittent entendu au scénario.', 'La parole reste possible en phrases complètes.', 'Aucun tirage n’est décrit dans ce compte rendu.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-3 : rangement d’une cave poussiéreuse.', 'J-2 : toux sèche apparue après le coucher.', 'Aujourd’hui : oppression variable selon l’effort.'] },
  },
  'hypothyroid-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif HT-296 ouvert le 14 octobre.', 'Frilosité inhabituelle évoquée au bureau.', 'Ralentissement ressenti depuis environ un mois.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,5 °C.', 'Pouls fictif relevé à 58 par minute.', 'La peau des mains paraît sèche dans la note.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['TSH fictive relevée à 7,1 mUI/L.', 'T4 libre fictive mesurée à 10 pmol/L.', 'Prélèvement réalisé avant le travail du matin.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Voix plus lente décrite durant l’entretien.', 'Peau sèche observée sur les avant-bras.', 'Aucun tremblement n’est consigné au scénario.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Il y a quatre semaines : besoin accru de couverture.', 'J-10 : lenteur remarquée pour les tâches courantes.', 'Aujourd’hui : fatigue malgré une nuit complète.'] },
  },
  'covid-like-illness': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif RV-309 ouvert le 20 octobre.', 'Un contact familial malade est rapporté dimanche.', 'Les odeurs semblent moins présentes depuis hier.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 38,1 °C.', 'Saturation fictive stable à 97 %.', 'La toux sèche apparaît surtout en parlant.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Test antigénique fictif noté positif.', 'CRP fictive mesurée à 18 mg/L.', 'Échantillon prélevé le 20 octobre à 08 h 45.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Auscultation sans foyer décrit au scénario.', 'Muqueuses nasales légèrement irritées mentionnées.', 'La voix reste normale malgré la toux.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Dimanche : repas auprès d’un proche fébrile.', 'J-2 : fatigue et gêne olfactive sont apparues.', 'Aujourd’hui : fièvre mesurée en fin de journée.'] },
  },
  'appendicitis-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif AP-322 ouvert le 22 octobre.', 'Inconfort initial autour du nombril rapporté.', 'La marche est devenue pénible dans la journée.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 38,0 °C.', 'Pouls fictif relevé à 102 par minute.', 'L’appétit est absent depuis le matin.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Leucocytes fictifs relevés à 12,8 G/L.', 'CRP fictive mesurée à 31 mg/L.', 'Prélèvement réalisé après migration de la douleur.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Douleur localisée à droite dans le compte rendu.', 'La toux accentue la gêne abdominale décrite.', 'Aucune conclusion n’est inscrite dans l’examen.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Ce matin : inconfort vague près du nombril.', 'Midi : douleur ressentie plus bas à droite.', 'Aujourd’hui : chaque déplacement augmente la gêne.'] },
  },
  'kidney-stone-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif KN-335 ouvert le 16 octobre.', 'Douleur lombaire par vagues depuis l’aube.', 'La gêne descend parfois vers l’aine.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,1 °C.', 'Pouls fictif variable entre 88 et 104 par minute.', 'La personne change souvent de position au fauteuil.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Hématies fictives notées ++ dans les urines.', 'Leucocytes fictifs absents sur la bandelette.', 'Prélèvement recueilli lors d’un pic douloureux.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Sensibilité lombaire droite décrite au scénario.', 'Échographie fictive sans conclusion rédigée.', 'L’abdomen reste souple entre les vagues.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['05 h 30 : premier réveil par une douleur intense.', 'J-1 : urine rosée remarquée une seule fois.', 'Aujourd’hui : vagues douloureuses espacées mais répétées.'] },
  },
  'lyme-like-illness': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif PT-348 ouvert le 12 octobre.', 'Sortie en sous-bois signalée quinze jours auparavant.', 'Une plaque rouge s’est élargie progressivement.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,9 °C.', 'La fatigue survient même après une nuit longue.', 'Douleurs articulaires diffuses citées à l’entretien.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Sérologie fictive notée en attente.', 'CRP fictive mesurée à 11 mg/L.', 'Prélèvement daté du 12 octobre, code PT-348.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Plaque cutanée fictive mesurée à 8 cm.', 'Le centre de la plaque paraît plus clair.', 'Aucune autre lésion n’est décrite dans la note.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-15 : promenade longue hors des sentiers.', 'J-6 : marque rouge remarquée sur la cuisse.', 'Aujourd’hui : fatigue et articulations douloureuses dominent.'] },
  },
  'endometriosis-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif CP-361 ouvert le 18 octobre.', 'Douleurs pelviennes revenues avant les règles.', 'Un carnet mensuel est apporté à la visite.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,7 °C.', 'Pouls fictif relevé à 84 par minute.', 'La fatigue accompagne les jours les plus douloureux.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['NFS fictive sans urgence signalée.', 'CRP fictive mesurée à 5 mg/L.', 'Échantillon daté du premier jour de gêne accrue.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Échographie antérieure fictive non concluante.', 'Sensibilité pelvienne notée dans le scénario.', 'Aucun signe urinaire n’est associé au récit.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Mois dernier : épisode semblable inscrit au carnet.', 'J-2 : douleur devenue plus présente avant les règles.', 'Aujourd’hui : la position assise prolongée est difficile.'] },
  },
  shingles: {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif ZN-374 ouvert le 10 octobre.', 'Brûlure localisée sur un seul côté du thorax.', 'Le contact du tissu est devenu douloureux.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,2 °C.', 'La douleur est décrite comme superficielle et vive.', 'Le sommeil a été interrompu par la gêne.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Aucun prélèvement n’est demandé dans ce scénario.', 'Glycémie fictive relevée à 0,96 g/L.', 'Le dossier mentionne une éruption récente et localisée.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Vésicules unilatérales décrites sur le thorax.', 'La ligne médiane n’est pas franchie dans la note.', 'La peau voisine paraît intacte au scénario.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-3 : sensation de brûlure sans marque visible.', 'J-1 : petites lésions apparues au même endroit.', 'Aujourd’hui : le frottement des vêtements est pénible.'] },
  },
  'pneumonia-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif PR-387 ouvert le 23 octobre.', 'Frissons présents depuis le début de semaine.', 'Le souffle manque dans les escaliers habituels.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 38,5 °C.', 'Saturation fictive relevée à 94 %.', 'Fréquence respiratoire fictive à 22 par minute.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['CRP fictive mesurée à 68 mg/L.', 'Leucocytes fictifs relevés à 13,2 G/L.', 'Prélèvement daté du 23 octobre au matin.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Radio fictive : opacité basale décrite.', 'Crépitants localisés notés à l’auscultation.', 'La toux ramène des sécrétions épaisses.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Lundi : frissons suivis d’une toux productive.', 'J-2 : fatigue notable après quelques marches.', 'Aujourd’hui : essoufflement au moindre étage.'] },
  },
  'heart-failure-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif CF-400 ouvert le 17 octobre.', 'Deux coussins sont utilisés depuis quelques nuits.', 'Les chevilles gonflent davantage le soir.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,9 °C.', 'Saturation fictive relevée à 93 % au repos.', 'Poids fictif augmenté de deux kilos en quatre jours.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['BNP fictif mesuré à 480 pg/mL.', 'Créatinine fictive relevée à 102 µmol/L.', 'Prélèvement étiqueté CF-400 le 17 octobre.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Œdèmes des chevilles consignés bilatéralement.', 'Crépitants discrets basaux notés au scénario.', 'La gêne augmente en position allongée.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-4 : poids augmenté sur le relevé domestique.', 'J-2 : besoin d’ajouter un second coussin.', 'Aujourd’hui : chaussures plus serrées en soirée.'] },
  },
  'diabetes-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif GL-413 ouvert le 7 octobre.', 'La gourde est remplie plusieurs fois par jour.', 'Les réveils nocturnes pour uriner se répètent.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,8 °C.', 'Pouls fictif relevé à 90 par minute.', 'Une soif persistante est signalée à l’accueil.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Glycémie fictive mesurée à 2,10 g/L.', 'Bandelette fictive : glucose noté ++.', 'HbA1c fictive relevée à 8,4 %.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Muqueuses sèches décrites dans la note.', 'La vision paraît floue en fin de journée.', 'Aucune lésion cutanée n’est rapportée ici.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-14 : soif inhabituelle remarquée au travail.', 'J-5 : réveils nocturnes devenus plus fréquents.', 'Aujourd’hui : fatigue malgré des nuits longues.'] },
  },
  'pulmonary-embolism-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif TE-426 ouvert le 24 octobre.', 'Douleur thoracique plus vive à l’inspiration.', 'Un trajet assis prolongé a eu lieu la veille.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,0 °C.', 'Saturation fictive relevée à 92 %.', 'Fréquence cardiaque fictive à 112 par minute.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['D-dimères fictifs relevés à 1 240 ng/mL.', 'Troponine fictive sans élévation signalée.', 'Prélèvement daté du 24 octobre à l’arrivée.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Angioscanner fictif programmé, résultat non joint.', 'Mollet droit décrit comme sensible dans le récit.', 'La douleur augmente lors d’une inspiration profonde.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Veille : plusieurs heures assises sans pause.', 'Ce matin : souffle court apparu brusquement.', 'Aujourd’hui : douleur thoracique lors des respirations.', 'Simulation : ces éléments sont signalés comme prioritaires dans la transmission.'] },
  },
  'meningitis-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif MN-439 ouvert le 25 octobre.', 'Lumière maintenue basse depuis le matin.', 'Le changement d’état a été très rapide.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 39,2 °C.', 'Fréquence cardiaque fictive à 118 par minute.', 'La personne parle peu à cause du mal de tête.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['CRP fictive mesurée à 112 mg/L.', 'Leucocytes fictifs relevés à 16,4 G/L.', 'Prélèvement identifié MN-439 le 25 octobre.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Raideur cervicale consignée dans l’examen.', 'La flexion de la nuque est très limitée.', 'Une forte sensibilité lumineuse est décrite.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['07 h 00 : mal de tête soudain rapporté.', '10 h 00 : nuque devenue difficile à bouger.', 'Aujourd’hui : fièvre élevée et lumière mal tolérée.', 'Simulation : ces éléments sont signalés comme prioritaires dans la transmission.'] },
  },
  'hepatitis-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif HP-452 ouvert le 9 octobre.', 'Urines foncées signalées depuis mardi matin.', 'L’appétit est diminué depuis plusieurs jours.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,3 °C.', 'Pouls fictif relevé à 82 par minute.', 'La fatigue s’accentue après les repas.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Bilirubine fictive mesurée à 48 µmol/L.', 'ALAT fictives relevées à 286 UI/L.', 'Prélèvement daté du 9 octobre, code HP-452.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Sclères légèrement colorées mentionnées dans la note.', 'Abdomen souple avec gêne haute à droite.', 'La peau ne présente pas de lésion décrite.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Mardi : couleur sombre des urines remarquée.', 'J-2 : faim moins présente au déjeuner.', 'Aujourd’hui : proche remarque un regard plus jaune.'] },
  },
  mononucleosis: {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif MO-465 ouvert le 14 octobre.', 'Fatigue persistante depuis environ deux semaines.', 'La gorge douloureuse ne s’améliore pas.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,8 °C.', 'Pouls fictif relevé à 94 par minute.', 'Les repas sont plus lents à cause de la gorge.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Lymphocytes fictifs relevés à 5,2 G/L.', 'CRP fictive mesurée à 19 mg/L.', 'Prélèvement identifié MO-465 le 14 octobre.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Ganglions cervicaux sensibles notés à droite.', 'Gorge rouge avec dépôts blanchâtres décrite.', 'Une fatigue visible est mentionnée dans l’examen.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-14 : fatigue inhabituelle après les cours.', 'J-6 : douleur de gorge devenue continue.', 'Aujourd’hui : ganglions du cou sensibles au toucher.'] },
  },
  'peptic-ulcer-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif UD-478 ouvert le 11 octobre.', 'Brûlure au creux de l’estomac la nuit.', 'Manger calme brièvement la gêne rapportée.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,7 °C.', 'Pouls fictif relevé à 76 par minute.', 'Aucun malaise n’est décrit pendant la visite.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Hémoglobine fictive relevée à 12,6 g/dL.', 'Test fictif de selles sans sang signalé.', 'Prélèvement enregistré le 11 octobre au matin.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Abdomen souple hors épisode douloureux.', 'Sensibilité haute centrale décrite à la palpation.', 'Le compte rendu ne mentionne pas de masse.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-10 : brûlure après un dîner très tardif.', 'J-3 : réveil nocturne répété par la gêne.', 'Aujourd’hui : repas léger suivi d’un soulagement court.'] },
  },
  'panic-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif PN-491 ouvert le 20 octobre.', 'Premier épisode décrit dans une rame de métro.', 'Peur intense qu’un nouvel épisode survienne.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,8 °C.', 'Saturation fictive relevée à 98 %.', 'Le pouls accélère lors du récit de l’épisode.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Glycémie fictive relevée à 0,94 g/L.', 'TSH fictive mesurée à 2,1 mUI/L.', 'Prélèvement réalisé après retour au calme.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['ECG fictif : rythme sinusal noté.', 'Auscultation fictive sans anomalie décrite.', 'Les mains tremblent brièvement durant l’entretien.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-5 : cœur emballé dans le métro bondé.', 'J-2 : évitement du même trajet rapporté.', 'Aujourd’hui : crainte avant de quitter le domicile.'] },
  },
  'rheumatoid-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif RA-504 ouvert le 16 octobre.', 'Les doigts sont raides au réveil prolongé.', 'Une bague est difficile à retirer certains jours.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,9 °C.', 'Pouls fictif relevé à 80 par minute.', 'Les mains paraissent plus gonflées au matin.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['CRP fictive mesurée à 22 mg/L.', 'VS fictive relevée à 34 mm à la première heure.', 'Prélèvement identifié RA-504 le 16 octobre.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Articulations des doigts gonflées par moments.', 'Raideur symétrique des poignets décrite.', 'La fermeture d’un bocal est devenue difficile.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-21 : doigts raides chaque matin au lever.', 'J-7 : gonflement visible autour des articulations.', 'Aujourd’hui : déverrouillage matinal dure plus d’une heure.'] },
  },
  'multiple-sclerosis-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif NF-517 ouvert le 13 octobre.', 'Vision trouble d’un œil améliorée en deux jours.', 'Des fourmillements changent parfois de côté.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,7 °C.', 'Pouls fictif relevé à 72 par minute.', 'La fatigue apparaît disproportionnée après un effort.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Bilan fictif standard sans anomalie rapportée.', 'Vitamine B12 fictive relevée à 340 pg/mL.', 'Prélèvement daté du 13 octobre au repos.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['IRM ancienne fictive avec note non spécifique.', 'Sensibilité diminuée par zones dans le scénario.', 'La marche reste stable durant l’examen décrit.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-12 : vue brouillée au réveil sur un œil.', 'J-7 : amélioration progressive de la vision.', 'Aujourd’hui : fourmillement intermittent dans une jambe.'] },
  },
  'sleep-apnea-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif SP-530 ouvert le 18 octobre.', 'Ronflements enregistrés par un proche la nuit.', 'Somnolence importante après le déjeuner rapportée.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,6 °C.', 'Tension fictive relevée à 142/88 mmHg.', 'La personne décrit un réveil non réparateur.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Oxymétrie nocturne fictive : creux répétés.', 'Hématocrite fictif relevé à 48 %.', 'Enregistrement effectué durant une nuit ordinaire.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Examen ORL fictif sans conclusion jointe.', 'Périmètre cervical relevé à 42 cm dans la note.', 'Le proche décrit des pauses respiratoires nocturnes.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-30 : somnolence en réunion de l’après-midi.', 'J-10 : proche note des pauses durant le sommeil.', 'Aujourd’hui : réveil avec sensation de sommeil incomplet.'] },
  },
  'inflammatory-bowel-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif ID-543 ouvert le 15 octobre.', 'Selles fréquentes depuis environ trois semaines.', 'Le poids semble diminuer sans intention déclarée.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 37,5 °C.', 'Pouls fictif relevé à 92 par minute.', 'La douleur abdominale revient avant les selles.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Calprotectine fictive mesurée à 310 µg/g.', 'CRP fictive relevée à 26 mg/L.', 'Hémoglobine fictive mesurée à 11,8 g/dL.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Abdomen sensible sans défense décrite.', 'La fosse iliaque droite est légèrement sensible.', 'Aucune masse n’est notée dans ce scénario.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-21 : fréquence des selles devenue inhabituelle.', 'J-8 : fatigue et perte d’appétit rapportées.', 'Aujourd’hui : crampes précédant chaque passage.'] },
  },
  'anemia-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif AN-556 ouvert le 8 octobre.', 'Fatigue qui limite les activités habituelles.', 'Palpitations ressenties dans les escaliers.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive stable à 36,6 °C.', 'Pouls fictif relevé à 104 par minute.', 'Pâleur des lèvres observée à l’accueil.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Hémoglobine fictive mesurée à 9,8 g/dL.', 'VGM fictif relevé à 74 fL.', 'Réticulocytes fictifs mesurés à 46 G/L.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Pâleur labiale observée dans la note.', 'Le souffle est court après une marche rapide.', 'Aucun gonflement des jambes n’est décrit.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['J-30 : fatigue inhabituelle après les journées longues.', 'J-9 : cœur perçu comme plus rapide à l’effort.', 'Aujourd’hui : pause nécessaire dans un seul escalier.'] },
  },
  'sepsis-alert-pattern': {
    'nursing-document-2': { title: 'Dossier de visite', facts: ['Dossier fictif SA-569 ouvert le 26 octobre.', 'L’entourage rapporte une confusion apparue ce matin.', 'Frissons intenses présents depuis la nuit dernière.'] },
    'nursing-document-4': { title: 'Constantes de visite', facts: ['Température fictive relevée à 39,4 °C.', 'Fréquence respiratoire fictive à 26 par minute.', 'Pression fictive relevée à 92/58 mmHg.'] },
    'nursing-document-6': { title: 'Compte rendu biologique', facts: ['Lactates fictifs mesurés à 3,4 mmol/L.', 'Leucocytes fictifs relevés à 18,7 G/L.', 'CRP fictive mesurée à 164 mg/L.'] },
    'nursing-document-8': { title: 'Compte rendu d’examen', facts: ['Peau marbrée décrite aux extrémités.', 'Temps de recoloration noté à quatre secondes.', 'La personne répond lentement aux questions simples.'] },
    'nursing-document-10': { title: 'Historique des transmissions', facts: ['Cette nuit : frissons très intenses signalés.', '07 h 30 : propos devenus incohérents pour l’entourage.', 'Aujourd’hui : respiration plus rapide que d’habitude.', 'Simulation : ces éléments sont signalés comme prioritaires dans la transmission.'] },
  },
});

export function getNursingDossier(id) {
  return NURSING_DOSSIERS[id] || null;
}

export function assertNursingDossierCatalog() {
  const ids = Object.keys(NURSING_DISEASES);
  const definitions = new Map(NURSING_DOCUMENT_DEFINITIONS.map(([id, _unlock, label]) => [id, label]));
  if (ids.length !== Object.keys(NURSING_DOSSIERS).length || ids.some((id) => !NURSING_DOSSIERS[id])) throw new Error('Nursing dossier coverage mismatch.');
  for (const id of ids) {
    const dossier = NURSING_DOSSIERS[id];
    const documentIds = Object.keys(dossier).sort();
    if (documentIds.length !== definitions.size || documentIds.some((documentId) => !definitions.has(documentId))) throw new Error(`Nursing dossier document IDs mismatch: ${id}`);
    for (const [documentId, label] of definitions) {
      const document = dossier[documentId];
      if (!document || document.title !== label) throw new Error(`Nursing dossier label mismatch: ${id}/${documentId}`);
      if (!Array.isArray(document.facts) || document.facts.length < 3 || document.facts.length > 6) throw new Error(`Nursing dossier fact count mismatch: ${id}/${documentId}`);
      const facts = document.facts.map((fact) => typeof fact === 'string' ? fact.trim() : '');
      if (facts.some((fact) => !fact) || new Set(facts).size !== facts.length) throw new Error(`Nursing dossier facts must be unique non-empty strings: ${id}/${documentId}`);
      if (facts.join(' ').toLocaleLowerCase('fr-FR').includes(NURSING_DISEASES[id].name.toLocaleLowerCase('fr-FR'))) throw new Error(`Nursing dossier reveals target disease: ${id}/${documentId}`);
    }
  }
}

assertNursingDossierCatalog();
