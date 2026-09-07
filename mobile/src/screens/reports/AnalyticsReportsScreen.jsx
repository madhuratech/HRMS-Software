import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart3, PieChart, TrendingUp, Users, DollarSign, CalendarCheck, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnalyticsReportsScreen() {
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
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Company overview & reports</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          {renderKpi('Total Employees', '124', Users, '#3B82F6', '#EFF6FF')}
          {renderKpi('Attendance Rate', '98%', CalendarCheck, '#10B981', '#D1FAE5')}
        </View>
        <View style={styles.kpiRow}>
          {renderKpi('Sales this Month', '$42k', DollarSign, '#F59E0B', '#FEF3C7')}
          {renderKpi('Performance', '+12%', TrendingUp, '#8B5CF6', '#EDE9FE')}
        </View>

        <Text style={styles.sectionTitle}>Available Reports</Text>

        <TouchableOpacity style={styles.reportItem}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <PieChart size={20} color="#3B82F6" />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Department Headcount</Text>
            <Text style={styles.reportDesc}>Distribution of employees across departments</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportItem}>
          <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
            <BarChart3 size={20} color="#10B981" />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Performance Matrix</Text>
            <Text style={styles.reportDesc}>9-box grid and appraisal results</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportItem}>
          <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
            <DollarSign size={20} color="#F59E0B" />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Sales Revenue Summary</Text>
            <Text style={styles.reportDesc}>Monthly and quarterly sales breakdown</Text>
          </View>
        </TouchableOpacity>

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
  
  content: { padding: 16, paddingBottom: 60 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiCard: { flex: 0.48, backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  kpiIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 12, marginBottom: 16 },
  
  reportItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  reportDesc: { fontSize: 13, color: '#6B7280' }
});
