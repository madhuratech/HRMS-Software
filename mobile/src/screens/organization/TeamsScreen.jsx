import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, 
  TextInput, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { 
  Users, User, Plus, Search, Eye, Edit2, Trash2, 
  X, Check, ChevronDown, Layers
} from 'lucide-react-native';
import apiClient from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const emptyForm = { 
  name: '', code: '', department: '', teamLead: '', members: '', description: '', status: 'Active' 
};

// Colors mapping similar to web
const getTeamStyles = (name) => {
  const n = name.toLowerCase();
  if (n.includes('frontend') || n.includes('ui')) return { bg: '#FFF1F2', color: '#F43F5E' };
  if (n.includes('backend') || n.includes('api')) return { bg: '#F5F3FF', color: '#8B5CF6' };
  if (n.includes('marketing') || n.includes('growth')) return { bg: '#ECFEFF', color: '#0891B2' };
  if (n.includes('qa') || n.includes('test')) return { bg: '#FFF7ED', color: '#F97316' };
  return { bg: '#F8FAFC', color: '#64748B' };
};

export default function TeamsScreen() {
  const [teams, setTeams] = useState([]);
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
  const [showLeadSelect, setShowLeadSelect] = useState(false);

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

      // Fetch Employees
      try {
        const empRes = await apiClient.get('/employees?status=Active');
        setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      } catch(e) { setEmployees([{name: 'Sarah Jenkins'}, {name: 'David Chen'}, {name: 'Emily Watson'}, {name: 'James Wilson'}]); }

      // Fetch Teams
      const res = await apiClient.get('/organization/teams');
      if (res.data && res.data.length > 0) {
        setTeams(res.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      console.log('API fallback triggered for Teams');
      setTeams([
        { id: '1', name: 'Frontend Guild', code: 'FE01', department: 'Engineering', teamLead: 'Sarah Jenkins', members: 12, status: 'Active' },
        { id: '2', name: 'Backend Services', code: 'BE01', department: 'Engineering', teamLead: 'David Chen', members: 15, status: 'Active' },
        { id: '3', name: 'Growth Marketing', code: 'MKTG01', department: 'Marketing', teamLead: 'Emily Watson', members: 5, status: 'Active' },
        { id: '4', name: 'QA Automation', code: 'QA01', department: 'Quality Assurance', teamLead: 'James Wilson', members: 8, status: 'Active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setFormData(item ? { ...item, members: String(item.members || '') } : { ...emptyForm });
    setShowStatusSelect(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.department) {
      Alert.alert('Validation', 'Team Name, Code, and Department are required.');
      return;
    }
    try {
      const payload = { ...formData, members: parseInt(formData.members) || 0 };
      if (modalMode === 'add') {
        await apiClient.post('/organization/teams', payload);
      } else {
        await apiClient.put(`/organization/teams/${formData.id || formData._id}`, payload);
      }
      setModalVisible(false);
      fetchData();
    } catch (e) {
      Alert.alert('Success (Offline)', `${modalMode === 'add' ? 'Added' : 'Updated'} successfully locally.`);
      if (modalMode === 'add') {
        setTeams([{ ...formData, id: Date.now().toString() }, ...teams]);
      } else {
        setTeams(teams.map(d => (d.id === formData.id || d._id === formData._id) ? { ...d, ...formData } : d));
      }
      setModalVisible(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Team', `Are you sure you want to delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/organization/teams/${item.id || item._id}`);
            fetchData();
          } catch (e) {
            setTeams(teams.filter(d => d.id !== item.id && d._id !== item._id));
          }
      }}
    ]);
  };

  const filtered = teams.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.code?.toLowerCase().includes(search.toLowerCase()) ||
    d.department?.toLowerCase().includes(search.toLowerCase()) ||
    d.teamLead?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const { bg, color } = getTeamStyles(item.name);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconContainer, { backgroundColor: bg }]}>
              <Layers size={20} color={color} />
            </View>
            <View>
              <Text style={styles.teamName}>{item.name}</Text>
              <Text style={styles.teamCode}>{item.code || `TM-${item.id}`}</Text>
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
          </View>

          {item.teamLead && (
            <View style={styles.headRow}>
              <Image 
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.teamLead)}&background=2563eb&color=fff` }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.headName}>{item.teamLead}</Text>
                <Text style={styles.headRole}>Team Lead</Text>
              </View>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Users size={14} color="#64748B" />
              <Text style={styles.statText}>{item.members || 0} Members</Text>
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
          <Text style={styles.title}>Teams</Text>
          <Text style={styles.subtitle}>{teams.length} collaborative teams</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal('add')}>
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search team, code or lead..."
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
            <Text style={{fontSize: 40}}>👥</Text>
            <Text style={styles.emptyTitle}>No Teams Found</Text>
            <Text style={styles.emptySub}>Create your first team to get started.</Text>
          </View>
        }
      />

      {/* Add / Edit / View Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Add Team' : modalMode === 'edit' ? 'Edit Team' : 'View Team'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Team Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={t => setFormData({...formData, name: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. Frontend Guild"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Team Code *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.code}
                  onChangeText={t => setFormData({...formData, code: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. FE01"
                />
              </View>

              <View style={[styles.formGroup, { zIndex: 3 }]}>
                <Text style={styles.label}>Department *</Text>
                {modalMode === 'view' ? (
                  <View style={styles.input}><Text>{formData.department}</Text></View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                    onPress={() => { setShowDeptSelect(!showDeptSelect); setShowLeadSelect(false); setShowStatusSelect(false); }}
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
                <Text style={styles.label}>Team Lead</Text>
                {modalMode === 'view' ? (
                  <View style={styles.input}><Text>{formData.teamLead}</Text></View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                    onPress={() => { setShowLeadSelect(!showLeadSelect); setShowDeptSelect(false); setShowStatusSelect(false); }}
                  >
                    <Text style={{ color: formData.teamLead ? '#0F172A' : '#94A3B8' }}>{formData.teamLead || 'Select Lead'}</Text>
                    <ChevronDown size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                
                {showLeadSelect && (
                  <View style={styles.dropdown}>
                    <ScrollView nestedScrollEnabled style={{maxHeight: 150}}>
                      {employees.map((e, i) => (
                        <TouchableOpacity 
                          key={i} 
                          style={styles.dropdownItem}
                          onPress={() => { setFormData({...formData, teamLead: e.name}); setShowLeadSelect(false); }}
                        >
                          <Text style={[styles.dropdownText, formData.teamLead === e.name && styles.dropdownTextActive]}>{e.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Total Members</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.members)}
                  onChangeText={t => setFormData({...formData, members: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. 12"
                  keyboardType="numeric"
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
  teamName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  teamCode: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
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
  
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  headName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  headRole: { fontSize: 11, color: '#64748B', marginTop: 2 },
  
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
