import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Search, Plus, MoreVertical, Clock, X, ChevronLeft, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function ShiftManagementScreen() {
  const navigation = useNavigation();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [newShiftName, setNewShiftName] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organization/shifts');
      if (Array.isArray(res.data)) {
        setShifts(res.data);
      }
    } catch (err) {
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async () => {
    if (!newShiftName.trim() || !newStartTime.trim() || !newEndTime.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post('/organization/shifts', { 
        name: newShiftName, 
        start_time: newStartTime, 
        end_time: newEndTime 
      });
      setNewShiftName('');
      setNewStartTime('');
      setNewEndTime('');
      setModalVisible(false);
      fetchShifts();
    } catch (err) {
      console.error('Error adding shift:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditShift = async () => {
    if (!newShiftName.trim() || !newStartTime.trim() || !newEndTime.trim() || !selectedShift) return;
    try {
      setSubmitting(true);
      await apiClient.put(`/organization/shifts/${selectedShift.id}`, { 
        name: newShiftName, 
        start_time: newStartTime, 
        end_time: newEndTime 
      });
      setNewShiftName('');
      setNewStartTime('');
      setNewEndTime('');
      setEditModalVisible(false);
      setSelectedShift(null);
      fetchShifts();
    } catch (err) {
      console.error('Error editing shift:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (shift) => {
    setSelectedShift(shift);
    setNewShiftName(shift.shift_name || '');
    setNewStartTime(shift.start_time || '');
    setNewEndTime(shift.end_time || '');
    setEditModalVisible(true);
  };

  const handleDeleteShift = async (id) => {
    try {
      await apiClient.delete(`/organization/shifts/${id}`);
      fetchShifts();
    } catch (err) {
      console.error('Error deleting shift:', err);
    }
  };

  const filtered = shifts.filter(s => 
    s.shift_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Shift Management</Text>
            <Text style={styles.headerSubtitle}>Manage employee working hours</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#2563EB', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Add Shift</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search shifts..." 
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No shifts found</Text>
            </View>
          ) : (
            filtered.map((shift, i) => (
              <View key={shift.id || i} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.titleRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: shift.color || '#2563EB' }]} />
                    <View>
                      <Text style={styles.shiftName}>{shift.shift_name}</Text>
                      <Text style={styles.shiftType}>{shift.shift_type || 'Regular'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.timeRow}>
                    <View style={styles.timeBox}>
                      <Clock size={16} color='#6B7280' />
                      <View>
                        <Text style={styles.infoLabel}>Start Time</Text>
                        <Text style={styles.infoValue}>{shift.start_time}</Text>
                      </View>
                    </View>
                    <View style={styles.timeBox}>
                      <Clock size={16} color='#6B7280' />
                      <View>
                        <Text style={styles.infoLabel}>End Time</Text>
                        <Text style={styles.infoValue}>{shift.end_time}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>Grace Time:</Text>
                    <Text style={styles.statValue}>{shift.grace_time || 15} mins</Text>
                  </View>

                  <View style={[styles.divider, { marginVertical: 12 }]} />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                    <TouchableOpacity onPress={() => openEditModal(shift)} style={{ padding: 4 }}>
                      <Edit2 size={18} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteShift(shift.id)} style={{ padding: 4 }}>
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Shift</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shift Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Morning Shift"
                  placeholderTextColor="#94A3B8"
                  value={newShiftName}
                  onChangeText={setNewShiftName}
                />
              </View>
              <View style={styles.timeInputsRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="09:00"
                    placeholderTextColor="#94A3B8"
                    value={newStartTime}
                    onChangeText={setNewStartTime}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="18:00"
                    placeholderTextColor="#94A3B8"
                    value={newEndTime}
                    onChangeText={setNewEndTime}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddShift}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Adding...' : 'Add Shift'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Shift</Text>
              <TouchableOpacity onPress={() => { setEditModalVisible(false); setSelectedShift(null); }}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shift Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Morning Shift"
                  placeholderTextColor="#94A3B8"
                  value={newShiftName}
                  onChangeText={setNewShiftName}
                />
              </View>
              <View style={styles.timeInputsRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="09:00"
                    placeholderTextColor="#94A3B8"
                    value={newStartTime}
                    onChangeText={setNewStartTime}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="18:00"
                    placeholderTextColor="#94A3B8"
                    value={newEndTime}
                    onChangeText={setNewEndTime}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleEditShift}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
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
    padding: 24, 
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toolbar: { padding: 24 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 24 },
  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', gap: 14, flex: 1 },
  colorIndicator: { width: 14, height: 14, borderRadius: 7, marginTop: 4 },
  shiftName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  shiftType: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
  cardBody: { gap: 16 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 0.48 },
  infoLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginTop: 4 },
  statLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginRight: 8 },
  statValue: { fontSize: 14, color: '#1E293B', fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  timeInputsRow: { flexDirection: 'row', gap: 16 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
