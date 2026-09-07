import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Linking } from 'react-native';
import { Search, UserPlus, Eye, Edit2, Trash2, MapPin, Briefcase, Mail, Phone, Calendar, Star, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function CandidatesScreen({ navigation }) {
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
      const res = await apiClient.get(`/candidates?page=${page}&limit=${limit}`);
      if (res.data?.success && res.data?.data?.candidates) {
        setData(res.data.data.candidates);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching candidates:', error);
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
    Alert.alert('Delete', 'Are you sure you want to delete this candidate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/candidates/${item.id}`);
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
        candidate_name: updatedItem.candidate_name || updatedItem.name,
        email: updatedItem.email,
        mobile_number: updatedItem.mobile_number || updatedItem.mobile,
        gender: updatedItem.gender || 'Male',
        department_id: updatedItem.department_id,
        job_position: updatedItem.job_position || updatedItem.job,
        date_of_birth: updatedItem.date_of_birth || updatedItem.dob,
        experience: updatedItem.experience,
        current_company: updatedItem.current_company || updatedItem.currentCompany,
        current_salary: updatedItem.current_salary || updatedItem.currentSalary,
        expected_salary: updatedItem.expected_salary || updatedItem.expectedSalary,
        notice_period: updatedItem.notice_period || updatedItem.noticePeriod,
        skills: updatedItem.skills,
        address: updatedItem.address,
        status: updatedItem.status || 'Applied'
      };

      if (updatedItem.id) {
        await apiClient.put(`/candidates/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/candidates', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const SCHEMA = [
    { key: 'candidate_name', label: 'Candidate Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text', required: true },
    { key: 'mobile_number', label: 'Mobile Number', type: 'text', required: true, keyboardType: 'phone-pad' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { key: 'department_id', label: 'Department', type: 'select', options: (meta.departments || []).map(d => ({ label: d.name, value: d.id })) },
    { key: 'job_position', label: 'Job Position', type: 'text', required: true },
    { key: 'date_of_birth', label: 'Date of Birth (YYYY-MM-DD)', type: 'text' },
    { key: 'experience', label: 'Experience (Years)', type: 'text', keyboardType: 'numeric' },
    { key: 'current_company', label: 'Current Company', type: 'text' },
    { key: 'current_salary', label: 'Current Salary', type: 'text', keyboardType: 'numeric' },
    { key: 'expected_salary', label: 'Expected Salary', type: 'text', keyboardType: 'numeric' },
    { key: 'notice_period', label: 'Notice Period (Days)', type: 'text', keyboardType: 'numeric' },
    { key: 'skills', label: 'Skills', type: 'text' },
    { key: 'address', label: 'Address', type: 'text', multiline: true },
    { key: 'status', label: 'Stage / Status', type: 'select', options: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Rejected', 'On Hold', 'Hired'] }
  ];

  const filteredData = data.filter(item => 
    (item.candidate_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.job_title || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStageColor = (status) => {
    switch (status) {
      case 'Applied': return { bg: '#EFF6FF', text: '#3B82F6' };
      case 'Shortlisted': return { bg: '#F5F3FF', text: '#8B5CF6' };
      case 'Interviewing':
      case 'Interview Scheduled': return { bg: '#FFFBEB', text: '#F59E0B' };
      case 'Offered': return { bg: '#F0FDF4', text: '#10B981' };
      case 'Hired': return { bg: '#ECFDF5', text: '#059669' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#EF4444' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderItem = ({ item }) => {
    const stage = item.status || 'Applied';
    const stageColors = getStageColor(stage);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.candidate_name || 'C').substring(0,2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.candidateName} numberOfLines={1}>{item.candidate_name}</Text>
              <Text style={styles.jobRole} numberOfLines={1}>{item.job_title || 'Position not specified'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: stageColors.bg }]}>
            <Text style={[styles.statusText, { color: stageColors.text }]}>{stage}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Mail size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.email || 'No Email'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Phone size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.mobile || 'No Phone'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              Applied: {item.applied_date ? new Date(item.applied_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric'}) : '--'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Star size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.experience || '0'} Yrs Exp.</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          {item.resume_path ? (
            <TouchableOpacity style={styles.resumeBtn} onPress={() => Linking.openURL(`https://madhura-hrm.onrender.com/app/resumes/${item.resume_path}`)}>
              <FileText size={14} color="#2563EB" />
              <Text style={styles.resumeText}>Resume</Text>
            </TouchableOpacity>
          ) : (
             <View style={{ flex: 1 }} />
          )}
          
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
            <Text style={styles.headerTitle}>Candidates</Text>
            <Text style={styles.headerSubtitle}>Manage and track candidates in pipeline</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setActionSelectedItem({});
            setActionModalMode('add');
            setActionModalVisible(true);
          }}>
            <UserPlus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email or job..."
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
              <Users size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No candidates found</Text>
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
          title={actionModalMode === 'add' ? 'Add Candidate' : actionModalMode === 'edit' ? 'Edit Candidate' : 'Candidate Details'}
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
  avatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  candidateName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  jobRole: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EFF6FF', borderRadius: 6 },
  resumeText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
