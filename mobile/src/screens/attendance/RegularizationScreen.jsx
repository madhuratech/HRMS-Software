import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Clock, CheckCircle, XCircle, Search, Plus, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function RegularizationScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [empId, setEmpId] = useState('');
  const [date, setDate] = useState('');
  const [punchIn, setPunchIn] = useState('');
  const [punchOut, setPunchOut] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/regularization?status=pending');
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Error fetching regularization:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiClient.put(`/attendance/regularization/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRequest = async () => {
    if (!empId || !date) return;
    try {
      setSubmitting(true);
      await apiClient.post('/attendance/regularization', {
        employeeId: empId,
        date,
        requestedPunchIn: punchIn || null,
        requestedPunchOut: punchOut || null,
        reason
      });
      setModalVisible(false);
      setEmpId(''); setDate(''); setPunchIn(''); setPunchOut(''); setReason('');
      fetchRequests();
    } catch (err) {
      console.error('Error requesting regularization', err);
    } finally {
      setSubmitting(false);
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
          <Text style={styles.avatarText}>{item.employee_name?.substring(0,2).toUpperCase()}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.empName}>{item.employee_name}</Text>
          <Text style={styles.dateText}>For Date: {new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Req. Punch In</Text>
            <Text style={styles.timeValue}>{item.requested_punch_in || '--:--'}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Req. Punch Out</Text>
            <Text style={styles.timeValue}>{item.requested_punch_out || '--:--'}</Text>
          </View>
        </View>
        {item.reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>Reason: {item.reason}</Text>
          </View>
        )}
      </View>
      {item.status === 'Pending' && (
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleUpdateStatus(item.id, 'Approved')}
          >
            <CheckCircle size={16} color='#FFFFFF' />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleUpdateStatus(item.id, 'Rejected')}
          >
            <XCircle size={16} color='#FFFFFF' />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Regularization</Text>
          <Text style={styles.headerSubtitle}>Fix missed punches</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Request</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No regularization requests found.</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Regularization</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Employee ID</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. 1" value={empId} onChangeText={setEmpId} keyboardType="numeric" />
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.modalInput} placeholder="2026-08-12" value={date} onChangeText={setDate} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Punch In</Text>
                  <TextInput style={styles.modalInput} placeholder="09:00:00" value={punchIn} onChangeText={setPunchIn} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Punch Out</Text>
                  <TextInput style={styles.modalInput} placeholder="18:00:00" value={punchOut} onChangeText={setPunchOut} />
                </View>
              </View>
              <Text style={styles.inputLabel}>Reason</Text>
              <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Forgot to punch in..." value={reason} onChangeText={setReason} multiline />
              
              <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.7 }]} onPress={handleRequest} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Request'}</Text>
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
  header: { padding: 20, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 10, overflow: 'hidden', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatarBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
  infoCol: { flex: 1, marginLeft: 12 },
  empName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  dateText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 16 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  timeValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  reasonBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8 },
  reasonText: { fontSize: 13, color: '#475569' },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  actionBtn: { flex: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  approveBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalBody: { gap: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#3B82F6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
