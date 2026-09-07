import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Download, DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SUMMARY_DATA = [
  { id: 1, dept: 'Engineering', total: '$145,000', net: '$110,000', taxes: '$25,000', ded: '$10,000' },
  { id: 2, dept: 'Sales', total: '$85,000', net: '$65,000', taxes: '$15,000', ded: '$5,000' },
  { id: 3, dept: 'HR', total: '$25,000', net: '$20,000', taxes: '$4,000', ded: '$1,000' }
];

export default function PayrollReportsModuleScreen() {
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
            <Text style={styles.headerTitle}>Payroll Reports</Text>
            <Text style={styles.headerSubtitle}>Monitor salary payouts & taxes</Text>
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
              <Text style={styles.kpiLabel}>Total Payroll (Gross)</Text>
              <DollarSign size={16} color="#2563EB" />
            </View>
            <Text style={styles.kpiValueLarge}>$255,000</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          {renderKpi('Net Pay', '$195,000', Wallet, '#10B981', '#D1FAE5')}
          {renderKpi('Taxes', '$44,000', ArrowUpRight, '#F59E0B', '#FEF3C7')}
        </View>
        
        <View style={styles.kpiRow}>
          {renderKpi('Deductions', '$16,000', ArrowDownRight, '#EF4444', '#FEE2E2')}
          {renderKpi('Avg. Salary', '$6,500', DollarSign, '#6366F1', '#E0E7FF')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Breakdown</Text>
          
          {SUMMARY_DATA.map(item => (
            <View key={item.id} style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryDept}>{item.dept}</Text>
                <Text style={styles.summaryTotal}>{item.total} Gross</Text>
              </View>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryText}>Net Pay: {item.net}</Text>
                <Text style={styles.summaryText}>Taxes: {item.taxes}</Text>
                <Text style={styles.summaryText}>Deductions: {item.ded}</Text>
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
  summaryTotal: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  summaryDetails: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  summaryText: { fontSize: 12, color: '#6B7280', width: '48%', marginBottom: 4 }
});
