import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Building2, Mail, Phone, Calendar as CalendarIcon, FileText, ChevronLeft, ChevronRight, DollarSign, Clock, StickyNote, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

      // Fetch related entries and followups
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator size="large" color='#2563EB' />
      </View>
    );
  }

  if (!details || !details.enquiry) {
    return (
      <View style={[styles.container, styles.centerBox]}>
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
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Customer Profile</Text>
            <Text style={styles.headerSubtitle}>Lead details and history</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Enquiry Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileIconBox}>
              <Building2 size={28} color='#2563EB' />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{enquiry.customer_name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(enquiry.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(enquiry.status) }]}>
                  {enquiry.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.contactList}>
            <View style={styles.contactItem}>
              <View style={styles.contactIconBg}>
                <Mail size={16} color='#6B7280' />
              </View>
              <Text style={styles.contactValue}>{enquiry.contact_email || 'No email provided'}</Text>
            </View>
            <View style={styles.contactItem}>
              <View style={styles.contactIconBg}>
                <Phone size={16} color='#6B7280' />
              </View>
              <Text style={styles.contactValue}>{enquiry.contact_phone || 'No phone provided'}</Text>
            </View>
          </View>
        </View>

        {/* Enquiry Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color='#2563EB' />
            <Text style={styles.sectionTitle}>Enquiry Requirements</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.descText}>{enquiry.enquiry_details}</Text>
        </View>

        {/* Sales History */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Sales Log</Text>
          <TouchableOpacity 
            style={styles.addSmallBtn} 
            onPress={() => navigation.navigate('SalesEntry')}
          >
            <Plus size={14} color="#10B981" />
            <Text style={[styles.addSmallBtnText, { color: '#10B981' }]}>Log Sale</Text>
          </TouchableOpacity>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptySubBox}>
            <Text style={styles.emptySubText}>No sales recorded for this customer.</Text>
          </View>
        ) : (
          entries.map((entry, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View style={styles.historyIconBox}>
                  <DollarSign size={18} color="#10B981" />
                </View>
                <View style={styles.historyCol}>
                  <Text style={styles.historyAmount}>₹{parseFloat(entry.amount).toLocaleString('en-IN')}</Text>
                  <Text style={styles.historyDate}>{new Date(entry.sale_date).toLocaleDateString()}</Text>
                </View>
              </View>
              {entry.notes ? (
                <View style={styles.historyNotesRow}>
                  <StickyNote size={14} color="#94A3B8" style={{marginRight: 8, marginTop: 2}} />
                  <Text style={styles.historyNotesText}>{entry.notes}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}

        {/* Follow Ups */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Recent Follow-ups</Text>
          <TouchableOpacity 
            style={styles.addSmallBtn} 
            onPress={() => navigation.navigate('FollowUp')}
          >
            <Text style={[styles.addSmallBtnText, { color: '#F59E0B' }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {followups.length === 0 ? (
          <View style={styles.emptySubBox}>
            <Text style={styles.emptySubText}>No follow-ups scheduled.</Text>
          </View>
        ) : (
          followups.slice(0, 3).map((fup, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View style={[styles.historyIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Clock size={18} color="#F59E0B" />
                </View>
                <View style={styles.historyCol}>
                  <Text style={styles.historyAmount}>{fup.next_action || 'Follow Up'}</Text>
                  <Text style={styles.historyDate}>{new Date(fup.followup_date).toLocaleDateString()}</Text>
                </View>
              </View>
              {fup.notes ? (
                <View style={styles.historyNotesRow}>
                  <StickyNote size={14} color="#94A3B8" style={{marginRight: 8, marginTop: 2}} />
                  <Text style={styles.historyNotesText}>{fup.notes}</Text>
                </View>
              ) : null}
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
    padding: 24, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backArrow: { marginRight: 16, padding: 4 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  
  centerBox: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  backBtn: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#FFFFFF', fontWeight: '700' },

  content: { paddingHorizontal: 20, paddingTop: 20 },
  
  profileCard: { 
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1, alignItems: 'flex-start' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
  
  contactList: { gap: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  contactValue: { fontSize: 15, color: '#334155', fontWeight: '500' },

  sectionCard: { 
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 16, elevation: 2
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  descText: { fontSize: 15, color: '#475569', lineHeight: 24 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  addSmallBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  addSmallBtnText: { fontSize: 13, fontWeight: '700' },

  emptySubBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  emptySubText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },

  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  historyCol: { flex: 1 },
  historyAmount: { fontSize: 16, fontWeight: '700', color: '#111827' },
  historyDate: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  historyNotesRow: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  historyNotesText: { fontSize: 14, color: '#6B7280', flex: 1, lineHeight: 20 }
});
