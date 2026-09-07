const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '..', 'src', 'screens');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('Screen.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for the literal \ followed by `
      if (content.includes('\\`')) {
        // Replace \` with `
        content = content.replace(/\\`/g, '`');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed backticks in ${fullPath}`);
      }
    }
  }
}

processDir(screensDir);
console.log('Finished fixing literal backslashes across all screens!');
