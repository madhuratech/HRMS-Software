import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Image } from 'react-native';
import { Search, Plus, Edit2, Trash2, Users, Briefcase, Mail, Phone, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

const createTeamMemberSchema = (meta) => [
  { key: 'employee_id', label: 'Employee', type: 'select', options: (meta?.employees || []).map(e => ({ label: e.name, value: e.id })), required: true },
  { key: 'project_id', label: 'Project', type: 'select', options: (meta?.projects || []).map(p => ({ label: p.name, value: p.id })), required: true },
  { key: 'role', label: 'Role', type: 'select', options: (meta?.roles?.length ? meta.roles : ['Team Member']) },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'On Leave'] }
];

export default function TeamMembersScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);
  const [meta, setMeta] = useState({ employees: [], projects: [], roles: [] });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [res, metaRes] = await Promise.all([
        apiClient.get('/project-team').catch(() => null),
        apiClient.get('/project-team/meta').catch(() => null)
      ]);
      
      if (metaRes?.data?.success && metaRes.data.data) {
        setMeta(metaRes.data.data);
      }

      if (res?.data?.success && Array.isArray(res.data?.data)) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching team members:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      role: item.role || 'Team Member',
      status: item.status || 'Active'
    }); 
    setActionModalMode('edit'); 
    setActionModalVisible(true); 
  };
  
  const handleActionDelete = (item) => {
    Alert.alert('Remove Member', `Are you sure you want to remove ${item.name} from the project team?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/project-team/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to remove team member');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        ...updatedItem,
        employee_id: parseInt(updatedItem.employee_id),
        project_id: parseInt(updatedItem.project_id)
      };
      if (updatedItem.id) {
        await apiClient.put(`/project-team/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/project-team', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const filteredData = data.filter(item => 
    (item.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { bg: '#DCFCE7', text: '#15803D' };
      case 'On Leave': return { bg: '#FEF3C7', text: '#D97706' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getAvatarFallback = (name = '') => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  const renderItem = ({ item }) => {
    const status = item.status || 'Active';
    const statusColors = getStatusColor(status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getAvatarFallback(item.name)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.memberRole} numberOfLines={1}>{item.role} • {item.department}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Projects</Text>
            <Text style={styles.statValue}>{item.assignedProjects || 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Open Tasks</Text>
            <Text style={styles.statValue}>{item.openTasks || 0}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionEdit(item)}>
              <Edit2 size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionDelete(item)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.viewBtn}>
            <Text style={styles.viewText}>View Profile</Text>
            <ChevronRight size={14} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Team Members</Text>
            <Text style={styles.headerSubtitle}>Manage project assignments and roles</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setActionSelectedItem({ role: 'Team Member', status: 'Active' });
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
              placeholder="Search team members..."
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
              <Text style={styles.emptyText}>No team members found</Text>
            </View>
          }
        />
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={createTeamMemberSchema(meta)}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Assign Member' : actionModalMode === 'edit' ? 'Edit Assignment' : 'Member Details'}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#1D4ED8' },
  memberName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  memberRole: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#F8FAFC', paddingVertical: 10, borderRadius: 8 },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  statDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
