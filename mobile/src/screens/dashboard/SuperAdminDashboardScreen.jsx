import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Animated, Easing, ActivityIndicator
} from 'react-native';
import { DollarSign, Users, Briefcase, CheckCircle2, UserCheck, Calendar, Bell, ChevronRight, Activity, Building2, CalendarOff } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

const { width } = Dimensions.get('window');

const KpiCard = ({ label, value, trend, trendLabel, iconBg, iconColor, iconSymbol: IconComponent, gradientColors }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <LinearGradient colors={gradientColors || ['#FFFFFF', '#FFFFFF']} style={styles.kpiCard}>
          <View style={styles.kpiTopRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.kpiLabel} numberOfLines={1}>{label}</Text>
              <Text style={styles.kpiValue}>{value}</Text>
            </View>
            <View style={[styles.kpiIconBox, { backgroundColor: iconBg }]}>
              <IconComponent size={18} color={iconColor} />
            </View>
          </View>
          {trend ? (
            <View style={styles.kpiBottomRow}>
              <Text style={styles.kpiTrend}>↑ {trend}</Text>
              <Text style={styles.kpiTrendLabel}>{trendLabel}</Text>
            </View>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Helper for Donut Chart
const DonutChart = ({ presentPct, leavePct, absentPct }) => {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const presentStroke = (presentPct / 100) * circumference;
  const leaveStroke = (leavePct / 100) * circumference;
  const absentStroke = (absentPct / 100) * circumference;

  const leaveOffset = circumference - presentStroke;
  const absentOffset = leaveOffset - leaveStroke;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Present (Green) */}
        <Circle cx={size/2} cy={size/2} r={radius} stroke="#10B981" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${presentStroke} ${circumference}`} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
        {/* Leave (Gray) */}
        <Circle cx={size/2} cy={size/2} r={radius} stroke="#CBD5E1" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${leaveStroke} ${circumference}`} strokeDashoffset={leaveOffset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
        {/* Absent (Red) */}
        <Circle cx={size/2} cy={size/2} r={radius} stroke="#EF4444" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${absentStroke} ${circumference}`} strokeDashoffset={absentOffset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827' }}>{presentPct}%</Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Present</Text>
      </View>
    </View>
  );
};

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation values
  const kpiAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.log('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
      animateIn();
    }
  };

  const animateIn = () => {
    Animated.timing(kpiAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5))
    }).start();

    const animations = cardsAnim.map(anim => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    );
    Animated.stagger(100, animations).start();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // Remove all dummy data backups - fallback to empty states or zeros
  const employeeCount = stats?.totalEmployees || 0;
  const deptCount = stats?.totalDepartments || 0;
  const branchCount = stats?.totalBranches || 0;
  const leavesCount = stats?.totalLeaves || 0;

  const presentToday = stats?.attendanceToday || 0;
  const leaveToday = stats?.totalLeaves || 0;
  const absentToday = Math.max(0, employeeCount - presentToday - leaveToday);

  const totalForPct = employeeCount > 0 ? employeeCount : (presentToday + leaveToday + absentToday);
  const presentPct = totalForPct > 0 ? Math.round((presentToday / totalForPct) * 100) : 0;
  const leavePct = totalForPct > 0 ? Math.round((leaveToday / totalForPct) * 100) : 0;
  const absentPct = totalForPct > 0 ? Math.max(0, 100 - presentPct - leavePct) : 0;

  const deptSummary = stats?.departmentSummary || [];
  const perfList = stats?.performanceEmployees || [];
  const leaveList = stats?.recentLeaves || [];
  const holidayList = stats?.upcomingHolidays || [];
  const birthdayList = stats?.upcomingBirthdays || [];
  const activityList = stats?.recentActivity || [];

  const EmptyState = ({ message }) => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}>

      {/* 1. KPIs */}
      <Animated.ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.kpiContainer}
        style={{ 
          opacity: kpiAnim, 
          transform: [{ translateY: kpiAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] 
        }}
      >
        <KpiCard label="Total Employees" value={employeeCount} trend="2%" trendLabel="vs last month" iconBg="#F3E8FF" iconColor="#7C3AED" iconSymbol={Users} gradientColors={['#FFFFFF', '#F5F3FF']} />
        <KpiCard label="Total Departments" value={deptCount} iconBg="#DCFCE7" iconColor="#16A34A" iconSymbol={Briefcase} gradientColors={['#FFFFFF', '#F0FDF4']} />
        <KpiCard label="Total Branches" value={branchCount} iconBg="#EFF6FF" iconColor="#2563EB" iconSymbol={Building2} gradientColors={['#FFFFFF', '#EFF6FF']} />
        <KpiCard label="Active Leaves" value={leavesCount} iconBg="#FEF3C7" iconColor="#D97706" iconSymbol={CalendarOff} gradientColors={['#FFFFFF', '#FFFBEB']} />
      </Animated.ScrollView>

      <View style={{ paddingBottom: 30 }}>
        {/* 2. Department Breakdown */}
        <Animated.View style={[styles.card, { opacity: cardsAnim[0], transform: [{ translateY: cardsAnim[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Department Breakdown</Text>
            <Text style={styles.cardSubtitle}>Employees per department</Text>
          </View>
          {deptSummary.length > 0 ? (
            <View style={{ gap: 12 }}>
              {deptSummary.map((item, idx) => {
                const pct = employeeCount > 0 ? Math.round((item.emp / employeeCount) * 100) : 0;
                return (
                  <View key={idx}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>{item.dept}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#111827' }}>{item.emp} ({pct}%)</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
                      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: '#2563EB', borderRadius: 16 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState message="No department data available" />
          )}
        </Animated.View>

        {/* 3. Attendance Status */}
        <Animated.View style={[styles.card, { opacity: cardsAnim[1], transform: [{ translateY: cardsAnim[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Attendance Status</Text>
            <Text style={styles.cardSubtitle}>Today's overview</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <DonutChart presentPct={presentPct} leavePct={leavePct} absentPct={absentPct} />
            </View>
            <View style={{ flex: 1, gap: 10 }}>
              <View style={[styles.attStatBox, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                <View style={[styles.attIconBox, { backgroundColor: '#DCFCE7' }]}><UserCheck size={14} color="#16A34A" /></View>
                <View>
                  <Text style={[styles.attStatVal, { color: '#111827' }]}>{presentToday}</Text>
                  <Text style={[styles.attStatLabel, { color: '#16A34A' }]}>Present</Text>
                </View>
              </View>
              <View style={[styles.attStatBox, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
                <View style={[styles.attIconBox, { backgroundColor: '#FEE2E2' }]}><Calendar size={14} color="#EF4444" /></View>
                <View>
                  <Text style={[styles.attStatVal, { color: '#111827' }]}>{leaveToday}</Text>
                  <Text style={[styles.attStatLabel, { color: '#EF4444' }]}>On Leave</Text>
                </View>
              </View>
              <View style={[styles.attStatBox, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                <View style={[styles.attIconBox, { backgroundColor: '#DBEAFE' }]}><Calendar size={14} color="#2563EB" /></View>
                <View>
                  <Text style={[styles.attStatVal, { color: '#111827' }]}>{absentToday}</Text>
                  <Text style={[styles.attStatLabel, { color: '#2563EB' }]}>Absent</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* 4. Employee Performance Overview */}
        <Animated.View style={[styles.card, { opacity: cardsAnim[2], transform: [{ translateY: cardsAnim[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={[styles.cardHeader, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={styles.cardTitle}>Top Performers</Text>
            <TouchableOpacity><Text style={styles.linkText}>View All</Text></TouchableOpacity>
          </View>
          {perfList.length > 0 ? perfList.slice(0, 3).map((emp, i) => (
            <View key={i} style={styles.perfRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.perfName}>{emp.name}</Text>
                <Text style={styles.perfDept}>{emp.designation} • {emp.dept}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={styles.perfScoreBox}><Text style={styles.perfScore}>{emp.score}</Text></View>
                <Text style={{ fontSize: 10, color: emp.isUp ? '#16A34A' : '#EF4444', fontWeight: '600' }}>{emp.trend}</Text>
              </View>
            </View>
          )) : <EmptyState message="No performance records found" />}
        </Animated.View>

        {/* 5. On Leave Today */}
        <Animated.View style={[styles.card, { opacity: cardsAnim[3], transform: [{ translateY: cardsAnim[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={[styles.cardHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 16, backgroundColor: '#F59E0B' }} />
              <Text style={styles.cardTitle}>On Leave Today</Text>
            </View>
            <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 16 }}>
              <Text style={{ color: '#D97706', fontSize: 10, fontWeight: '700' }}>{leaveToday}</Text>
            </View>
          </View>
          {leaveList.length > 0 ? leaveList.map((emp, i) => {
            const isSick = (emp.type || '').includes('Sick');
            return (
              <View key={i} style={[styles.perfRow, { borderBottomWidth: i === leaveList.length - 1 ? 0 : 1 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.perfName}>{emp.name}</Text>
                  <Text style={styles.perfDept}>{emp.dept} • {emp.days}</Text>
                </View>
                <View style={{ backgroundColor: isSick ? '#FEF2F2' : '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isSick ? '#EF4444' : '#2563EB' }}>{emp.type}</Text>
                </View>
              </View>
            );
          }) : <EmptyState message="No employees on leave today" />}
        </Animated.View>

        {/* 6. Upcoming Holidays */}
        <Animated.View style={[styles.card, { opacity: cardsAnim[4], transform: [{ translateY: cardsAnim[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={[styles.cardHeader, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={styles.cardTitle}>Upcoming Holidays</Text>
            <TouchableOpacity><Text style={styles.linkText}>View All</Text></TouchableOpacity>
          </View>
          {holidayList.length > 0 ? holidayList.map((h, i) => (
            <View key={i} style={styles.holidayRow}>
              <Calendar size={14} color='#6B7280' />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B', width: 55 }}>{h.date}</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', width: 75 }}>{h.day}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E293B', flex: 1 }}>{h.name}</Text>
            </View>
          )) : <EmptyState message="No upcoming holidays" />}
        </Animated.View>

        {/* 7. Upcoming Birthdays */}
        <Animated.View style={[styles.card, { opacity: cardsAnim[5], transform: [{ translateY: cardsAnim[5].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={[styles.cardHeader, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={styles.cardTitle}>Upcoming Birthdays</Text>
            <TouchableOpacity><Text style={styles.linkText}>View All</Text></TouchableOpacity>
          </View>
          {birthdayList.length > 0 ? birthdayList.map((b, i) => (
            <View key={i} style={[styles.perfRow, { borderBottomWidth: i === birthdayList.length - 1 ? 0 : 1, paddingVertical: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.perfName}>{b.name}</Text>
                <Text style={styles.perfDept}>{b.role}</Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280' }}>{b.date}</Text>
            </View>
          )) : <EmptyState message="No upcoming birthdays" />}
        </Animated.View>

        {/* 8. Recent Activities */}
        <Animated.View style={[styles.card, { opacity: cardsAnim[6], transform: [{ translateY: cardsAnim[6].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={[styles.cardHeader, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={styles.cardTitle}>Recent Activities</Text>
            <TouchableOpacity><Text style={styles.linkText}>View All</Text></TouchableOpacity>
          </View>
          {activityList.length > 0 ? activityList.map((act, i) => (
            <View key={i} style={[styles.holidayRow, { paddingVertical: 10, borderBottomWidth: i === activityList.length - 1 ? 0 : 1 }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#374151' }}>
                  <Text style={{ fontWeight: '700', color: '#111827' }}>{act.name} </Text>
                  {act.action}
                </Text>
                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{act.time}</Text>
              </View>
              <View style={{ width: 8, height: 8, borderRadius: 16, backgroundColor: act.dot || '#10B981' }} />
            </View>
          )) : <EmptyState message="No recent activities" />}
        </Animated.View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  kpiContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  kpiCard: {
    width: width * 0.42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB', // slate-200
    padding: 16,
    marginRight: 16,
    shadowColor: '#111827', // slate-900
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280', // gray-500
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22, // adjusted to match web's 22px
    fontWeight: '800',
    color: '#111827',
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8, // adjusted to match web's 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 4,
  },
  kpiTrend: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  kpiTrendLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // slate-200
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24, // adjusted to match web
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB', // blue-600
  },
  attStatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12, // adjusted to match web's 12px
    borderWidth: 1,
    gap: 10,
  },
  attIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attStatVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  attStatLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  perfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // slate-100
  },
  perfName: {
    fontSize: 13,
    fontWeight: '600', // matches web's 600
    color: '#111827',
  },
  perfDept: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  perfScoreBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // matches web's 12px
  },
  perfScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA', // matches web's FAFAFA for empty/striped rows
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  }
});

