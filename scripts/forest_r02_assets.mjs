/** R02 artwork delivery: format/size conversion only, never redraws or crops. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../storybook/assets/entrance/r02/', import.meta.url));
const definitions = [
  { name: 'entrance-desktop', width: 1536, quality: 88 },
  { name: 'entrance-mobile', width: 1024, quality: 88 },
  { name: 'paperkeeper.three-quarter', height: 960, quality: 92 },
];
const checkOnly = process.argv.includes('--check');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

async function describe(relativePath) {
  const filename = path.join(root, relativePath);
  const bytes = await readFile(filename);
  const { width, height, hasAlpha } = await sharp(bytes).metadata();
  const description = { path: relativePath, sha256: sha256(bytes), bytes: bytes.length, width, height, hasAlpha };
  if (hasAlpha) {
    const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left = width, top = height, right = 0, bottom = 0, alphaMin = 255, alphaMax = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * info.channels + 3];
      alphaMin = Math.min(alphaMin, alpha);
      alphaMax = Math.max(alphaMax, alpha);
      if (alpha > 32) {
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
    }
    assert.equal(alphaMin, 0, 'Character must include fully transparent space');
    assert.equal(alphaMax, 255, 'Character must include opaque pencil marks');
    description.alpha = { min: alphaMin, max: alphaMax, threshold: 32, bounds: { left, top, right, bottom }, footBaseline: Number((bottom / height).toFixed(5)) };
  }
  return description;
}

if (checkOnly) {
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  for (const asset of manifest.assets) {
    for (const key of ['source', 'export']) assert.deepEqual(await describe(asset[key].path), asset[key], asset[key].path + ' must match recorded source/export');
    const image = asset.export;
    assert.ok(image.bytes < 700_000, image.path + ' individual transfer budget');
    if (asset.name === 'paperkeeper.three-quarter') assert.ok(image.hasAlpha, 'Independent transparent character');
    else assert.equal(image.width / image.height, asset.name === 'entrance-mobile' ? 1 : 1.5, 'Full composition, no crop');
  }
  assert.notEqual(manifest.assets[0].source.sha256, manifest.assets[1].source.sha256, 'Mobile must be independently authored');
  for (const environment of manifest.assets.slice(0, 2)) {
    assert.ok(environment.export.bytes + manifest.assets[2].export.bytes < 850_000, 'Hero image transfer budget');
  }
  console.log('PASS R02: source/export hashes, dimensions, transparent character, independent compositions and transfer budgets.');
} else {
  await mkdir(path.join(root, 'exports'), { recursive: true });
  const assets = [];
  for (const definition of definitions) {
    const source = 'source/' + definition.name + '.png';
    const output = 'exports/' + definition.name + '.webp';
    await stat(path.join(root, source));
    const resize = definition.width ? { width: definition.width } : { height: definition.height };
    await sharp(path.join(root, source)).resize({ ...resize, withoutEnlargement: true }).webp({ quality: definition.quality, alphaQuality: 100, effort: 6 }).toFile(path.join(root, output));
    assets.push({ name: definition.name, conversion: { ...resize, quality: definition.quality, alphaQuality: 100, crop: false }, source: await describe(source), export: await describe(output) });
  }
  const manifest = {
    revision: 'R02', authored: '2026-11-16',
    provenance: 'sources.json', generator: 'scripts/forest_r02_assets.mjs',
    converter: { sharp: sharp.versions.sharp, webp: sharp.versions.webp },
    registration: { sceneGroundY: 0.865, footBaseline: 'Measured from exported alpha; see character entry.', light: 'upper left', layers: ['environment', 'CSS contact shadow', 'transparent Paperkeeper'] },
    assets,
  };
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(assets.map(a => `${a.name}: ${a.export.width}×${a.export.height}, ${a.export.bytes} bytes`).join('\n'));
}
