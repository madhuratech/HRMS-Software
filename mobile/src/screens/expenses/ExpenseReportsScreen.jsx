import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PieChart, BarChart, TrendingUp, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react-native';
import apiClient from '../../api/client';

export default function ExpenseReportsScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await apiClient.get('/expenses/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      } else if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching expense dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const renderStatCard = (title, value, subtitle, icon, colors) => (
    <LinearGradient colors={colors} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.statTop}>
        <View style={styles.statIconBox}>
          {icon}
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Expense Reports</Text>
            <Text style={styles.headerSubtitle}>Analytics and summary of all expenses</Text>
          </View>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : data ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* KPI Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiScroll}>
            {renderStatCard('Total Reimbursed', `₹${data.kpis?.totalReimbursement?.toLocaleString('en-IN') || 0}`, 'All Time Paid', <DollarSign size={24} color="#FFF" />, ['#10B981', '#059669'])}
            {renderStatCard('Pending Claims', data.kpis?.pendingClaims || 0, 'Awaiting Review', <Clock size={24} color="#FFF" />, ['#F59E0B', '#D97706'])}
            {renderStatCard('Approved Claims', data.kpis?.approvedClaims || 0, 'Ready for Payment', <CheckCircle size={24} color="#FFF" />, ['#3B82F6', '#2563EB'])}
            {renderStatCard('Total Claims', data.kpis?.totalClaims || 0, 'Submitted overall', <FileText size={24} color="#FFF" />, ['#8B5CF6', '#7C3AED'])}
          </ScrollView>

          {/* Category Distribution */}
          {data.categoryPie && data.categoryPie.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <PieChart size={20} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Category Distribution</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.barsContainer}>
                {data.categoryPie.map((cat, i) => (
                  <View key={i} style={styles.barWrapper}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabel}>{cat.name}</Text>
                      <Text style={styles.barAmount}>₹{cat.value.toLocaleString('en-IN')} ({cat.percent})</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: cat.percent, backgroundColor: cat.color || '#4F46E5' }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Department Breakdown */}
          {data.deptStats && data.deptStats.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <BarChart size={20} color="#EC4899" />
                <Text style={styles.sectionTitle}>Department Expenses</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.barsContainer}>
                {data.deptStats.sort((a, b) => b.amount - a.amount).map((dept, i) => {
                  const maxAmt = Math.max(...data.deptStats.map(d => d.amount));
                  const width = maxAmt > 0 ? `${(dept.amount / maxAmt) * 100}%` : '0%';
                  return (
                    <View key={i} style={styles.barWrapper}>
                      <View style={styles.barLabelRow}>
                        <Text style={styles.barLabel}>{dept.name}</Text>
                        <Text style={styles.barAmount}>{dept.formatted}</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width, backgroundColor: '#EC4899' }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Monthly Trend */}
          {data.monthlyTrend && data.monthlyTrend.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>Monthly Trend (Last 6 Months)</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.trendList}>
                {data.monthlyTrend.map((month, i) => (
                  <View key={i} style={styles.trendRow}>
                    <Text style={styles.trendMonth}>{month.month}</Text>
                    <Text style={styles.trendAmount}>₹{month.amount.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Failed to load dashboard data</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  
  content: { flex: 1 },
  kpiScroll: { paddingHorizontal: 16, paddingVertical: 20 },
  statCard: { width: 160, padding: 20, borderRadius: 24, marginRight: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  statTop: { marginBottom: 16 },
  statIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 4, letterSpacing: -1 },
  statTitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  statSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  sectionCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 20, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  
  barsContainer: { gap: 16 },
  barWrapper: { width: '100%' },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  barAmount: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  barTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  trendList: { gap: 12 },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  trendMonth: { fontSize: 15, fontWeight: '600', color: '#334155' },
  trendAmount: { fontSize: 16, fontWeight: '800', color: '#0F172A' }
});
