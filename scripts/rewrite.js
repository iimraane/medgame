import fs from 'fs';

let content = fs.readFileSync('c:/Users/windos 10/Desktop/med-game/src/data/modifiers.js', 'utf8');

const replacements = [
    [/(prompt:\s*')Tu es (.*?)/g, "$1Le patient est $2"],
    [/(prompt:\s*')Tu (.*?) et tu (.*?)/g, "$1Le patient $2 et il $3"],
    [/(prompt:\s*')Tu (.*?)/g, "$1Le patient $2"],
    [/tu /g, "il "],
    [/te /g, "le "],
    [/ta /g, "sa "],
    [/tes /g, "ses "],
    [/ton /g, "son "],
    [/Tu /g, "Il "],
    [/Te /g, "Le "]
];

let modified = content;
replacements.forEach(([regex, repl]) => {
    modified = modified.replace(regex, repl);
});

// Fix some weird wording introduced by simple regex
modified = modified.replace(/Le patient es /g, 'Le patient est ');
modified = modified.replace(/il rougis/g, 'il rougit');
modified = modified.replace(/il evites/g, 'il évite');
modified = modified.replace(/il digressent/g, 'il digresse');
modified = modified.replace(/il racontes/g, 'il raconte');
modified = modified.replace(/il fais/g, 'il fait');
modified = modified.replace(/il minimises/g, 'il minimise');
modified = modified.replace(/il as/g, 'il a');
modified = modified.replace(/il poses/g, 'il pose');
modified = modified.replace(/il questionnes/g, 'il questionne');
modified = modified.replace(/il banalises/g, 'il banalise');
modified = modified.replace(/il exageres/g, 'il exagère');
modified = modified.replace(/il pleures/g, 'il pleure');
modified = modified.replace(/il oublies/g, 'il oublie');
modified = modified.replace(/il changes/g, 'il change');
modified = modified.replace(/il prends/g, 'il prend');
modified = modified.replace(/il sembles/g, 'il semble');
modified = modified.replace(/il regardes/g, 'il regarde');
modified = modified.replace(/il refuses/g, 'il refuse');
modified = modified.replace(/il insistes/g, 'il insiste');
modified = modified.replace(/il acceptes/g, 'il accepte');
modified = modified.replace(/il doutes/g, 'il doute');
modified = modified.replace(/il demandes/g, 'il demande');
modified = modified.replace(/il compares/g, 'il compare');
modified = modified.replace(/il trembles/g, 'il tremble');
modified = modified.replace(/il begaies/g, 'il bégaie');
modified = modified.replace(/il evite/g, 'il évite'); // fixed casing
modified = modified.replace(/il hesites/g, 'il hésite');
modified = modified.replace(/il reponds/g, 'il répond');
modified = modified.replace(/il vouvoies/g, 'il vouvoie');
modified = modified.replace(/il utilises/g, 'il utilise');
modified = modified.replace(/il essaies/g, 'il essaie');
modified = modified.replace(/il contestes/g, 'il conteste');
modified = modified.replace(/il manges/g, 'il mange');
modified = modified.replace(/il dors/g, 'il dort');
modified = modified.replace(/il fumes/g, 'il fume');
modified = modified.replace(/il viens/g, 'il vient');

fs.writeFileSync('c:/Users/windos 10/Desktop/med-game/src/data/modifiers.js', modified);
console.log('Modifiers updated to 3rd person.');
