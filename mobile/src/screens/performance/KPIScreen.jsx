import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, ScrollView, Alert } from 'react-native';
import { Plus, Search, CheckCircle, Target, TrendingUp, Edit2, Trash2, PieChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function KPIScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState({ total: 0, active: 0, inactive: 0 });
  const [meta, setMeta] = useState({ departments: [] });

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, kpisRes] = await Promise.all([
        apiClient.get('/kpis/dashboard').catch(() => null),
        apiClient.get('/kpis?page=1&limit=50').catch(() => null)
      ]);

      if (dashboardRes?.data?.success) {
        setKpiData(dashboardRes.data.data);
      }

      if (kpisRes?.data?.success && kpisRes.data.data.kpis) {
        setData(kpisRes.data.data.kpis);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiClient.get('/requirements/meta/all');
      if (res.data?.departments) {
        setMeta(res.data);
      }
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
    Alert.alert('Delete KPI', `Are you sure you want to delete ${item.kpi_name || item.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/app/kpis/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete KPI');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const rawWeight = updatedItem.weightage ? String(updatedItem.weightage).replace('%', '').trim() : '';
      const parsedWeight = rawWeight ? parseInt(rawWeight, 10) : null;
      const parsedDept = parseInt(updatedItem.department_id, 10);

      const payload = {
        kpi_name: updatedItem.kpi_name || updatedItem.title,
        title: updatedItem.kpi_name || updatedItem.title,
        department_id: isNaN(parsedDept) ? null : parsedDept,
        weightage: isNaN(parsedWeight) ? null : parsedWeight,
        target_value: updatedItem.target_value,
        description: updatedItem.description || '',
        status: updatedItem.status || 'Active'
      };

      if (updatedItem.id) {
        await apiClient.put(`/app/kpis/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/app/kpis', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const SCHEMA = [
    { key: 'kpi_name', label: 'KPI Name', type: 'text', required: true },
    { key: 'department_id', label: 'Department', type: 'select', options: (meta.departments || []).map(d => ({ label: d.name, value: d.id })) },
    { key: 'weightage', label: 'Weightage (e.g., 20%)', type: 'text', keyboardType: 'numeric' },
    { key: 'target_value', label: 'Target Value', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
    { key: 'description', label: 'Description', type: 'text', multiline: true }
  ];

  const filteredData = data.filter(k => 
    (k.kpi_name || k.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (k.department_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderKPIs = () => (
    <View style={styles.kpiContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <PieChart size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Total KPIs</Text>
          <Text style={styles.kpiValue}>{kpiData.total || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle size={24} color="#10B981" />
          </View>
          <Text style={styles.kpiLabel}>Active KPIs</Text>
          <Text style={styles.kpiValue}>{kpiData.active || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
            <Target size={24} color="#EF4444" />
          </View>
          <Text style={styles.kpiLabel}>Inactive</Text>
          <Text style={styles.kpiValue}>{kpiData.inactive || 0}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const isActive = item.status === 'Active';
    const title = item.kpi_name || item.title || 'Untitled KPI';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.kpiTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.deptText}>{item.department_name || 'Department N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? '#ECFDF5' : '#F1F5F9' }]}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#64748B' }]} />
            <Text style={[styles.statusText, { color: isActive ? '#10B981' : '#64748B' }]}>{item.status || 'Active'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
           <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{item.target_value || 'N/A'}</Text>
           </View>
           <View style={styles.detailDivider} />
           <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Weightage</Text>
              <Text style={styles.detailValue}>{item.weightage ? `${item.weightage}%` : 'N/A'}</Text>
           </View>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
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
            <Text style={styles.headerTitle}>KPIs</Text>
            <Text style={styles.headerSubtitle}>Key Performance Indicators</Text>
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
              placeholder="Search by title or department..."
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
              <PieChart size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No KPIs found</Text>
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
          title={actionModalMode === 'add' ? 'Create KPI' : 'Edit KPI'}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  kpiTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  deptText: { fontSize: 13, color: '#64748B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  detailDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginHorizontal: 16 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 15, color: '#94A3B8', fontWeight: '500' }
});
