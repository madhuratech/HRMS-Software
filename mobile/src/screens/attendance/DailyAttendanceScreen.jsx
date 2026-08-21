import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, Calendar, Search, MapPin, UserCheck, CalendarOff, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';

export default function DailyAttendanceScreen({ navigation }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Employee');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/daily');
      if (res.data && Array.isArray(res.data.records)) {
        setAttendance(res.data.records);
      } else if (Array.isArray(res.data)) {
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
          <Text style={styles.avatarText}>{(item.name || item.employee_name || '').substring(0,2).toUpperCase()}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.empName}>{item.name || item.employee_name}</Text>
          <Text style={styles.empRole}>{item.role || item.designation || 'Staff'} • {item.department}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || 'Present'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.timeBox}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.timeLabel}>In: <Text style={styles.timeValue}>{item.checkIn || item.punch_in || '--:--'}</Text></Text>
          </View>
          {!!item.checkInAddress && (
            <View style={styles.timeBox}>
              <MapPin size={12} color="#10B981" />
              <Text style={[styles.timeLabel, { fontSize: 11 }]} numberOfLines={1}>{item.checkInAddress}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.timeBox}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.timeLabel}>Out: <Text style={styles.timeValue}>{item.checkOut || item.punch_out || '--:--'}</Text></Text>
          </View>
          {!!item.checkOutAddress && (
            <View style={styles.timeBox}>
              <MapPin size={12} color="#EF4444" />
              <Text style={[styles.timeLabel, { fontSize: 11 }]} numberOfLines={1}>{item.checkOutAddress}</Text>
            </View>
          )}
        </View>

        <View style={{ justifyContent: 'center' }}>
          <Text style={styles.timeLabel}>Hrs: <Text style={styles.timeValue}>{item.workingHours || item.work_hours || '0'}</Text></Text>
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
            <Text style={styles.headerTitle}>Daily Attendance</Text>
            <Text style={styles.headerSubtitle}>Monitor today's staff presence</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAttendance}>
          <Calendar size={20} color="#1E293B" />
        </TouchableOpacity>
      </LinearGradient>

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

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'Employee' && styles.activeTabBtn]} onPress={() => setActiveTab('Employee')}>
          <Text style={[styles.tabText, activeTab === 'Employee' && styles.activeTabText]}>Employees</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'Admin' && styles.activeTabBtn]} onPress={() => setActiveTab('Admin')}>
          <Text style={[styles.tabText, activeTab === 'Admin' && styles.activeTabText]}>Admins</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={attendance.filter(item => {
            const role = (item.role || '').toLowerCase();
            const isAdmin = role.includes('admin') || role.includes('hr');
            return activeTab === 'Admin' ? isAdmin : !isAdmin;
          })}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} records for today.</Text>
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
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#E2E8F0', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#3B82F6' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#FFFFFF' }
});
