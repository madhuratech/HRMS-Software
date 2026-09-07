const fs = require('fs');
const path = require('path');

const screensToGenerate = {
  documents: ['EmployeeDocumentsModule', 'CompanyDocuments', 'HRPolicies', 'Templates', 'DigitalSignatures'],
  helpdesk: ['HelpDeskDashboard', 'Tickets', 'Categories', 'Priorities', 'KnowledgeBase', 'HelpDeskReports'],
  settings: ['SettingsCompany', 'SettingsBranding', 'SettingsOrganization', 'SettingsUsers', 'SettingsHR', 'SettingsCommunication', 'SettingsIntegrations', 'SettingsSecurity', 'SettingsSystem'],
  ai: ['AIAssistant'],
  reports: ['EmployeeReports', 'AttendanceReportsModule', 'LeaveReports', 'PayrollReportsModule', 'RecruitmentReports', 'PerformanceReports', 'ProjectReports'],
  leave: ['HolidayList'],
  payroll: ['PayrollReports']
};

const screensDir = path.join(__dirname, '..', 'src', 'screens');
const navDir = path.join(__dirname, '..', 'src', 'navigation');
const navFilePath = path.join(navDir, 'DrawerNavigator.jsx');

const getTemplate = (screenName, moduleName) => `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Plus, Edit2, Eye, Trash2, Search, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function ${screenName}Screen({ navigation }) {
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
      // Mocking fetch for this premium layout
      setTimeout(() => {
        setData([
          { id: 1, title: 'Sample Item 1', status: 'Active', date: '2023-10-01' },
          { id: 2, title: 'Sample Item 2', status: 'Pending', date: '2023-10-05' },
          { id: 3, title: 'Sample Item 3', status: 'Completed', date: '2023-10-10' }
        ]);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          setData(data.filter(d => d.id !== item.id));
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    setActionModalVisible(false);
    fetchData();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{item.title.substring(0,2).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#DCFCE7' : '#FEF3C7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? '#166534' : '#92400E' }]}>{item.status}</Text>
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

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>${screenName}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => { setActionSelectedItem(null); setActionModalMode('create'); setActionModalVisible(true); }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" />
          <Text style={styles.searchPlaceholder}>Search in ${screenName}...</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
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

Object.entries(screensToGenerate).forEach(([moduleName, screens]) => {
  const dirPath = path.join(screensDir, moduleName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  screens.forEach(screen => {
    const filePath = path.join(dirPath, `${screen}Screen.jsx`);
    fs.writeFileSync(filePath, getTemplate(screen, moduleName));
    console.log(`Created ${filePath}`);
  });
});

console.log('Finished scaffolding Phase 4 screens!');
