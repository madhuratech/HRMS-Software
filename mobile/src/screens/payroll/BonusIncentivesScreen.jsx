import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Search, Filter, Download, Plus, MoreVertical, Gift, Clock, Award, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';

// Custom Simple Donut Chart for React Native (SVG)
const DonutChart = ({ data, size = 150, strokeWidth = 20, centerText = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let currentOffset = 0;
  
  return (
    <View style={{ width: size, height: size, alignSelf: 'center', marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
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
      {!!centerText && <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B' }}>{centerText}</Text>}
    </View>
  );
};

export default function BonusIncentivesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/payroll/bonuses');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setData(res.data);
      } else {
        setData([
          { id: 1, name: 'Rahul Verma', type: 'Performance Bonus', rating: '5/5', amount: 50000, status: 'Approved', date: '01 May 2024' },
          { id: 2, name: 'Neha Patel', type: 'Sales Incentive', rating: '4/5', amount: 25000, status: 'Pending', date: '15 May 2024' },
          { id: 3, name: 'Aarav Sharma', type: 'Festival Bonus', rating: 'N/A', amount: 15000, status: 'Approved', date: '10 Oct 2024' },
        ]);
      }
    } catch (error) {
      console.warn('Error fetching bonuses:', error);
      setData([
        { id: 1, name: 'Rahul Verma', type: 'Performance Bonus', rating: '5/5', amount: 50000, status: 'Approved', date: '01 May 2024' },
        { id: 2, name: 'Neha Patel', type: 'Sales Incentive', rating: '4/5', amount: 25000, status: 'Pending', date: '15 May 2024' },
        { id: 3, name: 'Aarav Sharma', type: 'Festival Bonus', rating: 'N/A', amount: 15000, status: 'Approved', date: '10 Oct 2024' },
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

  const totalBonusAmount = data.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  const pendingBonusAmount = data.filter(b => b.status === 'Pending').reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  const pieData = [
    { name: 'Performance', value: 45, color: '#2563EB' },
    { name: 'Sales Incentive', value: 30, color: '#10B981' },
    { name: 'Festival', value: 15, color: '#F59E0B' },
    { name: 'Retention', value: 10, color: '#8B5CF6' },
  ];

  const barData = [
    { name: 'Eng.', Bonus: 40, Incentive: 24 },
    { name: 'Sales', Bonus: 30, Incentive: 50 },
    { name: 'Mark.', Bonus: 20, Incentive: 15 },
    { name: 'HR', Bonus: 15, Incentive: 5 },
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Bonus & Incentives</Text>
        <Text style={styles.pageSubtitle}>Manage employee bonuses and incentives</Text>
      </View>
      
      {/* KPI Scroll View */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Gift size={24} color="#10B981" />
            </View>
            <Text style={styles.kpiLabel}>Total Paid</Text>
            <Text style={styles.kpiValue}>₹{totalBonusAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <Clock size={24} color="#F59E0B" />
            </View>
            <Text style={styles.kpiLabel}>Pending</Text>
            <Text style={styles.kpiValue}>₹{pendingBonusAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Award size={24} color="#2563EB" />
            </View>
            <Text style={styles.kpiLabel}>Incentives</Text>
            <Text style={styles.kpiValue}>₹{(totalBonusAmount * 0.6).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <Star size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.kpiLabel}>Perf. Rewards</Text>
            <Text style={styles.kpiValue}>₹{(totalBonusAmount * 0.4).toLocaleString('en-IN')}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Chart Row: Pie & Bar stacked vertically for mobile */}
      <View style={[styles.card, { marginHorizontal: 20, marginBottom: 16 }]}>
        <Text style={styles.cardTitle}>Bonus Distribution</Text>
        <DonutChart data={pieData} size={150} strokeWidth={24} centerText="600k" />
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
        <Text style={styles.cardTitle}>Department Performance Bonus</Text>
        <View style={{ marginTop: 16, gap: 16 }}>
          {barData.map((b, idx) => (
            <View key={idx}>
              <Text style={{ fontSize: 13, color: '#475569', marginBottom: 4, fontWeight: '500' }}>{b.name}</Text>
              <View style={{ flexDirection: 'row', height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${(b.Bonus / 80) * 100}%`, backgroundColor: '#2563EB' }} />
                <View style={{ width: `${(b.Incentive / 80) * 100}%`, backgroundColor: '#10B981' }} />
              </View>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 }}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
            <Text style={styles.legendText}>Bonus</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Incentive</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.cardTitle, { marginHorizontal: 20, marginBottom: 12 }]}>Bonus Entries</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Approved' ? '#ECFDF5' : '#FFFBEB' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Approved' ? '#10B981' : '#F59E0B' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={[styles.detailValue, { color: '#2563EB' }]}>₹{item.amount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Rating</Text>
          <Text style={styles.detailValue}>{item.rating}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{item.date}</Text>
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
  
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
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
