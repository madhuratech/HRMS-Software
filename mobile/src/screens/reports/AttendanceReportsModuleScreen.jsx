import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Download, Calendar, Users, UserCheck, Clock, UserX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SUMMARY_DATA = [
  { id: 1, dept: 'Engineering', total: 45, present: 43, absent: 1, late: 1, pct: '97%' },
  { id: 2, dept: 'Sales', total: 20, present: 19, absent: 0, late: 1, pct: '95%' },
  { id: 3, dept: 'HR', total: 5, present: 5, absent: 0, late: 0, pct: '100%' }
];

export default function AttendanceReportsModuleScreen() {
  const renderKpi = (label, value, Icon, color, bgColor) => (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIconBox, { backgroundColor: bgColor }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Attendance Reports</Text>
            <Text style={styles.headerSubtitle}>Monitor daily attendance, lates</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnPrimary}>
              <Download size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCardFull}>
            <View style={styles.kpiRowHeader}>
              <Text style={styles.kpiLabel}>Attendance Rate</Text>
              <Users size={16} color="#2563EB" />
            </View>
            <Text style={styles.kpiValueLarge}>100%</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          {renderKpi('Present', '140', UserCheck, '#10B981', '#D1FAE5')}
          {renderKpi('Late', '12', Clock, '#F59E0B', '#FEF3C7')}
        </View>
        
        <View style={styles.kpiRow}>
          {renderKpi('Absent', '3', UserX, '#EF4444', '#FEE2E2')}
          {renderKpi('Half Day', '2', Calendar, '#6366F1', '#E0E7FF')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Summary</Text>
          
          {SUMMARY_DATA.map(item => (
            <View key={item.id} style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryDept}>{item.dept}</Text>
                <Text style={styles.summaryPct}>{item.pct}</Text>
              </View>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryText}>Total: {item.total}</Text>
                <Text style={styles.summaryText}>Present: {item.present}</Text>
                <Text style={styles.summaryText}>Late: {item.late}</Text>
                <Text style={styles.summaryText}>Absent: {item.absent}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { padding: 20, paddingTop: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  btnPrimary: { padding: 10, borderRadius: 8, backgroundColor: '#2952E3' },
  
  content: { padding: 16, paddingBottom: 60 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiCard: { flex: 0.48, backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  kpiCardFull: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  kpiRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kpiIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  kpiValueLarge: { fontSize: 28, fontWeight: '800', color: '#111827' },
  
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  
  summaryCard: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryDept: { fontSize: 14, fontWeight: '700', color: '#111827' },
  summaryPct: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  summaryDetails: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  summaryText: { fontSize: 12, color: '#6B7280', width: '48%', marginBottom: 4 }
});
