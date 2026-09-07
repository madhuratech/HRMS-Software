import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { FileText, Clock, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function HelpDeskDashboardScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tickets');
      if (res.data && Array.isArray(res.data)) {
        setData(res.data.slice(0, 5)); // Show only 5 recent tickets on dashboard
      } else if (res.data?.data) {
        setData(res.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Resolved') return { bg: '#ECFDF5', text: '#059669' };
    if (status === 'In Progress') return { bg: '#FEF3C7', text: '#D97706' };
    if (status === 'Pending') return { bg: '#EFF6FF', text: '#818CF8' };
    return { bg: '#FEF2F2', text: '#EF4444' }; // Open
  };

  const renderKpis = () => (
    <View style={styles.kpiContainer}>
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
            <FileText size={20} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>Total Tickets</Text>
          <Text style={styles.kpiValue}>1,248</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#FEF2F2' }]}>
            <Clock size={20} color="#EF4444" />
          </View>
          <Text style={styles.kpiLabel}>Open</Text>
          <Text style={styles.kpiValue}>261</Text>
        </View>
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={20} color="#D97706" />
          </View>
          <Text style={styles.kpiLabel}>In Progress</Text>
          <Text style={styles.kpiValue}>312</Text>
        </View>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle size={20} color="#059669" />
          </View>
          <Text style={styles.kpiLabel}>Resolved</Text>
          <Text style={styles.kpiValue}>490</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Recent Tickets</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const sColor = getStatusColor(item.status);
    const title = item.subject || item.title || 'No Title';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{title.substring(0,2).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.cardSubtitle}>{item.date || item.created_at || ''}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sColor.bg }]}>
            <Text style={[styles.badgeText, { color: sColor.text }]}>{item.status || 'Open'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Help Desk</Text>
            <Text style={styles.headerSubtitle}>Overview of all support activities</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderKpis}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGradient: { padding: 20, paddingTop: 20, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, zIndex: 10 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  
  listContent: { padding: 20, paddingBottom: 100 },
  
  kpiContainer: { marginBottom: 10 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiCard: { flex: 0.48, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  kpiIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 10, marginBottom: 10 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#64748B', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { fontSize: 15, fontWeight: '700', color: '#3B82F6' },
  cardInfo: { flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
