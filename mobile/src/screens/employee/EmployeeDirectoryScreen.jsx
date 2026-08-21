import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { 
  Search, 
  Download, 
  Plus, 
  Mail, 
  Phone, 
  MoreVertical,
  ShieldCheck,
  User,
  BadgeCheck,
  ArrowLeft
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { HRMSCard } from '../../components/ui/HRMSCard';
import { HRMSAvatar } from '../../components/ui/HRMSAvatar';
import apiClient from '../../api/client';

export default function EmployeeDirectoryScreen({ navigation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = async () => {
    try {
      // Build query string
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiClient.get(`/employees${query}`);

      if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Failed to load directory", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchEmployees();
  }, [searchTerm]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const [activeTab, setActiveTab] = useState('EMPLOYEES'); // 'ADMINS' or 'EMPLOYEES'

  const isAdmin = (emp) => {
    const r = emp.role_name?.toUpperCase() || '';
    return r.includes('ADMIN') || r.includes('MANAGER');
  };

  const filteredEmployees = employees.filter(emp => {
    // Filter by tab
    if (activeTab === 'ADMINS' && !isAdmin(emp)) return false;
    if (activeTab === 'EMPLOYEES' && isAdmin(emp)) return false;
    // Filter by search
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!emp.name?.toLowerCase().includes(s) && !emp.email?.toLowerCase().includes(s) && !emp.phone?.includes(s)) {
        return false;
      }
    }
    return true;
  });

  // Derived stats (overall, unaffected by active tab)
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const adminCount = employees.filter(e => isAdmin(e)).length;

  const renderHeader = () => null;

  const renderEmployee = ({ item: emp }) => (
    <View style={styles.employeeCard}>
      <View style={styles.empHeader}>
        <View style={styles.empInfo}>
          <HRMSAvatar name={emp.name} photoUrl={emp.profile_photo} size={50} />
          <View style={styles.empDetails}>
            <Text style={styles.empName}>{emp.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <BadgeCheck size={14} color="#64748B" />
              <Text style={styles.empId}>EMP00{emp.id}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.badge, emp.status === 'Active' ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.badgeText, emp.status === 'Active' ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {emp.status || 'Active'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.empRole}>
        <View style={styles.roleBox}>
          <Text style={styles.roleLabel}>Department</Text>
          <Text style={styles.empDept}>{emp.dept_name || 'General'}</Text>
        </View>
        <View style={styles.roleBox}>
          <Text style={styles.roleLabel}>Designation</Text>
          <Text style={styles.empDesg}>{emp.role_name || 'Staff'}</Text>
        </View>
      </View>

      <View style={styles.empContact}>
        <View style={styles.contactRow}>
          <Mail size={16} color="#94A3B8" />
          <Text style={styles.contactText} numberOfLines={1} ellipsizeMode="tail">{emp.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Phone size={16} color="#94A3B8" />
          <Text style={styles.contactText}>{emp.phone || '—'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.viewProfileBtn}
        onPress={() => navigation.navigate('EmployeeProfile', { id: emp.id })}
      >
        <Text style={styles.viewProfileText}>View Full Profile</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.pageHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Directory</Text>
            <Text style={styles.pageSubtitle}>Browse team members</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredEmployees}
        keyExtractor={item => item.id.toString()}
        renderItem={renderEmployee}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found in this category.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 24,
  },
  headerContainer: { backgroundColor: '#FFF', paddingBottom: 16, marginBottom: 8 },
  pageHeader: { 
    padding: 24, 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  pageSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  searchRow: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  exportBtn: {
    width: 52, height: 52, backgroundColor: '#FFF', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  statTitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  statValue: { fontSize: 24, color: '#0F172A', fontWeight: '800', marginBottom: 4 },
  statTrend: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, gap: 8
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2
  },
  tabText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#4F46E5' },

  employeeCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3,
  },
  empHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  empInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  empDetails: {
    marginLeft: 16,
    flex: 1,
  },
  empName: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  empId: { fontSize: 13, color: '#64748B', fontWeight: '600', marginLeft: 4 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeActive: { backgroundColor: '#ECFCCB' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextActive: { color: '#4D7C0F' },
  badgeTextInactive: { color: '#B91C1C' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  empRole: { flexDirection: 'row', marginBottom: 16, gap: 16 },
  roleBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  roleLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  empDept: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  empDesg: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  empContact: { gap: 10, marginBottom: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { fontSize: 14, color: '#475569', fontWeight: '500', flex: 1 },
  viewProfileBtn: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#4338CA',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  }
});

