import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Search, Plus, Edit2, Trash2, Calendar, Briefcase, ChevronRight, User, CheckCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

const createTaskSchema = (meta) => [
  { key: 'title', label: 'Task Name', required: true },
  { 
    key: 'project_id', 
    label: 'Project', 
    type: 'select', 
    options: meta.projects.map(p => ({ label: p.name, value: p.id })), 
    required: true 
  },
  { 
    key: 'assignee_id', 
    label: 'Assigned To', 
    type: 'select', 
    options: meta.employees.map(e => ({ label: `${e.name} (EMP${String(e.id).padStart(3, '0')}) - ${e.department_name}`, value: e.id })), 
    required: true 
  },
  { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
  { key: 'start_date', label: 'Start Date (YYYY-MM-DD)', required: true },
  { key: 'due_date', label: 'Due Date (YYYY-MM-DD)', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Backlog', 'To Do', 'In Progress', 'Testing', 'Review', 'Done', 'Completed'] },
  { key: 'description', label: 'Description', multiline: true, required: true }
];

export default function TasksScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ employees: [], projects: [] });
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, metaRes] = await Promise.all([
        apiClient.get(`/tasks?page=${page}&limit=${limit}`),
        apiClient.get('/projects/meta').catch(() => null)
      ]);
      if (metaRes?.data?.success && metaRes.data.data) {
        setMeta({ 
          employees: metaRes.data.data.employees || [], 
          projects: metaRes.data.data.projects || [] 
        });
      }
      if (tasksRes.data?.success && tasksRes.data?.data?.tasks) {
        setData(tasksRes.data.data.tasks);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching tasks:', error);
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
      project_id: item.project_id ? parseInt(item.project_id) : '',
      assignee_id: item.assignee_id ? parseInt(item.assignee_id) : ''
    }); 
    setActionModalMode('edit'); 
    setActionModalVisible(true); 
  };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/tasks/${item.id}`);
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to delete task');
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        ...updatedItem,
        project_id: parseInt(updatedItem.project_id),
        assignee_id: parseInt(updatedItem.assignee_id)
      };
      if (updatedItem.id) {
        await apiClient.put(`/tasks/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/tasks', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const filteredData = data.filter(item => 
    (item.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.project_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Completed': 
      case 'Done': return { bg: '#DCFCE7', text: '#15803D' };
      case 'Testing':
      case 'Review': return { bg: '#FEF3C7', text: '#D97706' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'Medium': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Low': return { bg: '#DCFCE7', text: '#15803D' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const renderItem = ({ item }) => {
    const status = item.status || 'To Do';
    const statusColors = getStatusColor(status);
    const priorityColors = getPriorityColor(item.priority || 'Medium');

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.projectName} numberOfLines={1}>{item.project_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <User size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>{item.assignee_name || 'Unassigned'}</Text>
          </View>
          <View style={styles.detailItem}>
            <View style={[styles.statusBadge, { backgroundColor: priorityColors.bg }]}>
              <Text style={[styles.statusText, { color: priorityColors.text }]}>{item.priority || 'Medium'}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.start_date ? new Date(item.start_date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.due_date ? new Date(item.due_date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={{ flex: 1 }} />
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
            <Text style={styles.headerTitle}>Tasks</Text>
            <Text style={styles.headerSubtitle}>Manage and assign project tasks</Text>
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
              placeholder="Search tasks..."
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
              <CheckCircle size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          }
        />
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={createTaskSchema(meta)}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Create Task' : actionModalMode === 'edit' ? 'Edit Task' : 'Task Details'}
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
  taskTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  projectName: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
