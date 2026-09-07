import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Search, Filter, Download, Plus, MoreVertical, Layers, TrendingUp, TrendingDown, Landmark } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';

// Custom Simple Donut Chart for React Native (SVG)
const DonutChart = ({ data, size = 150, strokeWidth = 20 }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1; // Prevent division by zero
  
  let currentOffset = 0;
  
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', marginVertical: 10 }}>
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

export default function SalaryComponentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/payroll/components');
      if (Array.isArray(res.data)) {
        setData(res.data.map(item => ({
          ...item,
          freq: item.frequency || item.freq || 'Monthly'
        })));
      } else {
        setData([
          { id: '1', name: 'Basic Salary', type: 'Earning', taxable: 'Yes', formula: 'Fixed', freq: 'Monthly', status: 'Active' },
          { id: '2', name: 'Provident Fund', type: 'Deduction', taxable: 'No', formula: '12% of Basic', freq: 'Monthly', status: 'Active' },
          { id: '3', name: 'Employer PF', type: 'Contribution', taxable: 'No', formula: '12% of Basic', freq: 'Monthly', status: 'Active' }
        ]);
      }
    } catch (error) {
      console.warn('Error fetching salary components:', error);
      setData([
        { id: '1', name: 'Basic Salary', type: 'Earning', taxable: 'Yes', formula: 'Fixed', freq: 'Monthly', status: 'Active' },
        { id: '2', name: 'Provident Fund', type: 'Deduction', taxable: 'No', formula: '12% of Basic', freq: 'Monthly', status: 'Active' },
        { id: '3', name: 'Employer PF', type: 'Contribution', taxable: 'No', formula: '12% of Basic', freq: 'Monthly', status: 'Active' }
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

  const totalComp = data.length;
  const earningsCount = data.filter(c => c.type === 'Earning').length;
  const deductionsCount = data.filter(c => c.type === 'Deduction').length;
  const contribCount = data.filter(c => c.type === 'Contribution').length;

  const pieData = [
    { name: 'Earnings', value: earningsCount || 1, color: '#10B981' },
    { name: 'Deductions', value: deductionsCount || 1, color: '#EF4444' },
    { name: 'Contributions', value: contribCount || 1, color: '#F59E0B' },
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Salary Components</Text>
        <Text style={styles.pageSubtitle}>Manage earnings, deductions, and contributions</Text>
      </View>
      
      {/* KPI Scroll View */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Layers size={24} color="#2563EB" />
            </View>
            <Text style={styles.kpiLabel}>Total Components</Text>
            <Text style={styles.kpiValue}>{totalComp}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <TrendingUp size={24} color="#10B981" />
            </View>
            <Text style={styles.kpiLabel}>Earnings</Text>
            <Text style={styles.kpiValue}>{earningsCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
              <TrendingDown size={24} color="#EF4444" />
            </View>
            <Text style={styles.kpiLabel}>Deductions</Text>
            <Text style={styles.kpiValue}>{deductionsCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <Landmark size={24} color="#F59E0B" />
            </View>
            <Text style={styles.kpiLabel}>Contributions</Text>
            <Text style={styles.kpiValue}>{contribCount}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Chart Card */}
      <View style={[styles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
        <Text style={styles.cardTitle}>Component Distribution</Text>
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
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.formula}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.type === 'Earning' ? '#ECFDF5' : item.type === 'Contribution' ? '#FFFBEB' : '#FEF2F2' }]}>
          <Text style={[styles.statusText, { color: item.type === 'Earning' ? '#10B981' : item.type === 'Contribution' ? '#F59E0B' : '#EF4444' }]}>
            {item.type}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Taxable</Text>
          <Text style={styles.detailValue}>{item.taxable}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Frequency</Text>
          <Text style={styles.detailValue}>{item.freq}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[styles.statusBadgeSmall, { backgroundColor: item.status === 'Active' ? '#ECFDF5' : '#FEF2F2', alignSelf: 'flex-start' }]}>
            <Text style={[styles.statusTextSmall, { color: item.status === 'Active' ? '#10B981' : '#EF4444' }]}>
              {item.status}
            </Text>
          </View>
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
            data={data}
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
  kpiValue: { fontSize: 20, color: '#1E293B', fontWeight: '700' },

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
  statusBadgeSmall: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusTextSmall: { fontSize: 11, fontWeight: '600' },
  
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailBox: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: '#475569' },

  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  }
});
