import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, Calendar, Briefcase, ChevronRight, User, CheckCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

const createTimesheetSchema = (meta) => [
  { key: 'employee_id', label: 'Employee', type: 'select', options: (meta?.employees || []).map(e => ({ label: e.name, value: e.id })), required: true },
  { key: 'project_id', label: 'Project', type: 'select', options: (meta?.projects || []).map(p => ({ label: p.name, value: p.id })), required: true },
  { key: 'log_date', label: 'Date (YYYY-MM-DD)', required: true },
  { key: 'hours', label: 'Hours Logged', keyboardType: 'numeric', required: true },
  { key: 'billable', label: 'Billable Type', type: 'select', options: ['Billable', 'Non-Billable'] },
  { key: 'status', label: 'Approval Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
  { key: 'task_description', label: 'Task Description', multiline: true }
];

export default function TimesheetsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);
  
  const [meta, setMeta] = useState({ employees: [], projects: [] });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [res, metaRes] = await Promise.all([
        apiClient.get(`/timesheets?page=${page}&limit=${limit}`).catch(() => null),
        apiClient.get('/projects/meta').catch(() => null)
      ]);
      
      if (metaRes?.data?.success && metaRes.data.data) {
        setMeta(metaRes.data.data);
      }

      if (res?.data?.success && res.data?.data?.timesheets) {
        setData(res.data.data.timesheets);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching timesheets:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleActionEdit = (item) => { 
    setActionSelectedItem({
      ...item,
      employee_id: item.employee_id ? parseInt(item.employee_id) : '',
      project_id: item.project_id ? parseInt(item.project_id) : '',
      log_date: item.log_date ? item.log_date.slice(0,10) : '',
      hours: item.hours ? String(item.hours) : '',
      billable: item.billable === 'Billable' ? 'Billable' : 'Non-Billable',
      status: item.status || 'Pending'
    }); 
    setActionModalMode('edit'); 
    setActionModalVisible(true); 
  };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this timesheet entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/timesheets/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete timesheet');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        ...updatedItem,
        employee_id: parseInt(updatedItem.employee_id),
        project_id: parseInt(updatedItem.project_id),
        hours: parseFloat(updatedItem.hours)
      };
      if (updatedItem.id) {
        await apiClient.put(`/timesheets/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/timesheets', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const filteredData = data.filter(item => 
    (item.employee_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.project_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.task_description || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#DCFCE7', text: '#15803D' };
      case 'Pending': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Rejected': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const renderItem = ({ item }) => {
    const status = item.status || 'Pending';
    const statusColors = getStatusColor(status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.employeeName} numberOfLines={1}>{item.employee_name}</Text>
            <Text style={styles.projectName} numberOfLines={1}>{item.project_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.log_date ? new Date(item.log_date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.hours} Hrs</Text>
          </View>
          <View style={styles.detailItemFull}>
            <CheckCircle size={14} color="#64748B" />
            <Text style={styles.detailTextFull} numberOfLines={2}>{item.task_description || 'No Description'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.billableBadge}>
            <Text style={[styles.billableText, { color: item.billable === 'Billable' ? '#2563EB' : '#64748B' }]}>{item.billable}</Text>
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
            <Text style={styles.headerTitle}>Timesheets</Text>
            <Text style={styles.headerSubtitle}>Manage employee work logs</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setActionSelectedItem({ billable: 'Billable', status: 'Pending' });
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
              placeholder="Search timesheets..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Clock size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No timesheets found</Text>
            </View>
          }
        />
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={createTimesheetSchema(meta)}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Log Time' : actionModalMode === 'edit' ? 'Edit Log' : 'Log Details'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: '#64748B' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  searchRow: { flexDirection: 'row', gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  employeeName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  projectName: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  detailItemFull: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  detailTextFull: { fontSize: 12, color: '#475569', flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billableBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  billableText: { fontSize: 10, fontWeight: '600' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
