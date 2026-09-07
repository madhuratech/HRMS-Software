const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.join(__dirname, '../src/screens');
const DIRECTORIES_TO_PROCESS = ['recruitment', 'onboarding', 'payroll', 'employee', 'performance', 'projects', 'reports', 'expenses', 'helpdesk', 'settings', 'training', 'organization', 'attendance', 'leave'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already processed with actionModalVisible
  if (content.includes('const [actionModalVisible, setActionModalVisible] = useState(false);')) return;

  console.log(`Processing: ${filePath}`);

  // 1. Add Alert, Eye, Edit2, Trash2 to lucide/react-native imports
  if (!content.includes('Alert')) {
    content = content.replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]react-native['"];/, (match, p1) => {
      if (!p1.includes('Alert')) return `import { ${p1.trim()}, Alert } from 'react-native';`;
      return match;
    });
  }

  content = content.replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]lucide-react-native['"];/, (match, p1) => {
    let imports = p1.trim().split(',').map(s => s.trim());
    if (!imports.includes('Eye')) imports.push('Eye');
    if (!imports.includes('Edit2')) imports.push('Edit2');
    if (!imports.includes('Trash2')) imports.push('Trash2');
    return `import { ${imports.join(', ')} } from 'lucide-react-native';`;
  });

  // 2. Add ActionModals import
  if (!content.includes('import ActionModals')) {
    content = content.replace(/(import apiClient from '.*?';)/, `$1\nimport ActionModals from '../../components/common/ActionModals';`);
  }

  // Find the endpoint being used
  let endpoint = '';
  const match = content.match(/apiClient\.get\(['"]([^'"]+)['"]/);
  if (match) {
    endpoint = match[1];
  } else {
    endpoint = '/placeholder';
  }
  endpoint = endpoint.split('?')[0];

  // 3. Inject Action Modals state and functions
  const stateAndMethods = `
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(\`${endpoint}/\${item.id || item._id}\`);
            if (typeof fetchData === 'function') fetchData();
            if (typeof loadData === 'function') loadData();
            if (typeof fetchDocuments === 'function') fetchDocuments();
            if (typeof fetchAppraisals === 'function') fetchAppraisals();
            if (typeof fetchProjects === 'function') fetchProjects();
          } catch (err) { console.error('Delete error:', err); }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      if (updatedItem.id || updatedItem._id) {
        await apiClient.put(\`${endpoint}/\${updatedItem.id || updatedItem._id}\`, updatedItem);
      }
      setActionModalVisible(false);
      if (typeof fetchData === 'function') fetchData();
      if (typeof loadData === 'function') loadData();
      if (typeof fetchDocuments === 'function') fetchDocuments();
      if (typeof fetchAppraisals === 'function') fetchAppraisals();
      if (typeof fetchProjects === 'function') fetchProjects();
    } catch (err) { console.error('Update error:', err); }
  };
`;

  // Inject state into component
  // Clean up old ones first if they exist
  content = content.replace(/const \[modalVisible, setModalVisible\] = useState\(false\);\s*const \[modalMode, setModalMode\] = useState\('view'\);\s*const \[selectedItem, setSelectedItem\] = useState\(null\);[\s\S]*?const handleSave = async \(updatedItem\) => {[\s\S]*?};\s*/g, '');

  content = content.replace(/(export default function [A-Za-z0-9_]+\s*\([^)]*\)\s*{)/, `$1\n${stateAndMethods}`);

  // 4. Inject Card Actions into renderItem if not present
  if (!content.includes('<Eye') && !content.includes('<Edit2')) {
    const cardActionsHTML = `
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 12, gap: 12 }}>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionView(item)}>
          <Eye size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionEdit(item)}>
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionDelete(item)}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    `;
    
    // We try to find the end of renderItem's root view.
    content = content.replace(/(<\/View>\s*\);\s*(?:return|const))/g, `${cardActionsHTML}\n$1`);
  } else {
    // If they exist, map them to handleAction*
    content = content.replace(/onPress=\{[^}]*\}\s*>\s*<Eye/g, '> <Eye');
    content = content.replace(/<TouchableOpacity([^>]*)>\s*<Eye([^>]*)>\s*<\/TouchableOpacity>/g, `<TouchableOpacity$1 onPress={() => typeof item !== 'undefined' ? handleActionView(item) : null}>\n<Eye$2>\n</TouchableOpacity>`);
    
    content = content.replace(/onPress=\{[^}]*\}\s*>\s*<Edit2/g, '> <Edit2');
    content = content.replace(/<TouchableOpacity([^>]*)>\s*<Edit2([^>]*)>\s*<\/TouchableOpacity>/g, `<TouchableOpacity$1 onPress={() => typeof item !== 'undefined' ? handleActionEdit(item) : null}>\n<Edit2$2>\n</TouchableOpacity>`);
    
    content = content.replace(/onPress=\{[^}]*\}\s*>\s*<Trash2/g, '> <Trash2');
    content = content.replace(/<TouchableOpacity([^>]*)>\s*<Trash2([^>]*)>\s*<\/TouchableOpacity>/g, `<TouchableOpacity$1 onPress={() => typeof item !== 'undefined' ? handleActionDelete(item) : null}>\n<Trash2$2>\n</TouchableOpacity>`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function traverseAndProcess(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndProcess(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('renderItem')) {
        processFile(fullPath);
      }
    }
  }
}

for (const folder of DIRECTORIES_TO_PROCESS) {
  traverseAndProcess(path.join(SCREENS_DIR, folder));
}

console.log('Done mapping action modals globally!');
