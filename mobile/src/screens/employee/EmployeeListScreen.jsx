import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, Plus, Filter, ChevronRight, Briefcase, Calendar, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { HRMSAvatar } from '../../components/ui/HRMSAvatar';

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('EMPLOYEES');
  const navigation = useNavigation();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees');
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = (emp) => {
    const r = emp.role_name?.toUpperCase() || '';
    return r.includes('ADMIN') || r.includes('MANAGER');
  };

  const filtered = employees.filter(emp => {
    if (activeTab === 'ADMINS' && !isAdmin(emp)) return false;
    if (activeTab === 'EMPLOYEES' && isAdmin(emp)) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      if (!emp.name?.toLowerCase().includes(s) && !emp.email?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const calculateExperience = (joinDate) => {
    if (!joinDate) return 'Fresher';
    const start = new Date(joinDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0 && months === 0) return 'Joined recently';
    if (years === 0) return `${months} ${months === 1 ? 'Month' : 'Months'}`;
    if (months === 0) return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    return `${years} Yr ${months} Mo`;
  };

  const groupedData = Object.entries(
    filtered.reduce((acc, emp) => {
      const dept = emp.dept_name || 'Unassigned';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(emp);
      return acc;
    }, {})
  ).map(([title, data]) => ({ title, data }));

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => navigation.navigate('EmployeeProfile', { id: item.id })}
    >
      <HRMSAvatar name={item.name} photoUrl={item.profile_photo} size={50} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemRole}>{item.role_name || 'Employee'}</Text>

        <View style={styles.infoRow}>
          <Calendar size={12} color="#94A3B8" />
          <Text style={styles.itemInfoText}>
            Joined: {item.join_date ? new Date(item.join_date).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Briefcase size={12} color="#94A3B8" />
          <Text style={styles.itemInfoText}>
            Exp: {calculateExperience(item.join_date)}
          </Text>
        </View>
      </View>
      <View style={styles.statusBox}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#ECFCCB' : '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? '#4D7C0F' : '#B91C1C' }]}>
            {item.status || 'Active'}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color="#CBD5E1" style={{marginLeft: 8}} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title, data } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{data.length}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Employees</Text>
            <Text style={styles.headerSubtitle}>Manage all employee profiles</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddEmployee')}>
          <LinearGradient colors={['#2563EB', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Add New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search employees..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color='#6B7280' />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'ADMINS' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ADMINS')}
        >
          <Text style={[styles.tabText, activeTab === 'ADMINS' && styles.tabTextActive]}>Admins</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'EMPLOYEES' && styles.tabButtonActive]}
          onPress={() => setActiveTab('EMPLOYEES')}
        >
          <Text style={[styles.tabText, activeTab === 'EMPLOYEES' && styles.tabTextActive]}>Employees</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color='#2563EB' />
        </View>
      ) : (
        <SectionList
          sections={groupedData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No employees found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24, 
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 12, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6, backgroundColor: '#2563EB' },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  toolbar: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', gap: 12 },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', fontWeight: '500' },
  filterBtn: { 
    width: 52, height: 52, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 24, paddingBottom: 24 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  listItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2
  },
  itemDetails: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 2 },
  itemRole: { fontSize: 14, color: '#475569', fontWeight: '600', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  itemInfoText: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginLeft: 6 },

  statusBox: { alignItems: 'flex-end', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },

  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
});
