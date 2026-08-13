import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { MapPin, Clock, Camera, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { HRMSCard } from '../../components/ui/HRMSCard';
import apiClient from '../../api/client';

const EMPLOYEE_ID = 1; // Hardcoded for demo

export default function AttendanceScreen() {
  const [status, setStatus] = useState('idle');
  const [punchType, setPunchType] = useState('IN');
  const [recent, setRecent] = useState([]);
  const [workDoneModal, setWorkDoneModal] = useState(false);
  const [workDoneText, setWorkDoneText] = useState('');

  const fetchRecent = async () => {
    try {
      const res = await apiClient.get(`/attendance/recent/${EMPLOYEE_ID}`);
      setRecent(res.data);
    } catch (err) {
      console.log('Error fetching recent attendance', err);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handlePunch = () => {
    if (punchType === 'OUT') {
      setWorkDoneModal(true);
      return;
    }
    submitPunch();
  };

  const submitPunch = (workSummary = '') => {
    setWorkDoneModal(false);
    setStatus("locating");

    setTimeout(async () => {
      const location = { lat: 12.9716, lng: 77.5946 };
      try {
        await apiClient.post("/attendance/punch", {
          employee_id: EMPLOYEE_ID,
          punch_type: punchType,
          latitude: location.lat,
          longitude: location.lng,
          work_done: workSummary
        });
        setStatus("success");
        setWorkDoneText('');
        fetchRecent();
      } catch (err) {
        setStatus("error");
      }
    }, 1500);
  };

  // formatting time
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        
        <HRMSCard style={styles.punchCard}>
          {/* Top Blue Banner */}
          <View style={styles.blueBanner}>
            <Text style={styles.dateText}>{dateString}</Text>
            <Text style={styles.timeText}>{timeString}</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, punchType === 'IN' && styles.toggleBtnActive]}
                onPress={() => setPunchType('IN')}
              >
                <Text style={[styles.toggleText, punchType === 'IN' && styles.toggleTextActive]}>
                  CHECK IN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, punchType === 'OUT' && styles.toggleBtnActive]}
                onPress={() => setPunchType('OUT')}
              >
                <Text style={[styles.toggleText, punchType === 'OUT' && styles.toggleTextActive]}>
                  CHECK OUT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Main Action Area */}
          <View style={styles.actionArea}>
            {status === 'idle' && (
              <View style={styles.centerContent}>
                <View style={styles.mapPinContainer}>
                  <MapPin size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.actionTitle}>You are in Office Range</Text>
                <Text style={styles.actionSubtitle}>Location: Downtown Branch (Radius: 50m)</Text>
                
                <TouchableOpacity style={styles.punchButton} onPress={handlePunch}>
                  <Camera size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.punchButtonText}>Punch {punchType}</Text>
                </TouchableOpacity>
              </View>
            )}

            {status === 'locating' && (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 16 }} />
                <Text style={styles.locatingText}>Verifying GPS Location...</Text>
              </View>
            )}

            {status === 'success' && (
              <View style={styles.centerContent}>
                <View style={styles.successIconContainer}>
                  <CheckCircle size={40} color={COLORS.success} />
                </View>
                <Text style={styles.actionTitle}>Punch Successful!</Text>
                <Text style={styles.actionSubtitle}>Time: {timeString}</Text>
                <Text style={styles.actionCoords}>Lat: 40.7128 • Lng: -74.0060</Text>
                
                <TouchableOpacity onPress={() => setStatus('idle')} style={{ marginTop: 24 }}>
                  <Text style={styles.backText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            )}

            {status === 'error' && (
              <View style={styles.centerContent}>
                <View style={styles.errorIconContainer}>
                  <AlertTriangle size={40} color={COLORS.error} />
                </View>
                <Text style={styles.actionTitle}>Location Error</Text>
                <Text style={styles.actionSubtitle}>You seem to be out of the allowed radius.</Text>
                
                <TouchableOpacity onPress={() => setStatus('idle')} style={styles.tryAgainButton}>
                  <Text style={styles.tryAgainText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </HRMSCard>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <HRMSCard style={styles.recentCard}>
            {recent.map((item, i) => (
              <View key={i} style={[styles.recentItem, i === recent.length - 1 && styles.lastRecentItem]}>
                <View style={styles.recentLeft}>
                  <View style={styles.recentIconBox}>
                    <Clock size={18} color={COLORS.textMuted} />
                  </View>
                  <View>
                    <Text style={styles.recentType}>{item.punch_type || item.punchType}</Text>
                    <Text style={styles.recentTime}>{item.punch_time}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>On Time</Text>
                </View>
              </View>
            ))}
            {recent.length === 0 && (
              <Text style={{ textAlign: 'center', padding: 20, color: COLORS.textMuted }}>No recent punches today</Text>
            )}
          </HRMSCard>
        </View>

        {/* Work Done Modal */}
        <Modal visible={workDoneModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Work Summary</Text>
              <Text style={styles.modalSubtitle}>Briefly describe what you worked on today before checking out.</Text>
              
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="E.g., Completed the frontend dashboard, fixed 3 bugs..."
                value={workDoneText}
                onChangeText={setWorkDoneText}
                textAlignVertical="top"
              />
              
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setWorkDoneModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={() => submitPunch(workDoneText)}>
                  <Text style={styles.submitBtnText}>Submit & Check Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  innerContainer: {
    padding: SIZES.padding,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  punchCard: {
    overflow: 'hidden',
    padding: 0, // Reset padding from HRMSCard to make header full width
  },
  blueBanner: {
    backgroundColor: COLORS.primary,
    padding: 24,
    alignItems: 'center',
  },
  dateText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: '#bfdbfe', // Blue 200
    marginBottom: 4,
  },
  timeText: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    color: '#ffffff',
    letterSpacing: -1,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1d4ed8', // Blue 700
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#bfdbfe',
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  actionArea: {
    padding: 32,
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  mapPinContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.lg,
    color: COLORS.text,
  },
  actionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  actionCoords: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  punchButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#bfdbfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  punchButtonText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: '#ffffff',
  },
  locatingText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.md,
    color: COLORS.textMuted,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  tryAgainButton: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  tryAgainText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  recentSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  recentCard: {
    padding: 0,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRecentItem: {
    borderBottomWidth: 0,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentType: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.text,
  },
  recentTime: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statusBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.success,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 300
  },
  modalTitle: {
    fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 4
  },
  modalSubtitle: {
    fontSize: 14, color: '#64748B', marginBottom: 20
  },
  textArea: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 15, color: '#1E293B', backgroundColor: '#F8FAFC', marginBottom: 24
  },
  modalBtns: {
    flexDirection: 'row', gap: 12
  },
  cancelBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center'
  },
  cancelBtnText: {
    fontWeight: '700', color: '#475569'
  },
  submitBtn: {
    flex: 2, paddingVertical: 16, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center'
  },
  submitBtnText: {
    fontWeight: '700', color: '#FFF'
  }
});
