import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, Edit2, Eye, Trash2, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function LoansAdvancesScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API call for loans (matches frontend mock data)
      setTimeout(() => {
        setData([
          { id: 1, name: 'Siddharth Rao', type: 'Personal Loan', amount: '₹ 2,00,000', emi: '₹ 12,000', out: '₹ 1,40,000', status: 'Active' },
          { id: 2, name: 'Priya Sharma', type: 'Salary Advance', amount: '₹ 50,000', emi: '₹ 10,000', out: '₹ 20,000', status: 'Active' },
          { id: 3, name: 'Vikram Singh', type: 'Home Loan', amount: '₹ 15,00,000', emi: '₹ 45,000', out: '₹ 12,50,000', status: 'Active' },
          { id: 4, name: 'Neha Gupta', type: 'Medical Emergency', amount: '₹ 1,50,000', emi: '₹ 8,000', out: '₹ 0', status: 'Closed' },
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#DEF7EC' : '#FEECDC' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? '#03543F' : '#8A2C0D' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>{item.amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>EMI</Text>
          <Text style={styles.detailValue}>{item.emi}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Outstanding</Text>
          <Text style={styles.detailValue}>{item.out}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn}>
          <Eye size={18} color='#6B7280' />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Edit2 size={18} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Loans & Advances</Text>
          <Text style={styles.headerSubtitle}>Manage employee loans</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientBtn}>
            <Plus size={18} color='#FFFFFF' />
            <Text style={styles.addButtonText}>Add New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No data available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  addButton: { borderRadius: 10, overflow: 'hidden', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardInfo: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardDetails: { marginBottom: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#1E293B', fontWeight: '700' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, gap: 12 },
  iconBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});
