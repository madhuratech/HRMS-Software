import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, TextInput } from 'react-native';
import { Search, Plus, Clock, AlertCircle, CheckCircle, ChevronRight, X, Calendar as CalendarIcon, Briefcase } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function TimesheetsScreen({ navigation }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [summary, setSummary] = useState({ totalHours: 0, billableHours: 0, nonBillableHours: 0, pendingCount: 0 });

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newHours, setNewHours] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data for timesheets
      const mockData = [
        { id: 1, date: '2026-08-20', project: 'Website Redesign', hours: 6, billable: 'Billable', status: 'Approved', desc: 'Developed new landing page' },
        { id: 2, date: '2026-08-21', project: 'Mobile App', hours: 4, billable: 'Billable', status: 'Pending', desc: 'API Integration' },
        { id: 3, date: '2026-08-22', project: 'Internal Tool', hours: 2, billable: 'Non-Billable', status: 'Approved', desc: 'Team meeting and planning' },
      ];
      setTimesheets(mockData);
      
      let tot = 0, bill = 0, nonbill = 0, pen = 0;
      mockData.forEach(t => {
        tot += t.hours;
        if (t.billable === 'Billable') bill += t.hours;
        else nonbill += t.hours;
        if (t.status === 'Pending') pen++;
      });
      setSummary({ totalHours: tot, billableHours: bill, nonBillableHours: nonbill, pendingCount: pen });
      
    } catch (err) {
      console.error('Error fetching timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimesheet = async () => {
    if (!newHours.trim()) return;
    try {
      setSubmitting(true);
      // Simulate API post
      setTimeout(() => {
        setNewHours('');
        setNewDesc('');
        setModalVisible(false);
        fetchData();
        setSubmitting(false);
      }, 500);
    } catch (err) {
      console.error('Error adding timesheet:', err);
      setSubmitting(false);
    }
  };

  const filteredData = timesheets.filter(t => 
    t.project?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.desc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#F59E0B'; // Pending
    }
  };

  const KPICard = ({ label, value, unit, color, bg, icon: Icon }) => (
    <View style={[styles.kpiCard, { borderColor: bg }]}>
      <View style={[styles.kpiIconBox, { backgroundColor: bg }]}>
        <Icon size={18} color={color} />
      </View>
      <View>
        <View style={styles.kpiValueRow}>
          <Text style={styles.kpiValue}>{value}</Text>
          {unit && <Text style={styles.kpiUnit}>{unit}</Text>}
        </View>
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Briefcase size={16} color="#3B82F6" />
          <Text style={styles.cardTitle}>{item.project}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <CalendarIcon size={14} color='#6B7280' style={{marginRight: 4}} />
          <Text style={styles.dateLabel}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.footerInfo}>
          <Clock size={14} color='#6B7280' style={{marginRight: 4}} />
          <Text style={styles.hoursLabel}>{item.hours} hrs</Text>
        </View>
        <View style={[styles.billableBadge, { backgroundColor: item.billable === 'Billable' ? '#EFF6FF' : '#F1F5F9' }]}>
          <Text style={[styles.billableText, { color: item.billable === 'Billable' ? '#3B82F6' : '#64748B' }]}>{item.billable}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Timesheets</Text>
          <Text style={styles.headerSubtitle}>Log and manage your work hours</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Log Time</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <KPICard label="Total Logged" value={summary.totalHours} unit="hrs" color="#6366F1" bg="#EEF2FF" icon={Clock} />
        <KPICard label="Billable" value={summary.billableHours} unit="hrs" color="#10B981" bg="#D1FAE5" icon={CheckCircle} />
        <KPICard label="Non-Billable" value={summary.nonBillableHours} unit="hrs" color="#6B7280" bg="#F3F4F6" icon={AlertCircle} />
        <KPICard label="Pending Approval" value={summary.pendingCount} unit="logs" color="#F59E0B" bg="#FEF3C7" icon={Clock} />
      </ScrollView>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search timesheets..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No timesheets found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Work Time</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Hours</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="e.g. 4.5"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={newHours}
                onChangeText={setNewHours}
              />
              <Text style={styles.inputLabel}>Task Description</Text>
              <TextInput 
                style={[styles.modalInput, { height: 80 }]}
                placeholder="What did you work on?"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={newDesc}
                onChangeText={setNewDesc}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddTimesheet} disabled={submitting}>
                <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.submitGradient}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitText}>Save Log</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  addButton: { borderRadius: 8, overflow: 'hidden' },
  gradientBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  kpiScroll: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  kpiUnit: {
    fontSize: 12,
    color: '#64748B',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  toolbar: { paddingHorizontal: 20, marginBottom: 16 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10,
    paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#111827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 15 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  hoursLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  billableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  billableText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  modalBody: { flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#475569', marginBottom: 8, marginTop: 16 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 15, color: '#0F172A' },
  submitBtn: { marginTop: 32, borderRadius: 12, overflow: 'hidden' },
  submitGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
