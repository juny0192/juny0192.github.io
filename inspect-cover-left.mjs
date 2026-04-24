import { createCanvas, loadImage } from 'canvas';

const img = await loadImage('C:\\Users\\juny0\\jun-jung-portfolio\\images\\page-01.jpg');
const W = img.width, H = img.height;
const c = createCanvas(W, H);
const ctx = c.getContext('2d');
ctx.drawImage(img, 0, 0);
const px = ctx.getImageData(0, 0, W, H).data;

function get(x, y) { const i=(y*W+x)*4; return [px[i],px[i+1],px[i+2]]; }

console.log(`Image ${W}x${H}`);
// Sample left edge column x=0,1,2,5,10 at various y values
for (const y of [50, 200, 400, 600, 800, 1000, 1200, 1400, 1500, 1550, 1580]) {
  const samples = [0, 1, 2, 5, 10, 30, 50, 100, 200].map(x => `x=${x}:${get(x,y).join(',')}`).join('  ');
  console.log(`y=${y}: ${samples}`);
}

// For each row, find the leftmost x where pixel is NOT near-pure-white (>250)
console.log('\nLeftmost non-white x per row (threshold r<250):');
for (let y = 0; y < H; y += 20) {
  let leftX = -1;
  for (let x = 0; x < 200; x++) {
    const [r,g,b] = get(x,y);
    if (r < 250 || g < 250 || b < 250) { leftX = x; break; }
  }
  if (leftX !== -1) console.log(`  y=${y}: leftmost-non-white x=${leftX} color=${get(leftX,y).join(',')}`);
  else console.log(`  y=${y}: entire left 200px is pure white`);
}
