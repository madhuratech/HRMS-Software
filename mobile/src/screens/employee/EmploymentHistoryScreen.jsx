import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Search, Plus, MoreVertical, Briefcase, Calendar, CheckCircle2, Clock, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function EmploymentHistoryScreen({ route, navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EXPERIENCE');

  // Use passed employee ID or fallback to 1 for demo purposes
  const empId = route?.params?.id || 1;

  useEffect(() => {
    fetchHistory();
  }, [empId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/employees/${empId}/history`);
      if (Array.isArray(res.data)) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Error fetching employment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderExperienceItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <Briefcase size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.jobTitle}>{item.job_title || item.change_type}</Text>
            <Text style={styles.companyName}>{item.company_name || 'Madhura Tech'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}><MoreVertical size={20} color="#94A3B8" /></TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.infoText}>
            {formatDate(item.start_date || item.effective_date)} - {formatDate(item.end_date)}
          </Text>
        </View>

        {item.old_value && item.new_value && (
          <View style={styles.changeBox}>
            <Text style={styles.changeLabel}>Change:</Text>
            <Text style={styles.changeText}>{item.old_value} → {item.new_value}</Text>
          </View>
        )}

        {item.responsibilities && (
          <Text style={styles.responsibilities}>{item.responsibilities}</Text>
        )}
      </View>
    </View>
  );

  const renderAttendanceSummary = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={[styles.iconWrapper, {backgroundColor: '#ECFCCB'}]}>
          <Clock size={20} color="#4D7C0F" />
        </View>
        <Text style={styles.statTitle}>Present</Text>
        <Text style={styles.statValue}>20 Days</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.iconWrapper, {backgroundColor: '#FEE2E2'}]}>
          <Clock size={20} color="#B91C1C" />
        </View>
        <Text style={styles.statTitle}>Absent / Leave</Text>
        <Text style={styles.statValue}>2 Days</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.iconWrapper, {backgroundColor: '#FEF08A'}]}>
          <Clock size={20} color="#A16207" />
        </View>
        <Text style={styles.statTitle}>Late / Half-day</Text>
        <Text style={styles.statValue}>1 Day</Text>
      </View>
    </View>
  );

  const renderTasksSummary = () => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, {backgroundColor: '#ECFCCB'}]}>
            <CheckCircle2 size={20} color="#4D7C0F" />
          </View>
          <View>
            <Text style={styles.jobTitle}>Frontend UI Overhaul</Text>
            <Text style={styles.companyName}>Completed 2 days ago</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.responsibilities}>Successfully migrated 12 legacy screens to new premium UI layout and fixed 3 major bugs.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.pageHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16, padding: 4 }}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Employment History</Text>
            <Text style={styles.pageSubtitle}>View employee work timeline</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'EXPERIENCE' && styles.tabButtonActive]}
          onPress={() => setActiveTab('EXPERIENCE')}
        >
          <Text style={[styles.tabText, activeTab === 'EXPERIENCE' && styles.tabTextActive]}>Experience</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'ATTENDANCE' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ATTENDANCE')}
        >
          <Text style={[styles.tabText, activeTab === 'ATTENDANCE' && styles.tabTextActive]}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'TASKS' && styles.tabButtonActive]}
          onPress={() => setActiveTab('TASKS')}
        >
          <Text style={[styles.tabText, activeTab === 'TASKS' && styles.tabTextActive]}>Work Done</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeTab === 'EXPERIENCE' ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExperienceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No employment history records found.</Text>
            </View>
          }
        />
      ) : activeTab === 'ATTENDANCE' ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          {renderAttendanceSummary()}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {renderTasksSummary()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  pageHeader: { 
    padding: 24, 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTextContainer: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, gap: 8
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2
  },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#4F46E5' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 24, paddingBottom: 24 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  jobTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  companyName: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  moreButton: { padding: 4 },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginVertical: 16 },
  cardBody: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#475569', fontWeight: '600' },
  changeBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginTop: 4 },
  changeLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '600' },
  changeText: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
  responsibilities: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '500' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statTitle: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
});
