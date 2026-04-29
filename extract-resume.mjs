import http from 'http';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __dir     = fileURLToPath(new URL('.', import.meta.url));
const CHROME    = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PDF_PATH  = 'C:\\Projects\\jun-jung-portfolio\\images\\resume\\Byungjun (Jun) Jung — Interior Designer.pdf';
const OUT_DIR   = join(__dir, 'images', 'resume');
const SCALE     = 4.5;
const PORT      = 54323;

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
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  document.title = 'done';
  window.__numPages = pdf.numPages;
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

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const tab = await browser.newPage();

await tab.goto(`http://127.0.0.1:${PORT}/render.html?page=1`, { waitUntil: 'networkidle0' });
await tab.waitForFunction(() => document.title === 'done', { timeout: 60000 });
const numPages = await tab.evaluate(() => window.__numPages);
console.log(`Resume has ${numPages} page(s)`);

for (let i = 1; i <= numPages; i++) {
  await tab.goto(`http://127.0.0.1:${PORT}/render.html?page=${i}`, { waitUntil: 'networkidle0' });
  await tab.waitForFunction(() => document.title === 'done', { timeout: 60000 });
  const jpegB64 = await tab.evaluate(() =>
    document.getElementById('c').toDataURL('image/jpeg', 0.96).split(',')[1]
  );
  const num = String(i).padStart(2, '0');
  writeFileSync(join(OUT_DIR, `resume-${num}.jpg`), Buffer.from(jpegB64, 'base64'));
  console.log(`  Saved resume-${num}.jpg`);
}

await browser.close();
server.close();
