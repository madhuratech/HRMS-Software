const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

async function renderPages() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const buffer = new Uint8Array(fs.readFileSync(path.resolve(__dirname, 'public/HRMS.pdf')));
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  
  const outDir = path.resolve(__dirname, 'pdf_pages');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Document has ${doc.numPages} pages.`);
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    
    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;
    
    const pngBuffer = canvas.toBuffer('image/png');
    const outPath = path.join(outDir, `page_${i}.png`);
    fs.writeFileSync(outPath, pngBuffer);
    console.log(`Rendered page ${i} to ${outPath}`);
  }
}

renderPages().catch(console.error);
