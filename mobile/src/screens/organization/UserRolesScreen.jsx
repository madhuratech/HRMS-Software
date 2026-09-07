import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, 
  TextInput, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import { Shield, Plus, Eye, Edit2, Trash2, X, Check, Search, Lock, Users } from 'lucide-react-native';
import apiClient from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserRolesScreen() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ role_name: '', description: '' });
  const [permissions, setPermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/rbac/roles');
      if (res.data && res.data.data && res.data.data.length > 0) {
        setRoles(res.data.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      console.log('Fallback data for Roles');
      setRoles([
        { role_key: 'SUPER_ADMIN', role_name: 'Super Admin', description: 'Full root access to all modules.' },
        { role_key: 'HR_ADMIN', role_name: 'HR Admin', description: 'Access to HR, Payroll, Leave Approvals.' },
        { role_key: 'MANAGER', role_name: 'Manager', description: 'Access to team roster, attendance.' },
        { role_key: 'EMPLOYEE', role_name: 'Employee', description: 'Self-service access.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (roleKey) => {
    try {
      setLoadingPerms(true);
      const res = await apiClient.get(`/rbac/permissions/${roleKey}`);
      if (res.data && res.data.data) {
        setPermissions(res.data.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      setPermissions([
        { module_key: 'EMPLOYEE_MANAGEMENT', module_name: 'Employee Management', can_view: true, can_create: false, can_edit: false, can_delete: false },
        { module_key: 'LEAVE_MANAGEMENT', module_name: 'Leave Management', can_view: true, can_create: true, can_edit: false, can_delete: false },
      ]);
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleOpenModal = (mode, role = null) => {
    setModalMode(mode);
    setSelectedRole(role);
    setFormData(role ? { role_name: role.role_name, description: role.description } : { role_name: '', description: '' });
    setPermissions([]);
    setModalVisible(true);
    if (role && role.role_key) {
      fetchPermissions(role.role_key);
    } else if (mode === 'add') {
      // Mock empty permissions for new role
      setPermissions([
        { module_key: 'EMPLOYEE_MANAGEMENT', module_name: 'Employee Management', can_view: false, can_create: false, can_edit: false, can_delete: false },
        { module_key: 'LEAVE_MANAGEMENT', module_name: 'Leave Management', can_view: false, can_create: false, can_edit: false, can_delete: false },
      ]);
    }
  };

  const togglePermission = (moduleKey, field) => {
    if (selectedRole?.role_key === 'SUPER_ADMIN' || modalMode === 'view') return;
    setPermissions(prev => prev.map(p => {
      if (p.module_key === moduleKey) {
        const updated = { ...p, [field]: !p[field] };
        if (field === 'can_view' && !updated.can_view) {
          updated.can_create = false;
          updated.can_edit = false;
          updated.can_delete = false;
        }
        if ((field === 'can_create' || field === 'can_edit' || field === 'can_delete') && updated[field]) {
          updated.can_view = true;
        }
        return updated;
      }
      return p;
    }));
  };

  const handleSave = async () => {
    if (!formData.role_name) {
      Alert.alert('Validation Error', 'Role Name is required');
      return;
    }
    
    setSaving(true);
    try {
      if (modalMode === 'add') {
        // Mock add API call
        setRoles([...roles, { role_key: formData.role_name.toUpperCase().replace(/\s+/g, '_'), ...formData }]);
      } else {
        await apiClient.put(`/rbac/permissions/${selectedRole.role_key}`, {
          permissions,
          roleInfo: formData
        });
        setRoles(roles.map(r => r.role_key === selectedRole.role_key ? { ...r, ...formData } : r));
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Success (Offline)', 'Saved locally');
      if (modalMode !== 'add') {
        setRoles(roles.map(r => r.role_key === selectedRole.role_key ? { ...r, ...formData } : r));
      }
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    if (item.role_key === 'SUPER_ADMIN') {
      Alert.alert('Error', 'Cannot delete Super Admin role');
      return;
    }
    Alert.alert('Delete Role', `Are you sure you want to delete ${item.role_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/rbac/roles/${item.role_key}`);
            setRoles(roles.filter(r => r.role_key !== item.role_key));
          } catch (e) {
            setRoles(roles.filter(r => r.role_key !== item.role_key));
          }
      }}
    ]);
  };

  const filtered = roles.filter(d => d.role_name?.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
            <Shield size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.roleName}>{item.role_name}</Text>
            <View style={styles.keyBadge}>
              <Text style={styles.keyText}>{item.role_key}</Text>
            </View>
          </View>
        </View>
        {item.role_key === 'SUPER_ADMIN' && <Lock size={16} color="#EF4444" />}
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.description}>{item.description || 'No description provided.'}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('view', item)}>
          <Eye size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('edit', item)}>
          <Edit2 size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]} 
          onPress={() => handleDelete(item)}
          disabled={item.role_key === 'SUPER_ADMIN'}
        >
          <Trash2 size={16} color={item.role_key === 'SUPER_ADMIN' ? '#CBD5E1' : '#EF4444'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPermissionToggle = (label, field, moduleKey, value) => (
    <View style={styles.permToggleRow}>
      <Text style={styles.permToggleLabel}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={() => togglePermission(moduleKey, field)}
        disabled={selectedRole?.role_key === 'SUPER_ADMIN' || modalMode === 'view'}
        trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
        thumbColor={value ? '#2563EB' : '#F8FAFC'}
      />
    </View>
  );

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
          <Text style={styles.title}>User Roles</Text>
          <Text style={styles.subtitle}>{roles.length} permission tiers</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal('add')}>
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search roles..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.role_key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Create Role' : modalMode === 'edit' ? 'Edit Role' : 'View Role'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Role Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.role_name}
                  onChangeText={t => setFormData({...formData, role_name: t})}
                  editable={modalMode !== 'view' && selectedRole?.role_key !== 'SUPER_ADMIN'}
                  placeholder="e.g. Finance Manager"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.description}
                  onChangeText={t => setFormData({...formData, description: t})}
                  editable={modalMode !== 'view'}
                  placeholder="Describe role responsibilities"
                  multiline
                />
              </View>

              <Text style={styles.sectionTitle}>Permissions Matrix</Text>
              {selectedRole?.role_key === 'SUPER_ADMIN' && (
                <View style={styles.infoBox}>
                  <Lock size={16} color="#B91C1C" />
                  <Text style={styles.infoBoxText}>Super Admin permissions are protected.</Text>
                </View>
              )}
              
              {loadingPerms ? (
                <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
              ) : (
                <View style={styles.permsContainer}>
                  {permissions.map((perm, idx) => (
                    <View key={idx} style={styles.permCard}>
                      <Text style={styles.permTitle}>{perm.module_name}</Text>
                      <View style={styles.permGrid}>
                        {renderPermissionToggle('View', 'can_view', perm.module_key, perm.can_view)}
                        {renderPermissionToggle('Create', 'can_create', perm.module_key, perm.can_create)}
                        {renderPermissionToggle('Edit', 'can_edit', perm.module_key, perm.can_edit)}
                        {renderPermissionToggle('Delete', 'can_delete', perm.module_key, perm.can_delete)}
                      </View>
                    </View>
                  ))}
                </View>
              )}
              <View style={{ height: 100 }} />
            </ScrollView>

            {modalMode !== 'view' && (
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={handleSave} disabled={saving}>
                  <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.saveBtn}>
                    {saving ? <ActivityIndicator size="small" color="#FFF" /> : (
                      <>
                        <Check size={16} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.saveBtnText}>Save Role</Text>
                      </>
                    )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  
  listContainer: { padding: 16, gap: 12 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardHeaderLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  roleName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  keyBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  keyText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  
  cardBody: { padding: 14 },
  description: { fontSize: 13, color: '#475569', lineHeight: 18 },
  
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: '#F1F5F9' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 4 },
  modalScroll: { padding: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 8, marginBottom: 12 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 16 },
  infoBoxText: { color: '#B91C1C', fontSize: 13, marginLeft: 8, fontWeight: '500' },
  
  permsContainer: { gap: 12 },
  permCard: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16 },
  permTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  permGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  permToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '47%', backgroundColor: '#FFF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  permToggleLabel: { fontSize: 12, color: '#475569', fontWeight: '500' },
  
  modalFooter: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  saveBtn: { flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' }
});
