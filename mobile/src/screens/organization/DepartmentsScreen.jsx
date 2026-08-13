import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Modal } from 'react-native';
import { Search, Filter, Plus, MoreVertical, Users, X, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function DepartmentsScreen() {
  const navigation = useNavigation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptManagerId, setNewDeptManagerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organization/departments');
      if (Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post('/organization/departments', { 
        name: newDeptName,
        manager_id: newDeptManagerId ? parseInt(newDeptManagerId) : null
      });
      setNewDeptName('');
      setNewDeptManagerId('');
      setModalVisible(false);
      fetchDepartments();
    } catch (err) {
      console.error('Error adding department:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = departments.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Departments</Text>
            <Text style={styles.headerSubtitle}>Manage organizational departments</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>Add Dept</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search departments..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No departments found</Text>
            </View>
          ) : (
            filtered.map((dept, i) => (
              <View key={dept.id || i} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.titleRow}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#4F46E5' }]} />
                    <View>
                      <Text style={styles.deptName}>{dept.name}</Text>
                      {dept.code && <Text style={styles.deptCode}>{dept.code}</Text>}
                    </View>
                  </View>
                </View>

                {dept.headName && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.cardBody}>
                      <View style={styles.headInfoRow}>
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>{(dept.headName).substring(0, 2).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>Department Head</Text>
                          <Text style={styles.infoValue}>{dept.headName}</Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}
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
              <Text style={styles.modalTitle}>Add Department</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Engineering"
                  placeholderTextColor="#94A3B8"
                  value={newDeptName}
                  onChangeText={setNewDeptName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Manager ID (Optional)</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. 101"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={newDeptManagerId}
                  onChangeText={setNewDeptManagerId}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddDepartment}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Adding...' : 'Add Department'}</Text>
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
    paddingTop: 48, 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  toolbar: { flexDirection: 'row', padding: 24, gap: 12 },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  filterButton: { 
    width: 52, height: 52, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 24 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  colorIndicator: { width: 14, height: 14, borderRadius: 7, marginTop: 4 },
  deptName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  deptCode: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  cardBody: { gap: 16 },
  headInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C7D2FE' },
  avatarText: { color: '#4338CA', fontWeight: '800', fontSize: 16 },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#4338CA', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
