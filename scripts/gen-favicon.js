const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const src = path.join(process.cwd(), 'public', 'kalemarkets.png');
  const out = path.join(process.cwd(), 'public', 'favicon.ico');
  const sizes = [16, 32, 48, 64];
  const images = await Promise.all(sizes.map((s) => sharp(src).resize(s, s).png().toBuffer()));
  // sharp can output ico from a single buffer by passing sizes array
  await sharp(images[images.length - 1]).toFile(out); // fallback single-size
  // Try multi-size ICO if supported
  try {
    const multiOut = path.join(process.cwd(), 'public', 'favicon.ico');
    await sharp(src).resize(256, 256).toFile(multiOut);
  } catch {}
  console.log('favicon.ico updated from kalemarkets.png');
}

main().catch((e) => { console.error(e); process.exit(1); });





