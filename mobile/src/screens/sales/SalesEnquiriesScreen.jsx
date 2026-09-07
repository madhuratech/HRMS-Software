import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Search, Plus, Mail, Phone, ChevronRight, X, Building2, User, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ActionModals from '../../components/common/ActionModals';

const createEnquirySchema = () => [
  { key: 'customer_name', label: 'Customer Name', required: true },
  { key: 'contact_email', label: 'Email', keyboardType: 'email-address' },
  { key: 'contact_phone', label: 'Phone', keyboardType: 'phone-pad' },
  { key: 'enquiry_details', label: 'Requirements / Details', multiline: true, required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'] }
];

export default function SalesEnquiriesScreen({ navigation }) {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEnquiries();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sales/enquiries');
      if (Array.isArray(res.data)) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSave = async (updatedItem) => {
    try {
      if (updatedItem.id) {
        await apiClient.put(`/sales/enquiries/${updatedItem.id}`, updatedItem);
      } else {
        await apiClient.post('/sales/enquiries', {
          ...updatedItem,
          assigned_to: user?.id || 1
        });
      }
      setActionModalVisible(false);
      fetchEnquiries();
    } catch (err) {
      console.error('Error saving enquiry:', err);
      Alert.alert('Error', 'Failed to save enquiry.');
    }
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.enquiry_details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return '#3B82F6';
      case 'contacted': return '#F59E0B';
      case 'qualified': return '#8B5CF6';
      case 'proposal_sent': return '#6366F1';
      case 'won': return '#10B981';
      case 'lost': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatStatus = (status) => {
    return status?.replace('_', ' ').toUpperCase() || 'NEW';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sales Enquiries</Text>
            <Text style={styles.headerSubtitle}>Manage and track incoming leads</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setActionSelectedItem({ status: 'new' });
          setActionModalMode('add');
          setActionModalVisible(true);
        }}>
          <LinearGradient colors={['#2563EB', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>New Lead</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search enquiries..." 
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
          {filteredEnquiries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No enquiries found</Text>
            </View>
          ) : (
            filteredEnquiries.map((item, i) => (
              <TouchableOpacity 
                key={item.id || i}
                style={styles.card}
                onPress={() => navigation.navigate('CustomerSalesDetails', { enquiryId: item.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <Building2 size={20} color='#2563EB' />
                  </View>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.customerName} numberOfLines={1}>{item.customer_name}</Text>
                    <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {formatStatus(item.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.enquiryDesc} numberOfLines={2}>{item.enquiry_details}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.contactRow}>
                    <Mail size={14} color='#6B7280' style={{marginRight: 6}} />
                    <Text style={styles.contactText} numberOfLines={1}>{item.contact_email || 'No email provided'}</Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </View>
              </TouchableOpacity>
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
          schema={createEnquirySchema()}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'New Enquiry' : actionModalMode === 'edit' ? 'Edit Enquiry' : 'Enquiry Details'}
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
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
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
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  cardTitleCol: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  dateText: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  enquiryDesc: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 16 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  contactText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
