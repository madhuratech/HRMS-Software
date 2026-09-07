import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Briefcase, ChevronLeft, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function CompOffScreen({ navigation }) {

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
            await apiClient.delete(`/leaves/comp-off/${item.id || item._id}`);
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
        await apiClient.put(`/leaves/comp-off/${updatedItem.id || updatedItem._id}`, updatedItem);
      }
      setActionModalVisible(false);
      if (typeof fetchData === 'function') fetchData();
      if (typeof loadData === 'function') loadData();
      if (typeof fetchDocuments === 'function') fetchDocuments();
      if (typeof fetchAppraisals === 'function') fetchAppraisals();
      if (typeof fetchProjects === 'function') fetchProjects();
    } catch (err) { console.error('Update error:', err); }
  };

  const [compOffs, setCompOffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompOffs();
  }, []);

  const fetchCompOffs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leaves/comp-off');
      if (Array.isArray(res.data)) {
        setCompOffs(res.data);
      }
    } catch (err) {
      console.error('Error fetching comp-offs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiClient.put(`/leaves/comp-off/${id}/status`, { status, approved_by: 1 });
      fetchCompOffs();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#F59E0B'; // Pending
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{(item.employee_name || 'E').substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.empName}>{item.employee_name}</Text>
          <Text style={styles.deptText}>{item.department || 'General'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Worked Date</Text>
            <Text style={styles.dateValue}>{new Date(item.worked_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Total Days</Text>
            <Text style={styles.dateValue}>{item.total_days}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Expiry Date</Text>
            <Text style={styles.dateValue}>{new Date(item.expiry_date).toLocaleDateString()}</Text>
          </View>
        </View>
        <Text style={styles.reasonText}>Reason: {item.reason}</Text>
      </View>
      {item.status === 'Pending' && (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 12 }}>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#E2E8F0' }}
            onPress={() => handleUpdateStatus(item.id, 'Approved')}
          >
            <CheckCircle size={16} color="#10B981" />
            <Text style={{ marginLeft: 6, color: '#10B981', fontWeight: '600' }}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
            onPress={() => handleUpdateStatus(item.id, 'Rejected')}
          >
            <XCircle size={16} color="#EF4444" />
            <Text style={{ marginLeft: 6, color: '#EF4444', fontWeight: '600' }}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    
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
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Compensatory Offs</Text>
            <Text style={styles.headerSubtitle}>Manage comp-off requests</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={compOffs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Briefcase size={48} color="#CBD5E1" />
              <Text style={styles.title}>No Comp-Offs</Text>
              <Text style={styles.subtitle}>No comp-off requests found.</Text>
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
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#F8FAFC' },
  avatarBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#3B82F6' },
  infoCol: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  deptText: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardBody: { padding: 16 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateBlock: { flex: 1 },
  dateLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  dateValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  reasonText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }
});
