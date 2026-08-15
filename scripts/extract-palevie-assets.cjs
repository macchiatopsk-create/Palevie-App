const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const archivePath = path.join(root, 'public', 'palevie-v4-assets.tar.gz');
const outputDir = path.join(root, 'public', 'palevie-v4');
const marker = path.join(outputDir, '.asset-version');
const version = 'palevie-v4-mockup-2026-08-15';

if (!fs.existsSync(archivePath)) {
  throw new Error(`Missing Palevie asset archive: ${archivePath}`);
}
if (fs.existsSync(marker) && fs.readFileSync(marker, 'utf8') === version) {
  process.exit(0);
}

fs.mkdirSync(outputDir, { recursive: true });
const tar = zlib.gunzipSync(fs.readFileSync(archivePath));
let offset = 0;
let extracted = 0;

while (offset + 512 <= tar.length) {
  const header = tar.subarray(offset, offset + 512);
  if (header.every((byte) => byte === 0)) break;
  const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
  const sizeText = header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim();
  const size = Number.parseInt(sizeText || '0', 8);
  const type = String.fromCharCode(header[156] || 48);
  offset += 512;

  if (name && (type === '0' || type === '\0')) {
    const safeName = path.basename(name);
    if (safeName !== name || !safeName.endsWith('.webp')) {
      throw new Error(`Unsafe or unexpected asset entry: ${name}`);
    }
    fs.writeFileSync(path.join(outputDir, safeName), tar.subarray(offset, offset + size));
    extracted += 1;
  }
  offset += Math.ceil(size / 512) * 512;
}

if (extracted < 16) throw new Error(`Expected at least 16 Palevie assets, extracted ${extracted}`);
fs.writeFileSync(marker, version);
console.log(`Extracted ${extracted} Palevie visual assets.`);
