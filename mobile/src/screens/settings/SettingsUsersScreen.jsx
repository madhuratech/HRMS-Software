import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Users, Shield, Plus, MoreVertical, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ActionModals from '../../components/common/ActionModals';

const USER_SCHEMA = [
  { key: 'name', label: 'Full Name' },
  { key: 'email', label: 'Email Address', keyboardType: 'email-address' },
  { key: 'role', label: 'Role', type: 'select', options: ['Super Admin', 'HR Manager', 'Branch Manager', 'Employee'] },
  { key: 'dept', label: 'Department', type: 'select', options: ['Engineering', 'Human Resources', 'Operations', 'Sales'] }
];

const USERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.s@acme.com', role: 'Super Admin', dept: 'Engineering', status: 'Active' },
  { id: 2, name: 'Priya Patel', email: 'priya.p@acme.com', role: 'HR Manager', dept: 'Human Resources', status: 'Active' },
  { id: 3, name: 'Amit Kumar', email: 'amit.k@acme.com', role: 'Branch Manager', dept: 'Operations', status: 'Active' }
];

export default function SettingsUsersScreen() {
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState(USERS);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAddUser = () => {
    setModalMode('add');
    setSelectedUser(null);
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleSave = (data) => {
    if (modalMode === 'add') {
      const newUser = { id: Date.now(), status: 'Active', ...data };
      setUsersList([newUser, ...usersList]);
    } else {
      setUsersList(usersList.map(u => u.id === data.id ? data : u));
    }
    setModalVisible(false);
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfoContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.userMeta}>
        <Text style={styles.userRole}>{item.role}</Text>
        <Text style={styles.userDept}>{item.dept}</Text>
      </View>
      <TouchableOpacity style={styles.moreBtn} onPress={() => handleEditUser(item)}>
        <MoreVertical size={20} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>User Roles & Permissions</Text>
            <Text style={styles.headerSubtitle}>Manage roles, permissions, and users</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnSecondary}>
              <RefreshCw size={16} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleAddUser}>
              <Plus size={16} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Add User</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'permissions' && styles.activeTab]}
            onPress={() => setActiveTab('permissions')}
          >
            <Shield size={16} color={activeTab === 'permissions' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'permissions' && styles.activeTabText]}>Roles & Permissions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Users size={16} color={activeTab === 'users' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users List</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {activeTab === 'users' ? (
        <FlatList
          data={usersList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Shield size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>Roles Configuration</Text>
          <Text style={styles.emptyStateText}>Roles management is configured via web dashboard.</Text>
        </View>
      )}

      <ActionModals 
        visible={modalVisible}
        mode={modalMode}
        item={selectedUser}
        schema={USER_SCHEMA}
        title={modalMode === 'add' ? 'Add New User' : 'Edit User'}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { paddingTop: 20, elevation: 5, backgroundColor: '#0F172A' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  btnSecondary: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 8 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#2952E3' },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#2563EB' },

  listContent: { padding: 16, paddingBottom: 60 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  userInfoContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  userEmail: { fontSize: 13, color: '#6B7280' },
  
  userMeta: { alignItems: 'flex-end', marginRight: 12 },
  userRole: { fontSize: 13, fontWeight: '600', color: '#374151' },
  userDept: { fontSize: 12, color: '#6B7280' },
  moreBtn: { padding: 4 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center' }
});
