import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft, TrendingUp, Award, BarChart3, Star, ArrowUpRight, ArrowDownRight, Menu } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Dummy data for professional presentation
const performanceMetrics = [
  { label: 'Overall Efficiency', value: '92%', trend: '+4%', isUp: true },
  { label: 'Tasks Completed', value: '1,245', trend: '+12%', isUp: true },
  { label: 'Quality Score', value: '4.8/5', trend: '+0.2', isUp: true },
  { label: 'Turnaround Time', value: '2.4 days', trend: '-10%', isUp: false },
];

const topPerformers = [
  { id: 1, name: 'Alice Smith', dept: 'Engineering', score: '98/100', status: 'Excellent', avatar: 'AS' },
  { id: 2, name: 'Bob Johnson', dept: 'Sales', score: '95/100', status: 'Great', avatar: 'BJ' },
  { id: 3, name: 'Charlie Davis', dept: 'Marketing', score: '92/100', status: 'Good', avatar: 'CD' },
  { id: 4, name: 'Diana Prince', dept: 'Operations', score: '91/100', status: 'Good', avatar: 'DP' },
];

export default function PerformanceReportsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Custom Header with ONLY Screen Name and Back Button as requested */}
      <View style={styles.header}>
        <View style={styles.headerTop}>

        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Overview Cards */}
        <View style={styles.metricsContainer}>
          {performanceMetrics.map((item, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
              <View style={styles.trendRow}>
                {item.isUp ? (
                  <ArrowUpRight size={14} color={item.label === 'Turnaround Time' ? '#EF4444' : '#10B981'} />
                ) : (
                  <ArrowDownRight size={14} color={item.label === 'Turnaround Time' ? '#10B981' : '#EF4444'} />
                )}
                <Text style={[styles.trendText, { color: (item.label === 'Turnaround Time' ? !item.isUp : item.isUp) ? '#10B981' : '#EF4444' }]}>
                  {item.trend} vs last month
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top Performers List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Award size={20} color='#2563EB' />
            <Text style={styles.cardTitle}>Top Performers (This Quarter)</Text>
          </View>

          <View style={styles.listContainer}>
            {topPerformers.map((user, i) => (
              <View key={user.id} style={[styles.listItem, i === topPerformers.length - 1 && styles.lastItem]}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{user.avatar}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userDept}>{user.dept}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{user.score}</Text>
                  </View>
                  <Text style={styles.statusText}>{user.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Chart Placeholder for Professional Look */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BarChart3 size={20} color='#111827' />
            <Text style={styles.cardTitle}>Department Performance</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            {/* Simulating a bar chart with simple views */}
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 120, backgroundColor: '#2563EB' }]} />
              <Text style={styles.barLabel}>Eng</Text>
            </View>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 90, backgroundColor: '#818CF8' }]} />
              <Text style={styles.barLabel}>Sales</Text>
            </View>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 100, backgroundColor: '#2563EB' }]} />
              <Text style={styles.barLabel}>Mkt</Text>
            </View>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 75, backgroundColor: '#818CF8' }]} />
              <Text style={styles.barLabel}>Ops</Text>
            </View>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 110, backgroundColor: '#2563EB' }]} />
              <Text style={styles.barLabel}>HR</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 4, 
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  listContainer: {
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  userDept: {
    fontSize: 13,
    color: '#6B7280',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  statusText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  barGroup: {
    alignItems: 'center',
    width: 40,
  },
  bar: {
    width: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});