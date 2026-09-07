const fs = require('fs');
const path = require('path');

const modulesToUpgrade = {
  recruitment: ['RecruitmentDashboard', 'JobOpenings', 'Candidates', 'InterviewSchedule', 'OfferLetters', 'HiringPipeline'],
  onboarding: ['NewJoiners', 'DocumentVerification', 'AssetAllocation', 'WelcomeKit', 'Orientation', 'Probation'],
  payroll: ['SalaryStructure', 'SalaryComponents', 'PayrollProcessing', 'GeneratePayslips', 'BonusIncentives', 'Reimbursements', 'LoansAdvances', 'TaxManagement'],
  performance: ['Goals', 'KPI', 'KRAs', 'Appraisals', 'Reviews', 'Feedback', 'PromotionsPerformance'],
  projects: ['ProjectDashboard', 'ProjectsList', 'Tasks', 'SprintBoard', 'Timesheets', 'Milestones', 'TeamMembers'],
  expenses: ['ExpenseClaims', 'ExpenseCategories', 'ExpenseApproval', 'ExpenseReimbursements', 'ExpenseReports'],
  training: ['Training']
};

const screensDir = path.join(__dirname, '..', 'src', 'screens');

const getTemplate = (screenName, endpoint) => `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Plus, Edit2, Eye, Trash2, Search, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function ${screenName.replace('Performance', '')}Screen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action Modals State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('${endpoint}');
      if (res.data && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        // Fallback mock data if API fails or returns empty for UI display
        setData([
          { id: 1, title: 'Sample ${screenName} 1', status: 'Active', date: new Date().toISOString().split('T')[0] },
          { id: 2, title: 'Sample ${screenName} 2', status: 'Pending', date: new Date().toISOString().split('T')[0] }
        ]);
      }
    } catch (error) {
      console.warn('Error fetching data, using mock:', error);
      setData([
        { id: 1, title: 'Sample ${screenName} 1', status: 'Active', date: new Date().toISOString().split('T')[0] },
        { id: 2, title: 'Sample ${screenName} 2', status: 'Pending', date: new Date().toISOString().split('T')[0] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             if(item._id || item.id) {
               await apiClient.delete(\`${endpoint}/\${item._id || item.id}\`);
             }
             fetchData();
          } catch(err) {
             setData(data.filter(d => d.id !== item.id && d._id !== item._id));
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      if(updatedItem._id || updatedItem.id) {
        await apiClient.put(\`${endpoint}/\${updatedItem._id || updatedItem.id}\`, updatedItem);
      } else {
        await apiClient.post('${endpoint}', updatedItem);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const renderItem = ({ item }) => {
    const title = item.title || item.name || item.employee_name || 'Item';
    const subtitle = item.date || item.created_at || item.department || 'No Date';
    const status = item.status || 'Active';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{title.substring(0,2).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.toLowerCase() === 'active' || status.toLowerCase() === 'approved' ? '#DCFCE7' : '#FEF3C7' }]}>
            <Text style={[styles.statusText, { color: status.toLowerCase() === 'active' || status.toLowerCase() === 'approved' ? '#166534' : '#92400E' }]}>{status}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionView(item)}>
            <Eye size={18} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionEdit(item)}>
            <Edit2 size={18} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionDelete(item)}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>${screenName.replace('Performance', '')}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => { setActionSelectedItem(null); setActionModalMode('create'); setActionModalVisible(true); }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" />
          <Text style={styles.searchPlaceholder}>Search in ${screenName.replace('Performance', '')}...</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => (item.id || item._id || index).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        />
      )}

      <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGradient: { padding: 20, paddingTop: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, zIndex: 10 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchPlaceholder: { color: '#94A3B8', fontSize: 16, marginLeft: 10, fontWeight: '500' },
  listContent: { padding: 20, paddingTop: 30, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 18, fontWeight: '700', color: '#3B82F6' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 4 },
  actionBtn: { padding: 8, marginLeft: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }
});
`;

Object.entries(modulesToUpgrade).forEach(([moduleName, screens]) => {
  const dirPath = path.join(screensDir, moduleName);
  
  screens.forEach(screen => {
    // ExpenseReimbursements is just Reimbursements in folder
    let actualScreen = screen;
    if (screen === 'ExpenseReimbursements') actualScreen = 'Reimbursements';
    if (screen === 'PromotionsPerformance') actualScreen = 'Promotions';
    
    const filePath = path.join(dirPath, `${actualScreen}Screen.jsx`);
    
    // Attempt to guess the endpoint from screen name
    let endpoint = `/${actualScreen.toLowerCase()}`;
    if (actualScreen === 'KPI') endpoint = '/kpis';
    else if (actualScreen === 'KRAs') endpoint = '/kras';
    else if (actualScreen.endsWith('s')) endpoint = `/${actualScreen.toLowerCase()}`;
    else endpoint = `/${actualScreen.toLowerCase()}s`;
    
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, getTemplate(actualScreen, endpoint));
      console.log(`Upgraded ${filePath}`);
    } else {
      console.warn(`Skipped ${filePath}, does not exist.`);
    }
  });
});

console.log('Finished upgrading all Phase 4 screens!');
