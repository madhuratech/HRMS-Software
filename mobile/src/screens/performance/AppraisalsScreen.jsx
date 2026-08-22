import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Plus, Award, User, X, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function AppraisalsScreen() {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [appraisalCycle, setAppraisalCycle] = useState('');
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/appraisals');
      if (Array.isArray(res.data)) {
        setAppraisals(res.data);
      }
    } catch (err) {
      console.error('Error fetching appraisals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppraisal = async () => {
    if (!employeeId || !appraisalCycle || !rating) {
      Alert.alert('Error', 'Employee ID, Cycle, and Rating are required.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/appraisals', { 
        employee_id: parseInt(employeeId), appraisal_cycle: appraisalCycle, rating: parseFloat(rating), feedback 
      });
      setEmployeeId(''); setAppraisalCycle(''); setRating(''); setFeedback('');
      setModalVisible(false);
      fetchAppraisals();
    } catch (err) {
      console.error('Error adding appraisal:', err);
      Alert.alert('Error', 'Failed to add appraisal.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appraisals.filter(a => 
    a.appraisal_cycle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return '#6B7280';
      case 'submitted': return '#3B82F6';
      case 'reviewed': return '#F59E0B';
      case 'approved': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Award size={20} color="#3B82F6" />
          <Text style={styles.titleText}>{item.appraisal_cycle}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingValue}>{item.rating}</Text>
        <Text style={styles.ratingMax}>/ 5.0</Text>
      </View>

      {item.feedback ? (
        <View style={styles.feedbackBox}>
          <MessageSquare size={14} color='#6B7280' style={{marginRight: 6}} />
          <Text style={styles.feedbackText} numberOfLines={2}>{item.feedback}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

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
          <Text style={styles.headerTitle}>Appraisals</Text>
          <Text style={styles.headerSubtitle}>Performance appraisals</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search appraisals..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#3B82F6" />
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
              <Text style={styles.emptyText}>No appraisals found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Appraisal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput style={styles.modalInput} placeholder="Employee ID (e.g. 1)" placeholderTextColor="#94A3B8" value={employeeId} onChangeText={setEmployeeId} keyboardType="numeric" />
              <TextInput style={styles.modalInput} placeholder="Cycle (e.g. Q3 2026)" placeholderTextColor="#94A3B8" value={appraisalCycle} onChangeText={setAppraisalCycle} />
              <TextInput style={styles.modalInput} placeholder="Rating (0.0 to 5.0)" placeholderTextColor="#94A3B8" value={rating} onChangeText={setRating} keyboardType="numeric" />
              <TextInput 
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Feedback..." 
                placeholderTextColor="#94A3B8" 
                value={feedback} 
                onChangeText={setFeedback} 
                multiline 
              />
              <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.7 }]} onPress={handleAddAppraisal} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Save Appraisal'}</Text>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  ratingContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  ratingValue: { fontSize: 32, fontWeight: '800', color: '#111827' },
  ratingMax: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginLeft: 4 },
  feedbackBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'flex-start' },
  feedbackText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalBody: { gap: 12 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#3B82F6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
