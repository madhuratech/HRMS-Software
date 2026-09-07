import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import { 
  Search, Filter, ChevronRight, CheckSquare, 
  Upload, Download, MoreVertical, Building2, Phone 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { HRMSAvatar } from '../../components/ui/HRMSAvatar';

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEmployees(res.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      console.log('Fallback data for EmployeeList');
      setEmployees([
        { id: '1', name: 'Arun E', profile_photo: null, dept_name: 'Engineering', role_name: 'Senior Developer', branch_name: 'Head Office', status: 'Active', join_date: '2023-01-15' },
        { id: '2', name: 'Sarah Jenkins', profile_photo: null, dept_name: 'Human Resources', role_name: 'HR Manager', branch_name: 'Head Office', status: 'Active', join_date: '2022-11-01' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(emp => {
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      if (!emp.name?.toLowerCase().includes(s) && !emp.email?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EmployeeProfile', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <HRMSAvatar name={item.name} photoUrl={item.profile_photo} size={44} />
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemId}>EMP00{item.id}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRowTop}>
          <View>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{item.dept_name || 'General'}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>Designation</Text>
            <Text style={styles.infoValue}>{item.role_name || 'Staff'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Building2 size={14} color="#64748B" />
            <Text style={styles.statText}>{item.branch_name || 'Head Office'}</Text>
          </View>
          <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, item.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
              {item.status || 'Active'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employee List</Text>
        <Text style={styles.subtitle}>{employees.length} total employees</Text>
      </View>

      <View style={styles.actionsBar}>
        <View style={styles.searchContainer}>
          <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employee..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Filter size={16} color="#475569" />
            <Text style={styles.secondaryBtnText}>Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <CheckSquare size={16} color="#475569" />
            <Text style={styles.secondaryBtnText}>Bulk Actions</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Upload size={16} color="#475569" />
            <Text style={styles.secondaryBtnText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn}>
            <Download size={16} color="#FFF" />
            <Text style={styles.primaryBtnText}>Export List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  
  actionsBar: { padding: 16, gap: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  buttonsRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryBtnText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 8 },
  primaryBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

  listContainer: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cardHeaderLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  itemId: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  moreBtn: { padding: 4 },
  
  cardBody: { padding: 14 },
  infoRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusActive: { backgroundColor: '#ECFDF5' },
  statusInactive: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#047857' },
  statusTextInactive: { color: '#4B5563' },
});
