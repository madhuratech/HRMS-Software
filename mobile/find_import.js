const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('./src/screens');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('<TouchableOpacity') || content.includes('TouchableOpacity>')) {
    const importMatch = content.match(/import\s+{[^}]*TouchableOpacity[^}]*}\s+from\s+['"]react-native['"]/);
    if (!importMatch) {
      console.log('Missing import in:', f);
    }
  }
});
