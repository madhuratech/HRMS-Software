import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, CalendarDays, CheckCircle, Bell, ChevronRight, TrendingUp, Calendar, AlertCircle, Target } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  
  // Weekly Attendance Mock (same as frontend)
  const WEEKLY_ATTENDANCE = [
    { day: 'Mon', hours: 8.5 },
    { day: 'Tue', hours: 9.0 },
    { day: 'Wed', hours: 8.2 },
    { day: 'Thu', hours: 8.8 },
    { day: 'Fri', hours: 7.5 } 
  ];

  const recentActivity = [
    { id: 1, title: 'Punched In', time: '09:00 AM', date: 'Today', type: 'success' },
    { id: 2, title: 'Shift Started', time: '09:00 AM', date: 'Today', type: 'info' },
    { id: 3, title: 'Document Uploaded', time: 'Yesterday', date: 'Oct 23', type: 'neutral' },
    { id: 4, title: 'Punched Out', time: '06:15 PM', date: 'Oct 23', type: 'warning' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Welcome Section */}
      <View style={styles.welcomeCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{user?.name ? user.name.substring(0, 2).toUpperCase() : 'JD'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeTitle}>Welcome back, {user?.name ? user.name.split(' ')[0] : 'John'}!</Text>
            <Text style={styles.welcomeSubtitle}>{user?.designation || 'Service Staff'} • {user?.department || 'Downtown Branch'}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.shiftBtn}
            onPress={() => navigation.navigate('ShiftManagement')}
          >
            <CalendarDays size={16} color='#2563EB' />
            <Text style={styles.shiftBtnText}>My Shifts</Text>
          </TouchableOpacity>
          <View style={styles.punchedInBadge}>
            <CheckCircle size={14} color="#16A34A" />
            <Text style={styles.punchedInText}>Punched In (09:00 AM)</Text>
          </View>
        </View>
      </View>

      {/* Onboarding Status Widget */}
      <View style={styles.onboardingWidget}>
        <View style={styles.onboardingHeader}>
          <AlertCircle size={20} color="#D97706" />
          <Text style={styles.onboardingTitle}>Onboarding Action Required</Text>
        </View>
        <Text style={styles.onboardingDesc}>Your verification is pending. Please upload required documents.</Text>
      </View>

      {/* Stats Grid matching StaffDashboard */}
      <View style={{ gap: 16, marginBottom: 16 }}>
        <View style={styles.statCardTarget}>
          <View style={styles.statIconRowTarget}>
            <View style={[styles.iconWrapTarget, { backgroundColor: '#EFF6FF' }]}>
              <Target size={20} color='#2563EB' />
            </View>
            <Text style={styles.statLabelTarget}>MONTHLY TARGET</Text>
          </View>
          <Text style={styles.statValueTarget}>82%</Text>
          <View style={styles.progressBarTarget}>
            <View style={[styles.progressFillTarget, { width: '82%', backgroundColor: '#2563EB' }]} />
          </View>
          <Text style={styles.statSubTarget}>12 tasks remaining to hit bonus</Text>
        </View>

        <View style={styles.statCardTarget}>
          <View style={styles.statIconRowTarget}>
            <View style={[styles.iconWrapTarget, { backgroundColor: '#F0FDF4' }]}>
              <TrendingUp size={20} color="#16A34A" />
            </View>
            <Text style={styles.statLabelTarget}>INCENTIVES</Text>
          </View>
          <Text style={styles.statValueTarget}>$450</Text>
          <Text style={styles.statTrendTarget}>+ $120 this week</Text>
          <Text style={styles.statSubTarget}>Next payout: Nov 1st</Text>
        </View>
      </View>

      {/* Weekly Attendance (Mocked Bars) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Weekly Attendance</Text>
        <View style={styles.chartContainer}>
          {WEEKLY_ATTENDANCE.map((item, idx) => {
            const heightPct = (item.hours / 10) * 100;
            return (
              <View key={idx} style={styles.barCol}>
                <Text style={styles.barVal}>{item.hours}h</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { height: `${Math.min(100, heightPct)}%` }]} />
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Assigned Tasks matching Web layout */}
      <View style={[styles.sectionCard, { flex: 1 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Assigned Tasks</Text>
          <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>3 Pending</Text>
          </View>
        </View>
        <View style={{ gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <TouchableOpacity key={i} style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>#JOB-29{i}</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#EA580C' }}>High Priority</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155' }}>Brake System Overhaul</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Due Today, 5:00 PM</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={{ width: '100%', marginTop: 16, paddingVertical: 10, alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8 }}>
          <Text style={{ color: '#2563EB', fontSize: 14, fontWeight: '600' }}>View All Tasks</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  welcomeCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  profileInfo: { marginLeft: 16, flex: 1 },
  welcomeTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12 },
  shiftBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  shiftBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
  punchedInBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0' },
  punchedInText: { color: '#15803D', fontWeight: '700', fontSize: 13 },
  onboardingWidget: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  onboardingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  onboardingTitle: { fontSize: 15, fontWeight: '700', color: '#B45309' },
  onboardingDesc: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  iconWrap: { padding: 6, borderRadius: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', flex: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  statUnit: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  statTrend: { fontSize: 11, color: '#10B981', fontWeight: '600', marginTop: 4 },
  statSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  shiftDate: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  shiftType: { fontSize: 12, color: '#6B7280' },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 20 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingHorizontal: 10 },
  barCol: { alignItems: 'center', width: 40 },
  barVal: { fontSize: 11, color: '#6B7280', marginBottom: 6, fontWeight: '600' },
  barBg: { width: 32, height: 100, backgroundColor: '#E5E7EB', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 8 },
  barFill: { width: '100%', backgroundColor: '#2563EB', borderRadius: 6 },
  barLabel: { fontSize: 12, color: '#475569', fontWeight: '500' },
  activityList: { paddingLeft: 8 },
  activityItem: { flexDirection: 'row', marginBottom: 16 },
  activityDotContainer: { alignItems: 'center', marginRight: 16, width: 12 },
  activityDot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  activityLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', position: 'absolute', top: 10, bottom: -20 },
  activityContent: { flex: 1, paddingBottom: 4 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  activityTime: { fontSize: 12, color: '#6B7280' },
  statCardTarget: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  statIconRowTarget: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  iconWrapTarget: { padding: 8, borderRadius: 8 },
  statLabelTarget: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  statValueTarget: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  progressBarTarget: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressFillTarget: { height: '100%', borderRadius: 4 },
  statSubTarget: { fontSize: 12, color: '#64748B', marginTop: 8 },
  statTrendTarget: { fontSize: 14, color: '#16A34A', fontWeight: '500', marginTop: 4 },
});
