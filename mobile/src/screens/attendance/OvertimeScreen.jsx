import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Clock, ArrowLeft, Plus, X, CheckCircle, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function OvertimeScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [hours, setHours] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/overtime');
      if (Array.isArray(res.data)) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('Error fetching overtime:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!hours || !date) return;
    try {
      setSubmitting(true);
      await apiClient.post('/attendance/overtime', { hours, date, reason });
      setModalVisible(false);
      setHours(''); setDate(''); setReason('');
      fetchRecords();
    } catch (err) {
      console.error('Error applying for overtime', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.infoCol}>
          <Text style={styles.empName}>{item.employee_name || 'Employee'}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'Approved' ? styles.statusApproved : item.status === 'Rejected' ? styles.statusRejected : styles.statusPending]}>
          <Text style={[styles.statusText, item.status === 'Approved' ? styles.statusTextApproved : item.status === 'Rejected' ? styles.statusTextRejected : styles.statusTextPending]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.hoursText}>{item.hours} Hours</Text>
        {item.reason && <Text style={styles.reasonText}>{item.reason}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Overtime</Text>
            <Text style={styles.headerSubtitle}>Track extra hours worked</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>Request</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Clock size={48} color="#CBD5E1" />
              <Text style={styles.title}>Overtime Tracking</Text>
              <Text style={styles.subtitle}>No overtime records found for this period.</Text>
            </View>
          }
        />
      )}

      {/* Request Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Overtime</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput style={styles.modalInput} placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Hours</Text>
                  <TextInput style={styles.modalInput} placeholder="e.g. 2.5" value={hours} onChangeText={setHours} keyboardType="numeric" />
                </View>
              </View>
              <Text style={styles.inputLabel}>Reason / Task</Text>
              <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} placeholder="Reason for overtime..." value={reason} onChangeText={setReason} multiline />

              <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleRequest} disabled={submitting}>
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Request'}</Text>
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
  header: { padding: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 10, overflow: 'hidden', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoCol: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  dateText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusApproved: { backgroundColor: '#ECFDF5' },
  statusRejected: { backgroundColor: '#FEF2F2' },
  statusPending: { backgroundColor: '#FFFBEB' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextApproved: { color: '#10B981' },
  statusTextRejected: { color: '#EF4444' },
  statusTextPending: { color: '#F59E0B' },
  cardBody: { padding: 16 },
  hoursText: { fontSize: 18, fontWeight: '700', color: '#3B82F6', marginBottom: 4 },
  reasonText: { fontSize: 14, color: '#475569' },
  emptyBox: { padding: 40, alignItems: 'center', marginTop: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  modalBody: { gap: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitBtn: { backgroundColor: '#3B82F6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
