import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Search, Plus, X, DollarSign, Calendar, Building2, StickyNote, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

const createEntrySchema = (enquiries) => [
  { key: 'enquiry_id', label: 'Select Enquiry / Customer', type: 'select', options: (enquiries || []).map(e => ({ label: e.customer_name, value: e.id })), required: true },
  { key: 'amount', label: 'Amount (₹)', keyboardType: 'numeric', required: true },
  { key: 'sale_date', label: 'Sale Date (YYYY-MM-DD)', required: true },
  { key: 'notes', label: 'Notes', multiline: true }
];

export default function SalesEntryScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

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
        setEnquiries(enquiriesRes.data);
      }
    } catch (err) {
      console.error('Error fetching sales entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        ...updatedItem,
        enquiry_id: parseInt(updatedItem.enquiry_id),
        amount: parseFloat(updatedItem.amount)
      };
      if (updatedItem.id) {
        await apiClient.put(`/sales/entries/${updatedItem.id}`, payload);
      } else {
        await apiClient.post('/sales/entries', payload);
      }
      setActionModalVisible(false);
      fetchEntries();
    } catch (err) {
      console.error('Error saving sales entry:', err);
      Alert.alert('Error', 'Failed to save sales entry.');
    }
  };

  const filteredEntries = entries.filter(e => 
    e.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sales Entries</Text>
            <Text style={styles.headerSubtitle}>Log and track closed sales</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setActionSelectedItem({ sale_date: new Date().toISOString().split('T')[0] });
          setActionModalMode('add');
          setActionModalVisible(true);
        }}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Log Sale</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
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
                      <StickyNote size={14} color='#6B7280' style={{marginRight: 6}} />
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

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={createEntrySchema(enquiries)}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Log New Sale' : actionModalMode === 'edit' ? 'Edit Sale' : 'Sale Details'}
        />
      )}
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
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  toolbar: { flexDirection: 'row', padding: 24, gap: 12 },
  searchBox: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  
  content: { paddingHorizontal: 24 },
  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#111827', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  cardTitleCol: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  dateText: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  amountBox: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  amountText: { fontSize: 16, fontWeight: '800', color: '#10B981' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  
  notesRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  notesText: { fontSize: 14, color: '#475569', flex: 1, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  pillActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  pillTextActive: { color: '#10B981', fontWeight: '700' },

  submitButton: { backgroundColor: '#10B981', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
