import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CheckCircle, XCircle, ChevronLeft, Eye, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function LeaveApprovalScreen({ navigation, nested }) {

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const handleActionView = (item) => { setActionSelectedItem(item); setActionModalMode('view'); setActionModalVisible(true); };
  const handleActionEdit = (item) => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); };
  
  const handleActionDelete = (item) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/leaves/applications/${item.id || item._id}`);
            if (typeof fetchData === 'function') fetchData();
            if (typeof loadData === 'function') loadData();
            if (typeof fetchDocuments === 'function') fetchDocuments();
            if (typeof fetchAppraisals === 'function') fetchAppraisals();
            if (typeof fetchProjects === 'function') fetchProjects();
          } catch (err) { console.error('Delete error:', err); }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      if (updatedItem.id || updatedItem._id) {
        await apiClient.put(`/leaves/applications/${updatedItem.id || updatedItem._id}`, updatedItem);
      }
      setActionModalVisible(false);
      if (typeof fetchData === 'function') fetchData();
      if (typeof loadData === 'function') loadData();
      if (typeof fetchDocuments === 'function') fetchDocuments();
      if (typeof fetchAppraisals === 'function') fetchAppraisals();
      if (typeof fetchProjects === 'function') fetchProjects();
    } catch (err) { console.error('Update error:', err); }
  };

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leaves/applications');
      if (Array.isArray(res.data)) {
        setApplications(res.data.filter(app => app.status === 'Pending'));
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await apiClient.put(`/leaves/applications/${id}`, { status, approved_by: 1 });
      fetchApplications();
    } catch (err) {
      console.error('Error updating leave status', err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.infoCol}>
          <Text style={styles.empName}>{item.employee_name}</Text>
          <Text style={styles.leaveType}>{item.leave_type}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.start_date).toLocaleDateString()} to {new Date(item.end_date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardBody}>
        {item.reason && <Text style={styles.reasonText}>Reason: {item.reason}</Text>}
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleAction(item.id, 'Approved')}>
          <CheckCircle size={16} color='#FFFFFF' />
          <Text style={styles.actionBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleAction(item.id, 'Rejected')}>
          <XCircle size={16} color='#FFFFFF' />
          <Text style={styles.actionBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 12, gap: 12 }}>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionView(item)}>
          <Eye size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionEdit(item)}>
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }} onPress={() => handleActionDelete(item)}>
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    
</View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={[styles.header, nested && { paddingVertical: 12, paddingHorizontal: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {!nested && (
            <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
              <ChevronLeft size={24} color='#111827' />
            </TouchableOpacity>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Leave Approvals</Text>
            <Text style={styles.headerSubtitle}>Pending leave requests</Text>
          </View>
        </View>
      </LinearGradient>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No pending leave applications.</Text>
            </View>
          }
        />
      )}
          <ActionModals 
        visible={actionModalVisible}
        mode={actionModalMode}
        item={actionSelectedItem}
        onClose={() => setActionModalVisible(false)}
        onSave={handleActionSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  cardHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  infoCol: { marginBottom: 8 },
  empName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  leaveType: { fontSize: 13, color: '#6B7280' },
  dateText: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },
  cardBody: { padding: 16 },
  reasonText: { fontSize: 13, color: '#475569' },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  actionBtn: { flex: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  approveBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});
