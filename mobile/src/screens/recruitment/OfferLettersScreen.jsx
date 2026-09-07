import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Search, Plus, Eye, Edit2, Trash2, Calendar, Briefcase, DollarSign, UserCheck, Clock, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function OfferLettersScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ departments: [] });
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/offers?page=${page}&limit=${limit}`);
      if (res.data?.success && res.data?.data?.offers) {
        setData(res.data.data.offers);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching offers:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit]);

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

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this offer letter?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/offers/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete offer');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        candidate_name: updatedItem.candidate_name || updatedItem.candidate,
        job_position: updatedItem.job_position || updatedItem.job,
        department_id: updatedItem.department_id,
        salary_offered: updatedItem.salary_offered || updatedItem.salaryOffered,
        joining_date: updatedItem.joining_date || updatedItem.joiningDate,
        reporting_manager: updatedItem.reporting_manager || updatedItem.reportingManager,
        employment_type: updatedItem.employment_type || updatedItem.employmentType,
        offer_expiry_date: updatedItem.offer_expiry_date || updatedItem.offerExpiryDate,
        notes: updatedItem.notes,
        status: updatedItem.status || 'Pending'
      };

      if (updatedItem.id) {
        await apiClient.put(`/offers/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/offers', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const SCHEMA = [
    { key: 'candidate_name', label: 'Candidate Name', type: 'text', required: true },
    { key: 'job_position', label: 'Job Position', type: 'text', required: true },
    { key: 'department_id', label: 'Department', type: 'select', options: (meta.departments || []).map(d => ({ label: d.name, value: d.id })) },
    { key: 'salary_offered', label: 'Salary Offered (Per Annum)', type: 'text', keyboardType: 'numeric', required: true },
    { key: 'joining_date', label: 'Joining Date (YYYY-MM-DD)', type: 'text', required: true },
    { key: 'reporting_manager', label: 'Reporting Manager', type: 'text', required: true },
    { key: 'employment_type', label: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
    { key: 'offer_expiry_date', label: 'Offer Expiry Date (YYYY-MM-DD)', type: 'text', required: true },
    { key: 'notes', label: 'Additional Notes / Clauses', type: 'text', multiline: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Accepted', 'Rejected'] }
  ];

  const filteredData = data.filter(item => 
    (item.candidate_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.job_position || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return { bg: '#ECFDF5', text: '#10B981' };
      case 'Pending': return { bg: '#FFFBEB', text: '#F59E0B' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#EF4444' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderItem = ({ item }) => {
    const status = item.status || 'Pending';
    const statusColors = getStatusColor(status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.candidateName} numberOfLines={1}>{item.candidate_name}</Text>
            <Text style={styles.jobText} numberOfLines={1}>{item.job_position} • {item.department_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <DollarSign size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.salary_offered}</Text>
          </View>
          <View style={styles.detailItem}>
            <UserCheck size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>Mgr: {item.reporting_manager}</Text>
          </View>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              Join: {item.joining_date ? new Date(item.joining_date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              Exp: {item.offer_expiry_date ? new Date(item.offer_expiry_date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.downloadBtn}>
            <Download size={14} color="#2563EB" />
            <Text style={styles.downloadText}>Download PDF</Text>
          </TouchableOpacity>
          
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
            <Text style={styles.headerTitle}>Offer Letters</Text>
            <Text style={styles.headerSubtitle}>Generate and manage offers</Text>
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
              placeholder="Search candidate or job..."
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
              <Briefcase size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No offer letters found</Text>
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
          title={actionModalMode === 'add' ? 'Create Offer' : actionModalMode === 'edit' ? 'Edit Offer' : 'Offer Details'}
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
  candidateName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  jobText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EFF6FF', borderRadius: 6 },
  downloadText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
