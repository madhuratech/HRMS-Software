import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Plus, Star, User, X, MessageSquare, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reviews');
      if (Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!employeeId || !reviewerId || !reviewDate) {
      Alert.alert('Error', 'Employee ID, Reviewer ID, and Date are required.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/reviews', { 
        employee_id: parseInt(employeeId), reviewer_id: parseInt(reviewerId), review_date: reviewDate, rating: parseFloat(rating), comments 
      });
      setEmployeeId(''); setReviewerId(''); setReviewDate(''); setRating(''); setComments('');
      setModalVisible(false);
      fetchReviews();
    } catch (err) {
      console.error('Error adding review:', err);
      Alert.alert('Error', 'Failed to add review.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reviews.filter(r => 
    r.emp_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.rev_first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <User size={20} color="#8B5CF6" />
          <Text style={styles.titleText}>For: {item.emp_first_name ? `${item.emp_first_name} ${item.emp_last_name}` : `Emp #${item.employee_id}`}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Star size={12} color="#F59E0B" fill="#F59E0B" style={{marginRight: 4}} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      {item.comments ? (
        <View style={styles.commentsBox}>
          <MessageSquare size={14} color='#6B7280' style={{marginRight: 6, marginTop: 2}} />
          <Text style={styles.commentsText}>{item.comments}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Reviewer:</Text>
          <Text style={styles.footerValue}>{item.rev_first_name ? `${item.rev_first_name} ${item.rev_last_name}` : `Emp #${item.reviewer_id}`}</Text>
        </View>
        <View style={styles.footerItem}>
          <Calendar size={14} color='#6B7280' style={{marginRight: 4}} />
          <Text style={styles.footerValue}>{new Date(item.review_date).toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Reviews</Text>
          <Text style={styles.headerSubtitle}>1-on-1 performance reviews</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.gradientBtn}>
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
            placeholder="Search reviews..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#8B5CF6" />
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
              <Text style={styles.emptyText}>No reviews found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Review</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput style={styles.modalInput} placeholder="Employee ID (e.g. 1)" placeholderTextColor="#94A3B8" value={employeeId} onChangeText={setEmployeeId} keyboardType="numeric" />
              <TextInput style={styles.modalInput} placeholder="Reviewer ID (e.g. 2)" placeholderTextColor="#94A3B8" value={reviewerId} onChangeText={setReviewerId} keyboardType="numeric" />
              <TextInput style={styles.modalInput} placeholder="Date (YYYY-MM-DD)" placeholderTextColor="#94A3B8" value={reviewDate} onChangeText={setReviewDate} />
              <TextInput style={styles.modalInput} placeholder="Rating (0.0 to 5.0)" placeholderTextColor="#94A3B8" value={rating} onChangeText={setRating} keyboardType="numeric" />
              <TextInput 
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Comments..." 
                placeholderTextColor="#94A3B8" 
                value={comments} 
                onChangeText={setComments} 
                multiline 
              />
              <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.7 }]} onPress={handleAddReview} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Save Review'}</Text>
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
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  commentsBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'flex-start' },
  commentsText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginRight: 4 },
  footerValue: { fontSize: 13, color: '#1E293B', fontWeight: '600' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalBody: { gap: 12 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#8B5CF6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
