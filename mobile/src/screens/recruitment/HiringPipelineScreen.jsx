import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Clock, TrendingUp, CheckCircle, Users, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function HiringPipelineScreen({ navigation }) {
  const [pipelineList, setPipelineList] = useState([]);
  const [totals, setTotals] = useState({ applied: 0, screening: 0, interview: 0, offer: 0, hired: 0 });
  const [insights, setInsights] = useState({ avgTimeToHire: '28 Days', interviewConversion: '0%', offerAcceptanceRate: '0%', overallConversion: '0%' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/pipeline/stats');
      if (res.data?.success && res.data?.data) {
        setTotals(res.data.data.totals);
        setPipelineList(res.data.data.breakdown || []);
        setInsights(res.data.data.insights);
      }
    } catch (err) {
      console.warn('Error fetching pipeline stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getProgressBarColor = (val) => {
    if (val > 10) return '#10B981';
    if (val > 6) return '#2952E3';
    return '#F59E0B';
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hiring Pipeline</Text>
          <Text style={styles.subtitle}>Track hiring pipeline and conversion rates</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Action', 'Add Source form goes here.')}>
          <Plus size={16} color="#FFF" />
          <Text style={styles.addBtnText}>Source</Text>
        </TouchableOpacity>
      </View>

      {/* Pipeline Blocks */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pipelineScroll}>
        <View style={[styles.pipeBlock, { backgroundColor: '#EEF2FF', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }]}>
          <Text style={[styles.pipeLabel, { color: '#6366F1' }]}>Applied</Text>
          <Text style={styles.pipeValue}>{totals.applied}</Text>
        </View>
        <View style={[styles.pipeBlock, { backgroundColor: '#F5F3FF' }]}>
          <Text style={[styles.pipeLabel, { color: '#8B5CF6' }]}>Screening</Text>
          <Text style={styles.pipeValue}>{totals.screening}</Text>
        </View>
        <View style={[styles.pipeBlock, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.pipeLabel, { color: '#F59E0B' }]}>Interview</Text>
          <Text style={styles.pipeValue}>{totals.interview}</Text>
        </View>
        <View style={[styles.pipeBlock, { backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.pipeLabel, { color: '#10B981' }]}>Offered</Text>
          <Text style={styles.pipeValue}>{totals.offer}</Text>
        </View>
        <View style={[styles.pipeBlock, { backgroundColor: '#ECFDF5', borderTopRightRadius: 12, borderBottomRightRadius: 12 }]}>
          <Text style={[styles.pipeLabel, { color: '#059669' }]}>Hired</Text>
          <Text style={styles.pipeValue}>{totals.hired}</Text>
        </View>
      </ScrollView>

      {/* Insights */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pipeline Insights</Text>
        <View style={styles.insightGrid}>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Clock size={20} color="#2952E3" />
            </View>
            <View>
              <Text style={styles.insightLabel}>Avg Time to Hire</Text>
              <Text style={styles.insightValue}>{insights.avgTimeToHire}</Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Users size={20} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.insightLabel}>Interview Conv.</Text>
              <Text style={styles.insightValue}>{insights.interviewConversion}</Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconBox, { backgroundColor: '#ECFDF5' }]}>
              <CheckCircle size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.insightLabel}>Offer Acceptance</Text>
              <Text style={styles.insightValue}>{insights.offerAcceptanceRate}</Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.insightIconBox, { backgroundColor: '#FEF2F2' }]}>
              <TrendingUp size={20} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.insightLabel}>Overall Conv.</Text>
              <Text style={styles.insightValue}>{insights.overallConversion}</Text>
            </View>
          </View>
          
        </View>
      </View>

      {/* Table */}
      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 600 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeadText, { flex: 2 }]}>Job Title</Text>
              <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Applied</Text>
              <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Screening</Text>
              <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Interview</Text>
              <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Offered</Text>
              <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Hired</Text>
              <Text style={[styles.tableHeadText, { flex: 1.5, textAlign: 'right' }]}>Conversion</Text>
            </View>
            {pipelineList.length === 0 ? (
              <Text style={styles.emptyText}>No candidates found in pipeline</Text>
            ) : (
              pipelineList.map((row, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCellMain, { flex: 2 }]} numberOfLines={1}>{row.job}</Text>
                  <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'center' }]}>{row.applied}</Text>
                  <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'center' }]}>{row.screening}</Text>
                  <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'center' }]}>{row.interview}</Text>
                  <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'center' }]}>{row.offer}</Text>
                  <Text style={[styles.tableCellValue, { flex: 1, textAlign: 'center' }]}>{row.hired}</Text>
                  <View style={[{ flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }]}>
                    <Text style={{ fontSize: 11, color: '#475569', fontWeight: '500' }}>{row.conv}%</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${row.conv * 0.6}%`, backgroundColor: getProgressBarColor(row.conv) }]} />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#64748B' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2952E3', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '500' },
  pipelineScroll: { paddingHorizontal: 16, paddingBottom: 16, gap: 4 },
  pipeBlock: { padding: 16, width: 100, justifyContent: 'center' },
  pipeLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  pipeValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 16 },
  insightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  insightItem: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '45%' },
  insightIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  insightValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginBottom: 8 },
  tableHeadText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  tableCellMain: { fontSize: 12, fontWeight: '600', color: '#334155' },
  tableCellSub: { fontSize: 12, color: '#475569' },
  tableCellValue: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  emptyText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: 20 },
  progressTrack: { width: 50, height: 4, borderRadius: 2, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 }
});
