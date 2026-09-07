import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput, RefreshControl } from 'react-native';
import { Search, ChevronDown, Download, Eye, FileText, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Data
const MOCK_EMPLOYEES = [
  { id: 'EMP001', name: 'Aarav Sharma', dept: 'Design', net: '₹78,500', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP001' },
  { id: 'EMP002', name: 'Neha Patel', dept: 'HR', net: '₹52,300', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP002' },
  { id: 'EMP003', name: 'Rohan Mehta', dept: 'Development', net: '₹85,000', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP003' },
  { id: 'EMP004', name: 'Priya Nair', dept: 'Finance', net: '₹66,400', paymentMode: 'Bank Transfer', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=EMP004' },
  { id: 'EMP005', name: 'Karan Verma', dept: 'Marketing', net: '₹72,600', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP005' },
];

export default function GeneratePayslipsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulating API call
      setTimeout(() => {
        setData(MOCK_EMPLOYEES);
        setLoading(false);
        setRefreshing(false);
      }, 800);
    } catch (error) {
      setData(MOCK_EMPLOYEES);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredData = data.filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()) || emp.id.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.empRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.empInfo}>
          <Text style={styles.empName}>{item.name}</Text>
          <Text style={styles.empId}>{item.id} • {item.dept}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Generated' ? '#ECFDF5' : '#FEF3C7' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Generated' ? '#10B981' : '#D97706' }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Net Pay</Text>
          <Text style={styles.detailValue}>{item.net}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Payment Mode</Text>
          <Text style={styles.detailValue}>{item.paymentMode}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Eye size={18} color="#2563EB" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Download size={18} color="#2563EB" />
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.container}>
        
        {/* Header & Filters */}
        <View style={styles.headerArea}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search employee..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterDropdown}>
              <Text style={styles.filterText}>May 2024</Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterDropdown}>
              <Text style={styles.filterText}>All Departments</Text>
              <ChevronDown size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.primaryActionRow}>
            <TouchableOpacity style={styles.generateBtn}>
              <FileText size={18} color="#FFF" />
              <Text style={styles.generateBtnText}>Generate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn}>
              <Text style={styles.bulkBtnText}>Bulk Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
          />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerArea: { padding: 20, gap: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 16, height: 48, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1E293B' },
  filterRow: { flexDirection: 'row', gap: 12 },
  filterDropdown: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', paddingHorizontal: 16, height: 44, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  primaryActionRow: { marginTop: 4, flexDirection: 'row', gap: 12 },
  generateBtn: {
    flex: 1, backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: 12, gap: 8
  },
  generateBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  bulkBtn: {
    flex: 1, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0'
  },
  bulkBtnText: { color: '#2563EB', fontSize: 15, fontWeight: '600' },

  listContent: { paddingHorizontal: 20, gap: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  empRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  empInfo: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  empId: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },

  detailsGrid: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 16 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#1E293B' },

  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 40, borderRadius: 8, backgroundColor: '#EFF6FF'
  },
  actionText: { fontSize: 14, fontWeight: '600', color: '#2563EB' }
});
