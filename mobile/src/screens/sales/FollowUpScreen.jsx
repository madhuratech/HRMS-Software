import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { Search, Plus, Calendar, Clock, StickyNote, User, X, CheckCircle, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function FollowUpScreen({ navigation }) {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFollowUps();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/sales/followups');
      if (Array.isArray(res.data)) {
        setFollowUps(res.data);
      }
    } catch (err) {
      console.error('Error fetching followups:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFollowUps = followUps.filter(f => 
    f.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderFollowUp = ({ item, i }) => (
    <View key={item.id || i} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Clock size={20} color="#F59E0B" />
        </View>
        <View style={styles.cardTitleCol}>
          <Text style={styles.customerName} numberOfLines={1}>{item.customer_name || 'Unknown Customer'}</Text>
          <Text style={styles.dateText}>{new Date(item.followup_date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'pending') + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status || 'pending') }]}>
            {(item.status || 'Pending').toUpperCase()}
          </Text>
        </View>
      </View>

      {item.notes ? (
        <>
          <View style={styles.divider} />
          <View style={styles.notesRow}>
            <StickyNote size={14} color='#6B7280' style={{marginRight: 6}} />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        </>
      ) : null}
      
      {item.status !== 'completed' && (
        <View style={styles.actionRow}>
           <TouchableOpacity 
             style={styles.completeBtn}
             onPress={() => {
                // Future Implementation: Mark as complete API call
                Alert.alert("Complete", "Mark this follow-up as completed?");
             }}
           >
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.completeBtnText}>Mark Completed</Text>
           </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Follow-ups</Text>
            <Text style={styles.headerSubtitle}>Keep track of your scheduled check-ins</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color='#6B7280' />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search follow-ups..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredFollowUps.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No follow-ups scheduled</Text>
            </View>
          ) : (
            filteredFollowUps.map((item, i) => renderFollowUp({ item, i }))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
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
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  cardTitleCol: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  dateText: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  
  notesRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  notesText: { fontSize: 14, color: '#475569', flex: 1, lineHeight: 20 },
  
  actionRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
  completeBtnText: { color: '#10B981', fontSize: 13, fontWeight: '700' }
});
