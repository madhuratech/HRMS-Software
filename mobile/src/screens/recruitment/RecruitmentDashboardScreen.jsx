import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Briefcase, Users, CalendarDays, FileCheck, UserCheck, TrendingUp, TrendingDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Polygon, Defs, LinearGradient as SvgLinearGradient, Stop, Path } from 'react-native-svg';
import apiClient from '../../api/client';

const CustomDonutChart = ({ data, total }) => {
  const size = 120;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedDashOffset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size/2}, ${size/2}`}>
          {data.map((item, index) => {
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (item.value / (total || 1)) * circumference;
            const strokeRotation = accumulatedDashOffset;
            accumulatedDashOffset += (item.value / (total || 1)) * 360;

            return (
              <Circle
                key={index}
                cx={size/2} cy={size/2} r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(${strokeRotation}, ${size/2}, ${size/2})`}
              />
            );
          })}
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B' }}>{total}</Text>
        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '500' }}>Total</Text>
      </View>
    </View>
  );
};

const CustomAreaChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 10);
  const width = 300;
  const height = 120;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const y = height - (d.value / maxVal) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <View style={{ width: '100%', height, marginTop: 12 }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        <Polygon points={areaPoints} fill="url(#grad)" />
        <Path d={`M ${points}`} fill="none" stroke="#3B82F6" strokeWidth="3" />
      </Svg>
    </View>
  );
};

