import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Building2, Mail, Phone, Calendar as CalendarIcon, FileText, ArrowLeft, ChevronRight } from 'lucide-react-native';
import apiClient from '../../api/client';

export default function CustomerSalesDetailsScreen({ route, navigation }) {
  const { enquiryId } = route.params || {};
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (enquiryId) {
      fetchDetails();
    } else {
      setLoading(false);
    }
  }, [enquiryId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Fetch enquiry
      const enqRes = await apiClient.get('/sales/enquiries');
      const enquiry = enqRes.data.find(e => e.id === enquiryId);
      
      if (!enquiry) {
        setLoading(false);
        return;
      }

      // Fetch related entries and followups (inefficient but works for now)
      const [entriesRes, followupsRes] = await Promise.all([
        apiClient.get('/sales/entries'),
        apiClient.get('/sales/followups')
      ]);

      const entries = entriesRes.data.filter(e => e.enquiry_id === enquiryId);
      const followups = followupsRes.data.filter(f => f.enquiry_id === enquiryId);

      setDetails({
        enquiry,
        entries,
        followups
      });

    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!details || !details.enquiry) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Details not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { enquiry, entries, followups } = details;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enquiry Details Card */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Building2 size={24} color="#2563EB" />
            <Text style={styles.customerName}>{enquiry.customer_name}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Mail size={16} color="#64748B" />
            <Text style={styles.detailText}>{enquiry.contact_email || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Phone size={16} color="#64748B" />
            <Text style={styles.detailText}>{enquiry.contact_phone || 'N/A'}</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Enquiry Details</Text>
          <Text style={styles.descText}>{enquiry.enquiry_details}</Text>
        </View>

        {/* Sales Entries */}
        <Text style={styles.sectionHeader}>Sales History</Text>
        {entries.length === 0 ? (
          <Text style={styles.emptySubText}>No sales recorded yet.</Text>
        ) : (
          entries.map((entry, index) => (
            <View key={index} style={styles.listCard}>
              <View style={styles.listCardRow}>
                <Text style={styles.amountText}>${parseFloat(entry.amount).toFixed(2)}</Text>
                <Text style={styles.dateText}>{new Date(entry.sale_date).toLocaleDateString()}</Text>
              </View>
              {entry.notes ? <Text style={styles.notesText}>{entry.notes}</Text> : null}
            </View>
          ))
        )}

        {/* Follow Ups */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <Text style={styles.sectionHeader}>Follow-Ups</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FollowUp', { enquiryId })}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {followups.length === 0 ? (
          <Text style={styles.emptySubText}>No follow-ups scheduled.</Text>
        ) : (
          followups.slice(0, 3).map((fup, index) => (
            <View key={index} style={styles.listCard}>
              <View style={styles.listCardRow}>
                <Text style={styles.fupAction}>{fup.next_action}</Text>
                <Text style={styles.dateText}>{new Date(fup.followup_date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.notesText}>{fup.notes}</Text>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 20, backgroundColor: '#FFF', flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerBack: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  content: { padding: 20 },
  card: { 
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  detailText: { fontSize: 15, color: '#475569' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 8, marginBottom: 8 },
  descText: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  listCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  listCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amountText: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  dateText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  notesText: { fontSize: 14, color: '#475569' },
  fupAction: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  emptySubText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', marginBottom: 20 },
  emptyText: { fontSize: 16, color: '#64748B', marginBottom: 16 },
  backBtn: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#FFF', fontWeight: '600' },
  linkText: { color: '#2563EB', fontWeight: '600', fontSize: 14 }
});
