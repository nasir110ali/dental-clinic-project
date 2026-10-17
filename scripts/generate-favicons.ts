import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// SVG definition for Aura Dental Studio
// Premium stylized tooth silhouette with an illuminated dental aura sparkle
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="auraBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="50%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#115e59" />
    </linearGradient>
    <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f0fdfa" />
      <stop offset="100%" stop-color="#ccfbf1" />
    </linearGradient>
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#5eead4" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base squircle container -->
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#auraBg)" />
  <rect x="16" y="16" width="480" height="480" rx="112" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="6" />

  <!-- Subtle inner radial glow behind tooth -->
  <circle cx="256" cy="265" r="140" fill="#2dd4bf" opacity="0.18" filter="url(#softGlow)" />

  <!-- Stylized Elegant Tooth Silhouette -->
  <!-- Designed with anatomical root curvature, crown cusps, and harmonious proportions -->
  <path
    d="M 175 140 
       C 130 140, 105 178, 110 230
       C 114 270, 135 305, 160 350
       C 180 385, 205 425, 218 425
       C 230 425, 235 390, 246 330
       C 251 300, 261 300, 266 330
       C 277 390, 282 425, 294 425
       C 307 425, 332 385, 352 350
       C 377 305, 398 270, 402 230
       C 407 178, 382 140, 337 140
       C 298 140, 276 168, 256 168
       C 236 168, 214 140, 175 140 Z"
    fill="url(#toothGrad)"
  />

  <!-- Subtle tooth enamel shading highlight -->
  <path
    d="M 185 162
       C 152 162, 134 190, 137 232
       C 140 265, 157 296, 178 335
       C 192 360, 208 388, 217 398
       C 213 365, 218 320, 224 285
       C 228 260, 222 225, 215 200
       C 210 182, 200 166, 185 162 Z"
    fill="#ffffff"
    opacity="0.45"
  />

  <!-- Brilliant 4-Point Aura Sparkle (Upper Right Cusp) -->
  <g transform="translate(365, 145)">
    <!-- Aura glint outer aura -->
    <circle cx="0" cy="0" r="42" fill="#5eead4" opacity="0.3" filter="url(#softGlow)" />
    <!-- Primary 4-pointed star -->
    <path
      d="M 0 -58
         Q 3 -12 24 -3
         Q 3 0 0 58
         Q -3 0 -24 -3
         Q -3 -12 0 -58 Z"
      fill="url(#sparkleGrad)"
    />
    <path
      d="M -58 0
         Q -12 -3 -3 -24
         Q 0 -3 58 0
         Q 0 3 -3 24
         Q -12 3 -58 0 Z"
      fill="url(#sparkleGrad)"
    />
    <!-- Center gleaming diamond -->
    <circle cx="0" cy="0" r="11" fill="#ffffff" />
  </g>

  <!-- Secondary subtle sparkle (Left) -->
  <g transform="translate(142, 210) scale(0.45)">
    <path
      d="M 0 -45 Q 2 -8 18 -2 Q 2 0 0 45 Q -2 0 -18 -2 Q -2 -8 0 -45 Z"
      fill="#ffffff"
      opacity="0.85"
    />
    <path
      d="M -45 0 Q -8 -2 -2 -18 Q 0 -2 45 0 Q 0 2 -2 18 Q -8 2 -45 0 Z"
      fill="#ffffff"
      opacity="0.85"
    />
    <circle cx="0" cy="0" r="7" fill="#ffffff" />
  </g>
</svg>`;

// Helper function to build a valid ICO file containing multiple PNG images
function createIcoFromPngs(pngBuffers: { width: number; height: number; data: Buffer }[]): Buffer {
  // ICO header: 6 bytes
  // 0-1: Reserved (always 0)
  // 2-3: Type (1 for icon)
  // 4-5: Number of images
  const headerLength = 6;
  const directoryEntryLength = 16;
  const totalHeaderAndDirLength = headerLength + directoryEntryLength * pngBuffers.length;

  let currentOffset = totalHeaderAndDirLength;
  const header = Buffer.alloc(headerLength);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Icon type
  header.writeUInt16LE(pngBuffers.length, 4); // Image count

  const directoryEntries: Buffer[] = [];
  const imageBuffers: Buffer[] = [];

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(directoryEntryLength);
    // Width (1 byte, 0 means 256)
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    // Height (1 byte, 0 means 256)
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    // Color palette (0 means no palette)
    entry.writeUInt8(0, 2);
    // Reserved
    entry.writeUInt8(0, 3);
    // Color planes (1)
    entry.writeUInt16LE(1, 4);
    // Bits per pixel (32 for RGBA)
    entry.writeUInt16LE(32, 6);
    // Image data size in bytes
    entry.writeUInt32LE(img.data.length, 8);
    // Offset from start of file to image data
    entry.writeUInt32LE(currentOffset, 12);

    directoryEntries.push(entry);
    imageBuffers.push(img.data);
    currentOffset += img.data.length;
  }

  return Buffer.concat([header, ...directoryEntries, ...imageBuffers]);
}

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Writing favicon.svg...');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon, 'utf-8');

  console.log('Generating PNG favicons...');
  const svgBuffer = Buffer.from(svgIcon);

  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);

  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48);

  const appleTouch = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), png192);

  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), png512);

  console.log('Packaging multi-resolution favicon.ico (16x16, 32x32, 48x48)...');
  const icoBuffer = createIcoFromPngs([
    { width: 16, height: 16, data: png16 },
    { width: 32, height: 32, data: png32 },
    { width: 48, height: 48, data: png48 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  console.log('Writing site.webmanifest...');
  const manifest = {
    name: 'Aura Dental Studio',
    short_name: 'Aura Dental',
    description: 'A premium modern dental clinic website featuring live service booking, intelligent availability scheduling, and an administrative dashboard.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f766e',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png'
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('All favicons and icons generated successfully in /public!');
}

main().catch((err) => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
