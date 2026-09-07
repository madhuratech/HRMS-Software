import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, ToastAndroid, Platform, Alert } from 'react-native';
import { Search, Plus, MapPin, X, ArrowRightLeft, ChevronLeft, Eye, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function TransfersScreen() {

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
            await apiClient.delete(`/employees/transfers/${item.id || item._id}`);
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
        await apiClient.post('/employees/transfers', { 
          employeeId: updatedItem.employeeId, 
          transferType: updatedItem.transferType,
          newValueName: updatedItem.newValue, 
          effectiveDate: updatedItem.effectiveDate || new Date().toISOString().split('T')[0]
        });
        showToast('Transfer Requested Successfully!');
      } else {
        if (updatedItem.id || updatedItem._id) {
          await apiClient.put(`/employees/transfers/${updatedItem.id || updatedItem._id}`, updatedItem);
        }
      }
      setActionModalVisible(false);
      if (typeof fetchData === 'function') fetchData();
      if (typeof loadData === 'function') loadData();
      if (typeof fetchDocuments === 'function') fetchDocuments();
      if (typeof fetchAppraisals === 'function') fetchAppraisals();
      if (typeof fetchProjects === 'function') fetchProjects();
      fetchTransfers();
    } catch (err) {
      console.error('Update error:', err);
      showToast('Failed to request transfer.');
    }
  };

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees/transfers');
      if (Array.isArray(res.data)) {
        setTransfers(res.data);
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      alert(message);
    }
  };

  const handleApprove = async (transferId) => {
    try {
      await apiClient.put(`/employees/transfers/${transferId}/approve`, { approverId: 1 });
      showToast('Transfer Approved!');
      fetchTransfers();
    } catch (err) {
      console.error('Error approving transfer:', err);
      showToast('Failed to approve transfer.');
    }
  };

  const filtered = transfers.filter(t => 
    t.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.transfer_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <ArrowRightLeft size={20} color='#2563EB' />
          </View>
          <View>
            <Text style={styles.empName}>{item.employee_name}</Text>
            <Text style={styles.dateText}>Effective: {new Date(item.effective_date || item.transfer_date).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.typeBadge}>
          <MapPin size={14} color='#6B7280' />
          <Text style={styles.typeText}>{item.transfer_type} Transfer</Text>
        </View>
        <Text style={styles.reasonText}>{item.reason || "Initiated transfer request"}</Text>
        {item.status === 'Pending' && (
          <TouchableOpacity 
            style={{ marginTop: 12, backgroundColor: '#10B981', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
            onPress={() => handleApprove(item.id)}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Approve Transfer</Text>
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
            <Text style={styles.pageTitle}>Transfers</Text>
            <Text style={styles.pageSubtitle}>Manage employee transfers</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleActionAdd}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.gradientBtn}>
              <Plus size={18} color='#FFFFFF' />
              <Text style={styles.addButtonText}>Request</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search transfers..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
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
              <Text style={styles.emptyText}>No transfers found</Text>
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
          { key: 'transferType', label: 'Transfer Type', type: 'select', options: ['Department', 'Branch', 'Manager'], required: true },
          { key: 'newValue', label: 'New Value (Department/Branch/Manager Name)', required: true },
          { key: 'effectiveDate', label: 'Effective Date (YYYY-MM-DD)' }
        ]}
        title={actionModalMode === 'add' ? 'Request Transfer' : actionModalMode === 'edit' ? 'Edit Transfer' : 'Transfer Details'}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  pageHeader: { padding: 24, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTextContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  addButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
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
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  typeText: { fontSize: 12, color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  reasonText: { fontSize: 15, color: '#1E293B', fontWeight: '600' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
});
