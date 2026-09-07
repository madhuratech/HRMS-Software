import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ClipboardList, Play, CheckCircle, PauseCircle, AlertTriangle, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function ProjectDashboardScreen() {
  const [stats, setStats] = useState({
    totalProjects: 0, inProgress: 0, completed: 0, onHold: 0, notStarted: 0, delayed: 0,
    statusPie: [], monthlyTrend: [], topProjects: [], recentProjects: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/projects/dashboard');
      if (res.data?.success && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching project dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Completed': return { bg: '#DCFCE7', text: '#15803D' };
      case 'On Hold': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Overdue': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'Planning': return { bg: '#EDE9FE', text: '#5B21B6' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const { recentProjects = [], topProjects = [] } = stats;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Project Dashboard</Text>
          <Text style={styles.subtitle}>Overview of all projects and key metrics</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn}>
          <Download size={14} color="#374151" />
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <View style={[styles.kpiCard, { borderColor: '#E5E7EB' }]}>
          <View style={styles.kpiHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#DBEAFE' }]}><ClipboardList size={16} color="#2563EB" /></View>
            <Text style={styles.kpiLabel}>Total Projects</Text>
          </View>
          <Text style={styles.kpiValue}>{stats.totalProjects}</Text>
        </View>
        
        <View style={[styles.kpiCard, { borderColor: '#E5E7EB' }]}>
          <View style={styles.kpiHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#DBEAFE' }]}><Play size={16} color="#2563EB" /></View>
            <Text style={styles.kpiLabel}>In Progress</Text>
          </View>
          <Text style={styles.kpiValue}>{stats.inProgress}</Text>
        </View>
        
        <View style={[styles.kpiCard, { borderColor: '#E5E7EB' }]}>
          <View style={styles.kpiHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#DCFCE7' }]}><CheckCircle size={16} color="#16A34A" /></View>
            <Text style={styles.kpiLabel}>Completed</Text>
          </View>
          <Text style={styles.kpiValue}>{stats.completed}</Text>
        </View>
        
        <View style={[styles.kpiCard, { borderColor: '#E5E7EB' }]}>
          <View style={styles.kpiHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}><PauseCircle size={16} color="#D97706" /></View>
            <Text style={styles.kpiLabel}>On Hold</Text>
          </View>
          <Text style={styles.kpiValue}>{stats.onHold}</Text>
        </View>
        
        <View style={[styles.kpiCard, { borderColor: '#E5E7EB' }]}>
          <View style={styles.kpiHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FEE2E2' }]}><AlertTriangle size={16} color="#DC2626" /></View>
            <Text style={styles.kpiLabel}>Overdue</Text>
          </View>
          <Text style={styles.kpiValue}>{stats.delayed}</Text>
        </View>
      </ScrollView>

      {/* Top Projects */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 Projects by Progress</Text>
        <View style={styles.card}>
          {topProjects.length === 0 ? (
            <Text style={styles.emptyText}>No active projects</Text>
          ) : (
            topProjects.map((p, i) => (
              <View key={i} style={[styles.listItem, i === topProjects.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.projectName}>{p.name}</Text>
                  <Text style={styles.projectManager}>{p.manager}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>{p.progress}%</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${p.progress}%`, backgroundColor: p.progress > 80 ? '#10B981' : p.progress > 40 ? '#3B82F6' : '#F59E0B' }]} />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Recent Projects Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Projects</Text>
        <View style={styles.card}>
          {recentProjects.length === 0 ? (
             <Text style={styles.emptyText}>No recent projects</Text>
          ) : (
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
               <View style={{ minWidth: 500 }}>
                 <View style={styles.tableHeader}>
                   <Text style={[styles.th, { flex: 2 }]}>Project Name</Text>
                   <Text style={[styles.th, { flex: 1.5 }]}>Manager</Text>
                   <Text style={[styles.th, { flex: 1 }]}>Deadline</Text>
                   <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                 </View>
                 {recentProjects.map((p, i) => {
                   const sColors = getStatusColor(p.status);
                   return (
                     <View key={i} style={styles.tr}>
                       <Text style={[styles.tdMain, { flex: 2 }]} numberOfLines={1}>{p.name}</Text>
                       <Text style={[styles.tdSub, { flex: 1.5 }]} numberOfLines={1}>{p.manager}</Text>
                       <Text style={[styles.tdSub, { flex: 1 }]} numberOfLines={1}>{p.end}</Text>
                       <View style={[{ flex: 1, alignItems: 'flex-start' }]}>
                         <View style={[styles.badge, { backgroundColor: sColors.bg }]}>
                           <Text style={[styles.badgeText, { color: sColors.text }]}>{p.status}</Text>
                         </View>
                       </View>
                     </View>
                   );
                 })}
               </View>
             </ScrollView>
          )}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', gap: 6 },
  exportBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  
  kpiScroll: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  kpiCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, minWidth: 140, borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  kpiIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  kpiLabel: { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  kpiValue: { fontSize: 24, fontWeight: '700', color: '#111827' },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: 20 },
  
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  projectName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  projectManager: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  progressContainer: { alignItems: 'flex-end', width: 60 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 4 },
  progressBarBg: { width: '100%', height: 4, backgroundColor: '#F3F4F6', borderRadius: 2 },
  progressBarFill: { height: '100%', borderRadius: 2 },

  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 8 },
  th: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  tdMain: { fontSize: 13, fontWeight: '500', color: '#111827' },
  tdSub: { fontSize: 12, color: '#6B7280' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '600' }
});
