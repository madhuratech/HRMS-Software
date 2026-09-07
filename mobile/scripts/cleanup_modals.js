const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.join(__dirname, '../src/screens');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;

  if (content.includes('visible={modalVisible}')) {
    content = content.replace(/<ActionModals\s+visible=\{modalVisible\}\s+mode=\{modalMode\}\s+item=\{selectedItem\}\s+onClose=\{\(\) => setModalVisible\(false\)\}\s+onSave=\{handleSave\}\s*\/>/g, 
      `<ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />`);
    changed = true;
  }

  // Handle any other variations where we just want to forcefully fix the modal if actionModalVisible is declared
  if (content.includes('const [actionModalVisible') && content.includes('<ActionModals') && content.includes('modalVisible')) {
    content = content.replace(/<ActionModals[\s\S]*?\/>/, 
      `<ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed modal in: ${filePath}`);
  }
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

traverse(SCREENS_DIR);
console.log('Cleanup done!');
