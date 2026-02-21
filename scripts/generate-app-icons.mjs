import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const OUTPUTS = [
  { size: 512, path: 'public/icons/icon-512.png', type: 'any', variant: 'wordmark' },
  { size: 192, path: 'public/icons/icon-192.png', type: 'any', variant: 'monogram' },
  { size: 180, path: 'public/icons/apple-touch-icon.png', type: 'any', variant: 'monogram' },
  { size: 512, path: 'public/icons/icon-512-maskable.png', type: 'maskable', variant: 'wordmark' },
  { size: 192, path: 'public/icons/icon-192-maskable.png', type: 'maskable', variant: 'monogram' },
];

function iconSvg(size, type, variant) {
  const isMaskable = type === 'maskable';
  const isWordmark = variant === 'wordmark';
  const monogramSize = Math.round(size * (isMaskable ? 0.56 : 0.52));
  const wordmarkMainSize = Math.round(size * 0.196);
  const wordmarkSubSize = Math.round(size * 0.052);
  const wordmarkMainY = Math.round(size * 0.492);
  const wordmarkSubY = Math.round(size * 0.604);

  const glyph = isWordmark
    ? `
  <text
    x="50%"
    y="${wordmarkMainY}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Geist, Inter, Helvetica Neue, Arial, sans-serif"
    font-size="${wordmarkMainSize}"
    letter-spacing="-0.02em"
    font-weight="900"
    fill="#111111"
  >tulis</text>
  <text
    x="50%"
    y="${wordmarkSubY}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Geist Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    font-size="${wordmarkSubSize}"
    letter-spacing="0.24em"
    font-weight="500"
    fill="rgba(0,0,0,0.48)"
  >BY YUN</text>`
    : `
  <text
    x="50%"
    y="51%"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Geist, Inter, Helvetica Neue, Arial, sans-serif"
    font-size="${monogramSize}"
    font-weight="600"
    fill="#FFFFFF"
  >t</text>`;

  const background = isWordmark
    ? '<rect x="0" y="0" width="' + size + '" height="' + size + '" fill="#FFFFFF"/>'
    : `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5751E6" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#bg)"/>`;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="tulis icon">
  ${background}
  ${glyph}
</svg>`;
}

for (const output of OUTPUTS) {
  const svg = iconSvg(output.size, output.type, output.variant);
  const png = await sharp(Buffer.from(svg), { density: 384 })
    .resize(output.size, output.size)
    .png()
    .toBuffer();
  await writeFile(output.path, png);
}

console.log('Generated icons:', OUTPUTS.map((output) => output.path).join(', '));
