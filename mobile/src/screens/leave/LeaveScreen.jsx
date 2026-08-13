import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Dimensions
} from 'react-native';
import { Plus, Users, UserMinus, Calendar, Clock, X, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { HRMSCard } from '../../components/ui/HRMSCard';
import { HRMSButton } from '../../components/ui/HRMSButton';
import { HRMSTextInput } from '../../components/ui/HRMSTextInput';

const { width } = Dimensions.get('window');

import apiClient from '../../api/client';

export default function LeaveScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [applicationsData, setApplicationsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get('/leaves/applications');
      // the backend returns a list of leaves
      setApplicationsData(res.data);
    } catch (err) {
      console.log('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return { bg: '#ecfdf5', text: '#10b981' };
      case 'Pending': return { bg: '#fffbeb', text: '#f59e0b' };
      case 'Rejected': return { bg: '#fef2f2', text: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const handleApply = async () => {
    try {
      await apiClient.post('/leaves/applications', {
        employee_id: 1, // hardcoded for demo
        leave_type: leaveForm.type,
        start_date: leaveForm.startDate,
        end_date: leaveForm.endDate,
        reason: leaveForm.reason
      });
      fetchApplications();
    } catch (err) {
      console.log('Error submitting leave:', err);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header & Apply Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Leave Management</Text>
            <Text style={styles.headerSubtitle}>Manage and track leave requests</Text>
          </View>
          <TouchableOpacity style={styles.applyBtn} onPress={() => setModalVisible(true)}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiContainer}>
          <HRMSCard style={[styles.kpiCard, { borderColor: '#E5E7EB' }]}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
              <UserMinus size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiLabel}>On Leave Today</Text>
            <Text style={styles.kpiValue}>18</Text>
          </HRMSCard>
          
          <HRMSCard style={[styles.kpiCard, { borderColor: '#FCD34D' }]}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Clock size={20} color="#F59E0B" />
            </View>
            <Text style={styles.kpiLabel}>Pending Approval</Text>
            <Text style={styles.kpiValue}>12</Text>
          </HRMSCard>

          <HRMSCard style={[styles.kpiCard, { borderColor: '#E5E7EB' }]}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Calendar size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiLabel}>Leaves Taken</Text>
            <Text style={styles.kpiValue}>56</Text>
          </HRMSCard>
        </ScrollView>

        {/* Recent Applications List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          
          {applicationsData.map((app, index) => {
            const statusColor = getStatusColor(app.status);
            return (
              <HRMSCard key={index} style={styles.listItemCard}>
                <View style={styles.listItemHeader}>
                  <View style={styles.userInfo}>
                    <Image 
                      source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=f1f5f9&color=64748b` }} 
                      style={styles.avatar} 
                    />
                    <View>
                      <Text style={styles.userName}>{app.employee_name || app.name || `EMP ${app.employee_id}`}</Text>
                      <Text style={styles.userId}>{app.employee_id || app.id}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>{app.status}</Text>
                  </View>
                </View>
                
                <View style={styles.listDetailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>{app.leave_type || app.type}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {new Date(app.start_date || app.from).toLocaleDateString()} - {new Date(app.end_date || app.to).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Days</Text>
                    <Text style={styles.detailValue}>{app.total_days || app.days}</Text>
                  </View>
                </View>
              </HRMSCard>
            );
          })}
        </View>

      </ScrollView>

      {/* Apply Leave Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Apply Leave</Text>
              <Text style={styles.modalSubtitle}>Submit a new leave request</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalForm}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Leave Type <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.selectBox}>
                <Text style={styles.selectBoxText}>{leaveForm.type}</Text>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Start Date <Text style={styles.required}>*</Text></Text>
                <HRMSTextInput 
                  placeholder="YYYY-MM-DD" 
                  value={leaveForm.startDate}
                  onChangeText={(text) => setLeaveForm({...leaveForm, startDate: text})}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>End Date <Text style={styles.required}>*</Text></Text>
                <HRMSTextInput 
                  placeholder="YYYY-MM-DD" 
                  value={leaveForm.endDate}
                  onChangeText={(text) => setLeaveForm({...leaveForm, endDate: text})}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Reason <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Enter reason for leave"
                value={leaveForm.reason}
                onChangeText={(text) => setLeaveForm({...leaveForm, reason: text})}
                textAlignVertical="top"
              />
            </View>

            <HRMSButton title="Submit Application" onPress={handleApply} style={{ marginTop: 24 }} />
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    paddingTop: 24,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  applyBtnText: {
    fontFamily: FONTS.semibold,
    fontSize: SIZES.sm,
    color: '#ffffff',
  },
  kpiContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    gap: 12,
  },
  kpiCard: {
    width: width * 0.4,
    marginRight: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  kpiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  kpiLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  kpiValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  listSection: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: 16,
  },
  listItemCard: {
    marginBottom: 12,
    padding: 16,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.sm,
    color: COLORS.text,
  },
  userId: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  listDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  modalSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  modalForm: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: FONTS.semibold,
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  row: {
    flexDirection: 'row',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
  selectBoxText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 16,
    backgroundColor: COLORS.background,
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.text,
    height: 120,
  }
});
