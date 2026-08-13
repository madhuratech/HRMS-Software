import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Search, Plus, Mail, Phone, ChevronRight, X, Building2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function SalesEnquiriesScreen({ navigation }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newEnquiryDetails, setNewEnquiryDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddEnquiry = async () => {
    if (!newCustomerName.trim() || !newEnquiryDetails.trim()) {
      Alert.alert('Error', 'Customer name and details are required.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post('/sales/enquiries', { 
        customer_name: newCustomerName, 
        contact_email: newContactEmail,
        contact_phone: newContactPhone,
        enquiry_details: newEnquiryDetails,
        status: 'new'
      });
      setNewCustomerName('');
      setNewContactEmail('');
      setNewContactPhone('');
      setNewEnquiryDetails('');
      setModalVisible(false);
      fetchEnquiries();
    } catch (err) {
      console.error('Error adding enquiry:', err);
      Alert.alert('Error', 'Failed to add enquiry.');
    } finally {
      setSubmitting(false);
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
      default: return '#64748B';
    }
  };

  const formatStatus = (status) => {
    return status?.replace('_', ' ').toUpperCase();
  };

  const renderEnquiry = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CustomerSalesDetails', { enquiryId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Building2 size={20} color="#0F172A" />
          <Text style={styles.customerName} numberOfLines={1}>{item.customer_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {formatStatus(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.enquiryDesc} numberOfLines={2}>{item.enquiry_details}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.contactRow}>
          <Mail size={14} color="#64748B" style={{marginRight: 6}} />
          <Text style={styles.contactText} numberOfLines={1}>{item.contact_email || 'No email'}</Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Sales Enquiries</Text>
          <Text style={styles.headerSubtitle}>Manage incoming leads</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
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
        <FlatList
          data={filteredEnquiries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEnquiry}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No enquiries found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Sales Enquiry</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput 
                style={styles.modalInput}
                placeholder="Customer/Company Name"
                placeholderTextColor="#94A3B8"
                value={newCustomerName}
                onChangeText={setNewCustomerName}
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Email Address"
                placeholderTextColor="#94A3B8"
                value={newContactEmail}
                onChangeText={setNewContactEmail}
                keyboardType="email-address"
              />
              <TextInput 
                style={styles.modalInput}
                placeholder="Phone Number"
                placeholderTextColor="#94A3B8"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                keyboardType="phone-pad"
              />
              <TextInput 
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Enquiry Details..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                value={newEnquiryDetails}
                onChangeText={setNewEnquiryDetails}
              />
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddEnquiry}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Creating...' : 'Create Enquiry'}</Text>
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
  addButton: { borderRadius: 10, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  toolbar: { padding: 20 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 48,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  card: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 12 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  enquiryDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  contactText: { fontSize: 13, color: '#64748B', flex: 1 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  modalBody: { gap: 16 },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
