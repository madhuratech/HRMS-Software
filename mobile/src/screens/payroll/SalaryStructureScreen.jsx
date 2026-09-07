import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Plus, Edit2, Eye, Building2, CheckCircle2, Wallet, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SalaryStructureScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/payroll/structures');
      if (Array.isArray(res.data)) {
        setData(res.data.map(item => ({
          ...item,
          freq: item.frequency || item.freq || 'Monthly',
          amount: item.total_ctc ? `₹ ${Number(item.total_ctc).toLocaleString('en-IN')}${item.frequency === 'Hourly' ? '/hr' : ''}` : '₹ 85,000',
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Apr 2024'
        })));
      } else {
        // Fallback
        setData([
          { id: '1', name: 'Standard Monthly', code: 'STD-M', amount: '₹ 85,000', freq: 'Monthly', date: '01 Apr 2024', employees: 120, status: 'Active' },
          { id: '2', name: 'Contract Hourly', code: 'CON-H', amount: '₹ 500/hr', freq: 'Hourly', date: '15 Mar 2024', employees: 45, status: 'Active' },
        ]);
      }
    } catch (error) {
      console.warn('Error fetching structures:', error);
      setData([
        { id: '1', name: 'Standard Monthly', code: 'STD-M', amount: '₹ 85,000', freq: 'Monthly', date: '01 Apr 2024', employees: 120, status: 'Active' },
        { id: '2', name: 'Contract Hourly', code: 'CON-H', amount: '₹ 500/hr', freq: 'Hourly', date: '15 Mar 2024', employees: 45, status: 'Active' },
      ]);
    } finally {
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

  const totalStructures = data.length;
  const activeStructures = data.filter(s => s.status === 'Active').length;
  const totalEmployeesMapped = data.reduce((acc, curr) => acc + (Number(curr.employees) || 0), 0) || 245;

  const renderKPIs = () => (
    <View style={styles.kpiContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Building2 size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Total Structures</Text>
          <Text style={styles.kpiValue}>{totalStructures}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <CheckCircle2 size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Active Structures</Text>
          <Text style={styles.kpiValue}>{activeStructures}</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
            <Wallet size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.kpiLabel}>Avg CTC</Text>
          <Text style={styles.kpiValue}>₹ 8.5L</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Users size={24} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Employees</Text>
          <Text style={styles.kpiValue}>{totalEmployeesMapped}</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.code}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Active' ? '#10B981' : '#EF4444' }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Monthly Salary</Text>
            <Text style={styles.detailValue}>{item.amount}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Freq</Text>
            <Text style={styles.detailValue}>{item.freq}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Employees</Text>
            <Text style={styles.detailValue}>{item.employees}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Eye size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Edit2 size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
            ListHeaderComponent={
              <View>
                <View style={styles.pageHeader}>
                  <Text style={styles.pageTitle}>Salary Structure</Text>
                  <Text style={styles.pageSubtitle}>Manage and configure salary structures</Text>
                </View>
                {renderKPIs()}
              </View>
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
          />
        )}
      </LinearGradient>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageHeader: { padding: 20, paddingTop: 10 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  pageSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  
  kpiContainer: { marginBottom: 20 },
  kpiScroll: { paddingHorizontal: 20, gap: 16 },
  kpiCard: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: 140,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  kpiValue: { fontSize: 20, color: '#1E293B', fontWeight: '700' },

  listContent: { paddingHorizontal: 20, gap: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  cardSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailBox: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  actionBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  }
});
