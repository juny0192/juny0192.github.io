import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import sharp from 'sharp';

const ORIG = 'C:\\Projects\\jun-jung-portfolio\\images\\page-04.jpg';
const SRC  = 'C:\\Projects\\jun-jung-portfolio\\images\\200-Connell-Dr-Berkeley-Heights-NJ-Primary-Photo-1-HighDefinition.jpg';
const OUT  = 'C:\\Projects\\jun-jung-portfolio\\images\\page-04.jpg';

const orig = await loadImage(ORIG);
const W = orig.width, H = orig.height;  // 2448×1584

// Draw original to canvas to read pixels
const origCanvas = createCanvas(W, H);
const origCtx = origCanvas.getContext('2d');
origCtx.drawImage(orig, 0, 0);
const origData = origCtx.getImageData(0, 0, W, H);
const op = origData.data;

// Scale new photo to exact same dimensions (cover = fill + center crop)
const { data: np } = await sharp(SRC)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .raw()
  .toBuffer({ resolveWithObject: true });

// Build output canvas
const outCanvas = createCanvas(W, H);
const outCtx = outCanvas.getContext('2d');
const outData = outCtx.getImageData(0, 0, W, H);
const out = outData.data;

// Zones (all in image-space y, 0=top):
//   Top fade     : 0  → FADE_TOP   (white → photo)
//   New photo    : FADE_TOP → BLEND_START
//   Blend zone   : BLEND_START → BLEND_END  (new photo fades out, original fades in)
//   Original text: BLEND_END → BOT_FADE_START
//   Bottom fade  : BOT_FADE_START → H        (original, white overlay)
const FADE_TOP       = 200;   // top white fade extent (same as original)
const BLEND_START    = 1100;  // start blending from new→orig (73% down)
const BLEND_END      = 1220;  // fully original from here down (77% down)
const BOT_FADE_START = 1500;  // bottom white fade from here

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const oi = (y * W + x) * 4;  // original pixel index (RGBA)
    const ni = (y * W + x) * 3;  // new photo pixel index (RGB, no alpha)

    const oR = op[oi], oG = op[oi+1], oB = op[oi+2];
    const nR = np[ni], nG = np[ni+1], nB = np[ni+2];

    let r, g, b;

    if (y < BLEND_START) {
      // New photo
      r = nR; g = nG; b = nB;
    } else if (y < BLEND_END) {
      // Crossfade: new → original
      const t = (y - BLEND_START) / (BLEND_END - BLEND_START);
      r = Math.round(nR * (1-t) + oR * t);
      g = Math.round(nG * (1-t) + oG * t);
      b = Math.round(nB * (1-t) + oB * t);
    } else {
      // Original (preserves all text overlays + bottom fade)
      r = oR; g = oG; b = oB;
    }

    // Apply top white fade (same gradient as original page)
    if (y < FADE_TOP) {
      const fadeAlpha = 1 - y / FADE_TOP;  // 1 at top, 0 at FADE_TOP
      r = Math.round(r * (1 - fadeAlpha) + 255 * fadeAlpha);
      g = Math.round(g * (1 - fadeAlpha) + 255 * fadeAlpha);
      b = Math.round(b * (1 - fadeAlpha) + 255 * fadeAlpha);
    }

    out[oi]   = r;
    out[oi+1] = g;
    out[oi+2] = b;
    out[oi+3] = 255;
  }
}

outCtx.putImageData(outData, 0, 0);
const buf = outCanvas.toBuffer('image/jpeg', { quality: 0.92 });
writeFileSync(OUT, buf);
console.log(`✅ Saved page-04.jpg (${(buf.length/1024/1024).toFixed(1)} MB)`);
