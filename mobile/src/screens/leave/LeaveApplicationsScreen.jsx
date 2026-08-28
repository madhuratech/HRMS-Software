import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Calendar, Plus, X, Clock, CalendarDays, CheckCircle, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function LeaveApplicationsScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [empId, setEmpId] = useState('');
  const [leaveTypeCode, setLeaveTypeCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leaves/applications');
      if (Array.isArray(res.data)) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!empId || !leaveTypeCode || !startDate || !endDate) return;
    try {
      setSubmitting(true);
      await apiClient.post('/leaves/applications', {
        employee_id: empId,
        leave_type_code: leaveTypeCode,
        start_date: startDate,
        end_date: endDate,
        reason: reason
      });
      setModalVisible(false);
      setEmpId(''); setLeaveTypeCode(''); setStartDate(''); setEndDate(''); setReason('');
      fetchApplications();
    } catch (err) {
      console.error('Error applying for leave', err);
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
          <Text style={styles.leaveType}>{item.leave_type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{new Date(item.start_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>{new Date(item.end_date).toLocaleDateString()}</Text>
          </View>
        </View>
        {item.reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>Reason: {item.reason}</Text>
          </View>
        )}
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
            <Text style={styles.headerTitle}>Leave Applications</Text>
            <Text style={styles.headerSubtitle}>View and manage time off</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Apply</Text>
          </LinearGradient>
        </TouchableOpacity>
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
              <Text style={styles.emptyText}>No leave applications found.</Text>
            </View>
          }
        />
      )}

      {/* Apply Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply For Leave</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Employee ID</Text>
              <TextInput style={styles.modalInput} placeholder="Employee ID" value={empId} onChangeText={setEmpId} />
              <Text style={styles.inputLabel}>Leave Type Code</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. CL, SL, PL" value={leaveTypeCode} onChangeText={setLeaveTypeCode} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TextInput style={styles.modalInput} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TextInput style={styles.modalInput} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Reason</Text>
              <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Sick, Vacation..." value={reason} onChangeText={setReason} multiline />

              <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.7 }]} onPress={handleApply} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Application'}</Text>
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
  header: { padding: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTextContainer: { flex: 1 },
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
  leaveType: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 16 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateBlock: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  dateValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  reasonBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8 },
  reasonText: { fontSize: 13, color: '#475569' },
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
