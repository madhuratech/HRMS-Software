import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, ScrollView, Alert } from 'react-native';
import { Plus, Search, CheckCircle, Clock, AlertTriangle, Award, Edit2, Trash2, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function PromotionsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState({ total: 0, approved: 0, pending: 0, today: 0 });
  const [meta, setMeta] = useState({ employees: [] });

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, promotionsRes] = await Promise.all([
        apiClient.get('/promotions/dashboard').catch(() => null),
        apiClient.get('/promotions?page=1&limit=50').catch(() => null)
      ]);

      if (dashboardRes?.data?.success) {
        setKpiData(dashboardRes.data.data);
      }

      if (promotionsRes?.data?.success && promotionsRes.data.data.promotions) {
        setData(promotionsRes.data.data.promotions);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching promotions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiClient.get('/employees');
      const employeesList = res.data?.data?.employees || res.data || [];
      setMeta({ employees: employeesList });
    } catch (e) {
      console.warn('Meta fetch error');
    }
  }, []);

  useEffect(() => {
    fetchMeta();
    fetchData();
  }, [fetchData, fetchMeta]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete Promotion', `Are you sure you want to delete this promotion for ${item.employee_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/app/promotions/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete promotion');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        employee_id: updatedItem.employee_id ? parseInt(updatedItem.employee_id, 10) : null,
        current_department: updatedItem.current_department || updatedItem.department || '',
        current_designation: updatedItem.current_designation || updatedItem.currentRole || '',
        promoted_department: updatedItem.current_department || updatedItem.department || '', // assuming same
        promoted_designation: updatedItem.promoted_designation || updatedItem.proposedRole || '',
        promotion_date: updatedItem.promotion_date || new Date().toISOString().split('T')[0],
        effective_date: updatedItem.effective_date || updatedItem.effectiveDate || '',
        promotion_reason: updatedItem.promotion_reason || updatedItem.justification || '',
        status: updatedItem.status || 'Pending'
      };

      if (updatedItem.id) {
        await apiClient.put(`/app/promotions/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/app/promotions', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const SCHEMA = [
    { key: 'employee_id', label: 'Employee', type: 'select', options: (meta.employees || []).map(e => ({ label: e.name || e.employee_name, value: e.id })) },
    { key: 'current_department', label: 'Current Department', type: 'text' },
    { key: 'current_designation', label: 'Current Role', type: 'text' },
    { key: 'promoted_designation', label: 'Proposed Role / Designation', type: 'text', required: true },
    { key: 'effective_date', label: 'Effective Date (YYYY-MM-DD)', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
    { key: 'promotion_reason', label: 'Justification Remarks', type: 'text', multiline: true }
  ];

  const filteredData = data.filter(p => 
    (p.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.current_designation || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.promoted_designation || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('approved')) return '#10B981';
    if (s.includes('rejected')) return '#EF4444';
    if (s.includes('pending')) return '#F59E0B';
    return '#64748B';
  };

  const renderKPIs = () => (
    <View style={styles.kpiContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Award size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Total</Text>
          <Text style={styles.kpiValue}>{kpiData.total || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle size={24} color="#10B981" />
          </View>
          <Text style={styles.kpiLabel}>Approved</Text>
          <Text style={styles.kpiValue}>{kpiData.approved || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={24} color="#F59E0B" />
          </View>
          <Text style={styles.kpiLabel}>Pending</Text>
          <Text style={styles.kpiValue}>{kpiData.pending || 0}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.employeeName} numberOfLines={1}>{item.employee_name}</Text>
            <Text style={styles.deptText}>{item.current_department || 'Department N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status || 'Pending'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.roleTransition}>
          <View style={styles.roleCol}>
            <Text style={styles.roleLabel}>From</Text>
            <Text style={styles.roleValue} numberOfLines={2}>{item.current_designation || 'N/A'}</Text>
          </View>
          <View style={styles.roleIconWrapper}>
             <ArrowRight size={20} color="#94A3B8" />
          </View>
          <View style={[styles.roleCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.roleLabel}>To</Text>
            <Text style={[styles.roleValue, { color: '#10B981' }]} numberOfLines={2}>{item.promoted_designation || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.dateText}>
              Effective: {item.effective_date ? new Date(item.effective_date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
          
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionEdit(item)}>
              <Edit2 size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionDelete(item)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Promotions</Text>
            <Text style={styles.headerSubtitle}>Manage employee role transitions</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setActionSelectedItem({});
            setActionModalMode('add');
            setActionModalVisible(true);
          }}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search employee or role..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      </LinearGradient>

      {renderKPIs()}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Award size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No promotions found</Text>
            </View>
          }
        />
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={SCHEMA}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Create Promotion' : 'Edit Promotion'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  searchRow: { flexDirection: 'row', gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  kpiContainer: { marginVertical: 16 },
  kpiScroll: { paddingHorizontal: 16, gap: 12 },
  kpiCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, minWidth: 140, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  kpiLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  kpiValue: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  employeeName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  deptText: { fontSize: 13, color: '#64748B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6, marginLeft: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  roleTransition: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roleCol: { flex: 1 },
  roleLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  roleValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  roleIconWrapper: { paddingHorizontal: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 15, color: '#94A3B8', fontWeight: '500' }
});
