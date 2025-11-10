const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' }
];

const logoPath = path.join(__dirname, '../public/favicon-source.svg');
const publicPath = path.join(__dirname, '../public');

async function generateFavicons() {
  console.log('🎨 Generating favicons from logo.svg...\n');

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(publicPath, name);

      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Created ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to create ${name}:`, error.message);
    }
  }

  // Also create favicon.ico from 32x32 version
  try {
    const faviconIcoPath = path.join(publicPath, 'favicon.ico');
    await sharp(path.join(publicPath, 'favicon-32x32.png'))
      .toFile(faviconIcoPath);
    console.log(`✓ Created favicon.ico`);
  } catch (error) {
    console.error(`✗ Failed to create favicon.ico:`, error.message);
  }

  console.log('\n✨ All favicons generated successfully!');
}

generateFavicons().catch(console.error);
