import sharp from 'sharp';
import { readdir, rename } from 'fs/promises';
import { existsSync } from 'fs';

const images = ['eeeehs.jpg', 'Oooohs.jpg', 'Aaaahs.jpg', 'Mmmms.jpg'];
const dir = 'public/images/Memberships';

console.log('Compressing membership tier images...\n');

for (const img of images) {
  const inputPath = `${dir}/${img}`;
  const outputPath = `${dir}/${img}.optimized.jpg`;
  
  if (!existsSync(inputPath)) {
    console.log(`⚠ ${img} not found, skipping...`);
    continue;
  }
  
  await sharp(inputPath)
    .jpeg({ quality: 80, progressive: true })
    .toFile(outputPath);
  
  console.log(`✓ Compressed ${img}`);
}

console.log('\nDone! Now replacing originals with optimized versions...\n');

for (const img of images) {
  const original = `${dir}/${img}`;
  const optimized = `${dir}/${img}.optimized.jpg`;
  
  if (existsSync(optimized)) {
    await rename(optimized, original);
    console.log(`✓ Replaced ${img}`);
  }
}

console.log('\n✅ All images compressed and replaced!');
