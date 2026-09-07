import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Search, Plus, DoorOpen, X, AlertCircle, ChevronLeft, Eye, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function ExitManagementScreen() {

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  const handleActionAdd = () => { setActionSelectedItem(null); setActionModalMode('add'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/employees/exits/${item.id || item._id}`);
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
      if (actionModalMode === 'add') {
        await apiClient.post('/employees/exits', { 
          employeeId: updatedItem.employeeId, 
          exitType: updatedItem.exitType,
          noticeDate: updatedItem.noticeDate || new Date().toISOString().split('T')[0],
          exitDate: updatedItem.exitDate,
          reason: updatedItem.reason
        });
      } else {
        if (updatedItem.id || updatedItem._id) {
          await apiClient.put(`/employees/exits/${updatedItem.id || updatedItem._id}`, updatedItem);
        }
      }
      setActionModalVisible(false);
      if (typeof fetchData === 'function') fetchData();
      if (typeof loadData === 'function') loadData();
      if (typeof fetchDocuments === 'function') fetchDocuments();
      if (typeof fetchAppraisals === 'function') fetchAppraisals();
      if (typeof fetchProjects === 'function') fetchProjects();
      fetchExits();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const [exits, setExits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExits();
  }, []);

  const fetchExits = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees/exits');
      if (Array.isArray(res.data)) {
        setExits(res.data);
      }
    } catch (err) {
      console.error('Error fetching exits:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation();

  const handleSettle = async (exitId) => {
    try {
      await apiClient.put(`/employees/exits/${exitId}/settle`);
      alert('Exit settled and employee deactivated!');
      fetchExits();
    } catch (err) {
      console.error('Error settling exit:', err);
      alert('Failed to settle exit.');
    }
  };

  const filtered = exits.filter(e => 
    e.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.exit_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Settled': return '#10B981';
      case 'Rejected': return '#EF4444';
      case 'Approved': return '#3B82F6';
      default: return '#F59E0B'; // Pending
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: item.exit_type === 'Termination' ? '#FEF2F2' : '#FFF7ED' }]}>
            <DoorOpen size={20} color={item.exit_type === 'Termination' ? '#EF4444' : '#F97316'} />
          </View>
          <View>
            <Text style={styles.empName}>{item.employee_name}</Text>
            <Text style={styles.dateText}>Exit Date: {new Date(item.exit_date).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{item.exit_type}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Notice Date</Text>
            <Text style={styles.infoValue}>{item.notice_date ? new Date(item.notice_date).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>
        {item.reason && (
          <View style={styles.reasonBox}>
            <AlertCircle size={16} color='#6B7280' />
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>
        )}
        {item.status === 'Pending' && (
          <TouchableOpacity 
            style={{ marginTop: 12, backgroundColor: '#10B981', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
            onPress={() => handleSettle(item.id)}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Settle Exit</Text>
          </TouchableOpacity>
        )}
      </View>
    
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
    
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.pageHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Exit Records</Text>
            <Text style={styles.pageSubtitle}>Manage employee departures</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleActionAdd}>
            <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.gradientBtn}>
              <Plus size={20} color='#FFFFFF' />
              <Text style={styles.addButtonText}>New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search exits..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No exit records found</Text>
            </View>
          }
        />
      )}

      <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        schema={[
          { key: 'employeeId', label: 'Employee ID', required: true, keyboardType: 'numeric' },
          { key: 'exitType', label: 'Type', type: 'select', options: ['Resignation', 'Termination', 'Retirement', 'Absconding'], required: true },
          { key: 'noticeDate', label: 'Notice Date (YYYY-MM-DD)' },
          { key: 'exitDate', label: 'Exit Date (YYYY-MM-DD)', required: true },
          { key: 'reason', label: 'Reason (Optional)', multiline: true }
        ]}
        title={actionModalMode === 'add' ? 'Initiate Exit' : actionModalMode === 'edit' ? 'Edit Exit Record' : 'Exit Details'}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  pageHeader: { 
    paddingHorizontal: 24, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTextContainer: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  addButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  toolbar: { padding: 24, paddingBottom: 16 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 24, paddingBottom: 24 },

  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  empName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 2 },
  dateText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginVertical: 16 },
  cardBody: {},
  infoGrid: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  infoBlock: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#1E293B', fontWeight: '700' },
  reasonBox: { flexDirection: 'row', gap: 10, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12 },
  reasonText: { fontSize: 14, color: '#475569', flex: 1, lineHeight: 20, fontWeight: '500' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
});
