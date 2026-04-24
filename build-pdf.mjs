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
    // Phone was at image y=957-972, x=555-669 (centered on page)
    // URL text drawn on image at y=964, centered at x=612
    // PDF coords (y flipped from bottom): y_bot = H-972 = 612, y_top = H-953 = 631
    const urlY1 = H - 976, urlY2 = H - 953;
    const urlX1 = 447, urlX2 = 777;

    // Hyperlink over the URL text already drawn on the image
    addLink(pdfDoc, page, {
      x1: urlX1, y1: urlY1,
      x2: urlX2, y2: urlY2,
      url: 'https://juny0192.github.io/',
    });

    // Email text is at image y=920-939, x=513-710
    // PDF coords: y_bot = H-939 = 645, y_top = H-920 = 664
    addLink(pdfDoc, page, {
      x1: 513, y1: H - 939,
      x2: 710, y2: H - 920,
      url: 'mailto:juny0192@gmail.com',
    });

    console.log(`  Page 1: website URL + email links added`);
  }

  // ── Last page (page 32): 1224×1584 ───────────────────────────────────────
  if (pageNum === 32) {
    // Phone was at image y=855-865, inside card x=290-932
    // URL text drawn on image at y=859, centered at x=611
    // PDF coords: y_bot = H-870 = 714, y_top = H-848 = 736
    const urlY1 = H - 870, urlY2 = H - 848;
    const urlX1 = 350, urlX2 = 870;

    // Draw website URL text (as PDF text layer — invisible since image already has it,
    // but needed so the hyperlink annotation has something to attach to)
    page.drawText('juny0192.github.io', {
      x:     urlX1,
      y:     urlY1 + 2,
      size:  0.1,  // near-invisible — text is already baked into image
      font:  helvetica,
      color: accentColor,
    });

    // Hyperlink over URL (image y=848-870)
    addLink(pdfDoc, page, {
      x1: urlX1, y1: urlY1,
      x2: urlX2, y2: urlY2,
      url: 'https://juny0192.github.io/',
    });

    // Email is at image y=882-894, x=290-932
    // PDF coords: y_bot = H-894 = 690, y_top = H-882 = 702
    addLink(pdfDoc, page, {
      x1: 290, y1: H - 894,
      x2: 932, y2: H - 882,
      url: 'mailto:juny0192@gmail.com',
    });

    console.log(`  Page 32: website URL + email links added`);
  }

  console.log(`  ✓ page-${String(pageNum).padStart(2,'0')}.jpg → PDF page ${pageNum}`);
}

const pdfBytes = await pdfDoc.save();
writeFileSync(OUT_PATH, pdfBytes);
console.log(`\n✅ Saved to assets/portfolio.pdf (${(pdfBytes.length / 1024 / 1024).toFixed(1)} MB)`);
