import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { Search, Receipt, Calendar, CreditCard, Banknote, Clock, CheckCircle, XCircle, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ExpenseApprovalScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/expenses/claims');
      if (res.data?.success) {
        setClaims(res.data.data);
      } else if (Array.isArray(res.data)) {
        setClaims(res.data);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (id, status) => {
    try {
      await apiClient.put(`/expenses/claims/${id}/approve`, { status });
      setSelectedClaim(null);
      fetchClaims();
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Failed to update claim status.');
    }
  };

  const filtered = claims.filter(c => 
    (c.status || 'Pending') === activeTab &&
    (c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.category_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Expense Approvals</Text>
            <Text style={styles.headerSubtitle}>Review and approve employee expenses</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search claims..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        {['Pending', 'Approved', 'Rejected'].map(tab => (
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
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} claims found</Text>
            </View>
          ) : (
            filtered.map((claim, i) => (
              <TouchableOpacity key={claim.id || i} style={styles.card} onPress={() => setSelectedClaim(claim)}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{claim.employee_name?.substring(0,2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.empName}>{claim.employee_name}</Text>
                    <Text style={styles.claimTitle}>{claim.title} • {claim.category_name}</Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountText}>₹{parseFloat(claim.amount).toLocaleString('en-IN')}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={14} color='#6B7280' />
                    <Text style={styles.detailText}>{new Date(claim.date).toLocaleDateString()}</Text>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) + '15' }]}>
                    {claim.status === 'Approved' ? <CheckCircle size={14} color={getStatusColor(claim.status)} style={{ marginRight: 4 }}/> : null}
                    {claim.status === 'Pending' ? <Clock size={14} color={getStatusColor(claim.status)} style={{ marginRight: 4 }}/> : null}
                    {claim.status === 'Rejected' ? <X size={14} color={getStatusColor(claim.status)} style={{ marginRight: 4 }}/> : null}
                    <Text style={[styles.statusText, { color: getStatusColor(claim.status) }]}>{claim.status || 'Pending'}</Text>
                  </View>
                </View>

                {claim.status === 'Pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApproveReject(claim.id, 'Approved')}>
                      <CheckCircle size={18} color='#FFFFFF' />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleApproveReject(claim.id, 'Rejected')}>
                      <XCircle size={18} color='#FFFFFF' />
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Detail Modal */}
      <Modal visible={!!selectedClaim} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Claim Details</Text>
              <TouchableOpacity onPress={() => setSelectedClaim(null)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            
            {selectedClaim && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Employee</Text>
                  <Text style={styles.detailValue}>{selectedClaim.employee_name}</Text>
                  <Text style={styles.detailSub}>Dept: {selectedClaim.department_name}</Text>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Expense Info</Text>
                  <Text style={styles.detailValue}>{selectedClaim.title}</Text>
                  <Text style={styles.detailSub}>Category: {selectedClaim.category_name}</Text>
                  <Text style={styles.detailSub}>Date: {new Date(selectedClaim.date).toLocaleDateString()}</Text>
                  <Text style={[styles.detailValue, { color: '#2563EB', marginTop: 4 }]}>₹{parseFloat(selectedClaim.amount).toLocaleString('en-IN')}</Text>
                </View>

                {selectedClaim.description ? (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailSub}>{selectedClaim.description}</Text>
                  </View>
                ) : null}

                {selectedClaim.status === 'Pending' && (
                  <View style={[styles.actionRow, { marginTop: 16 }]}>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApproveReject(selectedClaim.id, 'Approved')}>
                      <CheckCircle size={18} color='#FFFFFF' />
                      <Text style={styles.actionBtnText}>Approve Claim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleApproveReject(selectedClaim.id, 'Rejected')}>
                      <XCircle size={18} color='#FFFFFF' />
                      <Text style={styles.actionBtnText}>Reject Claim</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    padding: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  
  toolbar: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10, gap: 12 },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  
  tabs: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#2563EB', fontWeight: '800' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#111827', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  avatarText: { color: '#2563EB', fontWeight: '800', fontSize: 14 },
  cardTitleCol: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  claimTitle: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  amountBox: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  amountText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, gap: 8 },
  approveBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 16 },
  detailCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  detailValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  detailSub: { fontSize: 14, color: '#6B7280', marginTop: 4, lineHeight: 20 },
});
