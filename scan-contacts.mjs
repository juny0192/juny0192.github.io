import { createCanvas, loadImage } from 'canvas';

async function scan(filename, label) {
  const img = await loadImage(`C:\\Users\\juny0\\jun-jung-portfolio\\images\\${filename}`);
  const W = img.width, H = img.height;
  console.log(`\n=== ${label} (${W}x${H}) ===`);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, W, H).data;

  function get(x, y) { const i=(y*W+x)*4; return [px[i],px[i+1],px[i+2]]; }

  // Scan full width, broad threshold, y=300–1100
  for (let y = 300; y <= 1100; y++) {
    let dark = 0, minX = W, maxX = 0;
    for (let x = 0; x < W; x++) {
      const [r] = get(x, y);
      if (r < 185) { dark++; if (x<minX) minX=x; if (x>maxX) maxX=x; }
    }
    if (dark > 3 && dark < 400 && (maxX-minX) < 700) {
      console.log(`  y=${y} (${(y/H*100).toFixed(1)}%): ${dark}px  x=${minX}-${maxX}  sample=${get(Math.round((minX+maxX)/2), y)}`);
    }
  }
}

await scan('page-01.jpg', 'Page 1 (Cover)');
await scan('page-32.jpg', 'Page 32 (Last)');
