import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, Edit2, Eye, Trash2, CheckCircle, FileText, FileX, Landmark, TrendingDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { ScrollView } from 'react-native';

export default function TaxManagementScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API call for tax declarations (matches frontend mock data)
      setTimeout(() => {
        setData([
          { id: 1, name: 'Siddharth Rao', fy: '2026-27', regime: 'New Regime', income: '₹ 14,50,000', deduction: '₹ 1,20,000', status: 'Declared' },
          { id: 2, name: 'Priya Sharma', fy: '2026-27', regime: 'Old Regime', income: '₹ 8,40,000', deduction: '₹ 45,000', status: 'Verified' },
          { id: 3, name: 'Vikram Singh', fy: '2026-27', regime: 'New Regime', income: '₹ 22,00,000', deduction: '₹ 4,50,000', status: 'Declared' },
          { id: 4, name: 'Neha Gupta', fy: '2026-27', regime: 'Old Regime', income: '₹ 6,50,000', deduction: '₹ 12,000', status: 'Pending' },
          { id: 5, name: 'Amit Patel', fy: '2026-27', regime: 'New Regime', income: '₹ 11,20,000', deduction: '₹ 85,000', status: 'Verified' },
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching TaxManagement:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const KPICard = ({ label, value, color, icon: Icon, bg }) => (
    <View style={[styles.kpiCard, { borderColor: bg }]}>
      <View style={[styles.kpiIconBox, { backgroundColor: bg }]}>
        <Icon size={18} color={color} />
      </View>
      <View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>FY: {item.fy} • {item.regime}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Verified' ? '#DEF7EC' : item.status === 'Pending' ? '#FEF3C7' : '#EFF6FF' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Verified' ? '#03543F' : item.status === 'Pending' ? '#92400E' : '#1E40AF' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Taxable Income</Text>
          <Text style={styles.detailValue}>{item.income}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tax Deduction</Text>
          <Text style={styles.detailValue}>{item.deduction}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn}>
          <Eye size={18} color='#6B7280' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tax Management</Text>
          <Text style={styles.headerSubtitle}>Manage tax declarations</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Add New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <KPICard label="Employees Filed" value="410" color="#10B981" bg="#ECFDF5" icon={FileText} />
        <KPICard label="Pending Declaration" value="70" color="#F59E0B" bg="#FFFBEB" icon={FileX} />
        <KPICard label="Tax Saved" value="₹ 1.8 Cr" color="#3B82F6" bg="#EFF6FF" icon={Landmark} />
        <KPICard label="Total Tax Collected" value="₹ 5.4 Cr" color="#EF4444" bg="#FEF2F2" icon={TrendingDown} />
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No data available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  addButton: { borderRadius: 10, overflow: 'hidden', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  kpiScroll: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  listContent: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardInfo: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDetails: { marginBottom: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#1E293B', fontWeight: '700' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, gap: 12 },
  iconBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});
