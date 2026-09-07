import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { Plus, Edit2, Eye, Trash2, Search, Filter, Briefcase, MapPin, Users, Calendar, Clock, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function JobOpeningsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ departments: [], designations: [], employees: [], branches: [], companies: [] });

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchMeta = async () => {
    try {
      const res = await apiClient.get('/requirements/meta/all');
      if (res.data?.departments) setMeta(res.data);
    } catch (e) {
      console.warn('Meta fetch error');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ search, page, limit: 10 }).toString();
      const res = await apiClient.get(`/requirements?${query}`);
      if (res.data?.success && res.data?.data?.requirements) {
        setData(res.data.data.requirements);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching jobs:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchData();
  }, [search, page]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this job opening?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/requirements/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        job_title: updatedItem.job_title || updatedItem.title,
        department_id: updatedItem.department_id,
        designation_id: updatedItem.designation_id,
        employment_type: updatedItem.employment_type,
        vacancies: updatedItem.vacancies ? parseInt(updatedItem.vacancies) : null,
        priority: updatedItem.priority,
        experience_from: updatedItem.experience_from ? parseInt(updatedItem.experience_from) : 0,
        experience_to: updatedItem.experience_to ? parseInt(updatedItem.experience_to) : 0,
        salary_from: updatedItem.salary_from ? parseFloat(updatedItem.salary_from) : null,
        salary_to: updatedItem.salary_to ? parseFloat(updatedItem.salary_to) : null,
        location: updatedItem.location,
        hiring_manager: updatedItem.hiring_manager || null,
        requested_by: updatedItem.requested_by || null,
        opening_date: updatedItem.opening_date,
        closing_date: updatedItem.closing_date,
        job_description: updatedItem.job_description,
        skills: updatedItem.skills,
        status: updatedItem.status || 'Open',
        education: updatedItem.education || null,
        responsibilities: updatedItem.responsibilities || null,
        requirements: updatedItem.requirements || null,
        remarks: updatedItem.remarks || null,
        company_id: updatedItem.company_id || null,
        branch_id: updatedItem.branch_id || null
      };

      if (updatedItem.id) {
        await apiClient.put(`/requirements/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/requirements', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const SCHEMA = [
    { key: 'job_title', label: 'Job Title', type: 'text', required: true },
    { key: 'department_id', label: 'Department', type: 'select', options: (meta.departments || []).map(d => ({ label: d.name, value: d.id })) },
    { key: 'designation_id', label: 'Designation', type: 'select', options: (meta.designations || []).map(d => ({ label: d.name, value: d.id })) },
    { key: 'employment_type', label: 'Employment Type', type: 'select', options: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Temporary', 'Freelancer', 'Remote', 'Hybrid'] },
    { key: 'location', label: 'Job Location', type: 'text' },
    { key: 'vacancies', label: 'Number of Vacancies', type: 'text', keyboardType: 'numeric' },
    { key: 'experience_from', label: 'Experience From (Years)', type: 'text', keyboardType: 'numeric' },
    { key: 'experience_to', label: 'Experience To (Years)', type: 'text', keyboardType: 'numeric' },
    { key: 'salary_from', label: 'Salary From', type: 'text', keyboardType: 'numeric' },
    { key: 'salary_to', label: 'Salary To', type: 'text', keyboardType: 'numeric' },
    { key: 'hiring_manager', label: 'Hiring Manager', type: 'select', options: (meta.employees || []).map(e => ({ label: e.name, value: e.id })) },
    { key: 'requested_by', label: 'Requested By', type: 'select', options: (meta.employees || []).map(e => ({ label: e.name, value: e.id })) },
    { key: 'opening_date', label: 'Opening Date (YYYY-MM-DD)', type: 'text' },
    { key: 'closing_date', label: 'Closing Date (YYYY-MM-DD)', type: 'text' },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    { key: 'branch_id', label: 'Branch', type: 'select', options: (meta.branches || []).map(b => ({ label: b.name, value: b.id })) },
    { key: 'company_id', label: 'Company', type: 'select', options: (meta.companies || []).map(c => ({ label: c.name, value: c.id })) },
    { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed', 'Draft', 'Pending', 'Approved'] },
    { key: 'job_description', label: 'Job Description', type: 'text', multiline: true },
    { key: 'skills', label: 'Skills Required', type: 'text' }
  ];

  const renderItem = ({ item }) => {
    const status = item.status || 'Open';
    
    let statusColor = '#3B82F6';
    let statusBg = '#EFF6FF';
    
    if (status === 'Open') { statusColor = '#10B981'; statusBg = '#ECFDF5'; }
    if (status === 'Pending Approval') { statusColor = '#F59E0B'; statusBg = '#FFFBEB'; }
    if (status === 'Closed') { statusColor = '#EF4444'; statusBg = '#FEF2F2'; }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={styles.jobTitle} numberOfLines={1}>{item.job_title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
              </View>
            </View>
            <Text style={styles.jobCode}>{item.requirement_code} • {item.department_name}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleActionEdit(item)}>
            <Edit2 size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Briefcase size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.employment_type}</Text>
          </View>
          <View style={styles.detailItem}>
            <Users size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.vacancies} Vacancies</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.experience_from}-{item.experience_to} Yrs</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.dateBox}>
            <Calendar size={14} color="#94A3B8" />
            <Text style={styles.dateText}>
              {new Date(item.opening_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionView(item)}>
              <Eye size={16} color="#2563EB" />
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
            <Text style={styles.headerTitle}>Job Openings</Text>
            <Text style={styles.headerSubtitle}>Manage recruitment requirements</Text>
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
              placeholder="Search jobs..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Briefcase size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No job openings found</Text>
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
          title={actionModalMode === 'add' ? 'Add Job Opening' : actionModalMode === 'edit' ? 'Edit Job Opening' : 'Job Details'}
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
  filterBtn: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1 },
  jobCode: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  editBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
