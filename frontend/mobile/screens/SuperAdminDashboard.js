import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { DollarSign, Users, Briefcase, UserCheck } from 'lucide-react-native';

const KpiCard = ({ label, value, trend, icon: Icon, color, bgColor }) => (
  <View style={styles.kpiCard}>
    <View style={styles.kpiTop}>
      <View>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
      </View>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <Icon color={color} size={20} />
      </View>
    </View>
    <View style={styles.kpiBottom}>
      <Text style={styles.trendText}>↑ {trend}</Text>
      <Text style={styles.trendLabel}>vs last month</Text>
    </View>
  </View>
);

export function SuperAdminDashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Header title="Dashboard" navigation={navigation} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <KpiCard label="Total Revenue" value="₹1.2L" trend="12.5%" icon={DollarSign} color="#7C3AED" bgColor="#F3E8FF" />
          <KpiCard label="Total Employees" value="45" trend="8.3%" icon={Users} color="#2563EB" bgColor="#EFF6FF" />
          <KpiCard label="Total Projects" value="12" trend="15.7%" icon={Briefcase} color="#16A34A" bgColor="#DCFCE7" />
          <KpiCard label="Total Clients" value="8" trend="10.2%" icon={UserCheck} color="#F59E0B" bgColor="#FEF3C7" />
        </View>

        {/* Charts & Tables Placeholders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Team Performance</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Chart Placeholder</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendance Status</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Donut Chart Placeholder</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  kpiGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  trendLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  placeholderBox: {
    height: 200,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '500',
  }
});
