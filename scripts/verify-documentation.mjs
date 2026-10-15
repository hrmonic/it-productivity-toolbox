import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';

const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
assert.equal(
  digest(await readFile('docs/assets/toolbox-hero.svg')).toUpperCase(),
  'F8E05C86AA21583E0559691D4258F75AC54822C9C3E496BBFDD34AF24F71C1B7',
  'The original hero must remain unchanged.',
);
for (const name of ['README.md', 'README.fr.md']) {
  const text = await readFile(name, 'utf8');
  assert(
    text.trimStart().startsWith('![IT Productivity Toolbox](docs/assets/toolbox-hero.svg)'),
    'The official banner must be the first visual.',
  );
  assert(
    text.includes('mailto:dev@hrmonic.fr') &&
      text.includes('Réda Touzani') &&
      text.includes('LICENSE'),
    'Official attribution must remain.',
  );
  for (const match of text.matchAll(/(?:\]\(([^)]+)\)|src="([^"]+)")/g)) {
    const target = match[1] ?? match[2];
    if (target.startsWith('#') || /^[a-z]+:/i.test(target)) continue;
    await access(path.resolve(path.dirname(name), decodeURI(target.split('#')[0])));
  }
}
const manifest = JSON.parse(await readFile('docs/assets/screenshots/manifest.json', 'utf8'));
assert.equal(manifest.deviceScaleFactor, 1);
assert.equal(manifest.fullPage, false);
assert.equal(manifest.buildHash, digest(await readFile('dist/index.html')));
for (const item of manifest.captures) {
  const bytes = await readFile(`docs/assets/screenshots/${item.file}`);
  assert.equal(bytes.readUInt32BE(16), item.width);
  assert.equal(bytes.readUInt32BE(20), item.height);
  assert.equal(digest(bytes), item.sha256);
}
const examples = JSON.parse(await readFile('docs/examples/manifest.json', 'utf8'));
for (const item of examples)
  assert.equal(digest(await readFile(`docs/examples/${item.file}`)), item.sha256);
const office = JSON.parse(await readFile('docs/evidence/powerpoint-validation.json', 'utf8'));
for (const item of office.results) {
  assert.equal(
    digest(await readFile(`docs/examples/fictional-${item.file}`)).toUpperCase(),
    item.inputSha256,
  );
  assert.equal(item.overflow.length, 0);
  assert.equal(item.outOfSlide.length, 0);
}
console.log(
  `Official hero, bilingual README links, attribution and ${manifest.captures.length} viewport image dimensions/hashes verified.`,
);
