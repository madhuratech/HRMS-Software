import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { Search, Plus, Calendar, Flag, CheckCircle, Clock, ChevronRight, Hash, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

const createTaskSchema = (projects, employees, columns) => [
  { key: 'title', label: 'Task Title', required: true },
  { key: 'project_id', label: 'Project', type: 'select', options: projects.map(p => ({ label: p.project_name || p.name, value: p.id })), required: true },
  { key: 'assignee_id', label: 'Assignee', type: 'select', options: employees.map(e => ({ label: e.name, value: e.id })) },
  { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
  { key: 'label', label: 'Label', type: 'select', options: ['Feature', 'Backend', 'Security', 'Design', 'QA', 'Bug', 'Enhancement', 'Setup', 'Auth', 'Admin'] },
  { key: 'due_date', label: 'Due Date (YYYY-MM-DD)' },
  { key: 'status', label: 'Column', type: 'select', options: columns.map(c => ({ label: c.label, value: c.label })) }
];

const DEFAULT_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#6B7280', bg: '#F9FAFB' },
  { id: 'todo', label: 'To Do', color: '#6B7280', bg: '#F9FAFB' },
  { id: 'inprogress', label: 'In Progress', color: '#1D4ED8', bg: '#EFF6FF' },
  { id: 'testing', label: 'Testing', color: '#D97706', bg: '#FFFBEB' },
  { id: 'done', label: 'Done', color: '#15803D', bg: '#F0FDF4' }
];

export default function SprintBoardScreen({ navigation }) {
  const [board, setBoard] = useState({ sprint: null, columns: DEFAULT_COLUMNS, cards: {}, progress: { total: 0, done: 0, pending: 0, pct: 0 } });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const [res, metaRes] = await Promise.all([
        apiClient.get('/sprints/board').catch(() => null),
        apiClient.get('/projects/meta').catch(() => null)
      ]);

      if (metaRes?.data?.success && metaRes.data.data) {
        setProjects(metaRes.data.data.projects || []);
        setEmployees(metaRes.data.data.employees || []);
      }

      if (res?.data?.success && res.data?.data) {
        const rawColumns = (res.data.data.columns && res.data.data.columns.length) ? res.data.data.columns : DEFAULT_COLUMNS;
        const columns = DEFAULT_COLUMNS.map(def => {
          const matched = rawColumns.find(c => c.id === def.id) || {};
          return { ...def, ...matched, id: def.id };
        });
        setBoard({ ...res.data.data, columns });
      }
    } catch (error) {
      console.warn('Error fetching sprint board:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBoard();
  };

  const handleActionEdit = (item) => { 
    const matchedCol = board.columns.find(c => board.cards && board.cards[c.id] && board.cards[c.id].find(x => x.id === item.id));
    setActionSelectedItem({
      ...item,
      project_id: item.project_id ? parseInt(item.project_id) : '',
      assignee_id: item.assignee_id ? parseInt(item.assignee_id) : '',
      status: matchedCol ? matchedCol.label : 'To Do'
    }); 
    setActionModalMode('edit'); 
    setActionModalVisible(true); 
  };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete Task', `Are you sure you want to delete ${item.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
             await apiClient.delete(`/tasks/${item.id}`);
             fetchBoard();
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
        project_id: updatedItem.project_id ? parseInt(updatedItem.project_id) : null,
        assignee_id: updatedItem.assignee_id ? parseInt(updatedItem.assignee_id) : null
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
    fetchBoard();
  };

  const renderColumn = (col) => {
    const cards = board.cards[col.id] || [];
    
    return (
      <View key={col.id} style={styles.column}>
        <View style={styles.colHeader}>
          <Text style={styles.colTitle}>{col.label}</Text>
          <View style={styles.colCountBadge}>
             <Text style={styles.colCount}>{cards.length}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardList}>
          {cards.map(card => (
            <TouchableOpacity key={card.id} style={styles.card} onPress={() => handleActionEdit(card)}>
              <View style={styles.cardHeader}>
                <View style={styles.labelPill}>
                  <Text style={styles.labelText}>{card.label || 'Task'}</Text>
                </View>
                <View style={[styles.priorityDot, { backgroundColor: card.priority === 'High' ? '#EF4444' : card.priority === 'Medium' ? '#F59E0B' : '#10B981' }]} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{card.title}</Text>
              <Text style={styles.cardProject} numberOfLines={1}>{card.project || 'No Project'}</Text>
              
              <View style={styles.cardFooter}>
                 <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{card.assignee ? card.assignee.substring(0,2).toUpperCase() : 'NA'}</Text>
                 </View>
                 <Text style={styles.dateText}>{card.due ? new Date(card.due).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {cards.length === 0 && (
             <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>No tasks</Text>
             </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{board.sprint ? board.sprint.name : 'Sprint Board'}</Text>
            <Text style={styles.headerSubtitle}>{board.sprint ? board.sprint.goal : 'Manage sprint tasks'}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
            setActionSelectedItem({ sprint_id: board.sprint?.id, status: 'To Do' });
            setActionModalMode('add');
            setActionModalVisible(true);
          }}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {board.sprint && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>{board.progress.pct}% Completed</Text>
              <Text style={styles.progressSubtext}>{board.progress.done} of {board.progress.total} tasks</Text>
            </View>
            <View style={styles.progressBarBg}>
               <View style={[styles.progressBarFill, { width: `${board.progress.pct}%` }]} />
            </View>
          </View>
        )}
      </LinearGradient>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardScroll}>
          {board.columns.map(renderColumn)}
        </ScrollView>
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={createTaskSchema(projects, employees, board.columns)}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Add Task' : 'Edit Task'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { padding: 16, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  progressContainer: { marginTop: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  progressSubtext: { fontSize: 12, color: '#64748B' },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  boardScroll: { padding: 16, gap: 16 },
  column: { width: 280, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  colHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  colTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  colCountBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  colCount: { fontSize: 12, fontWeight: '600', color: '#475569' },
  cardList: { gap: 10, paddingBottom: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  labelPill: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  labelText: { fontSize: 10, fontWeight: '600', color: '#1D4ED8' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  cardProject: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#3730A3' },
  dateText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  emptyCard: { padding: 16, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10 },
  emptyCardText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' }
});
