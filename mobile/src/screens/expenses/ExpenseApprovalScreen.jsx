import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { Search, Plus, CheckCircle, XCircle, Clock, Calendar, ChevronRight, FileText, Layers } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function ExpenseApprovalScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/expenses/claims?status=Pending`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn('Error fetching pending approvals:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApprove = (item) => {
    Alert.alert('Approve Claim', `Approve expense claim for ${item.employee_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', style: 'default', onPress: async () => {
          try {
             await apiClient.put(`/expenses/claims/${item.id}/approve`, { status: 'Approved' });
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to approve claim');
          }
      }}
    ]);
  };

  const handleReject = (item) => {
    Alert.alert('Reject Claim', `Reject expense claim for ${item.employee_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
          try {
             await apiClient.put(`/expenses/claims/${item.id}/approve`, { status: 'Rejected' });
             fetchData();
          } catch(err) {
             Alert.alert('Error', 'Failed to reject claim');
          }
      }}
    ]);
  };

  const filteredData = data.filter(item => 
    (item.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.employee_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.claimTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.employeeName} numberOfLines={1}>{item.employee_name} • {item.department_name}</Text>
          </View>
          <Text style={styles.amountText}>${parseFloat(item.amount).toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.date ? new Date(item.date).toLocaleDateString('en-IN') : '--'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FileText size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.category_name}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.actionGroup}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FEE2E2' }]} onPress={() => handleReject(item)}>
              <XCircle size={14} color="#DC2626" />
              <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DCFCE7', borderColor: '#DCFCE7' }]} onPress={() => handleApprove(item)}>
              <CheckCircle size={14} color="#15803D" />
              <Text style={[styles.actionBtnText, { color: '#15803D' }]}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Expense Approval</Text>
            <Text style={styles.headerSubtitle}>Review pending employee claims</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or employee..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Clock size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No pending claims</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: '#64748B' },
  searchRow: { flexDirection: 'row', gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  claimTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  employeeName: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  amountText: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#475569', flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  actionGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#94A3B8', fontWeight: '500' }
});
