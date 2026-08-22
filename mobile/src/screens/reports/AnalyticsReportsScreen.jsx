import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart3, PieChart, TrendingUp, Users, DollarSign, CalendarCheck } from 'lucide-react-native';

export default function AnalyticsReportsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Company overview & reports</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#3B82F6" />
            <Text style={styles.statValue}>124</Text>
            <Text style={styles.statLabel}>Total Employees</Text>
          </View>
          <View style={styles.statCard}>
            <CalendarCheck size={24} color="#10B981" />
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#F59E0B" />
            <Text style={styles.statValue}>$42k</Text>
            <Text style={styles.statLabel}>Sales this Month</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>+12%</Text>
            <Text style={styles.statLabel}>Performance</Text>
          </View>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  content: { padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  statCard: { 
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 12, marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  reportItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, 
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' 
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  reportDesc: { fontSize: 13, color: '#6B7280' }
});
