import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Search, Filter, Download, Plus, MoreVertical, FileText, FileX, Landmark, TrendingDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TaxManagementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tableData = [
    { id: 1, name: 'Siddharth Rao', fy: '2026-27', regime: 'New Regime', income: '₹ 14,50,000', deduction: '₹ 1,20,000', status: 'Declared' },
    { id: 2, name: 'Priya Sharma', fy: '2026-27', regime: 'Old Regime', income: '₹ 8,40,000', deduction: '₹ 45,000', status: 'Verified' },
    { id: 3, name: 'Vikram Singh', fy: '2026-27', regime: 'New Regime', income: '₹ 22,00,000', deduction: '₹ 4,50,000', status: 'Declared' },
    { id: 4, name: 'Neha Gupta', fy: '2026-27', regime: 'Old Regime', income: '₹ 6,50,000', deduction: '₹ 12,000', status: 'Pending' },
    { id: 5, name: 'Amit Patel', fy: '2026-27', regime: 'New Regime', income: '₹ 11,20,000', deduction: '₹ 85,000', status: 'Verified' },
  ];

  const fetchData = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderHeader = () => (
    <View>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Tax Management</Text>
        <Text style={styles.pageSubtitle}>Manage employee tax declarations and TDS</Text>
      </View>
      
      {/* KPI Scroll View */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <FileText size={24} color="#10B981" />
            </View>
            <Text style={styles.kpiLabel}>Employees Filed</Text>
            <Text style={styles.kpiValue}>410</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <FileX size={24} color="#F59E0B" />
            </View>
            <Text style={styles.kpiLabel}>Pending</Text>
            <Text style={styles.kpiValue}>70</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Landmark size={24} color="#2563EB" />
            </View>
            <Text style={styles.kpiLabel}>Tax Saved</Text>
            <Text style={styles.kpiValue}>₹ 1.8 Cr</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
              <TrendingDown size={24} color="#EF4444" />
            </View>
            <Text style={styles.kpiLabel}>Tax Collected</Text>
            <Text style={styles.kpiValue}>₹ 5.4 Cr</Text>
          </View>
        </ScrollView>
      </View>

      <View style={[styles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
        <Text style={styles.cardTitle}>Income Tax Slab Summary (New)</Text>
        <View style={{ marginTop: 16, gap: 12 }}>
          <View style={styles.slabRow}>
            <Text style={styles.slabLabel}>Up to ₹ 3,00,000</Text>
            <Text style={styles.slabValue}>Nil</Text>
          </View>
          <View style={styles.slabRow}>
            <Text style={styles.slabLabel}>₹ 3,00,001 - ₹ 6,00,000</Text>
            <Text style={styles.slabValue}>5%</Text>
          </View>
          <View style={styles.slabRow}>
            <Text style={styles.slabLabel}>₹ 6,00,001 - ₹ 9,00,000</Text>
            <Text style={styles.slabValue}>10%</Text>
          </View>
          <View style={styles.slabRow}>
            <Text style={styles.slabLabel}>₹ 9,00,001 - ₹ 12,00,000</Text>
            <Text style={styles.slabValue}>15%</Text>
          </View>
          <View style={styles.slabRow}>
            <Text style={styles.slabLabel}>₹ 12,00,001 - ₹ 15,00,000</Text>
            <Text style={styles.slabValue}>20%</Text>
          </View>
          <View style={[styles.slabRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.slabLabel}>Above ₹ 15,00,000</Text>
            <Text style={styles.slabValue}>30%</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.cardTitle, { marginHorizontal: 20, marginBottom: 12 }]}>Tax Declarations</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.fy} • {item.regime}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'Verified' ? '#ECFDF5' : item.status === 'Declared' ? '#EFF6FF' : '#FFFBEB'
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'Verified' ? '#10B981' : item.status === 'Declared' ? '#2563EB' : '#F59E0B'
          }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Taxable Income</Text>
          <Text style={styles.detailValue}>{item.income}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Tax Deduction</Text>
          <Text style={[styles.detailValue, { color: '#EF4444' }]}>{item.deduction}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={tableData}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
            ListHeaderComponent={renderHeader}
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
  kpiValue: { fontSize: 18, color: '#1E293B', fontWeight: '700' },

  slabRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  slabLabel: { fontSize: 13, color: '#475569' },
  slabValue: { fontSize: 13, fontWeight: '600', color: '#1E293B' },

  listContent: { paddingHorizontal: 20, gap: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  cardSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailBox: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#1E293B' },

  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  }
});
