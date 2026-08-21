import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, ScrollView, RefreshControl
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  Plus, X, CheckCircle, XCircle, Clock, CalendarDays,
  ChevronDown, FileText, User, AlertTriangle
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

// ─── Helpers ────────────────────────────────────────────────────────────────
function getRoleKey(user) {
  const r = (user?.role || user?.role_name || '').toUpperCase().replace(/\s+/g, '_');
  if (r.includes('SUPER')) return 'SUPER_ADMIN';
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'HR') return 'HR';
  return 'EMPLOYEE';
}

function toDateStr(date) {
  // Returns YYYY-MM-DD
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0];
  return date.toISOString().split('T')[0];
}

function diffDays(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start), e = new Date(end);
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG = {
  Pending:  { color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
  Approved: { color: '#10B981', bg: '#D1FAE5', icon: CheckCircle },
  Rejected: { color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
};

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Comp Off', 'Loss of Pay'];

// ─── Calendar Picker Modal ───────────────────────────────────────────────────
function DateRangePicker({ visible, onClose, onSelect, initialStart, initialEnd }) {
  const [selecting, setSelecting] = useState('start'); // 'start' | 'end'
  const [start, setStart] = useState(initialStart || '');
  const [end, setEnd] = useState(initialEnd || '');

  const reset = () => { setStart(''); setEnd(''); setSelecting('start'); };

  const handleDay = (day) => {
    const d = day.dateString;
    if (selecting === 'start') {
      setStart(d);
      setEnd('');
      setSelecting('end');
    } else {
      if (d < start) {
        setStart(d);
        setEnd('');
        setSelecting('end');
      } else {
        setEnd(d);
      }
    }
  };

  // Build marked dates
  const markedDates = {};
  if (start && end) {
    let cur = new Date(start);
    const last = new Date(end);
    while (cur <= last) {
      const k = toDateStr(cur);
      markedDates[k] = {
        color: '#4F46E5', textColor: '#FFF',
        startingDay: k === start, endingDay: k === end,
      };
      cur.setDate(cur.getDate() + 1);
    }
  } else if (start) {
    markedDates[start] = { selected: true, selectedColor: '#4F46E5', selectedTextColor: '#FFF' };
  }

  const confirm = () => {
    if (!start) { Alert.alert('Select Dates', 'Please select a start date.'); return; }
    onSelect(start, end || start);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.calModalOverlay}>
        <View style={s.calModal}>
          <View style={s.calHeader}>
            <Text style={s.calTitle}>Select Leave Dates</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color="#64748B" /></TouchableOpacity>
          </View>

          <View style={s.calHintRow}>
            <View style={[s.calHintDot, { backgroundColor: selecting === 'start' ? '#4F46E5' : '#CBD5E1' }]} />
            <Text style={s.calHintText}>
              {selecting === 'start' ? 'Tap to select start date' : `Start: ${formatDate(start)} — tap to select end date`}
            </Text>
          </View>

          <Calendar
            onDayPress={handleDay}
            markedDates={markedDates}
            markingType={start && end ? 'period' : 'simple'}
            minDate={toDateStr(new Date())}
            theme={{
              selectedDayBackgroundColor: '#4F46E5',
              todayTextColor: '#4F46E5',
              arrowColor: '#4F46E5',
              textSectionTitleColor: '#64748B',
              dayTextColor: '#0F172A',
              monthTextColor: '#0F172A',
              textDayFontWeight: '600',
              textMonthFontWeight: '800',
            }}
          />

          {start && end && (
            <View style={s.calSummary}>
              <CalendarDays size={16} color="#4F46E5" />
              <Text style={s.calSummaryText}>
                {formatDate(start)} → {formatDate(end)} ({diffDays(start, end)} day{diffDays(start, end) > 1 ? 's' : ''})
              </Text>
            </View>
          )}

          <View style={s.calBtns}>
            <TouchableOpacity style={s.calCancelBtn} onPress={() => { reset(); onClose(); }}>
              <Text style={s.calCancelText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.calConfirmBtn} onPress={confirm}>
              <Text style={s.calConfirmText}>Confirm Dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Apply Leave Modal ───────────────────────────────────────────────────────
function ApplyLeaveModal({ visible, onClose, onSubmit }) {
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [calVisible, setCalVisible] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const days = diffDays(startDate, endDate);

  const handleSubmit = async () => {
    if (!startDate || !reason.trim()) {
      Alert.alert('Incomplete', 'Please select dates and provide a reason.'); return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ leaveType, startDate, endDate: endDate || startDate, reason, totalDays: days });
      setStartDate(''); setEndDate(''); setReason(''); setLeaveType(LEAVE_TYPES[0]);
      onClose();
    } catch { /* error handled in parent */ }
    finally { setSubmitting(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.applyModal}>
          <View style={s.applyHeader}>
            <Text style={s.applyTitle}>Apply for Leave</Text>
            <TouchableOpacity onPress={onClose} style={s.applyClose}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Leave Type Dropdown */}
            <Text style={s.fieldLabel}>Leave Type *</Text>
            <TouchableOpacity style={s.dropdown} onPress={() => setTypeOpen(!typeOpen)}>
              <Text style={s.dropdownText}>{leaveType}</Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>
            {typeOpen && (
              <View style={s.dropdownList}>
                {LEAVE_TYPES.map(t => (
                  <TouchableOpacity key={t} style={s.dropdownItem} onPress={() => { setLeaveType(t); setTypeOpen(false); }}>
                    <Text style={[s.dropdownItemText, t === leaveType && { color: '#4F46E5', fontWeight: '700' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date Selection */}
            <Text style={s.fieldLabel}>Select Dates *</Text>
            <TouchableOpacity style={s.datePickerBtn} onPress={() => setCalVisible(true)}>
              <CalendarDays size={18} color="#4F46E5" />
              {startDate ? (
                <Text style={s.datePickerText}>
                  {formatDate(startDate)}{endDate && endDate !== startDate ? ` → ${formatDate(endDate)}` : ''} {days > 0 ? `(${days} day${days > 1 ? 's' : ''})` : ''}
                </Text>
              ) : (
                <Text style={s.datePickerPlaceholder}>Tap to choose dates from calendar</Text>
              )}
            </TouchableOpacity>

            {/* Reason */}
            <Text style={s.fieldLabel}>Reason *</Text>
            <TextInput
              style={s.reasonInput}
              multiline
              numberOfLines={4}
              placeholder="Briefly describe the reason for your leave..."
              placeholderTextColor="#94A3B8"
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />

            {/* Summary */}
            {startDate && (
              <View style={s.applySummary}>
                <Text style={s.applySummaryText}>
                  📋 {leaveType} • {formatDate(startDate)} {endDate && endDate !== startDate ? `to ${formatDate(endDate)}` : ''} • {days} day{days > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.submitBtn, (!startDate || !reason.trim()) && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!startDate || !reason.trim() || submitting}
            >
              {submitting
                ? <ActivityIndicator color="#FFF" />
                : <Text style={s.submitBtnText}>Submit Leave Request</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <DateRangePicker
        visible={calVisible}
        onClose={() => setCalVisible(false)}
        onSelect={(s, e) => { setStartDate(s); setEndDate(e); }}
        initialStart={startDate}
        initialEnd={endDate}
      />
    </Modal>
  );
}

// ─── Leave Application Card ───────────────────────────────────────────────────
function LeaveCard({ item, canApprove, onApprove, onReject, currentUserRole }) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
  const StatusIcon = cfg.icon;

  return (
    <View style={s.leaveCard}>
      <View style={s.leaveCardHeader}>
        <View style={s.leaveCardLeft}>
          <View style={s.leaveAvatar}>
            <Text style={s.leaveAvatarText}>
              {(item.employee_name || item.name || 'E').substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={s.leaveName}>{item.employee_name || item.name || 'Employee'}</Text>
            <Text style={s.leaveType}>{item.leave_type || item.type || 'Leave'}</Text>
          </View>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <StatusIcon size={13} color={cfg.color} />
          <Text style={[s.statusBadgeText, { color: cfg.color }]}>{item.status || 'Pending'}</Text>
        </View>
      </View>

      <View style={s.leaveDatesRow}>
        <CalendarDays size={14} color="#64748B" />
        <Text style={s.leaveDates}>
          {formatDate(item.start_date || item.startDate)} → {formatDate(item.end_date || item.endDate)}
        </Text>
        <View style={s.daysBadge}>
          <Text style={s.daysBadgeText}>{item.total_days || item.totalDays || 1} day{(item.total_days || 1) > 1 ? 's' : ''}</Text>
        </View>
      </View>

      {item.reason && (
        <View style={s.leaveReasonBox}>
          <FileText size={13} color="#94A3B8" />
          <Text style={s.leaveReason} numberOfLines={2}>{item.reason}</Text>
        </View>
      )}

      {/* Approval buttons */}
      {canApprove && item.status === 'Pending' && (
        <View style={s.approvalBtns}>
          <TouchableOpacity style={s.rejectBtn} onPress={() => onReject(item.id)}>
            <XCircle size={16} color="#EF4444" />
            <Text style={s.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.approveBtn} onPress={() => onApprove(item.id)}>
            <CheckCircle size={16} color="#FFF" />
            <Text style={s.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function LeaveScreen() {
  const { user } = useAuth();
  const roleKey = getRoleKey(user);
  const isSuperAdmin = roleKey === 'SUPER_ADMIN';
  const isHR = roleKey === 'HR';
  const isAdmin = roleKey === 'ADMIN';
  const isEmployee = roleKey === 'EMPLOYEE';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine' | 'pending'

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leaves/applications');
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, []);

  const handleApply = async ({ leaveType, startDate, endDate, reason, totalDays }) => {
    try {
      await apiClient.post('/leaves/applications', {
        employeeId: user?.employee_id || user?.id || 1,
        leaveTypeId: 1, // Will be resolved on backend
        leave_type: leaveType,
        startDate, endDate, totalDays, reason,
        applicant_role: roleKey,
      });
      Alert.alert('Success', 'Leave request submitted successfully!');
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit leave request.');
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient.put(`/leaves/applications/${id}/status`, {
        status,
        approvedBy: user?.employee_id || user?.id,
      });
      Alert.alert('Done', `Leave ${status.toLowerCase()} successfully.`);
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  // Who can approve what:
  // - HR/Admin can approve EMPLOYEE leaves
  // - Super Admin can approve ADMIN/HR leaves
  // - Employees can only view and apply
  const canApprove = (item) => {
    const applicantRole = (item.applicant_role || item.employee_role || '').toUpperCase();
    const isAdminLeave = applicantRole.includes('ADMIN') || applicantRole === 'HR';
    if (isSuperAdmin) return true; // Super Admin approves all
    if (isHR || isAdmin) return !isAdminLeave; // HR/Admin approve employees only
    return false;
  };

  // Filter logic
  const myId = user?.employee_id || user?.id;
  const filteredLeaves = leaves.filter(item => {
    if (activeTab === 'mine') return item.employee_id === myId;
    if (activeTab === 'pending') return item.status === 'Pending';
    return true;
  });

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  return (
    <View style={s.container}>
      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: '#4F46E5' },
          { label: 'Pending', value: stats.pending, color: '#F59E0B' },
          { label: 'Approved', value: stats.approved, color: '#10B981' },
          { label: 'Rejected', value: stats.rejected, color: '#EF4444' },
        ].map(st => (
          <View key={st.label} style={s.statBox}>
            <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {[
          { key: 'all', label: 'All Leaves' },
          { key: 'pending', label: 'Pending' },
          { key: 'mine', label: 'My Leaves' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Apply Button */}
      <View style={s.applyRow}>
        <Text style={s.applyRowLabel}>
          {isEmployee ? 'Your leave requests' : isSuperAdmin ? 'All staff leave requests' : 'Team leave requests'}
        </Text>
        <TouchableOpacity style={s.applyBtn} onPress={() => setApplyVisible(true)}>
          <Plus size={18} color="#FFF" />
          <Text style={s.applyBtnText}>Apply Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Role notice for pending approval */}
      {stats.pending > 0 && (isHR || isAdmin || isSuperAdmin) && (
        <View style={s.approvalNotice}>
          <AlertTriangle size={16} color="#F59E0B" />
          <Text style={s.approvalNoticeText}>
            {isSuperAdmin
              ? `${stats.pending} pending request(s) awaiting your approval`
              : `${stats.pending} employee leave(s) awaiting HR/Admin approval`}
          </Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={s.loadingText}>Loading leave requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLeaves}
          keyExtractor={(item, idx) => (item.id || idx).toString()}
          renderItem={({ item }) => (
            <LeaveCard
              item={item}
              canApprove={canApprove(item)}
              onApprove={(id) => updateStatus(id, 'Approved')}
              onReject={(id) => updateStatus(id, 'Rejected')}
              currentUserRole={roleKey}
            />
          )}
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaves(); }} colors={['#4F46E5']} />}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <CalendarDays size={52} color="#CBD5E1" />
              <Text style={s.emptyTitle}>No Leave Records</Text>
              <Text style={s.emptyText}>
                {activeTab === 'pending' ? 'No pending requests.' : 'No leave applications found.'}
              </Text>
            </View>
          }
        />
      )}

      <ApplyLeaveModal visible={applyVisible} onClose={() => setApplyVisible(false)} onSubmit={handleApply} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 2 },

  tabs: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#4F46E5' },

  applyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  applyRowLabel: { fontSize: 13, color: '#64748B', fontWeight: '500', flex: 1 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4F46E5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  approvalNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF3C7', marginHorizontal: 12, marginBottom: 4,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#FDE68A',
  },
  approvalNoticeText: { fontSize: 13, fontWeight: '600', color: '#92400E', flex: 1 },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B' },
  emptyBox: { alignItems: 'center', padding: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },

  // Leave card
  leaveCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  leaveCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  leaveCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  leaveAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  leaveAvatarText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  leaveName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  leaveType: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  leaveDatesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  leaveDates: { fontSize: 13, color: '#475569', fontWeight: '600', flex: 1 },
  daysBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  daysBadgeText: { fontSize: 11, color: '#4F46E5', fontWeight: '700' },
  leaveReasonBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 10 },
  leaveReason: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 18 },
  approvalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: '#FCA5A5' },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, backgroundColor: '#10B981' },
  approveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Apply modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  applyModal: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%' },
  applyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  applyTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  applyClose: { padding: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 16 },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { fontSize: 15, color: '#0F172A', fontWeight: '600' },
  dropdownList: {
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    marginTop: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 15, color: '#475569', fontWeight: '500' },
  datePickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
  },
  datePickerText: { fontSize: 15, color: '#0F172A', fontWeight: '600', flex: 1 },
  datePickerPlaceholder: { fontSize: 15, color: '#94A3B8', flex: 1 },
  reasonInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, padding: 16, fontSize: 15, color: '#0F172A', minHeight: 110, marginTop: 0,
  },
  applySummary: {
    backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginTop: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  applySummaryText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#4F46E5', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 20, marginBottom: 8,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  submitBtnText: { fontSize: 17, fontWeight: '800', color: '#FFF' },

  // Calendar modal
  calModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  calModal: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  calHintRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  calHintDot: { width: 10, height: 10, borderRadius: 5 },
  calHintText: { fontSize: 13, color: '#64748B', fontWeight: '500', flex: 1 },
  calSummary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', borderRadius: 12, padding: 12, marginTop: 12 },
  calSummaryText: { fontSize: 14, color: '#4F46E5', fontWeight: '700' },
  calBtns: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
  calCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  calCancelText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  calConfirmBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: '#4F46E5', alignItems: 'center' },
  calConfirmText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
