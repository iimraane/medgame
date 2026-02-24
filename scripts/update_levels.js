import fs from 'fs';

let content = fs.readFileSync('c:/Users/windos 10/Desktop/med-game/src/data/levels.js', 'utf8');

const levelPerkMap = {
    1: 'null',
    2: "'fichePatient'",
    3: 'null',
    4: "'reponsesRapides'",
    5: 'null',
    6: "'analysesLaboratoire'",
    7: 'null',
    8: "'imagerieMedicale'",
    9: 'null',
    10: "'pauseCafe'",
    11: 'null',
    12: "'antecedents'",
    13: 'null',
    14: "'indiceDiagnostic'",
    15: 'null',
    16: "'avisConfrere'",
    17: 'null',
    18: "'soutienPsy'",
    19: 'null',
    20: "'avisSpecialiste'",
};

// Also increase vagueness by bumping modifier count by 1 at each level bracket to make it harder
let lines = content.split('\n');
let currentLevel = null;

for (let i = 0; i < lines.length; i++) {
    const levelMatch = lines[i].match(/id:\s*(\d+),/);
    if (levelMatch) {
        currentLevel = parseInt(levelMatch[1]);
    }

    if (currentLevel && lines[i].includes('unlockPerk:')) {
        lines[i] = lines[i].replace(/unlockPerk:\s*.*?(\s*,)/, `unlockPerk: ${levelPerkMap[currentLevel]}$1`);
    }

    if (currentLevel && lines[i].includes('modifierCount:')) {
        let countMatch = lines[i].match(/modifierCount:\s*(\d+)/);
        if (countMatch) {
            let num = parseInt(countMatch[1]) + 1; // Increase difficulty
            lines[i] = lines[i].replace(/modifierCount:\s*\d+/, `modifierCount: ${num}`);
        }
    }
}

fs.writeFileSync('c:/Users/windos 10/Desktop/med-game/src/data/levels.js', lines.join('\n'));
console.log('Levels updated successfully.');
