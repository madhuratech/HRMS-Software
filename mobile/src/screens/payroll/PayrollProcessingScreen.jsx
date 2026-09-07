import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Play, Calendar, Filter, Users, FileText, CheckCircle2, IndianRupee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const workflowSteps = [
  { step: 1, name: 'Attendance Verif.', status: 'completed' },
  { step: 2, name: 'Leave Calc.', status: 'completed' },
  { step: 3, name: 'Overtime Calc.', status: 'completed' },
  { step: 4, name: 'Salary Calc.', status: 'in-progress' },
  { step: 5, name: 'Tax Calc.', status: 'pending' },
  { step: 6, name: 'Payroll Done', status: 'pending' },
];

export default function PayrollProcessingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/payroll/runs');
      if (Array.isArray(res.data)) {
        setRuns(res.data);
      } else {
        setRuns([{ id: 1, processed_employees: 450, total_employees: 480, gross_amount: 4520000, net_amount: 3880000 }]);
      }
    } catch (error) {
      console.warn('Error fetching runs, using fallback', error);
      setRuns([{ id: 1, processed_employees: 450, total_employees: 480, gross_amount: 4520000, net_amount: 3880000 }]);
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

  const latestRun = runs[0] || {};
  const processedCount = latestRun.processed_employees || 450;
  const totalCount = latestRun.total_employees || 480;
  const pendingCount = totalCount - processedCount;

  // Fallback data for the department table since we don't have it from backend in this view
  const tableData = [
    { id: 1, dept: 'Engineering', emp: 145, gross: '₹ 15,20,000', net: '₹ 12,80,000', status: 'Processed' },
    { id: 2, dept: 'Sales', emp: 82, gross: '₹ 6,40,000', net: '₹ 5,30,000', status: 'Processed' },
    { id: 3, dept: 'Marketing', emp: 45, gross: '₹ 3,80,000', net: '₹ 3,20,000', status: 'Processed' },
    { id: 4, dept: 'Customer Support', emp: 120, gross: '₹ 5,60,000', net: '₹ 4,90,000', status: 'Pending' },
    { id: 5, dept: 'Human Resources', emp: 15, gross: '₹ 1,80,000', net: '₹ 1,50,000', status: 'Pending' },
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Payroll Processing</Text>
          <Text style={styles.pageSubtitle}>Process and manage monthly payroll</Text>
        </View>
        <TouchableOpacity style={styles.processBtn}>
          <Play size={16} color="#FFF" />
          <Text style={styles.processBtnText}>Process Payroll</Text>
        </TouchableOpacity>
      </View>
      
      {/* KPI Scroll View */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Users size={24} color="#2563EB" />
            </View>
            <Text style={styles.kpiLabel}>Processed</Text>
            <Text style={styles.kpiValue}>{processedCount} / {totalCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <FileText size={24} color="#F59E0B" />
            </View>
            <Text style={styles.kpiLabel}>Pending</Text>
            <Text style={styles.kpiValue}>{pendingCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <IndianRupee size={24} color="#10B981" />
            </View>
            <Text style={styles.kpiLabel}>Gross Payroll</Text>
            <Text style={styles.kpiValue}>{latestRun.gross_amount ? `₹ ${(latestRun.gross_amount / 100000).toFixed(1)}L` : '₹ 45.2L'}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <IndianRupee size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.kpiLabel}>Net Payroll</Text>
            <Text style={styles.kpiValue}>{latestRun.net_amount ? `₹ ${(latestRun.net_amount / 100000).toFixed(1)}L` : '₹ 38.8L'}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Workflow Progress Card */}
      <View style={[styles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
        <Text style={styles.cardTitle}>Payroll Workflow</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {workflowSteps.map((step, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ alignItems: 'center', width: 70 }}>
                  <View style={[
                    styles.stepCircle, 
                    step.status === 'completed' ? { backgroundColor: '#10B981', borderColor: '#10B981' } :
                    step.status === 'in-progress' ? { backgroundColor: '#2563EB', borderColor: '#2563EB' } :
                    { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }
                  ]}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 size={16} color="#FFF" />
                    ) : (
                      <Text style={[styles.stepNum, { color: step.status === 'pending' ? '#94A3B8' : '#FFF' }]}>{step.step}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepText, { color: step.status === 'pending' ? '#94A3B8' : '#1E293B' }]} numberOfLines={2} textAlign="center">
                    {step.name}
                  </Text>
                </View>
                {idx < workflowSteps.length - 1 && (
                  <View style={{ width: 30, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: -5, marginTop: -20, zIndex: -1 }} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Text style={[styles.cardTitle, { marginHorizontal: 20, marginBottom: 12 }]}>Department Summary</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.dept}</Text>
          <Text style={styles.cardSubtitle}>{item.emp} Employees</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Processed' ? '#ECFDF5' : '#FFFBEB' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Processed' ? '#10B981' : '#F59E0B' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Gross Salary</Text>
          <Text style={styles.detailValue}>{item.gross}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Net Salary</Text>
          <Text style={[styles.detailValue, { color: '#2563EB' }]}>{item.net}</Text>
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
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
            ListHeaderComponent={renderHeader}
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
  pageHeader: { padding: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  pageSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  
  processBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 8 },
  processBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  kpiContainer: { marginBottom: 20 },
  kpiScroll: { paddingHorizontal: 20, gap: 16 },
  kpiCard: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: 140,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  kpiValue: { fontSize: 18, color: '#1E293B', fontWeight: '700' },

  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 8, zIndex: 2 },
  stepNum: { fontSize: 14, fontWeight: '700' },
  stepText: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

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
  detailValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
});
