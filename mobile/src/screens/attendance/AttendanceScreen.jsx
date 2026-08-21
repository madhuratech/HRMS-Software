import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, FlatList, RefreshControl,
  Linking, Alert, Platform
} from 'react-native';
import {
  Clock, CheckCircle, XCircle, MapPin, LogIn, LogOut,
  AlertTriangle, Eye, Download, Users, Activity, FileText
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import * as Location from 'expo-location';

// ─── Helpers ────────────────────────────────────────────────────────────────
function getRoleKey(user) {
  const r = (user?.role || user?.role_name || '').toUpperCase().replace(/\s+/g, '_');
  if (r.includes('SUPER')) return 'SUPER_ADMIN';
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'HR') return 'HR';
  return 'EMPLOYEE';
}

function formatTime(dt) {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
  catch { return '—'; }
}

function formatDate(dt) {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function openMapLocation(lat, lng, label) {
  const url = Platform.select({
    ios: `maps://app?saddr=&daddr=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${label || 'Location'})`
  });
  Linking.canOpenURL(url).then(supported => {
    if (supported) Linking.openURL(url);
    else Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
  });
}

// ─── Work Done Detail Modal ──────────────────────────────────────────────────
function WorkDetailModal({ visible, record, onClose }) {
  if (!record) return null;
  const name = record.employee_name || record.name || 'Employee';
  const checkIn = record.check_in_time || record.punch_in;
  const checkOut = record.check_out_time || record.punch_out;
  const workDone = record.work_done || record.notes || 'No work summary provided.';
  const inLat = record.check_in_lat || record.latitude;
  const inLng = record.check_in_lng || record.longitude;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Attendance Details</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <XCircle size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Employee */}
            <View style={s.detailSection}>
              <View style={s.avatarLarge}>
                <Text style={s.avatarLargeText}>{name.substring(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={s.detailName}>{name}</Text>
              <Text style={s.detailRole}>{record.department || record.role || 'Employee'}</Text>
            </View>

            {/* Times */}
            <View style={s.timeRow}>
              <View style={[s.timeBox, { borderColor: '#10B981' }]}>
                <LogIn size={20} color="#10B981" />
                <Text style={s.timeBoxLabel}>Check In</Text>
                <Text style={[s.timeBoxTime, { color: '#10B981' }]}>{formatTime(checkIn)}</Text>
                <Text style={s.timeBoxDate}>{formatDate(checkIn)}</Text>
              </View>
              <View style={[s.timeBox, { borderColor: '#EF4444' }]}>
                <LogOut size={20} color="#EF4444" />
                <Text style={s.timeBoxLabel}>Check Out</Text>
                <Text style={[s.timeBoxTime, { color: '#EF4444' }]}>{formatTime(checkOut)}</Text>
                <Text style={s.timeBoxDate}>{formatDate(checkOut)}</Text>
              </View>
            </View>

            {/* Location */}
            {inLat && inLng ? (
              <TouchableOpacity
                style={s.locationBtn}
                onPress={() => openMapLocation(inLat, inLng, `${name}'s Check-In`)}
              >
                <MapPin size={18} color="#4F46E5" />
                <Text style={s.locationBtnText}>View Check-In Location on Map</Text>
              </TouchableOpacity>
            ) : null}

            {/* Work Done */}
            <View style={s.workSection}>
              <View style={s.workHeader}>
                <FileText size={18} color="#4F46E5" />
                <Text style={s.workTitle}>Work Done</Text>
              </View>
              <Text style={s.workText}>{workDone}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Employee Card for Monitoring View ───────────────────────────────────────
function EmpAttendanceCard({ record, onView }) {
  const checkIn = record.check_in_time || record.punch_in;
  const checkOut = record.check_out_time || record.punch_out;
  const isCheckedIn = !!checkIn;
  const isCheckedOut = !!checkOut;
  const onLeave = record.on_leave > 0;
  const workDone = record.work_done;

  let statusColor = '#64748B', statusBg = '#F1F5F9', statusLabel = 'Not In';
  if (onLeave) { statusColor = '#F59E0B'; statusBg = '#FEF3C7'; statusLabel = 'On Leave'; }
  else if (isCheckedIn && !isCheckedOut) { statusColor = '#10B981'; statusBg = '#D1FAE5'; statusLabel = 'Checked In'; }
  else if (isCheckedIn && isCheckedOut) { statusColor = '#4F46E5'; statusBg = '#EEF2FF'; statusLabel = 'Completed'; }

  const name = record.name || record.employee_name || 'Unknown';
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <View style={s.empCard}>
      <View style={s.empCardTop}>
        <View style={s.empCardLeft}>
          <View style={[s.empAvatar, { backgroundColor: statusColor }]}>
            <Text style={s.empAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.empName} numberOfLines={1}>{name}</Text>
            <Text style={s.empDept} numberOfLines={1}>{record.department || record.dept_name || '—'}</Text>
            <View style={s.timePills}>
              {isCheckedIn && (
                <View style={s.timePill}>
                  <LogIn size={11} color="#10B981" />
                  <Text style={[s.timePillText, { color: '#10B981' }]}>
                    {formatTime(checkIn)} {record.checkInAddress ? ` - ${record.checkInAddress}` : ''}
                  </Text>
                </View>
              )}
              {isCheckedOut && (
                <View style={s.timePill}>
                  <LogOut size={11} color="#EF4444" />
                  <Text style={[s.timePillText, { color: '#EF4444' }]}>
                    {formatTime(checkOut)} {record.checkOutAddress ? ` - ${record.checkOutAddress}` : ''}
                  </Text>
                </View>
              )}
              {!isCheckedIn && !onLeave && (
                <Text style={s.notInText}>Not checked in</Text>
              )}
            </View>
          </View>
        </View>
        <View style={s.empCardRight}>
          <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <TouchableOpacity style={s.viewBtn} onPress={() => onView(record)}>
            <Eye size={14} color="#4F46E5" />
            <Text style={s.viewBtnText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Work Done Snippet */}
      {workDone && (
        <View style={s.empWorkDoneBox}>
          <FileText size={12} color="#94A3B8" style={{ marginTop: 2 }} />
          <Text style={s.empWorkDoneText} numberOfLines={2}>{workDone}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Employee Self Check-In/Out View ─────────────────────────────────────────
function SelfPunchView({ user, onRefresh }) {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [workDoneModal, setWorkDoneModal] = useState(false);
  const [workDoneText, setWorkDoneText] = useState('');

  const empId = user?.employee_id || user?.id;

  const fetchToday = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/today-status');
      setTodayRecord(res.data);
    } catch {
      setTodayRecord(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchToday(); }, []);

  const punch = async (type, workSummary = '') => {
    try {
      setPunching(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to punch in/out.');
        setPunching(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let lat = location.coords.latitude;
      let lng = location.coords.longitude;
      
      let location_address = null;
      try {
        let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode.length > 0) {
          const place = geocode[0];
          location_address = [place.name, place.street, place.subregion, place.city, place.region]
            .filter(Boolean)
            .join(', ');
        }
      } catch (geocodeErr) {
        console.warn('Reverse geocoding failed', geocodeErr);
      }

      await apiClient.post('/attendance/punch', {
        punch_type: type,
        latitude: lat,
        longitude: lng,
        location_address,
        work_done: workSummary,
      });
      await fetchToday();
      if (onRefresh) onRefresh();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Punch failed. Try again.');
    } finally {
      setPunching(false);
      setWorkDoneModal(false);
      setWorkDoneText('');
    }
  };

  const handleCheckOut = () => setWorkDoneModal(true);

  if (loading) {
    return (
      <View style={s.centerBox}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={s.loadingText}>Loading today's status...</Text>
      </View>
    );
  }

  const checkedIn = todayRecord?.punch_in;
  const checkedOut = todayRecord?.punch_out;
  const isActive = checkedIn && !checkedOut;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {/* Today Card */}
      <View style={s.todayCard}>
        <View style={s.todayHeader}>
          <View style={s.todayIconBox}>
            <Activity size={24} color="#4F46E5" />
          </View>
          <View>
            <Text style={s.todayTitle}>Today's Attendance</Text>
            <Text style={s.todayDate}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</Text>
          </View>
        </View>

        <View style={s.todayTimesRow}>
          <View style={s.todayTimeBlock}>
            <LogIn size={20} color="#10B981" />
            <Text style={s.todayTimeLabel}>Check In</Text>
            <Text style={[s.todayTimeValue, { color: '#10B981' }]}>{formatTime(checkedIn)}</Text>
          </View>
          <View style={s.todayTimeBlock}>
            <LogOut size={20} color="#EF4444" />
            <Text style={s.todayTimeLabel}>Check Out</Text>
            <Text style={[s.todayTimeValue, { color: '#EF4444' }]}>{formatTime(checkedOut)}</Text>
          </View>
          <View style={s.todayTimeBlock}>
            <Clock size={20} color="#4F46E5" />
            <Text style={s.todayTimeLabel}>Status</Text>
            <Text style={[s.todayTimeValue, { color: isActive ? '#10B981' : checkedOut ? '#4F46E5' : '#94A3B8', fontSize: 12 }]}>
              {isActive ? 'Active' : checkedOut ? 'Done' : 'Pending'}
            </Text>
          </View>
        </View>

        {todayRecord?.work_done && (
          <View style={s.workDoneBox}>
            <FileText size={15} color="#4F46E5" />
            <Text style={s.workDoneText} numberOfLines={3}>{todayRecord.work_done}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {!checkedIn && (
          <TouchableOpacity
            style={[s.punchBtn, { backgroundColor: '#10B981' }]}
            onPress={() => punch('IN')}
            disabled={punching}
          >
            {punching ? <ActivityIndicator color="#FFF" /> : (
              <>
                <LogIn size={20} color="#FFF" />
                <Text style={s.punchBtnText}>Check In</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        {isActive && (
          <TouchableOpacity
            style={[s.punchBtn, { backgroundColor: '#EF4444' }]}
            onPress={handleCheckOut}
            disabled={punching}
          >
            {punching ? <ActivityIndicator color="#FFF" /> : (
              <>
                <LogOut size={20} color="#FFF" />
                <Text style={s.punchBtnText}>Check Out</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        {checkedIn && checkedOut && (
          <View style={s.completedBanner}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={s.completedText}>Attendance marked for today</Text>
          </View>
        )}
      </View>

      {/* Work Done Modal */}
      <Modal visible={workDoneModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.workModal}>
            <Text style={s.workModalTitle}>Work Done Today</Text>
            <Text style={s.workModalSubtitle}>Please briefly describe what you accomplished today before checking out.</Text>
            <TextInput
              style={s.workInput}
              multiline
              numberOfLines={5}
              placeholder="e.g., Completed API integration, fixed 3 bugs, attended team meeting..."
              placeholderTextColor="#94A3B8"
              value={workDoneText}
              onChangeText={setWorkDoneText}
              textAlignVertical="top"
            />
            <View style={s.workModalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setWorkDoneModal(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, !workDoneText.trim() && { opacity: 0.5 }]}
                onPress={() => punch('OUT', workDoneText)}
                disabled={!workDoneText.trim() || punching}
              >
                {punching ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.confirmBtnText}>Submit & Check Out</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AttendanceScreen() {
  const { user } = useAuth();
  const roleKey = getRoleKey(user);
  const isSuperAdmin = roleKey === 'SUPER_ADMIN';
  const isMonitor = isSuperAdmin || roleKey === 'ADMIN' || roleKey === 'HR';

  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'monitor' : 'self');
  const [monitorSubTab, setMonitorSubTab] = useState('EMPLOYEE'); // 'EMPLOYEE' | 'ADMIN'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchAllAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const res = await apiClient.get(`/attendance/daily?date=${today}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.employees || []);
      setRecords(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'monitor') fetchAllAttendance();
  }, [activeTab]);

  const onRefresh = () => { setRefreshing(true); fetchAllAttendance(); };

  const openDetail = (record) => { setSelectedRecord(record); setDetailVisible(true); };

  const exportExcel = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filter = isSuperAdmin ? '' : '&roleFilter=EMPLOYEE';
      const url = `${apiClient.defaults.baseURL}/attendance/reports/excel?date=${today}${filter}`;
      Linking.openURL(url);
    } catch {
      Alert.alert('Export', 'Excel export URL opened. Check your browser/downloads.');
    }
  };

  // Filter records based on role
  const filteredRecords = React.useMemo(() => {
    if (!isSuperAdmin) {
      return records.filter(r => {
        const rk = (r.role || '').toUpperCase();
        return !rk.includes('SUPER') && rk !== 'ADMIN' && rk !== 'HR';
      });
    } else {
      return records.filter(r => {
        const rk = (r.role || '').toUpperCase();
        const isAdminType = rk.includes('ADMIN') || rk === 'HR';
        return monitorSubTab === 'ADMIN' ? isAdminType : !isAdminType;
      });
    }
  }, [records, isSuperAdmin, monitorSubTab]);

  const stats = React.useMemo(() => {
    if (activeTab !== 'monitor') return { total: 0, present: 0, absent: 0, onLeave: 0 };
    const present = filteredRecords.filter(r => r.check_in_time || r.punch_in).length;
    const onLeave = filteredRecords.filter(r => r.on_leave > 0).length;
    return { 
      total: filteredRecords.length, 
      present, 
      absent: filteredRecords.length - present - onLeave, 
      onLeave 
    };
  }, [filteredRecords, activeTab]);

  return (
    <View style={s.container}>
      {/* Main Tabs */}
      {isMonitor && !isSuperAdmin && (
        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tab, activeTab === 'self' && s.tabActive]}
            onPress={() => setActiveTab('self')}
          >
            <LogIn size={16} color={activeTab === 'self' ? '#4F46E5' : '#64748B'} />
            <Text style={[s.tabText, activeTab === 'self' && s.tabTextActive]}>My Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, activeTab === 'monitor' && s.tabActive]}
            onPress={() => setActiveTab('monitor')}
          >
            <Users size={16} color={activeTab === 'monitor' ? '#4F46E5' : '#64748B'} />
            <Text style={[s.tabText, activeTab === 'monitor' && s.tabTextActive]}>Team Monitor</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'self' ? (
        <SelfPunchView user={user} onRefresh={fetchAllAttendance} />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Sub Tabs for Super Admin */}
          {isSuperAdmin && (
            <View style={s.subTabs}>
              <TouchableOpacity
                style={[s.subTab, monitorSubTab === 'EMPLOYEE' && s.subTabActive]}
                onPress={() => setMonitorSubTab('EMPLOYEE')}
              >
                <Users size={15} color={monitorSubTab === 'EMPLOYEE' ? '#FFF' : '#475569'} />
                <Text style={[s.subTabText, monitorSubTab === 'EMPLOYEE' && s.subTabTextActive]}>Employees</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.subTab, monitorSubTab === 'ADMIN' && s.subTabActive]}
                onPress={() => setMonitorSubTab('ADMIN')}
              >
                <Users size={15} color={monitorSubTab === 'ADMIN' ? '#FFF' : '#475569'} />
                <Text style={[s.subTabText, monitorSubTab === 'ADMIN' && s.subTabTextActive]}>Admins & HR</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats Row */}
          <View style={s.statsRow}>
            {[
              { label: 'Total', value: stats.total, color: '#4F46E5' },
              { label: 'Present', value: stats.present, color: '#10B981' },
              { label: 'Absent', value: stats.absent, color: '#EF4444' },
              { label: 'On Leave', value: stats.onLeave, color: '#F59E0B' },
            ].map(st => (
              <View key={st.label} style={s.statBox}>
                <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          {/* Export Button */}
          <View style={s.exportRow}>
            <Text style={s.monitorDate}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}
            </Text>
            <TouchableOpacity style={s.exportBtn} onPress={exportExcel}>
              <Download size={16} color="#4F46E5" />
              <Text style={s.exportBtnText}>Export Excel</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {loading ? (
            <View style={s.centerBox}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={s.loadingText}>Loading attendance...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredRecords}
              keyExtractor={(item, idx) => (item.id || idx).toString()}
              renderItem={({ item }) => <EmpAttendanceCard record={item} onView={openDetail} />}
              contentContainerStyle={{ padding: 12 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
              ListEmptyComponent={
                <View style={s.emptyBox}>
                  <Users size={48} color="#CBD5E1" />
                  <Text style={s.emptyText}>No attendance records found</Text>
                </View>
              }
            />
          )}
        </View>
      )}

      <WorkDetailModal visible={detailVisible} record={selectedRecord} onClose={() => setDetailVisible(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  tabs: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#4F46E5' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  loadingText: { fontSize: 14, color: '#64748B' },
  emptyBox: { alignItems: 'center', padding: 48, gap: 12 },
  emptyText: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },

  // Self view
  todayCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  todayHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  todayIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  todayTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  todayDate: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },
  todayTimesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  todayTimeBlock: { alignItems: 'center', gap: 6 },
  todayTimeLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  todayTimeValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  workDoneBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F8FAFC',
    borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0'
  },
  workDoneText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
  punchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  punchBtnText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  completedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  completedText: { fontSize: 16, fontWeight: '700', color: '#10B981' },

  // Work modal
  workModal: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24, margin: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
  },
  workModalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  workModalSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 20 },
  workInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    padding: 16, fontSize: 15, color: '#0F172A', minHeight: 120, marginBottom: 20,
  },
  workModalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  confirmBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EF4444', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  // Monitor view
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  exportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  monitorDate: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  exportBtnText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  subTabs: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 8, gap: 8 },
  subTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#E2E8F0' },
  subTabActive: { backgroundColor: '#4F46E5' },
  subTabText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  subTabTextActive: { color: '#FFF' },

  // Employee card in monitor
  empCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  empCardTop: { flexDirection: 'row', alignItems: 'center' },
  empCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  empCardRight: { alignItems: 'flex-end', gap: 8 },
  empAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  empAvatarText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  empName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  empDept: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginBottom: 4 },
  timePills: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  timePillText: { fontSize: 11, fontWeight: '700' },
  notInText: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#EEF2FF', borderRadius: 8 },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  empWorkDoneBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginTop: 12, flexDirection: 'row', gap: 6 },
  empWorkDoneText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 18 },

  // Detail modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 4 },
  detailSection: { alignItems: 'center', marginBottom: 24 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLargeText: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  detailName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  detailRole: { fontSize: 14, color: '#64748B', marginTop: 4 },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timeBox: { flex: 1, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1.5, gap: 6 },
  timeBoxLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  timeBoxTime: { fontSize: 22, fontWeight: '900' },
  timeBoxDate: { fontSize: 11, color: '#94A3B8' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EEF2FF', borderRadius: 14, paddingVertical: 14, marginBottom: 16 },
  locationBtnText: { fontSize: 15, fontWeight: '700', color: '#4F46E5' },
  workSection: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, gap: 10 },
  workHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  workTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  workText: { fontSize: 15, color: '#475569', lineHeight: 24 },
});
