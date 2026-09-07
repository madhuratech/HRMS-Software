import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, ToastAndroid, Platform, Alert } from 'react-native';
import { Search, Plus, MoreVertical, Award, X, CheckCircle, TrendingUp, IndianRupee, ChevronLeft, Eye, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function PromotionsScreen() {

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
            await apiClient.delete(`/employees/promotions/${item.id || item._id}`);
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
        const res = await apiClient.post('/employees/promotions', { 
          employeeId: updatedItem.employeeId, 
          newDesignationName: updatedItem.newDesignationName,
          newSalary: updatedItem.newSalary ? parseFloat(updatedItem.newSalary) : null,
          effectiveDate: updatedItem.effectiveDate || new Date().toISOString().split('T')[0]
        });
        showToast('Promotion Successful! Salary updated automatically.');
      } else {
        if (updatedItem.id || updatedItem._id) {
          await apiClient.put(`/employees/promotions/${updatedItem.id || updatedItem._id}`, updatedItem);
        }
      }
      setActionModalVisible(false);
      if (typeof fetchData === 'function') fetchData();
      if (typeof loadData === 'function') loadData();
      if (typeof fetchDocuments === 'function') fetchDocuments();
      if (typeof fetchAppraisals === 'function') fetchAppraisals();
      if (typeof fetchProjects === 'function') fetchProjects();
      fetchPromotions();
    } catch (err) {
      console.error('Update error:', err);
      showToast('Failed to promote employee.');
    }
  };

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees/promotions');
      if (Array.isArray(res.data)) {
        setPromotions(res.data);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
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

  const filtered = promotions.filter(p => 
    p.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.new_designation?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
            <Award size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.empName}>{item.employee_name}</Text>
            <Text style={styles.dateText}>Effective: {new Date(item.effective_date || item.promotion_date).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.promotionFlow}>
          <View style={styles.flowCol}>
            <Text style={styles.flowLabel}>Previous Role</Text>
            <Text style={styles.flowValue}>{item.old_designation || item.previous_designation}</Text>
          </View>
          <View style={styles.flowArrow}>
            <TrendingUp size={24} color='#2563EB' />
          </View>
          <View style={styles.flowCol}>
            <Text style={styles.flowLabel}>New Role</Text>
            <Text style={[styles.flowValue, { color: '#2563EB' }]}>{item.new_designation}</Text>
          </View>
        </View>

        {item.reason && (
          <Text style={styles.reasonText}>Reason: {item.reason}</Text>
        )}
      
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
            <Text style={styles.pageTitle}>Promotions</Text>
            <Text style={styles.pageSubtitle}>Manage employee role changes</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleActionAdd}>
            <LinearGradient colors={['#2563EB', '#2563EB']} style={styles.gradientBtn}>
              <Plus size={18} color='#FFFFFF' />
              <Text style={styles.addButtonText}>Promote</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search promotions..." 
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
              <Text style={styles.emptyText}>No promotions found</Text>
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
          { key: 'newDesignationName', label: 'New Designation', required: true },
          { key: 'newSalary', label: 'New Salary (Optional)', keyboardType: 'numeric' },
          { key: 'effectiveDate', label: 'Effective Date (YYYY-MM-DD)' }
        ]}
        title={actionModalMode === 'add' ? 'Request Promotion' : actionModalMode === 'edit' ? 'Edit Promotion' : 'Promotion Details'}
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

  addButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
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
  promotionFlow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16 },
  flowCol: { flex: 1 },
  flowLabel: { fontSize: 11, color: '#6B7280', fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  flowValue: { fontSize: 15, color: '#1E293B', fontWeight: '800' },
  flowArrow: { width: 40, alignItems: 'center' },
  reasonText: { marginTop: 12, fontSize: 13, color: '#475569', fontStyle: 'italic', fontWeight: '500' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' }
});
