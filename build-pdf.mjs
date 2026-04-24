/**
 * build-pdf.mjs
 * Assembles all portfolio images into a downloadable PDF.
 * Run after any image changes: node build-pdf.mjs
 *
 * What it does:
 *  - Embeds every page-XX.jpg (01-32) in order
 *  - On the cover (page 1) and last page (page 32):
 *      · Draws "juny0192.github.io" where the phone number was removed
 *      · Adds a clickable hyperlink on that URL text
 *      · Adds a clickable mailto hyperlink over the visible email address
 */

import { PDFDocument, rgb, StandardFonts, PDFString, PDFName } from 'pdf-lib';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dir = fileURLToPath(new URL('.', import.meta.url));
const IMAGES_DIR = join(__dir, 'images');
const OUT_PATH   = join(__dir, 'assets', 'portfolio.pdf');

// Pages to include (1–32 in order, including page 21 which shows as coming-soon on website)
const TOTAL_PAGES = 32;

// ── Link annotation helper ──────────────────────────────────────────────────
function addLink(pdfDoc, page, { x1, y1, x2, y2, url }) {
  // PDF y-origin is bottom-left; caller passes image-space coords which
  // we expect already converted to PDF space (y1 = bottom, y2 = top).
  const annot = pdfDoc.context.obj({
    Type:    'Annot',
    Subtype: 'Link',
    Rect:    [x1, y1, x2, y2],
    A: {
      Type: 'Action',
      S:    'URI',
      URI:  PDFString.of(url),
    },
    Border: [0, 0, 0],
  });
  const annotRef = pdfDoc.context.register(annot);
  const existing = page.node.get(PDFName.of('Annots'));
  if (existing) {
    existing.push(annotRef);
  } else {
    page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([annotRef]));
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
const pdfDoc = await PDFDocument.create();
pdfDoc.setTitle('Jun Jung — Interior Design Portfolio');
pdfDoc.setAuthor('Jun Jung');

const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

// Accent color matching the portfolio style (#8b7355 ≈ rgb(139,115,85)/255)
const accentColor = rgb(139/255, 115/255, 85/255);
const darkColor   = rgb(0.12, 0.12, 0.12);

for (let pageNum = 1; pageNum <= TOTAL_PAGES; pageNum++) {
  const imgFile = join(IMAGES_DIR, `page-${String(pageNum).padStart(2,'0')}.jpg`);
  if (!existsSync(imgFile)) {
    console.warn(`  ⚠ Missing: ${imgFile} — skipping`);
    continue;
  }

  const jpegData = readFileSync(imgFile);
  const img = await pdfDoc.embedJpg(jpegData);
  const { width: W, height: H } = img;

  // PDF page — 1 PDF point = 1 image pixel (keeps all coords simple)
  const page = pdfDoc.addPage([W, H]);
  page.drawImage(img, { x: 0, y: 0, width: W, height: H });

  // ── Cover page (page 1): 1224×1584 ───────────────────────────────────────
  if (pageNum === 1) {
    // Phone was at image y=637-658, x=360-740
    // PDF coords (y flipped): y_bot = H-658 = 926, y_top = H-637 = 947
    const phoneX1 = 360, phoneY1 = H - 658, phoneX2 = 740, phoneY2 = H - 637;

    // Draw website URL text where phone was
    page.drawText('juny0192.github.io', {
      x:     phoneX1,
      y:     phoneY1 + 2,
      size:  19,
      font:  helvetica,
      color: accentColor,
    });

    // Hyperlink over the URL text
    addLink(pdfDoc, page, {
      x1: phoneX1, y1: phoneY1,
      x2: phoneX2, y2: phoneY2,
      url: 'https://juny0192.github.io/',
    });

    // Email text is at image y=881-904, x=447-776
    // PDF coords: y_bot = H-904 = 680, y_top = H-881 = 703
    addLink(pdfDoc, page, {
      x1: 447, y1: H - 904,
      x2: 776, y2: H - 881,
      url: 'mailto:juny0192@gmail.com',
    });

    console.log(`  Page 1: website URL + email links added`);
  }

  // ── Last page (page 32): 1224×1584 ───────────────────────────────────────
  if (pageNum === 32) {
    // Phone was at image y=685-715, x=360-740
    // PDF coords: y_bot = H-715 = 869, y_top = H-685 = 899
    const phoneX1 = 286, phoneY1 = H - 715, phoneX2 = 680, phoneY2 = H - 685;

    // Draw website URL text where phone was
    page.drawText('juny0192.github.io', {
      x:     phoneX1,
      y:     phoneY1 + 2,
      size:  19,
      font:  helvetica,
      color: accentColor,
    });

    // Hyperlink over URL
    addLink(pdfDoc, page, {
      x1: phoneX1, y1: phoneY1,
      x2: phoneX2, y2: phoneY2,
      url: 'https://juny0192.github.io/',
    });

    // Email is at image y=772-791, x=286-684
    // PDF coords: y_bot = H-791 = 793, y_top = H-772 = 812
    addLink(pdfDoc, page, {
      x1: 286, y1: H - 791,
      x2: 684, y2: H - 772,
      url: 'mailto:juny0192@gmail.com',
    });

    console.log(`  Page 32: website URL + email links added`);
  }

  console.log(`  ✓ page-${String(pageNum).padStart(2,'0')}.jpg → PDF page ${pageNum}`);
}

const pdfBytes = await pdfDoc.save();
writeFileSync(OUT_PATH, pdfBytes);
console.log(`\n✅ Saved to assets/portfolio.pdf (${(pdfBytes.length / 1024 / 1024).toFixed(1)} MB)`);
