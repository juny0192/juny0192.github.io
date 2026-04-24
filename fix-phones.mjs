import { createCanvas, loadImage, registerFont } from 'canvas';
import { writeFileSync } from 'fs';

// ── Page 1 fix ────────────────────────────────────────────────────────────────
{
  const PATH = 'C:\\Users\\juny0\\jun-jung-portfolio\\images\\page-01.jpg';
  const img  = await loadImage(PATH);
  const W = img.width, H = img.height;  // 1224×1584

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, W, H);
  const px = imgData.data;

  // Sample paper texture from a clean row above the contact block
  // Phone is at y=957-972; use y=840 as texture source
  function getPixel(x, y) {
    const i = (y * W + x) * 4;
    return [px[i], px[i+1], px[i+2]];
  }

  // Paint over phone row-by-row using texture from y=840
  for (let y = 953; y <= 976; y++) {
    for (let x = 0; x < W; x++) {
      const srcY = 840 + ((y - 953) % 10);
      const [r, g, b] = getPixel(x, srcY);
      const i = (y * W + x) * 4;
      px[i] = r; px[i+1] = g; px[i+2] = b;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw URL text in matching style (centered, light gray, similar size)
  ctx.font = '900 14px Arial';
  ctx.fillStyle = 'rgb(180,180,180)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('juny0192.github.io', W / 2, 964);

  writeFileSync(PATH, canvas.toBuffer('image/jpeg', { quality: 0.92 }));
  console.log('✅ page-01.jpg: phone removed, URL drawn at y=964');
}

// ── Page 32 fix ───────────────────────────────────────────────────────────────
{
  const PATH = 'C:\\Users\\juny0\\jun-jung-portfolio\\images\\page-32.jpg';
  const img  = await loadImage(PATH);
  const W = img.width, H = img.height;  // 1224×1584

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, W, H);
  const px = imgData.data;

  // Card background color from non-text rows inside the card
  // Sampled at y=800 center: ~rgb(240,240,238)
  const BG = [240, 240, 238];

  // Paint over phone at y=850-868 with card background
  for (let y = 848; y <= 870; y++) {
    for (let x = 290; x < 932; x++) {
      const i = (y * W + x) * 4;
      px[i] = BG[0]; px[i+1] = BG[1]; px[i+2] = BG[2];
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw URL text — centered inside the card (card x=286-935, center=610)
  ctx.font = '13px Arial';
  ctx.fillStyle = 'rgb(170,170,170)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('juny0192.github.io', 611, 859);

  writeFileSync(PATH, canvas.toBuffer('image/jpeg', { quality: 0.92 }));
  console.log('✅ page-32.jpg: phone removed, URL drawn at y=859');
}
