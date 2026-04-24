import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, readFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

const IMG_PATH = 'C:\\Users\\juny0\\jun-jung-portfolio\\images\\page-01.jpg';
const SRC_PDF  = 'C:\\Users\\juny0\\jun-jung-portfolio\\images\\Portfolio 2026 _new.pdf';

// ── 1. Fix the JPG ───────────────────────────────────────────────────────────
const img = await loadImage(IMG_PATH);
const W = img.width, H = img.height;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);
const imgData = ctx.getImageData(0, 0, W, H);
const px = imgData.data;

const STRIP_W = 18;  // white strip columns x=0..17

let fixedRows = 0;
for (let y = 0; y < H; y++) {
  // Check if this row has the white strip on the left (x=0 near-white, x=STRIP_W paper-texture)
  const p0 = (y * W + 0) * 4;
  const pE = (y * W + STRIP_W) * 4;
  const isWhite0 = px[p0] >= 253 && px[p0+1] >= 253 && px[p0+2] >= 253;
  const isPaperE = px[pE] < 253;
  if (!isWhite0 || !isPaperE) continue;

  // Copy pixels x=STRIP_W..STRIP_W+17 into x=0..STRIP_W-1 (mirror adjacent texture)
  for (let x = 0; x < STRIP_W; x++) {
    const srcX = STRIP_W + (STRIP_W - 1 - x);   // mirror
    const src = (y * W + srcX) * 4;
    const dst = (y * W + x) * 4;
    px[dst]   = px[src];
    px[dst+1] = px[src+1];
    px[dst+2] = px[src+2];
  }
  fixedRows++;
}

ctx.putImageData(imgData, 0, 0);
writeFileSync(IMG_PATH, canvas.toBuffer('image/jpeg', { quality: 0.92 }));
console.log(`Fixed ${fixedRows} rows in page-01.jpg`);

// ── 2. Replace page 1 of source PDF with the fixed image ─────────────────────
const pdfBytes = readFileSync(SRC_PDF);
const pdf = await PDFDocument.load(pdfBytes);
const pages = pdf.getPages();
const { width: pw, height: ph } = pages[0].getSize();

// Remove original page 1
pdf.removePage(0);

// Create a new page 1 with the fixed JPG, same dimensions as original
const jpg = await pdf.embedJpg(readFileSync(IMG_PATH));
const newPage = pdf.insertPage(0, [pw, ph]);
newPage.drawImage(jpg, { x: 0, y: 0, width: pw, height: ph });

writeFileSync(SRC_PDF, await pdf.save());
console.log(`Replaced page 1 in source PDF (${pw}x${ph})`);
