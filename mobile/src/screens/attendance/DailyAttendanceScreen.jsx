import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Clock, Calendar, Search, MapPin, UserCheck, CalendarOff, ChevronLeft, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
export default function DailyAttendanceScreen({ navigation }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Employee');
  const [mapVisible, setMapVisible] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);

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
      default: return '#6B7280';
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || 'Present'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.timeBox}>
            <Clock size={14} color='#6B7280' />
            <Text style={styles.timeLabel}>In: <Text style={styles.timeValue}>{item.checkIn || item.punch_in || item.check_in_time || '--:--'}</Text></Text>
          </View>
          {!!(item.check_in_address || item.checkInAddress) && (
            <TouchableOpacity 
              style={styles.timeBox}
              onPress={() => {
                const lat = item.check_in_lat || item.latitude_in;
                const lng = item.check_in_lng || item.longitude_in;
                if (lat && lng) {
                  setMapLocation({ lat, lng, name: item.name, address: item.check_in_address || item.checkInAddress, type: 'Check-In' });
                  setMapVisible(true);
                }
              }}
            >
              <MapPin size={12} color="#10B981" />
              <Text style={[styles.timeLabel, { fontSize: 11, color: '#10B981', textDecorationLine: 'underline' }]} numberOfLines={1}>{item.check_in_address || item.checkInAddress}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.timeBox}>
            <Clock size={14} color='#6B7280' />
            <Text style={styles.timeLabel}>Out: <Text style={styles.timeValue}>{item.checkOut || item.punch_out || item.check_out_time || '--:--'}</Text></Text>
          </View>
          {!!(item.check_out_address || item.checkOutAddress) && (
            <TouchableOpacity 
              style={styles.timeBox}
              onPress={() => {
                const lat = item.check_out_lat || item.latitude_out;
                const lng = item.check_out_lng || item.longitude_out;
                if (lat && lng) {
                  setMapLocation({ lat, lng, name: item.name, address: item.check_out_address || item.checkOutAddress, type: 'Check-Out' });
                  setMapVisible(true);
                }
              }}
            >
              <MapPin size={12} color="#EF4444" />
              <Text style={[styles.timeLabel, { fontSize: 11, color: '#EF4444', textDecorationLine: 'underline' }]} numberOfLines={1}>{item.check_out_address || item.checkOutAddress}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ justifyContent: 'center' }}>
          <Text style={styles.timeLabel}>Hrs: <Text style={styles.timeValue}>{item.workingHours || item.working_hours || item.work_hours || '0'}</Text></Text>
        </View>
      </View>
      
      {!!item.work_done && (
        <View style={{ padding: 12, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderColor: '#E2E8F0', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>Work Done:</Text>
          <Text style={{ fontSize: 12, color: '#64748B' }}>{item.work_done}</Text>
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
      
      {/* Map Modal */}
      <Modal visible={mapVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.mapModalContainer}>
            <View style={styles.mapModalHeader}>
              <View>
                <Text style={styles.mapModalTitle}>{mapLocation?.name || 'Location'}</Text>
                <Text style={styles.mapModalSubtitle}>{mapLocation?.type || 'Check-In'} Location</Text>
              </View>
              <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeBtn}>
                <X size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            
            {mapLocation && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={{
                    latitude: parseFloat(mapLocation.lat),
                    longitude: parseFloat(mapLocation.lng),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(mapLocation.lat),
                      longitude: parseFloat(mapLocation.lng),
                    }}
                    title={mapLocation.name}
                    description={mapLocation.address}
                  />
                </MapView>
                <View style={styles.addressBox}>
                  <MapPin size={16} color="#10B981" />
                  <Text style={styles.addressText}>{mapLocation.address}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  refreshBtn: { padding: 10, backgroundColor: '#E5E7EB', borderRadius: 10 },
  summaryRow: { flexDirection: 'row', padding: 20, gap: 16 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: '#10B981', marginTop: 8 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: '#10B981', marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  infoCol: { flex: 1, marginLeft: 12 },
  empName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  empRole: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeLabel: { fontSize: 13, color: '#6B7280' },
  timeValue: { fontWeight: '700', color: '#111827' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '500' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#E5E7EB', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 20 },
  mapModalContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', height: 400, borderWidth: 1, borderColor: '#E5E7EB' },
  mapModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  mapModalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  mapModalSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  closeBtn: { padding: 4 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  addressBox: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  addressText: { flex: 1, fontSize: 13, color: '#111827', fontWeight: '500' }
});
