const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function run() {
  const pdfBuffer = fs.readFileSync(path.resolve(__dirname, 'public/HRMS.pdf'));
  const parser = new PDFParse({ data: pdfBuffer });
  await parser.load();
  
  for (let i = 1; i <= 19; i++) {
    console.log(`\n=================== PAGE ${i} DETAILS ===================`);
    try {
      const pageText = await parser.getPageText(i);
      console.log('TEXT:\n', pageText);
    } catch(e) {
      console.log('Error getting page text:', e.message);
    }
  }
}

run().catch(console.error);
