import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Plus, TrendingUp, User, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function KPIScreen() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [achievedValue, setAchievedValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/kpis');
      if (Array.isArray(res.data)) {
        setKpis(res.data);
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKPI = async () => {
    if (!employeeId || !title || !targetValue) {
      Alert.alert('Error', 'Employee ID, Title, and Target are required.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/kpis', { 
        employee_id: parseInt(employeeId), title, target_value: targetValue, achieved_value: achievedValue 
      });
      setEmployeeId(''); setTitle(''); setTargetValue(''); setAchievedValue('');
      setModalVisible(false);
      fetchKPIs();
    } catch (err) {
      console.error('Error adding KPI:', err);
      Alert.alert('Error', 'Failed to add KPI.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = kpis.filter(k => 
    k.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <TrendingUp size={20} color="#F59E0B" />
          <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
        </View>
        <Text style={styles.weightageText}>Weight: {item.weightage}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricGrid}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Target</Text>
          <Text style={styles.metricValue}>{item.target_value}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Achieved</Text>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>{item.achieved_value || '0'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <User size={14} color='#6B7280' style={{marginRight: 6}} />
        <Text style={styles.footerText}>{item.first_name ? `${item.first_name} ${item.last_name}` : `Emp #${item.employee_id}`}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>KPIs</Text>
          <Text style={styles.headerSubtitle}>Key Performance Indicators</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Add KPI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search KPIs..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No KPIs found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set New KPI</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput style={styles.modalInput} placeholder="Employee ID (e.g. 1)" placeholderTextColor="#94A3B8" value={employeeId} onChangeText={setEmployeeId} keyboardType="numeric" />
              <TextInput style={styles.modalInput} placeholder="KPI Title" placeholderTextColor="#94A3B8" value={title} onChangeText={setTitle} />
              <TextInput style={styles.modalInput} placeholder="Target Value (e.g. 100%)" placeholderTextColor="#94A3B8" value={targetValue} onChangeText={setTargetValue} />
              <TextInput style={styles.modalInput} placeholder="Achieved Value (e.g. 90%)" placeholderTextColor="#94A3B8" value={achievedValue} onChangeText={setAchievedValue} />
              <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.7 }]} onPress={handleAddKPI} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Set KPI'}</Text>
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
  header: { padding: 20, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 10, overflow: 'hidden' },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toolbar: { padding: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 48 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  titleText: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  weightageText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  metricGrid: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metricCol: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  metricDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
  footer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8 },
  footerText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalBody: { gap: 12 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#F59E0B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
