import http from 'http';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __dir     = fileURLToPath(new URL('.', import.meta.url));
const CHROME    = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PDF_PATH  = 'C:\\Projects\\jun-jung-portfolio\\images\\Portfolio 2026 _new.pdf';
const OUT_DIR   = join(__dir, 'images');
const SCALE     = 2.0;
const PORT      = 54322;
const PAGES     = [21];

mkdirSync(OUT_DIR, { recursive: true });

const pdfjsMain   = readFileSync(join(__dir, 'node_modules/pdfjs-dist/build/pdf.min.mjs'));
const pdfjsWorker = readFileSync(join(__dir, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'));
const pdfData     = readFileSync(PDF_PATH);

const renderHtml = `<!DOCTYPE html>
<html><head><style>*{margin:0;padding:0}body{background:#fff}</style></head>
<body>
<canvas id="c"></canvas>
<script type="module">
  import * as pdfjsLib from '/pdfjs/pdf.min.mjs';
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

  const resp = await fetch('/pdf');
  const data = new Uint8Array(await resp.arrayBuffer());
  const pdf  = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

  const pageNum  = parseInt(new URLSearchParams(location.search).get('page')) || 1;
  const page     = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: ${SCALE} });
  const canvas   = document.getElementById('c');
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  document.body.style.width  = viewport.width  + 'px';
  document.body.style.height = viewport.height + 'px';

  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  document.title = 'done';
</script>
</body></html>`;

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/pdfjs/pdf.min.mjs')        { res.setHeader('Content-Type', 'application/javascript'); res.end(pdfjsMain); }
  else if (url === '/pdfjs/pdf.worker.min.mjs') { res.setHeader('Content-Type', 'application/javascript'); res.end(pdfjsWorker); }
  else if (url === '/pdf')                 { res.setHeader('Content-Type', 'application/pdf'); res.end(pdfData); }
  else if (url === '/render.html')         { res.setHeader('Content-Type', 'text/html'); res.end(renderHtml); }
  else                                     { res.writeHead(404); res.end(); }
});

await new Promise(r => server.listen(PORT, '127.0.0.1', r));
console.log(`Server running on port ${PORT}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const tab = await browser.newPage();

for (const i of PAGES) {
  await tab.goto(`http://127.0.0.1:${PORT}/render.html?page=${i}`, { waitUntil: 'networkidle0' });
  await tab.waitForFunction(() => document.title === 'done', { timeout: 60000 });

  const jpegB64 = await tab.evaluate(() =>
    document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]
  );

  const num  = String(i).padStart(2, '0');
  const path = join(OUT_DIR, `page-${num}.jpg`);
  writeFileSync(path, Buffer.from(jpegB64, 'base64'));
  console.log(`  Saved page-${num}.jpg`);
}

await browser.close();
server.close();
console.log('\nPages 1, 3, 32 re-extracted from new PDF!');
