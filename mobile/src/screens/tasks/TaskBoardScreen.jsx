import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, TextInput } from 'react-native';
import { Search, Plus, Clock, AlertCircle, CheckCircle, ChevronRight, X, Calendar as CalendarIcon, FolderKanban } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function TaskBoardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tasks');
      if (Array.isArray(res.data)) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post('/tasks', { 
        title: newTaskTitle, 
        description: newTaskDesc,
        status: 'todo',
        priority: 'medium',
        assignee_id: 1 // Default test user
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setModalVisible(false);
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const [kpiData, setKpiData] = useState({ totalTasks: 0, todo: 0, inProgress: 0, review: 0, completed: 0 });
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // Calculate KPIs from tasks
    const kpis = { totalTasks: tasks.length, todo: 0, inProgress: 0, review: 0, completed: 0 };
    tasks.forEach(t => {
      const s = (t.status || '').toLowerCase();
      if (s === 'todo' || s === 'to_do') kpis.todo++;
      else if (s === 'in_progress') kpis.inProgress++;
      else if (s === 'review') kpis.review++;
      else if (s === 'completed' || s === 'done') kpis.completed++;
    });
    setKpiData(kpis);
  }, [tasks]);

  const KPICard = ({ label, value, color, icon: Icon, bg }) => (
    <View style={[styles.kpiCard, { borderColor: bg }]}>
      <View style={[styles.kpiIconBox, { backgroundColor: bg }]}>
        <Icon size={18} color={color} />
      </View>
      <View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
    </View>
  );

  const statuses = ['All', 'To Do', 'In Progress', 'Review', 'Completed'];

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (statusFilter === 'All') return true;
    const s = (t.status || '').replace('_', ' ').toLowerCase();
    return s === statusFilter.toLowerCase();
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#EF4444';
      case 'urgent': return '#B91C1C';
      case 'low': return '#10B981';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} color="#10B981" />;
      case 'in_progress': return <Clock size={16} color="#3B82F6" />;
      case 'review': return <AlertCircle size={16} color="#F59E0B" />;
      default: return <AlertCircle size={16} color='#6B7280' />;
    }
  };

  const formatStatus = (status) => {
    return status?.replace('_', ' ').toUpperCase();
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          {getStatusIcon(item.status)}
          <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '15' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority?.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Text style={styles.statusLabel}>{formatStatus(item.status)}</Text>
        </View>
        <View style={styles.footerInfo}>
          <CalendarIcon size={14} color='#6B7280' style={{marginRight: 4}} />
          <Text style={styles.dateLabel}>
            {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No Date'}
          </Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Task Board</Text>
          <Text style={styles.headerSubtitle}>Manage your team's tasks</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>New Task</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <KPICard label="Total Tasks" value={kpiData.totalTasks} color="#6366F1" bg="#EEF2FF" icon={FolderKanban} />
        <KPICard label="To Do" value={kpiData.todo} color="#6B7280" bg="#F3F4F6" icon={Clock} />
        <KPICard label="In Progress" value={kpiData.inProgress} color="#3B82F6" bg="#DBEAFE" icon={AlertCircle} />
        <KPICard label="Review" value={kpiData.review} color="#F59E0B" bg="#FEF3C7" icon={AlertCircle} />
        <KPICard label="Completed" value={kpiData.completed} color="#10B981" bg="#D1FAE5" icon={CheckCircle} />
      </ScrollView>

      <View style={styles.filterScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {statuses.map(s => (
            <TouchableOpacity 
              key={s} 
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search tasks..." 
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
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="What needs to be done?"
                placeholderTextColor="#94A3B8"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput 
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Add more details..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={newTaskDesc}
                onChangeText={setNewTaskDesc}
              />

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddTask}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Creating...' : 'Create Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 20, backgroundColor: '#FFFFFF', flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 12, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6, backgroundColor: '#2563EB' },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toolbar: { padding: 20 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, height: 48,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', fontWeight: '500' },
  kpiScroll: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterScrollContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '500' },
  taskCard: { 
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 12 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  taskDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerInfo: { flexDirection: 'row', alignItems: 'center' },
  statusLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  dateLabel: { fontSize: 13, fontWeight: '500', color: '#6B7280' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: '#E5E7EB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  modalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
