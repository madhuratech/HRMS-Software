import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, ScrollView, Alert } from 'react-native';
import { Plus, Search, CheckCircle, Clock, Flag, Edit2, Trash2, Calendar, Target, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

const createMilestoneSchema = (projects) => [
  { key: 'milestone_name', label: 'Milestone Name', required: true },
  { 
    key: 'project_id', 
    label: 'Project', 
    type: 'select', 
    options: projects.map(p => ({ label: p.project_name || p.name, value: p.id })), 
    required: true 
  },
  { key: 'due_date', label: 'Due Date (YYYY-MM-DD)', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Upcoming', 'In Progress', 'Completed', 'Delayed'] },
  { key: 'progress_pct', label: 'Progress (%)', keyboardType: 'numeric' },
  { key: 'description', label: 'Description', multiline: true }
];

export default function MilestonesScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [kpiData, setKpiData] = useState({ totalMilestones: 0, completed: 0, inProgress: 0, delayed: 0, upcoming: 0 });
  const [projects, setProjects] = useState([]);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, milestonesRes, metaRes] = await Promise.all([
        apiClient.get('/milestones/dashboard').catch(() => null),
        apiClient.get('/milestones?page=1&limit=50').catch(() => null),
        apiClient.get('/projects/meta').catch(() => null)
      ]);

      if (dashboardRes?.data?.success) {
        setKpiData(dashboardRes.data.data);
      }
      if (metaRes?.data?.success && metaRes.data.data?.projects) {
        setProjects(metaRes.data.data.projects);
      }

      if (milestonesRes?.data?.success && milestonesRes.data.data.milestones) {
        setData(milestonesRes.data.data.milestones);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching milestones:', error);
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
      project_id: item.project_id ? parseInt(item.project_id) : '',
      progress_pct: item.progress_pct ? String(item.progress_pct) : '0'
    }); 
    setActionModalMode('edit'); 
    setActionModalVisible(true); 
  };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete Milestone', `Are you sure you want to delete ${item.milestone_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/milestones/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete milestone');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        ...updatedItem,
        project_id: parseInt(updatedItem.project_id),
        progress_pct: updatedItem.status === 'Completed' ? 100 : (parseInt(updatedItem.progress_pct) || 0)
      };
      if (updatedItem.id) {
        await apiClient.put(`/milestones/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/milestones', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const filteredData = data.filter(m => 
    (m.milestone_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.project_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('completed')) return '#10B981';
    if (s.includes('progress')) return '#2563EB';
    if (s.includes('delayed')) return '#EF4444';
    return '#64748B';
  };

  const renderKPIs = () => (
    <View style={styles.kpiContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Flag size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Total</Text>
          <Text style={styles.kpiValue}>{kpiData.totalMilestones || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle size={24} color="#10B981" />
          </View>
          <Text style={styles.kpiLabel}>Completed</Text>
          <Text style={styles.kpiValue}>{kpiData.completed || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Clock size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>In Progress</Text>
          <Text style={styles.kpiValue}>{kpiData.inProgress || 0}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
            <AlertTriangle size={24} color="#EF4444" />
          </View>
          <Text style={styles.kpiLabel}>Delayed</Text>
          <Text style={styles.kpiValue}>{kpiData.delayed || 0}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.titleText} numberOfLines={2}>{item.milestone_name || 'Untitled Milestone'}</Text>
            <Text style={styles.subtitleText}>{item.project_name || 'No Project'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status || 'Upcoming'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
           <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Progress</Text>
              <View style={styles.progressBarBg}>
                 <View style={[styles.progressBarFill, { width: `${item.progress_pct || 0}%`, backgroundColor: statusColor }]} />
              </View>
              <Text style={styles.detailValue}>{item.progress_pct || 0}%</Text>
           </View>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.dateText}>
              Due: {item.due_date ? new Date(item.due_date).toLocaleDateString('en-US') : '--'}
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
            <Text style={styles.headerTitle}>Milestones</Text>
            <Text style={styles.headerSubtitle}>Key project phases & targets</Text>
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
              placeholder="Search milestones..."
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
              <Flag size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No milestones found</Text>
            </View>
          }
        />
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={createMilestoneSchema(projects)}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Create Milestone' : 'Edit Milestone'}
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
  titleText: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  subtitleText: { fontSize: 13, color: '#64748B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  detailCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailLabel: { fontSize: 12, color: '#64748B' },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  detailValue: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 15, color: '#94A3B8', fontWeight: '500' }
});
