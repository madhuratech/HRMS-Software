import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, 
  TextInput, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  Briefcase, Users, Plus, Search, Eye, Edit2, Trash2, 
  X, Check, Shield, Calendar, ChevronDown
} from 'lucide-react-native';
import apiClient from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const emptyForm = { 
  name: '', code: '', department: '', reportsTo: '', 
  grade: '', description: '', status: 'Active' 
};

// Colors mapping similar to web
const getDesigStyles = (name) => {
  const n = name.toLowerCase();
  if (n.includes('manager') || n.includes('head')) return { bg: '#F5F3FF', color: '#8B5CF6' };
  if (n.includes('senior') || n.includes('lead')) return { bg: '#EEF2FF', color: '#2563EB' };
  if (n.includes('executive') || n.includes('specialist')) return { bg: '#ECFDF5', color: '#10B981' };
  if (n.includes('director') || n.includes('vp')) return { bg: '#FFF7ED', color: '#F97316' };
  return { bg: '#F8FAFC', color: '#64748B' };
};

export default function DesignationsScreen() {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [formData, setFormData] = useState({ ...emptyForm });
  
  // Dropdown States
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [showDeptSelect, setShowDeptSelect] = useState(false);
  const [showReportsSelect, setShowReportsSelect] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Departments
      try {
        const deptRes = await apiClient.get('/organization/departments');
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      } catch(e) { setDepartments([{name: 'Engineering'}, {name: 'Marketing'}, {name: 'Quality Assurance'}]); }

      // Fetch Employees for Reports To
      try {
        const empRes = await apiClient.get('/employees?status=Active');
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      } catch(e) { setEmployees([{name: 'Engineering Manager'}, {name: 'VP of Engineering'}, {name: 'CEO'}, {name: 'Marketing Manager'}]); }

      // Fetch Designations
      const res = await apiClient.get('/organization/designations');
      if (res.data && res.data.length > 0) {
        setDesignations(res.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      console.log('API fallback triggered for Designations');
      setDesignations([
        { id: '1', name: 'Software Engineer', code: 'SE01', department: 'Engineering', reportsTo: 'Engineering Manager', grade: 'L3', employees: 12, createdDate: '12 Jan 2026', status: 'Active' },
        { id: '2', name: 'Senior Software Engineer', code: 'SSE01', department: 'Engineering', reportsTo: 'VP of Engineering', grade: 'L5', employees: 5, createdDate: '12 Jan 2026', status: 'Active' },
        { id: '3', name: 'HR Manager', code: 'HRM01', department: 'Human Resources', reportsTo: 'CEO', grade: 'M1', employees: 2, createdDate: '12 Jan 2026', status: 'Active' },
        { id: '4', name: 'Marketing Specialist', code: 'MKT01', department: 'Marketing', reportsTo: 'Marketing Manager', grade: 'L2', employees: 4, createdDate: '12 Jan 2026', status: 'Active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setFormData(item ? { ...item } : { ...emptyForm });
    setShowStatusSelect(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.department) {
      Alert.alert('Validation', 'Designation Name, Code, and Department are required.');
      return;
    }
    try {
      if (modalMode === 'add') {
        await apiClient.post('/organization/designations', formData);
      } else {
        await apiClient.put(`/organization/designations/${formData.id || formData._id}`, formData);
      }
      setModalVisible(false);
      fetchData();
    } catch (e) {
      Alert.alert('Success (Offline)', `${modalMode === 'add' ? 'Added' : 'Updated'} successfully locally.`);
      if (modalMode === 'add') {
        setDesignations([{ ...formData, id: Date.now().toString(), employees: 0, createdDate: 'Today' }, ...designations]);
      } else {
        setDesignations(designations.map(d => (d.id === formData.id || d._id === formData._id) ? { ...d, ...formData } : d));
      }
      setModalVisible(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Designation', `Are you sure you want to delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/organization/designations/${item.id || item._id}`);
            fetchData();
          } catch (e) {
            setDesignations(designations.filter(d => d.id !== item.id && d._id !== item._id));
          }
      }}
    ]);
  };

  const filtered = designations.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.code?.toLowerCase().includes(search.toLowerCase()) ||
    d.department?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const { bg, color } = getDesigStyles(item.name);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconContainer, { backgroundColor: bg }]}>
              <Briefcase size={20} color={color} />
            </View>
            <View>
              <Text style={styles.designationName}>{item.name}</Text>
              <Text style={styles.designationCode}>{item.code}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, item.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRowTop}>
            <View>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{item.department}</Text>
            </View>
            <View>
              <Text style={styles.infoLabel}>Grade</Text>
              <Text style={styles.infoValue}>{item.grade || '—'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Users size={14} color="#64748B" />
              <Text style={styles.statText}>{item.employees || 0} Staff</Text>
            </View>
            <View style={styles.statBox}>
              <Calendar size={14} color="#64748B" />
              <Text style={styles.statText}>{item.createdDate || '12 Jan 2026'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('view', item)}>
            <Eye size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('edit', item)}>
            <Edit2 size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Designations</Text>
          <Text style={styles.subtitle}>{designations.length} total designations</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal('add')}>
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search designation, code or department..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => (item.id || item._id).toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{fontSize: 40}}>🎖️</Text>
            <Text style={styles.emptyTitle}>No Designations Found</Text>
            <Text style={styles.emptySub}>Create your first designation to get started.</Text>
          </View>
        }
      />

      {/* Add / Edit / View Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Add Designation' : modalMode === 'edit' ? 'Edit Designation' : 'View Designation'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Designation Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={t => setFormData({...formData, name: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. Senior Software Engineer"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Designation Code *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.code}
                  onChangeText={t => setFormData({...formData, code: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. SSE01"
                />
              </View>

              <View style={[styles.formGroup, { zIndex: 3 }]}>
                <Text style={styles.label}>Department *</Text>
                {modalMode === 'view' ? (
                  <View style={styles.input}><Text>{formData.department}</Text></View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                    onPress={() => { setShowDeptSelect(!showDeptSelect); setShowReportsSelect(false); setShowStatusSelect(false); }}
                  >
                    <Text style={{ color: formData.department ? '#0F172A' : '#94A3B8' }}>{formData.department || 'Select Department'}</Text>
                    <ChevronDown size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                
                {showDeptSelect && (
                  <View style={styles.dropdown}>
                    <ScrollView nestedScrollEnabled style={{maxHeight: 150}}>
                      {departments.map((d, i) => (
                        <TouchableOpacity 
                          key={i} 
                          style={styles.dropdownItem}
                          onPress={() => { setFormData({...formData, department: d.name || d.dept_name}); setShowDeptSelect(false); }}
                        >
                          <Text style={[styles.dropdownText, formData.department === (d.name || d.dept_name) && styles.dropdownTextActive]}>{d.name || d.dept_name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={[styles.formGroup, { zIndex: 2 }]}>
                <Text style={styles.label}>Reports To</Text>
                {modalMode === 'view' ? (
                  <View style={styles.input}><Text>{formData.reportsTo}</Text></View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                    onPress={() => { setShowReportsSelect(!showReportsSelect); setShowDeptSelect(false); setShowStatusSelect(false); }}
                  >
                    <Text style={{ color: formData.reportsTo ? '#0F172A' : '#94A3B8' }}>{formData.reportsTo || 'Select Reports To'}</Text>
                    <ChevronDown size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                
                {showReportsSelect && (
                  <View style={styles.dropdown}>
                    <ScrollView nestedScrollEnabled style={{maxHeight: 150}}>
                      {employees.map((e, i) => (
                        <TouchableOpacity 
                          key={i} 
                          style={styles.dropdownItem}
                          onPress={() => { setFormData({...formData, reportsTo: e.name}); setShowReportsSelect(false); }}
                        >
                          <Text style={[styles.dropdownText, formData.reportsTo === e.name && styles.dropdownTextActive]}>{e.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Grade</Text>
                <TextInput
                  style={styles.input}
                  value={formData.grade}
                  onChangeText={t => setFormData({...formData, grade: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. L5"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                {modalMode === 'view' ? (
                  <View style={styles.input}><Text>{formData.status}</Text></View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                    onPress={() => setShowStatusSelect(!showStatusSelect)}
                  >
                    <Text style={{ color: formData.status ? '#0F172A' : '#94A3B8' }}>{formData.status || 'Select Status'}</Text>
                    <ChevronDown size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                
                {showStatusSelect && (
                  <View style={styles.dropdown}>
                    {['Active', 'Inactive'].map(s => (
                      <TouchableOpacity 
                        key={s} 
                        style={styles.dropdownItem}
                        onPress={() => { setFormData({...formData, status: s}); setShowStatusSelect(false); }}
                      >
                        <Text style={[styles.dropdownText, formData.status === s && styles.dropdownTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {modalMode === 'view' && formData.description && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <View style={[styles.input, { minHeight: 80 }]}><Text>{formData.description}</Text></View>
                </View>
              )}

              <View style={{ height: 100 }} />
            </ScrollView>

            {modalMode !== 'view' && (
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={handleSave}>
                  <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.saveBtn}>
                    <Check size={16} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  listContainer: { padding: 16, gap: 12 },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardHeaderLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  designationName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  designationCode: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: '#ECFDF5' },
  statusInactive: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#047857' },
  statusTextInactive: { color: '#4B5563' },
  
  cardBody: { padding: 14 },
  infoRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  
  statsRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: '#F1F5F9' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 4 },
  modalScroll: { padding: 20 },
  formGroup: { marginBottom: 16, zIndex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  dropdown: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, position: 'absolute', top: 75, left: 0, right: 0, zIndex: 10 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownText: { fontSize: 14, color: '#475569' },
  dropdownTextActive: { color: '#2563EB', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  saveBtn: { flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' }
});
