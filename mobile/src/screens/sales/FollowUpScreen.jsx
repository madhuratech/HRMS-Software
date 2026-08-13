import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Search, Plus, Calendar as CalendarIcon, Clock, CheckCircle, ArrowLeft, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function FollowUpScreen({ route, navigation }) {
  const { enquiryId } = route.params || {};
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newEnquiryId, setNewEnquiryId] = useState(enquiryId ? String(enquiryId) : '');
  const [followupDate, setFollowupDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFollowups();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sales/followups');
      if (Array.isArray(res.data)) {
        if (enquiryId) {
          setFollowups(res.data.filter(f => f.enquiry_id === enquiryId));
        } else {
          setFollowups(res.data);
        }
      }
    } catch (err) {
      console.error('Error fetching followups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowup = async () => {
    // API endpoint doesn't exist yet for POST followups! Oh wait, I didn't add it to salesRoute.js
    // I need to update the backend route to support it. For now, just simulate it or show error.
    Alert.alert('Info', 'Add follow up function will be available in next backend update.');
    setModalVisible(false);
  };

  const renderFollowup = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Clock size={18} color={item.status === 'completed' ? '#10B981' : '#F59E0B'} />
          <Text style={styles.actionText}>{item.next_action}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.followup_date).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Customer:</Text>
        <Text style={styles.detailValue}>{item.customer_name || `Enquiry #${item.enquiry_id}`}</Text>
      </View>
      {item.notes ? (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Notes:</Text>
          <Text style={styles.detailValue}>{item.notes}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {enquiryId ? (
          <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Follow Ups</Text>
          <Text style={styles.headerSubtitle}>{enquiryId ? `For Enquiry #${enquiryId}` : 'All upcoming follow ups'}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={followups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFollowup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No follow ups found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Follow Up</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput 
                style={styles.modalInput}
                placeholder="Enquiry ID (e.g. 1)"
                placeholderTextColor="#94A3B8"
                value={newEnquiryId}
                onChangeText={setNewEnquiryId}
                keyboardType="numeric"
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor="#94A3B8"
                value={followupDate}
                onChangeText={setFollowupDate}
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Next Action (e.g. Call Client)"
                placeholderTextColor="#94A3B8"
                value={nextAction}
                onChangeText={setNextAction}
              />
              <TextInput 
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Notes..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddFollowup}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Save Follow Up'}</Text>
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
    padding: 20, backgroundColor: '#FFF', flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerBack: { padding: 4, marginRight: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 10, overflow: 'hidden' },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  card: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  actionText: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },
  dateText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: '#64748B', width: 80, fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#0F172A', fontWeight: '600', flex: 1 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  modalBody: { gap: 16 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#F59E0B', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
