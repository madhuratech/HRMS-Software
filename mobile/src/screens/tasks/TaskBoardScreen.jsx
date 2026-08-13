import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, TextInput } from 'react-native';
import { Search, Plus, Clock, AlertCircle, CheckCircle, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react-native';
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

  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      default: return <AlertCircle size={16} color="#64748B" />;
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
        <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(item.priority)}15` }]}>
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
          <CalendarIcon size={14} color="#64748B" style={{marginRight: 4}} />
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
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>New Task</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
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
                <X size={24} color="#64748B" />
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
    padding: 20, backgroundColor: '#FFF', flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 10, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  toolbar: { padding: 20 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 48,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  taskCard: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 12 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  taskDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerInfo: { flexDirection: 'row', alignItems: 'center' },
  statusLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  dateLabel: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  modalBody: { gap: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
