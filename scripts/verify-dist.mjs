import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const indexHtml = await readFile(new URL('index.html', distDir), 'utf8');
const assetPaths = [...indexHtml.matchAll(/\/game\/(assets\/[^"']+)/g)].map((match) => match[1]);

if (!assetPaths.length) throw new Error('The production index does not reference any built assets.');

const obsoleteNursingCopy = [
  'Support fictif de simulation',
  'Température fictive',
  'Saturation fictive',
  'Fréquence respiratoire fictive',
];

for (const assetPath of assetPaths) {
  const asset = await readFile(join(distDir.pathname, assetPath), 'utf8');
  const obsolete = obsoleteNursingCopy.find((copy) => asset.includes(copy));
  if (obsolete) throw new Error(`Obsolete Nursing document copy found in ${assetPath}: ${obsolete}`);
}

console.log(`Verified ${assetPaths.length} production asset(s): Nursing document copy is current.`);
