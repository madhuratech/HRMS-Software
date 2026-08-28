import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { Briefcase, HeartPulse, Award, Clock, CalendarDays, RefreshCw, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const LEAVE_COLORS = {
  'Casual Leave': { icon: Briefcase, color: '#3B82F6', bg: '#EFF6FF' },
  'Sick Leave': { icon: HeartPulse, color: '#10B981', bg: '#ECFDF5' },
  'Earned Leave': { icon: Award, color: '#8B5CF6', bg: '#F5F3FF' },
  'Comp Off': { icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
  'Default': { icon: CalendarDays, color: '#2563EB', bg: '#EFF6FF' },
};

export default function LeaveBalanceScreen({ navigation }) {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ cl: '0 Days', sl: '0 Days', el: '0 Days', comp: '0 Hrs' });

  const isEmployee = (user?.role || '').toUpperCase() === 'EMPLOYEE';

  useEffect(() => { fetchBalances(); }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const empId = user?.employee_id || user?.id || 1;
      const res = await apiClient.get('/leaves/balances/' + empId);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setBalances(res.data);
        // Build summary
        const clItem = res.data.find(b => b.leave_type?.toLowerCase().includes('casual'));
        const slItem = res.data.find(b => b.leave_type?.toLowerCase().includes('sick'));
        const elItem = res.data.find(b => b.leave_type?.toLowerCase().includes('earned'));
        const compItem = res.data.find(b => b.leave_type?.toLowerCase().includes('comp'));
        setSummary({
          cl: (clItem?.balance ?? 0) + ' Days',
          sl: (slItem?.balance ?? 0) + ' Days',
          el: (elItem?.balance ?? 0) + ' Days',
          comp: (compItem?.balance ?? 0) + ' Hrs',
        });
      }

      // For HR/Admin, also try to get all-balances
      if (!isEmployee) {
        try {
          const allRes = await apiClient.get('/leaves/all-balances');
          if (allRes.data?.records) setAllRecords(allRes.data.records);
        } catch {}
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const kpiCards = [
    { title: 'Casual Leave (CL)', value: summary.cl, icon: Briefcase, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Sick Leave (SL)', value: summary.sl, icon: HeartPulse, color: '#10B981', bg: '#ECFDF5' },
    { title: 'Earned Leave (EL)', value: summary.el, icon: Award, color: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Comp Off', value: summary.comp, icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Leave Balance</Text>
          <Text style={styles.headerSubtitle}>Your leave allocations & remaining balance</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchBalances}>
          <RefreshCw size={18} color='#2563EB' />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBalances(); }} colors={['#2563EB']} />}
      >
        {/* Summary KPI Cards (matches web LeaveBalance) */}
        <View style={styles.kpiGrid}>
          {kpiCards.map((kpi, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <View style={styles.kpiCardLeft}>
                <Text style={styles.kpiTitle}>{kpi.title}</Text>
                {loading ? (
                  <ActivityIndicator size="small" color='#2563EB' style={{ marginTop: 4 }} />
                ) : (
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                )}
              </View>
              <View style={[styles.kpiIcon, { backgroundColor: kpi.bg }]}>
                <kpi.icon size={22} color={kpi.color} />
              </View>
            </View>
          ))}
        </View>

        {/* Detailed Leave Balance Cards */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <CalendarDays size={18} color='#2563EB' />
            <Text style={styles.sectionTitle}>Detailed Leave Breakdown</Text>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color='#2563EB' />
            </View>
          ) : balances.length === 0 ? (
            <View style={styles.emptyBox}>
              <CalendarDays size={40} color='#CBD5E1' />
              <Text style={styles.emptyText}>No leave balance data found</Text>
            </View>
          ) : (
            balances.map((item, idx) => {
              const config = LEAVE_COLORS[item.leave_type] || LEAVE_COLORS['Default'];
              const Icon = config.icon;
              const used = item.used ?? (item.allocated - item.balance);
              const pct = item.allocated > 0 ? Math.min(100, ((used / item.allocated) * 100)) : 0;
              return (
                <View key={idx} style={styles.balanceRow}>
                  <View style={styles.balanceLeft}>
                    <View style={[styles.balanceIcon, { backgroundColor: config.bg }]}>
                      <Icon size={16} color={config.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.balanceType}>{item.leave_type}</Text>
                      {/* Progress bar */}
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: pct + '%', backgroundColor: config.color }]} />
                      </View>
                      <Text style={styles.balanceSub}>{used} used of {item.allocated} allocated</Text>
                    </View>
                  </View>
                  <View style={styles.balanceRight}>
                    <Text style={[styles.balanceNum, { color: item.balance > 0 ? '#10B981' : '#EF4444' }]}>{item.balance}</Text>
                    <Text style={styles.balanceNumLabel}>Days Left</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Leave Policy</Text>
          <Text style={styles.infoText}>• Leave balance resets at the beginning of each calendar year</Text>
          <Text style={styles.infoText}>• Earned leave can be carried forward up to the maximum limit</Text>
          <Text style={styles.infoText}>• Contact HR for leave encashment or comp-off adjustments</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  refreshBtn: { padding: 8, backgroundColor: '#EFF6FF', borderRadius: 10 },
  content: { padding: 16, gap: 16 },

  // KPI grid (2×2)
  kpiGrid: { gap: 12 },
  kpiCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  kpiCardLeft: { flex: 1 },
  kpiTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 },
  kpiValue: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  kpiIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Section card
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },

  // Balance rows
  balanceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  balanceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  balanceIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  balanceType: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  balanceSub: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  progressTrack: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  balanceRight: { alignItems: 'center' },
  balanceNum: { fontSize: 22, fontWeight: '900' },
  balanceNumLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },

  // Info card
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginBottom: 10 },
  infoText: { fontSize: 12, color: '#1E40AF', lineHeight: 20 },

  centerBox: { padding: 32, alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
});
