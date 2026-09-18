const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function run() {
  const pdfBuffer = fs.readFileSync(path.resolve(__dirname, 'public/HRMS.pdf'));
  const parser = new PDFParse({ data: pdfBuffer });
  await parser.load();
  
  const info = await parser.getInfo();
  console.log('PDF Info:', info);
  
  const textResult = await parser.getText();
  console.log('Text result keys:', Object.keys(textResult || {}));
  console.log('Total pages:', textResult.pages ? textResult.pages.length : 'N/A');
  
  let fullText = '';
  if (textResult.pages) {
    textResult.pages.forEach((page, idx) => {
      fullText += `\n\n==================== PAGE ${idx + 1} ====================\n\n` + page.text;
    });
  } else if (typeof textResult === 'string') {
    fullText = textResult;
  } else if (textResult.text) {
    fullText = textResult.text;
  }
  
  fs.writeFileSync(path.resolve(__dirname, 'extracted_pdf_text.txt'), fullText, 'utf-8');
  console.log('Saved extracted_pdf_text.txt. Characters count:', fullText.length);
}

run().catch(console.error);
