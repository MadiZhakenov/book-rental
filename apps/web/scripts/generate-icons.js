const fs = require('fs');
const path = require('path');

// Простая функция для создания PNG из base64
// Создаем простые цветные иконки с текстом BR

function createIcon(size) {
    // Создаем простой SVG
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FAFAF9"/>
  <rect x="${size * 0.2}" y="${size * 0.15}" width="${size * 0.6}" height="${size * 0.7}" rx="${size * 0.02}" fill="#F97316" stroke="#EA580C" stroke-width="${size * 0.01}"/>
  <line x1="${size / 2}" y1="${size * 0.15}" x2="${size / 2}" y2="${size * 0.85}" stroke="#EA580C" stroke-width="${size * 0.01}"/>
  <text x="${size / 2}" y="${size * 0.6}" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold" fill="#EA580C" text-anchor="middle" dominant-baseline="middle">BR</text>
</svg>`;
    
    return svg;
}

const publicDir = path.join(__dirname, '../public');

// Создаем SVG файлы
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createIcon(512));

console.log('SVG icons created. For PWA, you need PNG files.');
console.log('You can convert them using an online tool or ImageMagick:');
console.log('  convert icon-192.svg icon-192.png');
console.log('  convert icon-512.svg icon-512.png');
console.log('');
console.log('For now, creating placeholder PNG files...');

// Создаем простые placeholder PNG файлы (минимальный валидный PNG)
// Это будет простой оранжевый квадрат
const createPlaceholderPNG = (size, filename) => {
    // Минимальный валидный PNG 1x1 пиксель, растягиваемый браузером
    // Но лучше создать реальный PNG
    // Для простоты создадим файл с инструкцией
    const placeholder = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        // Это минимальный валидный PNG, но лучше использовать реальную библиотеку
    ]);
    
    // Вместо этого создадим простой текстовый файл с инструкцией
    // и временно используем SVG в манифесте
    console.log(`Placeholder for ${filename} (${size}x${size})`);
};

// Обновим manifest чтобы использовать SVG временно
const manifestPath = path.join(publicDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.icons = [
    {
        "src": "/icon-192.svg",
        "sizes": "192x192",
        "type": "image/svg+xml",
        "purpose": "any maskable"
    },
    {
        "src": "/icon-512.svg",
        "sizes": "512x512",
        "type": "image/svg+xml",
        "purpose": "any maskable"
    }
];
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Updated manifest.json to use SVG icons temporarily.');
console.log('Note: Some browsers may require PNG for PWA. Convert SVG to PNG when ready.');

