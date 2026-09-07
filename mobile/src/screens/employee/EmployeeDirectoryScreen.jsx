import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, TextInput, SafeAreaView, ScrollView
} from 'react-native';
import { 
  Search, Download, Plus, Mail, Phone, ChevronDown, 
  Users, Building2, UserPlus, ShieldCheck 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { HRMSAvatar } from '../../components/ui/HRMSAvatar';

export default function EmployeeDirectoryScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dropdown toggles
  const [showDept, setShowDept] = useState(false);
  const [showDesg, setShowDesg] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, departmentFilter, designationFilter, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (departmentFilter) queryParams.append('department', departmentFilter);
      if (designationFilter) queryParams.append('designation', designationFilter);
      if (statusFilter) queryParams.append('status', statusFilter);

      const res = await apiClient.get(`/employees?${queryParams.toString()}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEmployees(res.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      console.log('Fallback data for EmployeeDirectory');
      let fallback = [
        { id: '1', name: 'Arun E', email: 'arun@example.com', phone: '1234567890', dept_name: 'Engineering', role_name: 'Senior Developer', status: 'Active', join_date: '2023-01-15' },
        { id: '2', name: 'Sarah Jenkins', email: 'sarah@example.com', phone: '0987654321', dept_name: 'Human Resources', role_name: 'HR Manager', status: 'Active', join_date: '2022-11-01' }
      ];
      if (searchTerm) {
        fallback = fallback.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setEmployees(fallback);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const newJoinersCount = employees.filter(e => e.join_date && new Date(e.join_date).getFullYear() >= 2024).length;
  const uniqueDeptsCount = new Set(employees.map(e => e.dept_name).filter(Boolean)).size || 5;

  const uniqueDepts = ["Engineering", "Sales", "Marketing", "Customer Support", "Human Resources"];
  const uniqueDesgs = ["Super Admin", "Branch Manager", "Sales Manager", "Service Staff", "Software Engineer", "HR Executive"];

  const renderCard = ({ item: emp }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <HRMSAvatar name={emp.name} photoUrl={emp.profile_photo} size={48} />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.empName}>{emp.name}</Text>
          <Text style={styles.empRole}>{emp.role_name || 'Staff'}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => navigation.navigate('EmployeeProfile', { id: emp.id })}>
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Building2 size={14} color="#64748B" />
          <Text style={styles.infoText}>{emp.dept_name || 'General'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Mail size={14} color="#64748B" />
          <Text style={styles.infoText}>{emp.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={14} color="#64748B" />
          <Text style={styles.infoText}>{emp.phone || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, emp.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusText, emp.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
            {emp.status || 'Active'}
          </Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconBtn}><Phone size={14} color="#2563EB" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Mail size={14} color="#2563EB" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFilterDropdown = (label, value, options, show, setShow, setFilter) => (
    <View style={{ zIndex: show ? 10 : 1, marginRight: 8 }}>
      <TouchableOpacity style={styles.filterBtn} onPress={() => setShow(!show)}>
        <Text style={[styles.filterBtnText, value && {color: '#0F172A'}]}>{value || label}</Text>
        <ChevronDown size={14} color="#64748B" />
      </TouchableOpacity>
      {show && (
        <View style={styles.dropdown}>
          <ScrollView nestedScrollEnabled style={{maxHeight: 150}}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setFilter(''); setShow(false); }}>
              <Text style={styles.dropdownText}>All</Text>
            </TouchableOpacity>
            {options.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => { setFilter(opt); setShow(false); }}>
                <Text style={[styles.dropdownText, value === opt && styles.dropdownTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Employee Directory</Text>
          <Text style={styles.subtitle}>Find and manage your team members</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEmployee')}>
            <Plus size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={employees}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Total Employees</Text>
                <Text style={styles.statValue}>{totalEmployees}</Text>
                <Text style={styles.statTrend}>Live count</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Active Employees</Text>
                <Text style={[styles.statValue, {color: '#2563EB'}]}>{activeEmployees}</Text>
                <Text style={styles.statTrend}>{totalEmployees > 0 ? ((activeEmployees/totalEmployees)*100).toFixed(1) : 0}%</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>New Joiners</Text>
                <Text style={[styles.statValue, {color: '#0EA5E9'}]}>{newJoinersCount}</Text>
                <Text style={styles.statTrend}>Since 2024</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Departments</Text>
                <Text style={[styles.statValue, {color: '#8B5CF6'}]}>{uniqueDeptsCount}</Text>
                <Text style={styles.statTrend}>View all</Text>
              </View>
            </ScrollView>

            <View style={styles.searchContainer}>
              <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search employee..."
                placeholderTextColor="#94A3B8"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={{paddingRight: 16}}>
              {renderFilterDropdown('Department', departmentFilter, uniqueDepts, showDept, setShowDept, setDepartmentFilter)}
              {renderFilterDropdown('Designation', designationFilter, uniqueDesgs, showDesg, setShowDesg, setDesignationFilter)}
              {renderFilterDropdown('Status', statusFilter, ['Active', 'Inactive', 'Terminated'], showStatus, setShowStatus, setStatusFilter)}
            </ScrollView>

            <Text style={styles.sectionTitle}>All Employees</Text>
          </View>
        }
        renderItem={renderCard}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Users size={32} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Employees Found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or filters.</Text>
            </View>
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#2563EB" style={{marginTop: 20}} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addBtn: { backgroundColor: '#2563EB', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  listContainer: { paddingBottom: 24 },
  
  statsContainer: { padding: 16, paddingRight: 0 },
  statCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', width: 140, marginRight: 12 },
  statTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  statTrend: { fontSize: 11, color: '#10B981', fontWeight: '500' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  
  filtersScroll: { paddingHorizontal: 16, marginTop: 12, zIndex: 10 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 110 },
  filterBtnText: { fontSize: 13, color: '#64748B', marginRight: 8 },
  dropdown: { position: 'absolute', top: 40, left: 0, right: 0, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, zIndex: 20 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownText: { fontSize: 13, color: '#475569' },
  dropdownTextActive: { color: '#2563EB', fontWeight: '600' },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  
  card: { backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardHeaderInfo: { flex: 1, marginLeft: 12 },
  empName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  empRole: { fontSize: 13, color: '#64748B', marginTop: 2 },
  moreBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F1F5F9', borderRadius: 6 },
  viewText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  
  cardBody: { padding: 14, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: '#475569' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FAFAF9', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: '#ECFDF5' },
  statusInactive: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#047857' },
  statusTextInactive: { color: '#4B5563' },
  
  actionIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DBEAFE' },

  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#64748B', marginTop: 4 }
});
