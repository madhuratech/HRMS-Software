import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertCircle, Clock, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function LateArrivalScreen({ navigation }) {
  const [lateData, setLateData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLateArrivals();
  }, []);

  const fetchLateArrivals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/late-arrivals');
      if (Array.isArray(res.data)) {
        setLateData(res.data);
      }
    } catch (err) {
      console.error('Error fetching late arrivals:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{(item.employee_name || 'E').substring(0,2).toUpperCase()}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.empName}>{item.employee_name}</Text>
          <Text style={styles.empRole}>{item.date}</Text>
        </View>
        <View style={styles.timeBadge}>
          <Clock size={12} color="#EF4444" style={{ marginRight: 4 }} />
          <Text style={styles.timeText}>{item.time_in}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.reasonText}>Reason: {item.reason || 'None provided'}</Text>
      </View>
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
            <Text style={styles.headerTitle}>Late Arrivals</Text>
            <Text style={styles.headerSubtitle}>Monitor employee punctuality</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={lateData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <AlertCircle size={48} color="#CBD5E1" />
              <Text style={styles.title}>Late Arrivals</Text>
              <Text style={styles.subtitle}>No late arrivals recorded.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  infoCol: { flex: 1 },
  empName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  empRole: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  timeText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  cardBody: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  reasonText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }
});
