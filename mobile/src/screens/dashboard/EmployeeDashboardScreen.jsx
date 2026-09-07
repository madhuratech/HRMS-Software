import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Animated, ActivityIndicator, Platform
} from 'react-native';
import {
  Clock, CalendarCheck, CalendarOff, Sun, CheckCircle, FileText,
  User, Users, Award, Download, Eye, HelpCircle, ArrowRight,
  TrendingUp, AlertCircle, Bell, CheckSquare, Briefcase, Inbox,
  Activity as PieChartIcon
} from 'lucide-react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { useNavigation } from '@react-navigation/native';

// Helper for Donut Chart
const DonutChart = ({ presentPct, leavePct, absentPct }) => {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Render simple progress ring for present to keep it bug-free
  const presentStroke = (presentPct / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size/2}, ${size/2}`}>
          <Circle cx={size/2} cy={size/2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
          {presentPct > 0 && (
            <Circle 
              cx={size/2} cy={size/2} r={radius} stroke="#10B981" strokeWidth={strokeWidth}
              strokeDasharray={circumference} strokeDashoffset={circumference - presentStroke}
              strokeLinecap="round" fill="none" 
            />
          )}
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>{presentPct}%</Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>Present</Text>
      </View>
    </View>
  );
};

const LegendItem = ({ color, label, val }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, width: 100 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 6 }} />
      <Text style={{ fontSize: 12, color: '#64748B' }}>{label}</Text>
    </View>
    <Text style={{ fontSize: 12, fontWeight: '600', color: '#0F172A' }}>{val}</Text>
  </View>
);

const SafeIcon = ({ icon: Icon, fallback: Fallback = PieChartIcon, ...props }) => {
  const RenderIcon = Icon || Fallback;
  return RenderIcon ? <RenderIcon {...props} /> : null;
};

export default function EmployeeDashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // States mirroring the Web
  const [employee, setEmployee] = useState({ name: '', id: '', designation: '', department: '', joined: '', email: '' });
  const [attendanceToday, setAttendanceToday] = useState({ status: 'Not Punched', checkIn: '--', checkOut: '--', workingHours: '0h 0m' });
  const [attendanceStats, setAttendanceStats] = useState({ present: 85, absent: 5, leave: 10 });
  const [shift, setShift] = useState({ name: 'General Shift', time: '09:00 AM - 06:00 PM', workingDays: 'Mon - Fri' });
  const [leaveBalance, setLeaveBalance] = useState({ total: 24, used: 8, pending: 2, remaining: 14 });
  const [tasks, setTasks] = useState([]);

  const fetchData = async () => {
    try {
      // Setup base from context
      setEmployee({
        name: user?.name || 'Employee',
        id: user?.id ? `EMP${String(user.id).padStart(4, '0')}` : 'EMP-0124',
        email: user?.email || 'employee@company.com',
        department: user?.department || 'Engineering',
        designation: user?.designation || 'Software Developer',
        joined: '12 Jan 2024'
      });

      // Try fetching live data
      const [attRes, leaveRes, tasksRes] = await Promise.all([
        apiClient.get('/attendance/today-status').catch(() => null),
        apiClient.get('/leaves/balances/1').catch(() => null),
        apiClient.get('/tasks?assignedTo=me').catch(() => null),
      ]);

      if (attRes?.data) {
        setAttendanceToday(attRes.data.today || { status: 'Punched In', checkIn: '09:01 AM', checkOut: '--', workingHours: '4h 12m' });
        if (attRes.data.stats) setAttendanceStats(attRes.data.stats);
      } else {
        throw new Error('Fallback Attendance');
      }

      if (leaveRes?.data) {
        setLeaveBalance(leaveRes.data);
      } else {
        throw new Error('Fallback Leave');
      }
      
      if (tasksRes?.data) {
        const tData = tasksRes.data.data || tasksRes.data;
        setTasks(Array.isArray(tData) ? tData : []);
      } else {
        throw new Error('Fallback Tasks');
      }

    } catch (e) {
      // Web Fallback Data
      setAttendanceToday({ status: 'Punched In', checkIn: '08:55 AM', checkOut: '--', workingHours: '4h 30m' });
      setAttendanceStats({ present: 88, absent: 4, leave: 8 });
      setLeaveBalance({ total: 24, used: 6, pending: 1, remaining: 17 });
      setTasks([
        { id: 'TSK-001', title: 'Complete Q3 React Native Release', priority: 'High', due: 'Today' },
        { id: 'TSK-002', title: 'Review Payroll Module UI', priority: 'Medium', due: 'Tomorrow' },
        { id: 'TSK-003', title: 'Update Daily Timesheet', priority: 'Low', due: 'Oct 28' }
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
    >
      {/* 1. Header & Profile Card */}
      <View style={styles.headerCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{employee.name.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeTitle}>Welcome back, {employee.name.split(' ')[0]}!</Text>
            <Text style={styles.welcomeSubtitle}>{employee.designation} • {employee.department}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{employee.id}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity style={styles.primaryActionBtn} onPress={() => navigation.navigate('AttendanceMain')}>
            <SafeIcon icon={Clock} size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Web Clock In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        
        {/* 2. Today's Attendance Box */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <SafeIcon icon={Clock} size={18} color="#2563EB" />
            <Text style={styles.widgetTitle}>Today's Attendance</Text>
          </View>
          
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{attendanceToday.status}</Text>
          </View>
          
          <View style={styles.timingRow}>
            <View style={styles.timingBox}>
              <Text style={styles.timingLabel}>Check In</Text>
              <Text style={styles.timingValue}>{attendanceToday.checkIn}</Text>
            </View>
            <View style={styles.timingDivider} />
            <View style={styles.timingBox}>
              <Text style={styles.timingLabel}>Check Out</Text>
              <Text style={styles.timingValue}>{attendanceToday.checkOut}</Text>
            </View>
          </View>
          
          <View style={styles.hoursBox}>
            <Text style={styles.hoursLabel}>Total Working Hours</Text>
            <Text style={styles.hoursValue}>{attendanceToday.workingHours}</Text>
          </View>
        </View>

        {/* 3. Shift Schedule Box */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <SafeIcon icon={CalendarCheck} size={18} color="#8B5CF6" />
            <Text style={styles.widgetTitle}>Shift Schedule</Text>
          </View>
          
          <View style={styles.shiftBox}>
            <Text style={styles.shiftName}>{shift.name}</Text>
            <View style={styles.shiftTimeRow}>
              <SafeIcon icon={Clock} size={14} color="#64748B" />
              <Text style={styles.shiftTimeText}>{shift.time}</Text>
            </View>
            <View style={styles.shiftDaysRow}>
              <SafeIcon icon={CalendarCheck} size={14} color="#64748B" />
              <Text style={styles.shiftDaysText}>{shift.workingDays}</Text>
            </View>
          </View>
        </View>

        {/* 4. Attendance Overview Donut */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <SafeIcon icon={PieChartIcon} color="#059669" />
            <Text style={styles.widgetTitle}>Attendance Overview</Text>
          </View>
          
          <View style={styles.donutRow}>
            <DonutChart 
              presentPct={attendanceStats.present} 
              leavePct={attendanceStats.leave} 
              absentPct={attendanceStats.absent} 
            />
            <View style={styles.donutLegend}>
              <LegendItem color="#10B981" label="Present" val={`${attendanceStats.present}%`} />
              <LegendItem color="#CBD5E1" label="Leave" val={`${attendanceStats.leave}%`} />
              <LegendItem color="#EF4444" label="Absent" val={`${attendanceStats.absent}%`} />
            </View>
          </View>
        </View>

        {/* 5. Leave Balance */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <SafeIcon icon={Sun} size={18} color="#F59E0B" />
            <Text style={styles.widgetTitle}>Leave Balance</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LeaveBalance')}>
              <Text style={styles.linkText}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.leaveStatsGrid}>
            <View style={styles.leaveStat}>
              <Text style={styles.leaveStatVal}>{leaveBalance.total}</Text>
              <Text style={styles.leaveStatLabel}>Total</Text>
            </View>
            <View style={styles.leaveStat}>
              <Text style={[styles.leaveStatVal, { color: '#059669' }]}>{leaveBalance.remaining}</Text>
              <Text style={styles.leaveStatLabel}>Remaining</Text>
            </View>
            <View style={styles.leaveStat}>
              <Text style={[styles.leaveStatVal, { color: '#D97706' }]}>{leaveBalance.pending}</Text>
              <Text style={styles.leaveStatLabel}>Pending</Text>
            </View>
            <View style={styles.leaveStat}>
              <Text style={[styles.leaveStatVal, { color: '#DC2626' }]}>{leaveBalance.used}</Text>
              <Text style={styles.leaveStatLabel}>Used</Text>
            </View>
          </View>
        </View>

        {/* 6. Tasks List */}
        <View style={[styles.widgetCard, { marginBottom: 40 }]}>
          <View style={styles.widgetHeader}>
            <SafeIcon icon={CheckSquare} size={18} color="#0284C7" />
            <Text style={styles.widgetTitle}>My Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.linkText}>All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksList}>
            {Array.isArray(tasks) && tasks.map((task, idx) => (
              <View key={idx} style={styles.taskItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <View style={styles.taskMetaRow}>
                    <Text style={styles.taskMetaText}>{task.id}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.taskMetaText}>Due: {task.due}</Text>
                  </View>
                </View>
                <View style={[
                  styles.priorityBadge, 
                  task.priority === 'High' ? styles.priorityHigh : task.priority === 'Medium' ? styles.priorityMed : styles.priorityLow
                ]}>
                  <Text style={[
                    styles.priorityText,
                    task.priority === 'High' ? styles.priorityTextHigh : task.priority === 'Medium' ? styles.priorityTextMed : styles.priorityTextLow
                  ]}>{task.priority}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  headerCard: { backgroundColor: '#0F172A', padding: 24, paddingTop: 40, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { marginLeft: 16, flex: 1 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  badgeRow: { flexDirection: 'row' },
  badge: { backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.5)' },
  badgeText: { color: '#60A5FA', fontSize: 12, fontWeight: '600' },
  quickActionRow: { flexDirection: 'row', gap: 12 },
  primaryActionBtn: { flex: 1, backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  primaryActionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  
  grid: { padding: 16, marginTop: -10 },
  widgetCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  widgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  widgetTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },
  linkText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },

  // Attendance
  statusBadge: { backgroundColor: '#ECFDF5', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  statusBadgeText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
  timingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 16 },
  timingBox: { flex: 1, alignItems: 'center' },
  timingDivider: { width: 1, height: '100%', backgroundColor: '#E2E8F0', marginHorizontal: 16 },
  timingLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  timingValue: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  hoursBox: { alignItems: 'center', padding: 12, backgroundColor: '#EFF6FF', borderRadius: 12 },
  hoursLabel: { fontSize: 12, color: '#3B82F6', fontWeight: '600', marginBottom: 2 },
  hoursValue: { fontSize: 20, fontWeight: '800', color: '#1D4ED8' },

  // Shift
  shiftBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  shiftName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  shiftTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  shiftTimeText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  shiftDaysRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shiftDaysText: { fontSize: 14, color: '#475569', fontWeight: '500' },

  // Donut
  donutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, paddingTop: 10 },
  donutLegend: { justifyContent: 'center' },

  // Leave
  leaveStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  leaveStat: { flex: 1, minWidth: '45%', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  leaveStatVal: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  leaveStatLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },

  // Tasks
  tasksList: { gap: 12 },
  taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  taskTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskMetaText: { fontSize: 12, color: '#64748B' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 },
  priorityHigh: { backgroundColor: '#FEE2E2' },
  priorityMed: { backgroundColor: '#FEF3C7' },
  priorityLow: { backgroundColor: '#F1F5F9' },
  priorityText: { fontSize: 12, fontWeight: '700' },
  priorityTextHigh: { color: '#EF4444' },
  priorityTextMed: { color: '#D97706' },
  priorityTextLow: { color: '#64748B' },
});
