import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Search, Plus, DollarSign, Calendar as CalendarIcon, FileText, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function SalesEntryScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [amount, setAmount] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEntries();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sales/entries');
      if (Array.isArray(res.data)) {
        setEntries(res.data);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!enquiryId || !amount || !saleDate) {
      Alert.alert('Error', 'Enquiry ID, Amount, and Date are required.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/sales/entries', { 
        enquiry_id: parseInt(enquiryId), 
        amount: parseFloat(amount),
        sale_date: saleDate,
        notes
      });
      setEnquiryId('');
      setAmount('');
      setSaleDate('');
      setNotes('');
      setModalVisible(false);
      fetchEntries();
    } catch (err) {
      console.error('Error adding entry:', err);
      Alert.alert('Error', 'Failed to add entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderEntry = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <DollarSign size={20} color="#10B981" />
          <Text style={styles.amountText}>${parseFloat(item.amount).toFixed(2)}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.sale_date).toLocaleDateString()}</Text>
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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Sales Entries</Text>
          <Text style={styles.headerSubtitle}>Revenue records</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>New Sale</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No sales entries found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record New Sale</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput 
                style={styles.modalInput}
                placeholder="Enquiry ID (e.g. 1)"
                placeholderTextColor="#94A3B8"
                value={enquiryId}
                onChangeText={setEnquiryId}
                keyboardType="numeric"
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Amount ($)"
                placeholderTextColor="#94A3B8"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Sale Date (YYYY-MM-DD)"
                placeholderTextColor="#94A3B8"
                value={saleDate}
                onChangeText={setSaleDate}
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
                onPress={handleAddEntry}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Save Sale'}</Text>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountText: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
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
  submitButton: { backgroundColor: '#10B981', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
