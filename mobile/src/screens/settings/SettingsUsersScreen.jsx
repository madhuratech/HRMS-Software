import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Shield, Mail, Phone, MoreVertical, Plus, User, CheckCircle2, Search } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsUsersScreen({ navigation }) {
  const { getRegisteredUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await getRegisteredUsers();
      setUsers(data || []);
    } catch (e) {
      console.log('Error fetching users:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#2563EB' />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Monitor and manage all registered accounts</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Register')}>
          <Plus size={20} color='#FFFFFF' />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#94A3B8" />
        <Text style={styles.searchText}>Search users by name or email...</Text>
      </View>

      <Text style={styles.sectionTitle}>Registered Accounts ({users.length})</Text>

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <User size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Users Found</Text>
          <Text style={styles.emptyDesc}>No employees have registered yet. When they register, their accounts will appear here.</Text>
        </View>
      ) : (
        <View style={styles.usersList}>
          {users.map((u, idx) => (
            <View key={u.id || idx} style={styles.userCard}>
              <View style={styles.userInfoRow}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <View style={styles.emailRow}>
                    <Mail size={12} color='#6B7280' />
                    <Text style={styles.userEmail}>{u.email}</Text>
                  </View>
                  <View style={styles.roleBadge}>
                    <Shield size={12} color='#2563EB' />
                    <Text style={styles.roleText}>{u.role || 'Employee'}</Text>
                  </View>
                </View>
                <View style={styles.statusBox}>
                  <View style={styles.activeDot} />
                  <Text style={styles.statusText}>{u.status || 'Active'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#6B7280' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  searchText: { marginLeft: 12, fontSize: 15, color: '#94A3B8' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  usersList: { gap: 12 },
  userCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#2563EB' },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  userEmail: { fontSize: 13, color: '#6B7280' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  statusBox: { alignItems: 'flex-end' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginBottom: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#10B981' }
});
