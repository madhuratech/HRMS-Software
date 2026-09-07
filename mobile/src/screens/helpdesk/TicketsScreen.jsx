import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Plus, Edit2, Eye, Trash2, Search, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function TicketsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action Modals State
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tickets');
      if (res.data && Array.isArray(res.data)) {
        setData(res.data);
      } else if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete Ticket', 'Are you sure you want to delete this ticket?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          // If you have a delete endpoint, call it here. For now we just remove from state.
          setData(data.filter(d => d.id !== item.id));
      }}
    ]);
  };

  const handleActionSave = async (formData) => {
    try {
      if (actionModalMode === 'create') {
        await apiClient.post('/tickets', {
          subject: formData.title,
          cat: formData.category,
          priority: formData.priority,
          requester: formData.employee || 'Admin'
        });
      } else {
        // If there's an edit endpoint, call it here
      }
      setActionModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Error saving ticket:', err);
      Alert.alert('Error', 'Failed to save ticket');
    }
  };

  const ticketFields = [
    { key: 'title', label: 'Ticket Title', type: 'text', placeholder: 'e.g. VPN Access & Login Error', required: true },
    { key: 'employee', label: 'Employee', type: 'text', placeholder: 'e.g. Rohit Sharma', required: true },
    { key: 'department', label: 'Department', type: 'select', options: ['IT Support', 'HR Support', 'Payroll', 'Facilities'], required: true },
    { key: 'category', label: 'Category', type: 'select', options: ['IT Support', 'Payroll', 'Leave & Attendance', 'HR Support'], required: true },
    { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low', 'Critical'] },
    { key: 'assignedTo', label: 'Assigned To', type: 'text', placeholder: 'e.g. IT Admin', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Pending', 'Resolved'] }
  ];

  const getPriorityColor = (priority) => {
    if (priority === 'High' || priority === 'Critical') return { bg: '#FEF2F2', text: '#EF4444' };
    if (priority === 'Medium') return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#F3F4F6', text: '#6B7280' };
  };

  const getStatusColor = (status) => {
    if (status === 'Resolved') return { bg: '#ECFDF5', text: '#059669' };
    if (status === 'In Progress') return { bg: '#FEF3C7', text: '#D97706' };
    if (status === 'Pending') return { bg: '#EFF6FF', text: '#818CF8' };
    return { bg: '#FEF2F2', text: '#EF4444' }; // Open
  };

  const renderItem = ({ item }) => {
    const pColor = getPriorityColor(item.priority);
    const sColor = getStatusColor(item.status);
    
    // Support either backend fields or mapped fields
    const title = item.subject || item.title || 'No Title';
    const cat = item.cat || item.category || 'General';
    const priority = item.priority || 'Low';
    const status = item.status || 'Open';
    const req = item.requester || item.employee || 'Admin';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{title.substring(0,2).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{item.date || item.created_at || ''}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sColor.bg }]}>
            <Text style={[styles.badgeText, { color: sColor.text }]}>{status}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{item.id_str || item.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{cat}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Requester:</Text>
            <Text style={styles.infoValue}>{req}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priority:</Text>
            <View style={[styles.priorityBadge, { backgroundColor: pColor.bg }]}>
              <Text style={[styles.priorityText, { color: pColor.text }]}>{priority}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionView(item)}>
            <Eye size={18} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionEdit(item)}>
            <Edit2 size={18} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleActionDelete(item)}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Tickets</Text>
            <Text style={styles.headerSubtitle}>Manage and track all support tickets</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => { setActionSelectedItem(null); setActionModalMode('create'); setActionModalVisible(true); }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" />
          <Text style={styles.searchPlaceholder}>Search tickets...</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        />
      )}

      <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        schema={ticketFields}
        title={actionModalMode === 'create' ? 'Create Ticket' : 'Edit Ticket'}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGradient: { padding: 20, paddingTop: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, zIndex: 10 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2952E3', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchPlaceholder: { color: '#94A3B8', fontSize: 16, marginLeft: 10, fontWeight: '500' },
  listContent: { padding: 20, paddingTop: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardBody: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '600' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  actionBtn: { padding: 8, marginLeft: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }
});
