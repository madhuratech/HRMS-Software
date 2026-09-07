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
      
      const targetStr = `      if (res.data && Array.isArray(res.data)) {
        setData(res.data);
      } else {`;
      
      if (content.includes(targetStr)) {
        const replacement = `      let extractedList = null;
      if (res.data) {
        if (Array.isArray(res.data)) {
          extractedList = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          extractedList = res.data.data;
        } else if (res.data.data && typeof res.data.data === 'object') {
          const arrayVal = Object.values(res.data.data).find(val => Array.isArray(val));
          if (arrayVal) extractedList = arrayVal;
        } else if (res.data.success && Array.isArray(res.data.data)) {
          extractedList = res.data.data;
        }
      }
      
      if (extractedList && extractedList.length > 0) {
        setData(extractedList);
      } else {`;
        
        content = content.replace(targetStr, replacement);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated data extraction in ${fullPath}`);
      }
    }
  }
}

processDir(screensDir);
console.log('Finished fixing data parsing across all screens!');
