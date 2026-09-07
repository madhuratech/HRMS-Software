import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Search, Filter, Download, Plus, MoreVertical, CreditCard, PiggyBank, CalendarClock, HandCoins } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';

// Custom Simple Donut Chart for React Native (SVG)
const DonutChart = ({ data, size = 150, strokeWidth = 20 }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let currentOffset = 0;
  
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {data.map((item, index) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (item.value / total) * circumference;
            return (
              <Path
                key={index}
                d={`M${center},${center} m0,-${radius} a${radius},${radius} 0 1,1 0,${2 * radius} a${radius},${radius} 0 1,1 0,-${2 * radius}`}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default function LoansAdvancesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tableData = [
    { id: 1, name: 'Siddharth Rao', type: 'Personal Loan', amount: '₹ 2,00,000', emi: '₹ 12,000', out: '₹ 1,40,000', next: '05 Nov 2026', status: 'Active' },
    { id: 2, name: 'Priya Sharma', type: 'Salary Advance', amount: '₹ 50,000', emi: '₹ 10,000', out: '₹ 20,000', next: '05 Nov 2026', status: 'Active' },
    { id: 3, name: 'Vikram Singh', type: 'Home Loan', amount: '₹ 15,00,000', emi: '₹ 45,000', out: '₹ 12,50,000', next: '05 Nov 2026', status: 'Active' },
    { id: 4, name: 'Neha Gupta', type: 'Medical Emergency', amount: '₹ 1,50,000', emi: '₹ 8,000', out: '₹ 0', next: '-', status: 'Closed' },
    { id: 5, name: 'Amit Patel', type: 'Salary Advance', amount: '₹ 30,000', emi: '₹ 15,000', out: '₹ 30,000', next: '05 Nov 2026', status: 'Pending Approval' },
  ];

  const pieData = [
    { name: 'Personal Loan', value: 45, color: '#2563EB' },
    { name: 'Home Loan', value: 35, color: '#10B981' },
    { name: 'Salary Advance', value: 15, color: '#F59E0B' },
    { name: 'Medical', value: 5, color: '#EF4444' },
  ];

  const barData = [
    { month: 'Jun', EMI: 90000 },
    { month: 'Jul', EMI: 105000 },
    { month: 'Aug', EMI: 110000 },
    { month: 'Sep', EMI: 115000 },
    { month: 'Oct', EMI: 120000 },
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
        <Text style={styles.pageTitle}>Loans & Advances</Text>
        <Text style={styles.pageSubtitle}>Manage employee loans and salary advances</Text>
      </View>
      
      {/* KPI Scroll View */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <CreditCard size={24} color="#2563EB" />
            </View>
            <Text style={styles.kpiLabel}>Active Loans</Text>
            <Text style={styles.kpiValue}>18</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <PiggyBank size={24} color="#10B981" />
            </View>
            <Text style={styles.kpiLabel}>Total Amount</Text>
            <Text style={styles.kpiValue}>₹ 24.5L</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <CalendarClock size={24} color="#F59E0B" />
            </View>
            <Text style={styles.kpiLabel}>Monthly EMI</Text>
            <Text style={styles.kpiValue}>₹ 1.2L</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
              <HandCoins size={24} color="#EF4444" />
            </View>
            <Text style={styles.kpiLabel}>Outstanding</Text>
            <Text style={styles.kpiValue}>₹ 16.8L</Text>
          </View>
        </ScrollView>
      </View>

      {/* Distribution Chart */}
      <View style={[styles.card, { marginHorizontal: 20, marginBottom: 16 }]}>
        <Text style={styles.cardTitle}>Loan Distribution by Type</Text>
        <DonutChart data={pieData} size={150} strokeWidth={24} />
        <View style={styles.legendContainer}>
          {pieData.map((item, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
        <Text style={styles.cardTitle}>Monthly EMI Collection</Text>
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
          {barData.map((b, idx) => {
            const maxEMI = 120000;
            const height = `${(b.EMI / maxEMI) * 100}%`;
            return (
              <View key={idx} style={{ alignItems: 'center', width: '15%' }}>
                <View style={{ width: 20, height, backgroundColor: '#10B981', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>{b.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={[styles.cardTitle, { marginHorizontal: 20, marginBottom: 12 }]}>Loans & Advances Records</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'Active' ? '#ECFDF5' : item.status === 'Closed' ? '#F1F5F9' : '#FFFBEB'
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 'Active' ? '#10B981' : item.status === 'Closed' ? '#64748B' : '#F59E0B'
          }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>{item.amount}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>EMI</Text>
          <Text style={styles.detailValue}>{item.emi}</Text>
        </View>
      </View>
      <View style={[styles.detailsRow, { borderTopWidth: 0, paddingTop: 4 }]}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Outstanding</Text>
          <Text style={[styles.detailValue, { color: '#EF4444' }]}>{item.out}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Next EMI Date</Text>
          <Text style={styles.detailValue}>{item.next}</Text>
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
  
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailBox: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#475569' },

  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  }
});
