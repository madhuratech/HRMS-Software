import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal
} from 'react-native';
import { 
  Edit2, Mail, Phone, MapPin, Camera, Trash2, FileText, Briefcase, IndianRupee, ShieldCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { HRMSCard } from '../../components/ui/HRMSCard';
import { HRMSButton } from '../../components/ui/HRMSButton';
import { HRMSTextInput } from '../../components/ui/HRMSTextInput';
import { HRMSAvatar } from '../../components/ui/HRMSAvatar';
import apiClient from '../../api/client';

const TABS = [
  'Overview', 'Employment', 'Salary', 'Attendance', 'Leave', 
  'Documents', 'Performance'
];

export default function EmployeeProfileScreen({ route, navigation }) {
  // Using route.params.id to get the passed ID, defaulting to 1 for demo
  const empId = route.params?.id || 1;
  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  
  // Editing state (simplified for Phase 1 demo)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, docsRes] = await Promise.all([
        apiClient.get(`/employees/${empId}/profile`),
        apiClient.get(`/employees/${empId}/documents`).catch(() => ({ data: [] }))
      ]);
      
      setProfile(profileRes.data);
      setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [empId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Employee profile not found.</Text>
        <HRMSButton title="Back to Directory" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  let bank = { bankName: '—', accountNumber: '—', ifscCode: '—' };
  try {
    if (profile.bankDetails) {
      bank = JSON.parse(profile.bankDetails);
    }
  } catch (e) {
    bank.accountNumber = profile.bankDetails;
  }

  const rawAcc = bank.accountNumber || "";
  const maskedAcc = rawAcc.length > 4 
    ? rawAcc.slice(-4).padStart(rawAcc.length, "*") 
    : rawAcc;

  const handleEditClick = () => {
    setEditForm({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      salary: profile.salary?.toString() || '0',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await apiClient.put(`/employees/${empId}`, {
        ...profile, // mock payload for demo
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        salary: parseFloat(editForm.salary) || 0
      });
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            <HRMSCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <Text style={styles.value}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : '—'}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Gender</Text>
                  <Text style={styles.value}>{profile.gender || '—'}</Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Employment Type</Text>
                  <Text style={styles.value}>{profile.employmentType || 'Full-time'}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Emergency Contact</Text>
                  <Text style={styles.value}>{profile.emergencyContact || '—'}</Text>
                </View>
              </View>
            </HRMSCard>
            
            <HRMSCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactRow}>
                <Mail size={16} color={COLORS.textMuted} />
                <View style={styles.contactContent}>
                  <Text style={styles.label}>Email Address</Text>
                  <Text style={styles.value}>{profile.email}</Text>
                </View>
              </View>
              <View style={styles.contactRow}>
                <Phone size={16} color={COLORS.textMuted} />
                <View style={styles.contactContent}>
                  <Text style={styles.label}>Phone Number</Text>
                  <Text style={styles.value}>{profile.phone || '—'}</Text>
                </View>
              </View>
              <View style={styles.contactRow}>
                <MapPin size={16} color={COLORS.textMuted} />
                <View style={styles.contactContent}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>{profile.address || '—'}</Text>
                </View>
              </View>
            </HRMSCard>
          </>
        );
      case 'Employment':
        return (
          <HRMSCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Employment Details</Text>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Joining Date</Text>
                <Text style={styles.value}>{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Manager</Text>
                <Text style={[styles.value, { color: COLORS.primary }]}>{profile.managerName || 'None'}</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Department</Text>
                <Text style={styles.value}>{profile.deptName}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Designation</Text>
                <Text style={styles.value}>{profile.roleName}</Text>
              </View>
            </View>
          </HRMSCard>
        );
      case 'Salary':
        return (
          <>
            <HRMSCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Compensation Details</Text>
              <Text style={styles.label}>Monthly Gross CTC</Text>
              <Text style={styles.salaryValue}>INR {profile.salary ? parseFloat(profile.salary).toLocaleString() : '0'}</Text>
            </HRMSCard>
            
            <HRMSCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Bank Information</Text>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Bank Name</Text>
                  <Text style={styles.value}>{bank.bankName}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>IFSC Code</Text>
                  <Text style={styles.value}>{bank.ifscCode}</Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Account Number</Text>
                  <Text style={styles.value}>{maskedAcc}</Text>
                </View>
              </View>
            </HRMSCard>
          </>
        );
      case 'Attendance':
        return (
          <HRMSCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Attendance (Current Month)</Text>
            <View style={styles.gridRow}>
              <View style={[styles.gridItemBox, { backgroundColor: '#ecfdf5' }]}>
                <Text style={styles.label}>Present</Text>
                <Text style={[styles.boxValue, { color: COLORS.success }]}>{profile.attendanceSummary?.present || 0}</Text>
              </View>
              <View style={[styles.gridItemBox, { backgroundColor: '#fef2f2' }]}>
                <Text style={styles.label}>Absent</Text>
                <Text style={[styles.boxValue, { color: COLORS.danger }]}>{profile.attendanceSummary?.absent || 0}</Text>
              </View>
            </View>
          </HRMSCard>
        );
      case 'Leave':
        return (
          <HRMSCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Leave Balances</Text>
            <View style={styles.gridRow}>
              <View style={[styles.gridItemBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={styles.label}>Taken</Text>
                <Text style={[styles.boxValue, { color: COLORS.primary }]}>{profile.leaveSummary?.taken || 0}</Text>
              </View>
              <View style={[styles.gridItemBox, { backgroundColor: '#ecfdf5' }]}>
                <Text style={styles.label}>Remaining</Text>
                <Text style={[styles.boxValue, { color: COLORS.success }]}>{profile.leaveSummary?.remaining || 0}</Text>
              </View>
            </View>
          </HRMSCard>
        );
      default:
        return (
          <HRMSCard style={styles.sectionCard}>
            <Text style={styles.emptyText}>Data not available</Text>
          </HRMSCard>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.pageHeader}>
        <View style={styles.headerTop}>
          <View style={styles.avatarContainer}>
            <HRMSAvatar name={profile.name} photoUrl={profile.profilePhoto} size={90} />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <View style={[styles.badge, { backgroundColor: profile.status === 'Active' ? '#ECFDF5' : '#FEF2F2' }]}>
                <Text style={[styles.badgeText, { color: profile.status === 'Active' ? '#10B981' : '#EF4444' }]}>{profile.status || 'Active'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Briefcase size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.subtext}>{profile.roleName || 'Staff'} • EMP00{profile.id}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Mail size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.subtext}>{profile.email}</Text>
            </View>
            
            <TouchableOpacity style={styles.editButton} onPress={handleEditClick}>
              <Edit2 size={14} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      <View style={styles.contentArea}>
        {renderTabContent()}
      </View>

      <Modal visible={isEditing} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <HRMSCard style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Edit Profile (Quick)</Text>
            <ScrollView>
              <HRMSTextInput 
                label="Full Name" 
                value={editForm.name} 
                onChangeText={t => setEditForm({...editForm, name: t})} 
              />
              <HRMSTextInput 
                label="Email" 
                value={editForm.email} 
                onChangeText={t => setEditForm({...editForm, email: t})} 
              />
              <HRMSTextInput 
                label="Phone" 
                value={editForm.phone} 
                onChangeText={t => setEditForm({...editForm, phone: t})} 
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <HRMSButton title="Cancel" variant="secondary" onPress={() => setIsEditing(false)} style={{ flex: 1, marginRight: 8 }} />
              <HRMSButton title="Save Changes" onPress={handleSave} style={{ flex: 1, marginLeft: 8 }} />
            </View>
          </HRMSCard>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.md,
    color: COLORS.textMuted,
  },
  pageHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4
  },
  headerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#0F172A',
    marginRight: 10,
    letterSpacing: -0.5
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  subtext: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#475569',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 4
  },
  editButtonText: {
    color: '#3B82F6',
    fontSize: 13,
    fontFamily: FONTS.bold
  },
  tabsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  contentArea: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  sectionCard: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.semibold,
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    paddingRight: 8,
  },
  gridItemBox: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  boxValue: {
    fontFamily: FONTS.semibold,
    fontSize: 24,
    marginTop: 8,
  },
  label: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  value: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.text,
  },
  salaryValue: {
    fontFamily: FONTS.semibold,
    fontSize: 20,
    color: COLORS.success,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contactContent: {
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '80%',
    padding: 24,
    marginVertical: 0,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
    paddingBottom: 24,
  }
});
