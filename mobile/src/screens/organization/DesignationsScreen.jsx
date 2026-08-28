import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Search, Plus, MoreVertical, Briefcase, Award, X, ChevronLeft, Edit2, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function DesignationsScreen() {
  const navigation = useNavigation();
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organization/designations');
      if (Array.isArray(res.data)) {
        setDesignations(res.data);
      }
    } catch (err) {
      console.error('Error fetching designations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDesignation = async () => {
    if (!newName.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post('/organization/designations', { name: newName, code: newCode });
      setNewName('');
      setNewCode('');
      setModalVisible(false);
      fetchDesignations();
    } catch (err) {
      console.error('Error adding designation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDesignation = async () => {
    if (!newName.trim() || !selectedDesignation) return;
    try {
      setSubmitting(true);
      await apiClient.put(`/organization/designations/${selectedDesignation.id}`, { name: newName, code: newCode });
      setNewName('');
      setNewCode('');
      setEditModalVisible(false);
      setSelectedDesignation(null);
      fetchDesignations();
    } catch (err) {
      console.error('Error editing designation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (designation) => {
    setSelectedDesignation(designation);
    setNewName(designation.name || '');
    setNewCode(designation.code || '');
    setEditModalVisible(true);
  };

  const handleDeleteDesignation = async (id) => {
    try {
      await apiClient.delete(`/organization/designations/${id}`);
      fetchDesignations();
    } catch (err) {
      console.error('Error deleting designation:', err);
    }
  };

  const filtered = designations.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Designations</Text>
            <Text style={styles.headerSubtitle}>Manage employee roles and titles</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#2563EB', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Add Role</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search designations..." 
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
              <Text style={styles.emptyText}>No designations found</Text>
            </View>
          ) : (
            filtered.map((desig, i) => (
              <View key={desig.id || i} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.iconTitleRow}>
                    <View style={[styles.iconBox, { backgroundColor: '#4F46E515' }]}>
                      <Briefcase size={22} color={'#2563EB'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.desigName}>{desig.name}</Text>
                      {desig.code && <Text style={styles.deptName}>Code: {desig.code}</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => openEditModal(desig)} style={{ padding: 4 }}>
                        <Edit2 size={18} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteDesignation(desig.id)} style={{ padding: 4 }}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
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
              <Text style={styles.modalTitle}>Add Designation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Senior Developer"
                  placeholderTextColor="#94A3B8"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role Code</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. SD-01"
                  placeholderTextColor="#94A3B8"
                  value={newCode}
                  onChangeText={setNewCode}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddDesignation}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Adding...' : 'Add Designation'}</Text>
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
              <Text style={styles.modalTitle}>Edit Designation</Text>
              <TouchableOpacity onPress={() => { setEditModalVisible(false); setSelectedDesignation(null); }}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Designation Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Senior Developer"
                  placeholderTextColor="#94A3B8"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role Code (Optional)</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. SDEV-01"
                  placeholderTextColor="#94A3B8"
                  value={newCode}
                  onChangeText={setNewCode}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleEditDesignation}
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  desigName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  deptName: { fontSize: 14, color: '#6B7280', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
