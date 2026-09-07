import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Linking } from 'react-native';
import { Plus, Edit2, Trash2, Clock, Video, User, Briefcase, MessageSquare, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import ActionModals from '../../components/common/ActionModals';

export default function InterviewScheduleScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ candidates: [], employees: [] });
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalMode, setActionModalMode] = useState('view');
  const [actionSelectedItem, setActionSelectedItem] = useState(null);

  const fetchMeta = async () => {
    try {
      const candRes = await apiClient.get('/candidates');
      const empRes = await apiClient.get('/employees');
      
      const candidates = candRes.data?.data?.candidates || candRes.data || [];
      const employees = empRes.data?.data?.employees || empRes.data || [];
      
      setMeta({ candidates, employees });
    } catch(err) {
      console.warn('Meta fetch error');
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchData();
  }, []);

  const groupByDate = (schedules) => {
    const groups = {};
    schedules.forEach(item => {
      const d = new Date(item.interview_date || item.date || new Date());
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }

      // Format time: "10:00:00" -> "10:00 AM"
      let displayTime = item.interview_time || item.time || '10:00 AM';
      if (displayTime.includes(':')) {
        const [hours, minutes] = displayTime.split(':');
        if (hours && minutes) {
          const hh = parseInt(hours, 10);
          const suffix = hh >= 12 ? 'PM' : 'AM';
          const h12 = hh % 12 || 12;
          displayTime = `${h12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
        }
      }

      groups[dateStr].push({ ...item, displayTime });
    });

    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date]
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/interviews');
      let extractedList = null;
      
      if (res.data) {
        if (res.data.success && res.data.data && res.data.data.schedules) {
          extractedList = res.data.data.schedules;
        } else if (Array.isArray(res.data)) {
          extractedList = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          extractedList = res.data.data;
        }
      }
      
      if (extractedList && extractedList.length > 0) {
        setData(groupByDate(extractedList));
      } else {
        useMockData();
      }
    } catch (error) {
      console.warn('Error fetching schedules, using mock:', error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    const mock = [
      { id: 1, candidate_name: 'John Doe', candidate_job: 'Frontend Developer', interview_round: 'Technical Round 1', interviewer_name: 'Alice Smith', interview_time: '10:00:00', interview_date: new Date().toISOString(), meeting_link: 'https://meet.google.com/xyz', status: 'Scheduled' },
      { id: 2, candidate_name: 'Sarah Connor', candidate_job: 'UX Designer', interview_round: 'Design Portfolio', interviewer_name: 'Bob Jones', interview_time: '14:30:00', interview_date: new Date().toISOString(), meeting_link: 'https://zoom.us/j/123456', status: 'Scheduled' }
    ];
    setData(groupByDate(mock));
  };

  const handleActionDelete = (item) => {
    Alert.alert('Cancel Interview', 'Are you sure you want to cancel this interview?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
             if(item._id || item.id) {
               await apiClient.delete(`/interviews/${item._id || item.id}`);
             }
             fetchData();
          } catch(err) {
             fetchData(); // refresh to show mock or retry
          }
      }}
    ]);
  };

  const handleActionSave = async (updatedItem) => {
    try {
      const payload = {
        candidate_id: updatedItem.candidate_id ? parseInt(updatedItem.candidate_id) : null,
        interviewer_id: updatedItem.interviewer_id ? parseInt(updatedItem.interviewer_id) : null,
        interview_round: updatedItem.interview_round || updatedItem.interviewRound,
        interview_mode: updatedItem.interview_mode || updatedItem.interviewType,
        interview_date: updatedItem.interview_date || updatedItem.interviewDate,
        interview_time: updatedItem.interview_time || updatedItem.interviewTime,
        meeting_link: updatedItem.interview_mode === 'Online' ? (updatedItem.meeting_link || updatedItem.meetingLink) : null,
        location: updatedItem.interview_mode !== 'Online' ? (updatedItem.location || updatedItem.meetingLink) : null,
        status: updatedItem.status || 'Scheduled',
        remarks: updatedItem.remarks
      };

      if(updatedItem._id || updatedItem.id) {
        await apiClient.put(`/interviews/${updatedItem._id || updatedItem.id}`, payload);
      } else {
        await apiClient.post('/interviews', payload);
      }
    } catch(err) {
      console.warn('Save failed');
    }
    setActionModalVisible(false);
    fetchData();
  };

  const SCHEMA = [
    { key: 'candidate_id', label: 'Candidate', type: 'select', options: (meta.candidates || []).map(c => ({ label: c.candidate_name || c.name, value: c.id })) },
    { key: 'interviewer_id', label: 'Interviewer', type: 'select', options: (meta.employees || []).map(e => ({ label: e.name || e.employee_name, value: e.id })) },
    { key: 'interview_round', label: 'Interview Round', type: 'select', options: ['Screening', 'Technical Round 1', 'Technical Round 2', 'HR Round', 'Manager Round', 'Design Portfolio', 'Final Round'] },
    { key: 'interview_mode', label: 'Interview Type', type: 'select', options: ['Online', 'In-Person', 'Telephonic'] },
    { key: 'interview_date', label: 'Interview Date (YYYY-MM-DD)', type: 'text' },
    { key: 'interview_time', label: 'Interview Time (HH:MM)', type: 'text' },
    { key: 'meeting_link', label: 'Meeting Link / Location', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'] },
    { key: 'remarks', label: 'Remarks / Comments', type: 'text', multiline: true }
  ];

  const openLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.timeBadge}>
        <Clock size={14} color="#64748B" />
        <Text style={styles.timeText}>{item.displayTime}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.mainInfo}>
          <Text style={styles.candidateName}>{item.candidate_name || item.title || 'Candidate'}</Text>
          <Text style={styles.jobText}>{item.candidate_job || item.job || 'Role Not Specified'}</Text>
        </View>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Briefcase size={14} color="#64748B" />
            <Text style={styles.detailText}>{item.interview_round || item.round || 'Initial Round'}</Text>
          </View>
          <View style={styles.detailRow}>
            <User size={14} color="#64748B" />
            <Text style={styles.detailText}>{item.interviewer_name || item.interviewer || 'Not Assigned'}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {item.meeting_link || item.meetingLink ? (
            <TouchableOpacity style={styles.joinBtn} onPress={() => openLink(item.meeting_link || item.meetingLink)}>
              <Video size={14} color="#2952E3" />
              <Text style={styles.joinBtnText}>Join Meeting</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noLinkBtn}>
              <MapPin size={14} color="#94A3B8" />
              <Text style={styles.noLinkText}>{item.location || 'In-Person'}</Text>
            </View>
          )}

          <View style={styles.iconActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => { setActionSelectedItem(item); setActionModalMode('edit'); setActionModalVisible(true); }}>
              <Edit2 size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handleActionDelete(item)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Interviews</Text>
            <Text style={styles.headerSubtitle}>View and manage interview schedules</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => { setActionSelectedItem(null); setActionModalMode('create'); setActionModalVisible(true); }}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading && data.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <SectionList
          sections={data}
          keyExtractor={(item, index) => (item.id || item._id || index).toString()}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        />
      )}

      {actionModalVisible && (
        <ActionModals
          visible={actionModalVisible}
          mode={actionModalMode}
          item={actionSelectedItem}
          schema={SCHEMA}
          onClose={() => setActionModalVisible(false)}
          onSave={handleActionSave}
          title={actionModalMode === 'add' ? 'Schedule Interview' : actionModalMode === 'edit' ? 'Edit Schedule' : 'Schedule Details'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGradient: { padding: 20, paddingTop: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2952E3', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  listContent: { padding: 20, paddingBottom: 100 },
  sectionHeader: { marginBottom: 16, marginTop: 10 },
  sectionHeaderText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 6 },
  timeText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  cardBody: { padding: 16 },
  mainInfo: { marginBottom: 12 },
  candidateName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  jobText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  detailsBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, marginBottom: 16, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  joinBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: '#BFDBFE' },
  joinBtnText: { fontSize: 13, fontWeight: '600', color: '#2952E3' },
  noLinkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6 },
  noLinkText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  iconActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 }
});
