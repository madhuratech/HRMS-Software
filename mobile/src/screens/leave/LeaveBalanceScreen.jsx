import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { ShieldAlert, ArrowLeft, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function LeaveBalanceScreen({ navigation }) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leaves/balances/1'); // Using employee 1 as default
      if (Array.isArray(res.data)) {
        setBalances(res.data);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Calendar size={20} color="#3B82F6" />
        </View>
        <Text style={styles.leaveType}>{item.leave_type}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Allocated</Text>
          <Text style={styles.statValue}>{item.allocated}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Used</Text>
          <Text style={styles.statValueUsed}>{item.used}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Balance</Text>
          <Text style={styles.statValueBalance}>{item.balance}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16, padding: 4 }}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Leave Balances</Text>
            <Text style={styles.headerSubtitle}>View remaining time off</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={balances}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <ShieldAlert size={48} color="#CBD5E1" />
              <Text style={styles.title}>No Balances</Text>
              <Text style={styles.subtitle}>No leave balances found for this employee.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#F8FAFC' },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  leaveType: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: '500' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statValueUsed: { fontSize: 18, fontWeight: '800', color: '#EF4444' },
  statValueBalance: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  emptyBox: { padding: 40, alignItems: 'center', marginTop: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' }
});
