import fs from 'fs';

let content = fs.readFileSync('c:/Users/windos 10/Desktop/med-game/src/data/cards.js', 'utf8');

const additionalData = {
    rhume: { lab: "CRP normale (<5 mg/L), NFS normale.", radio: "Radio thorax normale. Pas de foyer infectieux." },
    grippe: { lab: "CRP modérément élevée (10-40 mg/L), Leucopénie possible.", radio: "Radio thorax souvent normale. Opacités interstitielles discrètes possibles." },
    allergie_saisonniere: { lab: "Éosinophilie possible (PNE > 500/mm³). CRP normale.", radio: "Radio thorax normale. Scanner sinusien: hypertrophie muqueuse (rarement fait)." },
    migraine: { lab: "Bilan sanguin standard (NFS, CRP, Iono) strictement normal.", radio: "IRM ou Scanner cérébral normal (pas de masse ou saignement)." },
    gastro_enterite: { lab: "Iono: légère hypokaliémie ou hyponatrémie si déshydratation, CRP augmentée si bactérienne.", radio: "ASP (Abdomen Sans Préparation): niveaux hydro-aériques non spécifiques." },
    hypertension: { lab: "Créatinine à surveiller, Kaliémie normale. Bilan lipidique (LDL, HDL) pour RCV.", radio: "Radio thorax: Index cardiothoracique potentiellement augmenté. ECG: Hypertrophie Ventriculaire Gauche (HVG)." },
    diabete_type2: { lab: "Glycémie à jeun > 1.26 g/L. HbA1c > 6.5%.", radio: "Echo-doppler artériel (recherche d'athérome). Bilan visuel et rénal associés." },
    asthme: { lab: "NFS: Éosinophilie inconstante. IgE totales souvent élevées.", radio: "Radio thorax: distension thoracique (hyperclarté, aplatissement des coupoles)." },
    angine: { lab: "TDR Streptocoque positif (si bactérien). NFS: hyperleucocytose à PN Neutrophiles.", radio: "Pas d'indication radiologique." },
    otite: { lab: "CRP modérément élevée. Hyperleucocytose possible.", radio: "Pas de radio recommandée. Diagnostic clinique (tympan congestif/bombant)." },
    depression: { lab: "Bilan thyroïdien (TSH) normal (pour éliminer hypothyroïdie). NFS normale.", radio: "Aucun examen d'imagerie diagnostique." },
    anxiete: { lab: "Bilan thyroïdien (TSH) normal (pour éliminer hyperthyroïdie), ionogramme normal.", radio: "Aucun examen d'imagerie diagnostique." },
    lombalgie: { lab: "NFS et CRP normaux (pas d'infection/inflammation).", radio: "Radio rachis: pincement discal, ostéophytes (arthrose) ou normale si lumbago aigu." },
    arthrite: { lab: "CRP et VS élevées (syndrome inflammatoire). Facteur rhumatoïde / anti-CCP positifs (si Par).", radio: "Radio articulaire: pincement articulaire, érosions osseuses, déminéralisation en bande." },
    dermatite: { lab: "IgE totales souvent élevées, hyperéosinophilie sanguine.", radio: "Pas d'indication radiologique." },
    pneumonie: { lab: "CRP très élevée (>50-100 mg/L), Hyperleucocytose à PNN (>12000/mm³).", radio: "Radio thorax: opacité alvéolaire systématisée avec bronchogramme aérien (condensations)." },
    thyroide: { lab: "TSH < 0.1 mUI/L (hyper) ou > 4.0 mUI/L (hypo). T4L anormale.", radio: "Échographie cervicale: nodule, goitre ou thyroïde hétérogène." },
    insuffisance_cardiaque: { lab: "BNP > 100 pg/mL ou NT-proBNP > 300 pg/mL. Créatinine augmentée.", radio: "Radio thorax: cardiomégalie (ICT > 0.5), œdème pulmonaire (lignes de Kerley)." },
    anemie: { lab: "Hémoglobine < 12 g/dL (femme) ou < 13 g/dL (homme). Ferritine basse si carencée.", radio: "Recherche de saignement (FOGD / Coloscopie) plutôt qu'imagerie classique." },
    ist: { lab: "PCR Chlamydia/Gonocoque positive. Sérologies VIH, Syphilis, VHB/VHC.", radio: "Échographie pelvienne si suspicion de salpingite (trompes épaissies)." },
    embolie_pulmonaire: { lab: "D-dimères > 500 µg/L (sensible mais non spécifique). Gaz du sang: hypoxémie, hypocapnie.", radio: "Angioscanner thoracique: lacune artérielle (caillot dans l'artère pulmonaire)." },
    avc: { lab: "Bilan d'urgence (coagulation, plaquettes, glycémie) pour éliminer CI à la thrombolyse.", radio: "IRM cérébrale (séquence de Diffusion): hypersignal (infarctus) ou Scanner: saignement (si hémorragique)." },
    meningite: { lab: "PL: liquide purulent (si bactérien) avec hyperprotéinorachie, hypoglycorachie. Sang: CRP très haute.", radio: "Scanner cérébral avant PL si signes de localisation (éliminer engagement)." },
    pancreatite: { lab: "Lipasémie > 3x la normale. CRP, Leucocytes, Bilan hépatique perturbés (si lithiase).", radio: "Scanner abdominal injecté (à 72h): coulées de nécrose, œdème pancréatique." },
    lupus: { lab: "Anticorps antinucléaires (AAN) positifs, anti-ADN natif. Cytopénies à la NFS.", radio: "Écho cardiaque: péricardite possible. Radio thorax: épanchement pleural possible." },
    sclerose_en_plaques: { lab: "PL: bandes oligoclonales (inflammation du SNC). Sang: éliminer autres causes autoinmunes.", radio: "IRM cérébrale et médullaire: plaques d'hyper-signal (démyélinisation) dans la substance blanche." },
    maladie_de_crohn: { lab: "Calprotectine fécale élevée. Anémie inflammatoire, CRP augmentée.", radio: "Entéro-IRM: épaississement de la paroi intestinale, sténoses ou fistules." },
    endocardite: { lab: "Hémocultures positives (bactériémie). CRP et VS très élevées.", radio: "Échographie Transoesophagienne (ETO): végétation sur une valve cardiaque." },
    burn_out: { lab: "Bilan sanguin (Cortisol, TSH, NFS) pour éliminer cause organique, souvent normal.", radio: "Aucun examen d'imagerie diagnostique." },
    endometriose: { lab: "Bilan sanguin général souvent normal (CA-125 parfois légèrement augmenté).", radio: "IRM pelvienne: kystes endométriosiques (endométriomes), nodules ou adhérences profondes." },
    calculs_renaux: { lab: "BU: hématurie microscopique. Créatininémie pour éliminer insuffisance rénale aiguë.", radio: "Scanner abdomino-pelvien sans injection: calcul hyperdense dans l'uretère avec dilatation pyélocalicielle en amont." },
    zona: { lab: "Pas de biologie spécifique nécessaire en routine (clinique pure).", radio: "Pas d'imagerie requise." },
    anaphylaxie: { lab: "Tryptase sérique augmentée (dosée en urgence/à distance). Bilan allergo.", radio: "Pas d'imagerie à l'aiguë." },
};

let output = content;

// Use regex to find each card object and append the properties right before its closing brace.
Object.keys(additionalData).forEach(cardId => {
    const data = additionalData[cardId];
    // Regex matches the card block: id: 'rhume' up to the matching }
    const regex = new RegExp(`(id:\\s*'${cardId}'.*?)(\\n    },)`, 's');

    // Add labExams and radioExams inside the block
    output = output.replace(regex, `$1,\n        labExams: "${data.lab}",\n        radioExams: "${data.radio}"$2`);
});

fs.writeFileSync('c:/Users/windos 10/Desktop/med-game/src/data/cards.js', output);
console.log('Cards updated with lab and radio exams.');