export default function RecruitmentDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, jobsRes] = await Promise.all([
        apiClient.get('/requirements/dashboard'),
        apiClient.get('/requirements?limit=5')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (jobsRes.data?.success) setRecentJobs(jobsRes.data.data.requirements || []);
    } catch (err) {
      console.warn('Error fetching recruitment dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const totalOpenings = stats?.total?.[0]?.count || 0;
  const openReqs = stats?.open?.[0]?.count || 0;
  const pendingApproval = stats?.pendingApproval?.[0]?.count || 0;
  const criticalHiring = stats?.critical?.[0]?.count || 0;
  const monthOpenings = stats?.monthOpenings?.[0]?.count || 0;

  const kpis = [
    { title: 'Total Openings', value: totalOpenings, trend: '10%', isUp: true, Icon: Briefcase, color: '#2952E3', bg: '#EFF6FF' },
    { title: 'Open Reqs', value: openReqs, trend: '15%', isUp: true, Icon: Users, color: '#10B981', bg: '#ECFDF5' },
    { title: 'Pending Appr.', value: pendingApproval, trend: '5%', isUp: false, Icon: CalendarDays, color: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Critical Hiring', value: criticalHiring, trend: '20%', isUp: true, Icon: FileCheck, color: '#EF4444', bg: '#FEF2F2' },
    { title: 'Month Openings', value: monthOpenings, trend: '114%', isUp: true, Icon: UserCheck, color: '#10B981', bg: '#ECFDF5' },
  ];

  const lineChartData = (stats?.monthlyTrend || []).map(item => ({ date: item.month, value: item.count }));
  if (lineChartData.length === 0) lineChartData.push({ date: 'No Data', value: 0 });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];
  const statusPieData = (stats?.statusChart || []).map((item, idx) => ({
    name: item.status, value: item.count, color: COLORS[idx % COLORS.length]
  }));
  const totalStatusCount = statusPieData.reduce((acc, curr) => acc + curr.value, 0);

  const topJobs = (stats?.hiringManagerStats || []).map(item => ({ title: item.manager_name, apps: item.count }));

  const funnelData = [
    { stage: 'Total Openings', value: totalOpenings, color: '#3B82F6' },
    { stage: 'Open', value: openReqs, color: '#6366F1' },
    { stage: 'Pending Approval', value: pendingApproval, color: '#8B5CF6' },
    { stage: 'Critical', value: criticalHiring, color: '#A855F7' }
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      {/* KPIs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        {kpis.map((kpi, idx) => (
          <View key={idx} style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <View style={[styles.iconBox, { backgroundColor: kpi.bg }]}>
                <kpi.Icon size={16} color={kpi.color} />
              </View>
              <Text style={styles.kpiTitle}>{kpi.title}</Text>
            </View>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <View style={styles.trendRow}>
              <View style={[styles.trendIcon, { backgroundColor: kpi.bg }]}>
                {kpi.isUp ? <TrendingUp size={10} color={kpi.color} /> : <TrendingDown size={10} color={kpi.color} />}
              </View>
              <Text style={[styles.trendText, { color: kpi.color }]}>{kpi.trend}</Text>
              <Text style={styles.trendLabel}> vs last month</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.content}>
        
        {/* Openings Trend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Openings Trend</Text>
          <CustomAreaChart data={lineChartData} />
          <View style={styles.chartXAxis}>
            {lineChartData.map((d, i) => (
              <Text key={i} style={styles.chartXLabel}>{d.date}</Text>
            ))}
          </View>
        </View>

        {/* Requirements by Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Requirements by Status</Text>
          <View style={styles.pieRow}>
            <CustomDonutChart data={statusPieData} total={totalStatusCount} />
            <View style={styles.legendContainer}>
              {statusPieData.map((item, idx) => (
                <View key={idx} style={styles.legendItem}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendName}>{item.name}</Text>
                  </View>
                  <Text style={styles.legendValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Hiring Manager Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hiring Manager Stats</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeadText}>Manager</Text>
            <Text style={styles.tableHeadText}>Requirements</Text>
          </View>
          {topJobs.length === 0 ? (
            <Text style={styles.emptyText}>No stats available</Text>
          ) : (
            topJobs.map((job, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCellMain}>{job.title}</Text>
                <Text style={styles.tableCellValue}>{job.apps}</Text>
              </View>
            ))
          )}
        </View>

        {/* Recruitment Funnel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recruitment Funnel</Text>
          <View style={styles.funnelContainer}>
            {funnelData.map((stage, idx) => (
              <View key={idx} style={styles.funnelItem}>
                <View style={styles.funnelLeft}>
                  <View style={[styles.funnelDot, { backgroundColor: stage.color }]} />
                  <Text style={styles.funnelName}>{stage.stage}</Text>
                </View>
                <Text style={styles.funnelValue}>{stage.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Job Openings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Job Openings</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 600 }}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeadText, { flex: 2 }]}>Job Title</Text>
                <Text style={[styles.tableHeadText, { flex: 1.5 }]}>Department</Text>
                <Text style={[styles.tableHeadText, { flex: 1.5 }]}>Location</Text>
                <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Vacancies</Text>
                <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Status</Text>
              </View>
              {recentJobs.length === 0 ? (
                <Text style={styles.emptyText}>No recent openings</Text>
              ) : (
                recentJobs.map((row, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.tableCellMain, { flex: 2 }]} numberOfLines={1}>{row.job_title}</Text>
                    <Text style={[styles.tableCellSub, { flex: 1.5 }]} numberOfLines={1}>{row.department_name}</Text>
                    <Text style={[styles.tableCellSub, { flex: 1.5 }]} numberOfLines={1}>{row.location}</Text>
                    <Text style={[styles.tableCellValue, { flex: 1, textAlign: 'center' }]}>{row.vacancies}</Text>
                    <View style={[{ flex: 1, alignItems: 'center' }]}>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{row.status}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  kpiScroll: { padding: 16, gap: 12, paddingRight: 24 },
  kpiCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: 160,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  kpiTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  kpiTitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  kpiValue: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendIcon: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  trendText: { fontSize: 11, fontWeight: '600' },
  trendLabel: { fontSize: 10, color: '#94A3B8' },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 16 },
  chartXAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  chartXLabel: { fontSize: 10, color: '#94A3B8' },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  legendContainer: { flex: 1, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendName: { fontSize: 12, color: '#475569', fontWeight: '500' },
  legendValue: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 8 },
  tableHeadText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  tableCellMain: { fontSize: 12, fontWeight: '500', color: '#334155' },
  tableCellSub: { fontSize: 12, color: '#475569' },
  tableCellValue: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  emptyText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: 20 },
  statusBadge: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '600', color: '#10B981' },
  funnelContainer: { gap: 12 },
  funnelItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  funnelLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  funnelDot: { width: 8, height: 8, borderRadius: 4 },
  funnelName: { fontSize: 12, color: '#475569', fontWeight: '500' },
  funnelValue: { fontSize: 13, fontWeight: '600', color: '#1E293B' }
});
