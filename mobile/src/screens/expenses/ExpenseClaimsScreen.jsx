import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Plus, X, Receipt, Calendar, CreditCard, Banknote, Clock, CheckCircle, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ExpenseClaimsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const myId = user?.employee_id || user?.id;

  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [claimsRes, metaRes] = await Promise.all([
        apiClient.get('/expenses/claims'),
        apiClient.get('/expenses/meta')
      ]);

      if (claimsRes.data?.success) {
        // Only show logged in user's claims
        const myClaims = claimsRes.data.data.filter(c => c.employee_id === myId);
        setClaims(myClaims);
      }
      
      if (metaRes.data?.success) {
        setCategories(metaRes.data.data.categories || []);
        if (metaRes.data.data.categories?.length > 0) {
          setCategoryId(metaRes.data.data.categories[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching claims data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClaim = async () => {
    if (!title.trim() || !amount || !categoryId) {
      Alert.alert('Required', 'Please fill in Title, Amount, and Category.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/expenses/claims', { 
        title,
        amount,
        date,
        category_id: parseInt(categoryId),
        description,
        employee_id: myId
      });
      setTitle('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Error adding claim:', err);
      Alert.alert('Error', 'Failed to submit expense claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const [kpis, setKpis] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 });
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let tot = claims.length;
    let pen = 0, app = 0, rej = 0, amt = 0;
    claims.forEach(c => {
      const s = c.status || 'Pending';
      if (s === 'Pending') pen++;
      else if (s === 'Approved') app++;
      else if (s === 'Rejected') rej++;
      
      if (s === 'Approved') amt += Number(c.amount || 0);
    });
    setKpis({ total: tot, pending: pen, approved: app, rejected: rej, totalAmount: amt });
  }, [claims]);

  const KPICard = ({ label, value, color, icon: Icon, bg }) => (
    <View style={[styles.kpiCard, { borderColor: bg }]}>
      <View style={[styles.kpiIconBox, { backgroundColor: bg }]}>
        <Icon size={18} color={color} />
      </View>
      <View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
    </View>
  );

  const statuses = ['All', 'Pending', 'Approved', 'Rejected'];

  const filtered = claims.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;
    return (c.status || 'Pending') === statusFilter;
  });

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
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Expenses</Text>
            <Text style={styles.headerSubtitle}>Submit and track your expense claims</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#2563EB', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>New Claim</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        <KPICard label="Total Claims" value={kpis.total} color="#6366F1" bg="#EEF2FF" icon={Receipt} />
        <KPICard label="Pending" value={kpis.pending} color="#F59E0B" bg="#FEF3C7" icon={Clock} />
        <KPICard label="Approved" value={kpis.approved} color="#10B981" bg="#D1FAE5" icon={CheckCircle} />
        <KPICard label="Rejected" value={kpis.rejected} color="#EF4444" bg="#FEE2E2" icon={X} />
      </ScrollView>

      <View style={styles.filterScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {statuses.map(s => (
            <TouchableOpacity 
              key={s} 
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search my claims..." 
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>You haven't submitted any claims</Text>
            </View>
          ) : (
            filtered.map((claim, i) => (
              <View key={claim.id || i} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <Receipt size={20} color='#2563EB' />
                  </View>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.claimTitle}>{claim.title}</Text>
                    <Text style={styles.categoryName}>{claim.category_name}</Text>
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
              <Text style={styles.modalTitle}>New Expense Claim</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Claim Title</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Client Lunch"
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                />
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
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput 
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                  {categories.map(cat => (
                    <TouchableOpacity 
                      key={cat.id} 
                      style={[styles.catPill, categoryId == cat.id && styles.catPillActive]}
                      onPress={() => setCategoryId(cat.id.toString())}
                    >
                      <Text style={[styles.catPillText, categoryId == cat.id && styles.catPillTextActive]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description / Notes</Text>
                <TextInput 
                  style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Details about this expense..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddClaim}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Claim'}</Text>
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
    padding: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 12, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6, backgroundColor: '#2563EB' },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toolbar: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#111827', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
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
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterScrollContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: { paddingHorizontal: 24 },
  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  cardTitleCol: { flex: 1 },
  claimTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  categoryName: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  amountBox: { backgroundColor: '#FAFAFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  amountText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: '700' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%', borderWidth: 1, borderColor: '#E5E7EB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 16 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  modalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  catPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FAFAFA', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  catPillActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  catPillText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  catPillTextActive: { color: '#2563EB', fontWeight: '700' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
