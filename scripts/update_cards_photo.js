import fs from 'fs';

const filePath = 'c:/Users/windos 10/Desktop/med-game/src/data/cards.js';
let content = fs.readFileSync(filePath, 'utf8');

const photoData = {
    rhume: "Red nose, slight fatigue, watery eyes, using a tissue.",
    grippe: "Sweating, feverish flush, very tired expression, wearing warm clothes.",
    allergie_saisonniere: "Red watery eyes, swollen eyelids, clear nasal discharge, slight nasal redness.",
    migraine: "Squinting, rubbing temples, pained expression, avoiding bright light, pale skin.",
    gastro_enterite: "Very pale, clutching stomach, sweating, exhausted appearance.",
    hypertension: "Slightly flushed face, tense posture, generally normal appearance.",
    diabete_type2: "Normal appearance, perhaps slightly overweight, looking a bit tired.",
    asthme: "Breathing through mouth, looking anxious, slightly pale, hand near chest.",
    angine: "Holding throat, pained expression when swallowing, somewhat swollen neck area.",
    otite: "Holding one ear, pained grimace, slightly tilted head.",
    depression: "Flat affect, unkempt appearance, dark circles under eyes, slumped sad posture.",
    anxiete: "Tense posture, biting lip, wide eyes, restless hands, looking worried.",
    lombalgie: "Holding lower back, stiff posture, grimacing as if in pain when sitting.",
    arthrite: "Subtly swollen or red knuckles, stiff hand posture resting on lap.",
    dermatite: "Red, scaly skin patches or eczema visible on arms or face, scratching slightly.",
    pneumonie: "Pale, sweating, looking very ill, breathing heavily.",
    thyroide: "Either slightly bulging eyes (hyper) or puffy face with dry skin (hypo), tired but anxious look.",
    insuffisance_cardiaque: "Shortness of breath, pale, slightly bluish lips (cyanosis), puffy legs if visible.",
    anemie: "Very pale skin, pale lips and conjunctiva, looking exhausted and weak.",
    ist: "Normal physical appearance, looking slightly anxious or embarrassed.",
    embolie_pulmonaire: "Gasping for air, holding chest, extremely anxious, sweaty, pale.",
    avc: "Subtle facial droop on one side of the mouth, asymmetrical expression.",
    meningite: "Extremely ill, stiff neck, avoiding light, possible small red spots (purpura) on skin.",
    pancreatite: "Severe abdominal pain posture, curled up, pale, sweating profusely.",
    lupus: "Distinct reddish butterfly rash (malar rash) across cheeks and nose, tired.",
    sclerose_en_plaques: "Normal facial appearance, maybe a slight asymmetrical weakness or a cane nearby.",
    maladie_de_crohn: "Looking thin, pale, holding abdomen, exhausted appearance.",
    endocardite: "Pale, feverish looking, maybe small red spots on fingers (splinter hemorrhages).",
    burn_out: "Deeply exhausted, dark circles under eyes, disheveled, stressed expression.",
    endometriose: "Pained expression, holding lower abdomen, curled posture.",
    calculs_renaux: "Agonizing flank pain, twisting in pain, sweating, unable to sit still.",
    zona: "Subtle red blistering rash on one side of the face or neck.",
    anaphylaxie: "Swollen lips and face (angioedema), visible hives on skin, looking panicked."
};

Object.keys(photoData).forEach(cardId => {
    const signs = photoData[cardId];
    // Match the card block and append physicalSigns before the closing brace
    const regex = new RegExp(`(id:\\s*'${cardId}'.*?)(\\n    },)`, 's');
    content = content.replace(regex, `$1,\n        physicalSigns: "${signs}"$2`);
});

fs.writeFileSync(filePath, content);
console.log('Cards updated with physicalSigns for DALL-E photos.');
