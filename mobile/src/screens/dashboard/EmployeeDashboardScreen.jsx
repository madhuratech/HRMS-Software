import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CalendarCheck, CalendarOff, Clock, FileText, ChevronRight } from 'lucide-react-native';

export default function EmployeeDashboardScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome back, Sarah!</Text>
        <Text style={styles.welcomeSubtitle}>Here's your activity for today.</Text>
      </View>

      {/* Attendance Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Clock size={20} color="#2563EB" />
          </View>
          <Text style={styles.statValue}>09:00 AM</Text>
          <Text style={styles.statLabel}>Check In Time</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
            <CalendarCheck size={20} color="#16A34A" />
          </View>
          <Text style={styles.statValue}>22 Days</Text>
          <Text style={styles.statLabel}>Present this month</Text>
        </View>
      </View>

      {/* Leave Balance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Leave Balance</Text>
          <TouchableOpacity><Text style={styles.linkText}>View All</Text></TouchableOpacity>
        </View>

        <View style={styles.leaveCards}>
          <View style={[styles.leaveCard, { borderColor: '#E0E7FF' }]}>
            <Text style={styles.leaveType}>Casual Leave</Text>
            <Text style={[styles.leaveValue, { color: '#4F46E5' }]}>08</Text>
            <Text style={styles.leaveSub}>Remaining</Text>
          </View>
          <View style={[styles.leaveCard, { borderColor: '#DCFCE7' }]}>
            <Text style={styles.leaveType}>Sick Leave</Text>
            <Text style={[styles.leaveValue, { color: '#16A34A' }]}>04</Text>
            <Text style={styles.leaveSub}>Remaining</Text>
          </View>
        </View>
      </View>

      {/* Upcoming Holidays */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.holidayRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateMonth}>OCT</Text>
              <Text style={styles.dateDay}>24</Text>
            </View>
            <View style={styles.holidayInfo}>
              <Text style={styles.holidayName}>Diwali</Text>
              <Text style={styles.holidayDesc}>Floating Holiday</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <CalendarOff size={20} color="#475569" />
          </View>
          <Text style={styles.actionText}>Apply for Leave</Text>
          <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionIcon}>
            <FileText size={20} color="#475569" />
          </View>
          <Text style={styles.actionText}>View Payslip</Text>
          <ChevronRight size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  linkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  leaveCards: {
    flexDirection: 'row',
    gap: 16,
  },
  leaveCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  leaveType: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
  },
  leaveValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  leaveSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B91C1C',
  },
  holidayInfo: {
    flex: 1,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  holidayDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
});
