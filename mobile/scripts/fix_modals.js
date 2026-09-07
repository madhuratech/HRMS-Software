const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.join(__dirname, '../src/screens');
const DIRECTORIES_TO_PROCESS = ['recruitment', 'onboarding', 'payroll', 'employee', 'performance', 'projects', 'reports', 'expenses', 'helpdesk', 'settings', 'training', 'organization', 'attendance', 'leave'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // If ActionModals is imported but not used in the render tree, add it
  if (content.includes('import ActionModals') && !content.includes('<ActionModals')) {
    
    const modalComponent = `
      <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}`;

    // Replace the end of the component return statement
    content = content.replace(/<\/View>\s*\);\s*}\s*const styles = StyleSheet\.create/, 
      `      <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}

const styles = StyleSheet.create`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected <ActionModals /> in: ${filePath}`);
  }
}

function traverseAndProcess(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndProcess(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

for (const folder of DIRECTORIES_TO_PROCESS) {
  traverseAndProcess(path.join(SCREENS_DIR, folder));
}

console.log('Done fixing modals!');
