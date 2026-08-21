import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Search, Plus, X, DollarSign, Calendar, Building2, StickyNote, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function SalesEntryScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState('');
  const [amount, setAmount] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
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
      const [entriesRes, enquiriesRes] = await Promise.all([
        apiClient.get('/sales/entries'),
        apiClient.get('/sales/enquiries')
      ]);
      
      if (Array.isArray(entriesRes.data)) {
        setEntries(entriesRes.data);
      }
      
      if (Array.isArray(enquiriesRes.data)) {
        // Filter to only show won enquiries as options for new sales?
        // Let's show all for now, but in reality maybe only qualified/won
        setEnquiries(enquiriesRes.data);
        if (enquiriesRes.data.length > 0) {
          setSelectedEnquiry(enquiriesRes.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching sales entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!selectedEnquiry || !amount || !saleDate) {
      Alert.alert('Required', 'Please fill in all required fields (Enquiry, Amount, Date).');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/sales/entries', { 
        enquiry_id: selectedEnquiry,
        amount: parseFloat(amount),
        sale_date: saleDate,
        notes: notes
      });
      setAmount('');
      setNotes('');
      setSaleDate(new Date().toISOString().split('T')[0]);
      setModalVisible(false);
      fetchEntries();
    } catch (err) {
      console.error('Error adding sales entry:', err);
      Alert.alert('Error', 'Failed to add sales entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEntries = entries.filter(e => 
    e.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sales Entries</Text>
            <Text style={styles.headerSubtitle}>Log and track closed sales</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>Log Sale</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search sales..." 
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No sales entries found</Text>
            </View>
          ) : (
            filteredEntries.map((item, i) => (
              <View key={item.id || i} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <DollarSign size={20} color="#10B981" />
                  </View>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.customerName} numberOfLines={1}>{item.customer_name || 'Unknown Customer'}</Text>
                    <Text style={styles.dateText}>{new Date(item.sale_date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountText}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {item.notes ? (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.notesRow}>
                      <StickyNote size={14} color="#64748B" style={{marginRight: 6}} />
                      <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
                    </View>
                  </>
                ) : null}
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log New Sale</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Enquiry / Customer</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                  {enquiries.map(enq => (
                    <TouchableOpacity 
                      key={enq.id} 
                      style={[styles.pill, selectedEnquiry == enq.id && styles.pillActive]}
                      onPress={() => setSelectedEnquiry(enq.id.toString())}
                    >
                      <Text style={[styles.pillText, selectedEnquiry == enq.id && styles.pillTextActive]}>{enq.customer_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Amount (₹)</Text>
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Sale Date</Text>
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={saleDate}
                    onChangeText={setSaleDate}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput 
                  style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Details about the deal..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddEntry}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Log Sale'}</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  toolbar: { flexDirection: 'row', padding: 24, gap: 12 },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  
  content: { paddingHorizontal: 24 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  cardTitleCol: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  dateText: { fontSize: 13, fontWeight: '500', color: '#64748B', marginTop: 2 },
  amountBox: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  amountText: { fontSize: 16, fontWeight: '800', color: '#10B981' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  
  notesRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  notesText: { fontSize: 14, color: '#475569', flex: 1, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  pillActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  pillTextActive: { color: '#10B981', fontWeight: '700' },

  submitButton: { backgroundColor: '#10B981', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
