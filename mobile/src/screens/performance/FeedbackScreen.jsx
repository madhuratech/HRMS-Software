import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Plus, MessageCircle, User, X, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function FeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('positive');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/feedback');
      if (Array.isArray(res.data)) {
        setFeedbacks(res.data);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!employeeId || !providerId || !feedbackText) {
      Alert.alert('Error', 'Employee ID, Provider ID, and Text are required.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/feedback', { 
        employee_id: parseInt(employeeId), provider_id: parseInt(providerId), feedback_text: feedbackText, feedback_type: feedbackType 
      });
      setEmployeeId(''); setProviderId(''); setFeedbackText(''); setFeedbackType('positive');
      setModalVisible(false);
      fetchFeedbacks();
    } catch (err) {
      console.error('Error adding feedback:', err);
      Alert.alert('Error', 'Failed to add feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = feedbacks.filter(f => 
    f.emp_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.prov_first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const isPositive = item.feedback_type === 'positive';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            {isPositive ? <ThumbsUp size={18} color="#10B981" /> : <ThumbsDown size={18} color="#F59E0B" />}
            <Text style={styles.titleText}>To: {item.emp_first_name ? `${item.emp_first_name} ${item.emp_last_name}` : `Emp #${item.employee_id}`}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: isPositive ? '#D1FAE5' : '#FEF3C7' }]}>
            <Text style={[styles.badgeText, { color: isPositive ? '#059669' : '#B45309' }]}>
              {item.feedback_type.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.feedbackText}>{item.feedback_text}</Text>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <User size={14} color='#6B7280' style={{marginRight: 6}} />
          <Text style={styles.footerText}>From: {item.prov_first_name ? `${item.prov_first_name} ${item.prov_last_name}` : `Emp #${item.provider_id}`}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Feedback</Text>
          <Text style={styles.headerSubtitle}>Continuous peer feedback</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Give Feedback</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search feedback..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#10B981" />
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
              <Text style={styles.emptyText}>No feedback found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Give Feedback</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput style={styles.modalInput} placeholder="To Employee ID (e.g. 1)" placeholderTextColor="#94A3B8" value={employeeId} onChangeText={setEmployeeId} keyboardType="numeric" />
              <TextInput style={styles.modalInput} placeholder="From Provider ID (e.g. 2)" placeholderTextColor="#94A3B8" value={providerId} onChangeText={setProviderId} keyboardType="numeric" />

              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeBtn, feedbackType === 'positive' && styles.typeBtnActivePositive]} 
                  onPress={() => setFeedbackType('positive')}
                >
                  <ThumbsUp size={16} color={feedbackType === 'positive' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.typeBtnText, feedbackType === 'positive' && {color: '#FFFFFF'}]}>Positive</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, feedbackType === 'constructive' && styles.typeBtnActiveConstructive]} 
                  onPress={() => setFeedbackType('constructive')}
                >
                  <ThumbsDown size={16} color={feedbackType === 'constructive' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.typeBtnText, feedbackType === 'constructive' && {color: '#FFFFFF'}]}>Constructive</Text>
                </TouchableOpacity>
              </View>

              <TextInput 
                style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]} 
                placeholder="Write your feedback..." 
                placeholderTextColor="#94A3B8" 
                value={feedbackText} 
                onChangeText={setFeedbackText} 
                multiline 
              />
              <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.7 }]} onPress={handleAddFeedback} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Submit Feedback'}</Text>
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
  titleText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  feedbackText: { fontSize: 14, color: '#475569', lineHeight: 22, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalBody: { gap: 12 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  typeBtnActivePositive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  typeBtnActiveConstructive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  submitButton: { backgroundColor: '#10B981', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
