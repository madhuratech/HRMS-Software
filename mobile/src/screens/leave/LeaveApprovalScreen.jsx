import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import apiClient from '../../api/client';

export default function LeaveApprovalScreen() {
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
      await apiClient.put(`/leaves/applications/${id}/status`, { status, approvedBy: 1 });
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
          <CheckCircle size={16} color="#FFF" />
          <Text style={styles.actionBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleAction(item.id, 'Rejected')}>
          <XCircle size={16} color="#FFF" />
          <Text style={styles.actionBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leave Approvals</Text>
        <Text style={styles.headerSubtitle}>Pending leave requests</Text>
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  listContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  cardHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoCol: { marginBottom: 8 },
  empName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  leaveType: { fontSize: 13, color: '#64748B' },
  dateText: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },
  cardBody: { padding: 16 },
  reasonText: { fontSize: 13, color: '#475569' },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { flex: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  approveBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});
