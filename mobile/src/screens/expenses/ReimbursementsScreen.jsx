import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { Search, Banknote, Calendar, CreditCard, Clock, CheckCircle, X, Hash } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

export default function ReimbursementsScreen() {
  const navigation = useNavigation();

  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReimbursements();
  }, []);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/expenses/reimbursements');
      if (res.data?.success) {
        setReimbursements(res.data.data);
      } else if (Array.isArray(res.data)) {
        setReimbursements(res.data);
      }
    } catch (err) {
      console.error('Error fetching reimbursements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedItem) return;
    try {
      setSubmitting(true);
      await apiClient.put(`/expenses/reimbursements/${selectedItem.id}/process`, { 
        payment_method: paymentMethod,
        transaction_id: transactionId,
        paid_date: paidDate
      });
      setSelectedItem(null);
      setTransactionId('');
      setPaymentMethod('Bank Transfer');
      fetchReimbursements();
    } catch (err) {
      console.error('Error processing payment:', err);
      Alert.alert('Error', 'Failed to process reimbursement.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reimbursements.filter(r => 
    (r.status || 'Pending') === activeTab &&
    (r.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     r.claim_title?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Reimbursements</Text>
            <Text style={styles.headerSubtitle}>Process payments for approved claims</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by employee or title..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        {['Pending', 'Paid'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} reimbursements found</Text>
            </View>
          ) : (
            filtered.map((item, i) => (
              <View key={item.id || i} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <Banknote size={20} color="#10B981" />
                  </View>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.empName}>{item.employee_name}</Text>
                    <Text style={styles.claimTitle}>{item.claim_title}</Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountText}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={14} color="#64748B" />
                    <Text style={styles.detailText}>{new Date(item.claim_date || item.created_at).toLocaleDateString()}</Text>
                  </View>
                  
                  {item.status === 'Paid' ? (
                    <View style={styles.detailRow}>
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={[styles.detailText, { color: '#10B981', fontWeight: '700' }]}>Paid on {new Date(item.paid_date).toLocaleDateString()}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.processBtn} onPress={() => setSelectedItem(item)}>
                      <Text style={styles.processBtnText}>Process Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {item.status === 'Paid' && item.transaction_id && (
                  <View style={styles.txBox}>
                    <Text style={styles.txText}>TX ID: {item.transaction_id}</Text>
                    <Text style={styles.txMethod}>{item.payment_method}</Text>
                  </View>
                )}
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Process Payment Modal */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Process Payment</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            {selectedItem && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Pay To: {selectedItem.employee_name}</Text>
                  <Text style={styles.summaryAmount}>₹{parseFloat(selectedItem.amount).toLocaleString('en-IN')}</Text>
                  <Text style={styles.summaryTitle}>{selectedItem.claim_title}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Payment Method</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                    {['Bank Transfer', 'Cash', 'Cheque', 'UPI'].map(method => (
                      <TouchableOpacity 
                        key={method} 
                        style={[styles.pill, paymentMethod === method && styles.pillActive]}
                        onPress={() => setPaymentMethod(method)}
                      >
                        <Text style={[styles.pillText, paymentMethod === method && styles.pillTextActive]}>{method}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Transaction ID / Ref (Optional)</Text>
                  <View style={styles.inputIconWrapper}>
                    <Hash size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput 
                      style={[styles.modalInput, { paddingLeft: 44 }]}
                      placeholder="e.g. TXN-123456789"
                      placeholderTextColor="#94A3B8"
                      value={transactionId}
                      onChangeText={setTransactionId}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Paid Date</Text>
                  <View style={styles.inputIconWrapper}>
                    <Calendar size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput 
                      style={[styles.modalInput, { paddingLeft: 44 }]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94A3B8"
                      value={paidDate}
                      onChangeText={setPaidDate}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                  onPress={handleProcessPayment}
                  disabled={submitting}
                >
                  <Text style={styles.submitButtonText}>{submitting ? 'Processing...' : 'Mark as Paid'}</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            )}
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
  
  toolbar: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10, gap: 12 },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  
  tabs: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#10B981' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#10B981', fontWeight: '800' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
  cardTitleCol: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  claimTitle: { fontSize: 13, fontWeight: '500', color: '#64748B', marginTop: 2 },
  amountBox: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  amountText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  
  processBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  processBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  
  txBox: { marginTop: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  txText: { fontSize: 12, color: '#64748B', fontWeight: '600', fontFamily: 'monospace' },
  txMethod: { fontSize: 12, color: '#10B981', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  modalBody: { gap: 20 },
  summaryBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  summaryAmount: { fontSize: 32, fontWeight: '900', color: '#10B981', marginBottom: 4 },
  summaryTitle: { fontSize: 14, color: '#0F172A', fontWeight: '500' },
  
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  inputIconWrapper: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  pillActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  pillTextActive: { color: '#10B981', fontWeight: '700' },
  
  submitButton: { backgroundColor: '#10B981', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
