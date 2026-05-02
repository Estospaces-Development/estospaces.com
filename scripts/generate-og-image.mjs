import sharp from 'sharp';

const output = 'public/assets/estospaces-og.webp';
const overlay = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111827" stop-opacity="0.84"/>
      <stop offset="0.55" stop-color="#111827" stop-opacity="0.58"/>
      <stop offset="1" stop-color="#ff6b35" stop-opacity="0.42"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#shade)"/>
  <rect x="72" y="74" width="92" height="92" rx="22" fill="#ffffff" fill-opacity="0.92"/>
  <path d="M98 132h46M101 119h37M110 106h26" stroke="#ff6b35" stroke-width="9" stroke-linecap="round"/>
  <text x="190" y="116" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="800" fill="#ffffff">Estospaces</text>
  <text x="72" y="282" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">Virtual property tours</text>
  <text x="72" y="362" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="700" fill="#fed7aa">and verified UK listings</text>
  <text x="72" y="456" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="500" fill="#f9fafb">Search smarter. View clearly. Move with confidence.</text>
  <rect x="72" y="512" width="360" height="52" rx="26" fill="#ff6b35"/>
  <text x="102" y="547" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff">estospaces.com</text>
</svg>`;

await sharp('public/assets/modern-apartment.png')
  .resize(1200, 630, { fit: 'cover' })
  .composite([{ input: Buffer.from(overlay) }])
  .webp({ quality: 88 })
  .toFile(output);

console.log(`Generated ${output}`);
