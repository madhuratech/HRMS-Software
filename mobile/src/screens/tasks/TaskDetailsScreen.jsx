import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Clock, AlertCircle, CheckCircle, User, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react-native';
import apiClient from '../../api/client';

export default function TaskDetailsScreen({ route, navigation }) {
  const { taskId } = route.params || {};
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    } else {
      setLoading(false);
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/tasks/${taskId}`);
      setTask(res.data);
    } catch (err) {
      console.error('Error fetching task details:', err);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await apiClient.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTaskDetails();
    } catch (err) {
      console.error('Error updating task:', err);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#EF4444';
      case 'urgent': return '#B91C1C';
      case 'low': return '#10B981';
      default: return '#F59E0B';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Task not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>

        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.taskTitle}>{task.title}</Text>
          </View>

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: `${getPriorityColor(task.priority)}15` }]}>
              <Text style={[styles.badgeText, { color: getPriorityColor(task.priority) }]}>
                {task.priority?.toUpperCase()} PRIORITY
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.badgeText, { color: '#475569' }]}>
                {task.status?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.taskDesc}>{task.description || 'No description provided.'}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <User size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Assignee:</Text>
            <Text style={styles.detailValue}>{task.assignee_name || 'Unassigned'}</Text>
          </View>
          <View style={styles.detailRow}>
            <CalendarIcon size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>{new Date(task.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusButtons}>
          <TouchableOpacity 
            style={[styles.statusBtn, task.status === 'todo' && styles.statusBtnActive]}
            onPress={() => updateStatus('todo')}
            disabled={updating}
          >
            <Text style={[styles.statusBtnText, task.status === 'todo' && styles.statusBtnTextActive]}>To Do</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statusBtn, task.status === 'in_progress' && styles.statusBtnActive]}
            onPress={() => updateStatus('in_progress')}
            disabled={updating}
          >
            <Text style={[styles.statusBtnText, task.status === 'in_progress' && styles.statusBtnTextActive]}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statusBtn, task.status === 'review' && styles.statusBtnActive]}
            onPress={() => updateStatus('review')}
            disabled={updating}
          >
            <Text style={[styles.statusBtnText, task.status === 'review' && styles.statusBtnTextActive]}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statusBtn, task.status === 'completed' && styles.statusBtnActive]}
            onPress={() => updateStatus('completed')}
            disabled={updating}
          >
            <Text style={[styles.statusBtnText, task.status === 'completed' && styles.statusBtnTextActive]}>Completed</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 20, backgroundColor: '#FFF', flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerBack: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  content: { padding: 20 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  titleRow: { marginBottom: 12 },
  taskTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', lineHeight: 28 },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  taskDesc: { fontSize: 15, color: '#475569', lineHeight: 24 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#64748B', marginLeft: 10, width: 80 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#1E293B', flex: 1 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statusBtn: { 
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', 
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, width: '47%', alignItems: 'center'
  },
  statusBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  statusBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  statusBtnTextActive: { color: '#2563EB' },
  emptyText: { fontSize: 16, color: '#64748B', marginBottom: 16 },
  backBtn: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#FFF', fontWeight: '600' }
});
