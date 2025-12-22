const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

async function createPNGIcon(size) {
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FAFAF9"/>
  <rect x="${size * 0.2}" y="${size * 0.15}" width="${size * 0.6}" height="${size * 0.7}" rx="${size * 0.02}" fill="#F97316" stroke="#EA580C" stroke-width="${Math.max(2, size * 0.01)}"/>
  <line x1="${size / 2}" y1="${size * 0.15}" x2="${size / 2}" y2="${size * 0.85}" stroke="#EA580C" stroke-width="${Math.max(2, size * 0.01)}"/>
  <text x="${size / 2}" y="${size * 0.6}" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold" fill="#EA580C" text-anchor="middle" dominant-baseline="middle">BR</text>
</svg>`;

    const buffer = Buffer.from(svg);
    await sharp(buffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, `icon-${size}.png`));
    
    console.log(`Created icon-${size}.png`);
}

async function main() {
    try {
        await createPNGIcon(192);
        await createPNGIcon(512);
        
        // Обновляем manifest.json для использования PNG
        const manifestPath = path.join(publicDir, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.icons = [
            {
                "src": "/icon-192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable"
            },
            {
                "src": "/icon-512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any maskable"
            }
        ];
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log('PNG icons created successfully!');
        console.log('Updated manifest.json to use PNG icons.');
    } catch (error) {
        console.error('Error creating PNG icons:', error);
        process.exit(1);
    }
}

main();

