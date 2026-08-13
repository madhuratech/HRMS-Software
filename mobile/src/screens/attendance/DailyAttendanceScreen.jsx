import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, Calendar, Search, MapPin, UserCheck, CalendarOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function DailyAttendanceScreen() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/daily');
      if (Array.isArray(res.data)) {
        setAttendance(res.data);
      }
    } catch (err) {
      console.error('Error fetching daily attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return '#10B981';
      case 'absent': return '#EF4444';
      case 'late': return '#F59E0B';
      case 'half day': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{item.employee_name?.substring(0,2).toUpperCase()}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.empName}>{item.employee_name}</Text>
          <Text style={styles.empRole}>{item.designation} • {item.department}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || 'Present'}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardBottom}>
        <View style={styles.timeBox}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.timeLabel}>In: <Text style={styles.timeValue}>{item.punch_in || '--:--'}</Text></Text>
        </View>
        <View style={styles.timeBox}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.timeLabel}>Out: <Text style={styles.timeValue}>{item.punch_out || '--:--'}</Text></Text>
        </View>
        <View style={styles.timeBox}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.timeLabel}>Hrs: <Text style={styles.timeValue}>{item.work_hours || '0'}</Text></Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Daily Attendance</Text>
          <Text style={styles.headerSubtitle}>{new Date().toDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAttendance}>
          <Calendar size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.summaryCard}>
          <UserCheck size={24} color="#10B981" />
          <Text style={styles.summaryValue}>{attendance.filter(a => a.status === 'Present').length}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </LinearGradient>
        <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.summaryCard}>
          <CalendarOff size={24} color="#EF4444" />
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{attendance.filter(a => a.status === 'Absent').length}</Text>
          <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Absent</Text>
        </LinearGradient>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={attendance}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No attendance records for today.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  refreshBtn: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: 10 },
  summaryRow: { flexDirection: 'row', padding: 20, gap: 16 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: '#10B981', marginTop: 8 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: '#10B981', marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  infoCol: { flex: 1, marginLeft: 12 },
  empName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  empRole: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeLabel: { fontSize: 13, color: '#64748B' },
  timeValue: { fontWeight: '700', color: '#0F172A' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});
