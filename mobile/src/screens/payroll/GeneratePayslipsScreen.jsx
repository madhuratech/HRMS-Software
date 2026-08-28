import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, Edit2, Eye, Trash2, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function GeneratePayslipsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API call for payslips (matches frontend mock data)
      setTimeout(() => {
        setData([
          { id: 'EMP001', name: 'Aarav Sharma', dept: 'Design', net: '₹78,500', status: 'Generated', date: 'May 2024' },
          { id: 'EMP002', name: 'Neha Patel', dept: 'HR', net: '₹52,300', status: 'Generated', date: 'May 2024' },
          { id: 'EMP003', name: 'Rohan Mehta', dept: 'Development', net: '₹85,000', status: 'Generated', date: 'May 2024' },
          { id: 'EMP004', name: 'Priya Nair', dept: 'Finance', net: '₹66,400', status: 'Generated', date: 'May 2024' },
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching payslips:', err);
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
          <Text style={styles.cardSubtitle}>{item.id} • {item.dept}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Generated' ? '#DEF7EC' : '#FEECDC' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Generated' ? '#03543F' : '#8A2C0D' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Net Pay</Text>
          <Text style={styles.detailValue}>{item.net}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Period</Text>
          <Text style={styles.detailValue}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconBtn}>
          <Eye size={18} color='#6B7280' />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Generate Payslips</Text>
          <Text style={styles.headerSubtitle}>Generate and distribute payslips</Text>
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
