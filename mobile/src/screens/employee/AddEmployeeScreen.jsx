import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert
} from 'react-native';
import { ChevronRight, ChevronLeft, Check, UploadCloud, ShieldCheck, User } from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { HRMSCard } from '../../components/ui/HRMSCard';
import { HRMSButton } from '../../components/ui/HRMSButton';
import { HRMSTextInput } from '../../components/ui/HRMSTextInput';
import { HRMSAvatar } from '../../components/ui/HRMSAvatar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Employment' },
  { id: 3, label: 'Contact' },
  { id: 4, label: 'Salary' },
  { id: 5, label: 'Docs' },
  { id: 6, label: 'Review' },
];

export default function AddEmployeeScreen({ navigation }) {
  const { user } = useAuth();
  
  // Role checks
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGING_DIRECTOR' || user?.role === 'ADMIN';
  const isHrAdmin = user?.role === 'HR_ADMIN' || user?.role === 'HR_MANAGER';
  const hasAccess = isSuperAdmin || isHrAdmin;

  const [activeTab, setActiveTab] = useState('EMPLOYEE');
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    branch: '',
    department: '',
    designation: '',
    joinDate: new Date().toISOString().split('T')[0],
    email: '',
    phone: '',
    salary: '60000',
    address: '',
    photo: ''
  });
  
  const [loading, setLoading] = useState(false);

  if (!hasAccess) {
    return (
      <View style={styles.centerBox}>
        <ShieldCheck size={48} color="#EF4444" style={{marginBottom: 16}} />
        <Text style={styles.errorText}>You do not have permission to add employees.</Text>
        <HRMSButton title="Go Back" onPress={() => navigation.goBack()} style={{marginTop: 16}} />
      </View>
    );
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 1 && (!formData.firstName || !formData.lastName || !formData.email)) {
      Alert.alert('Error', 'Please fill in required fields (Name, Email)');
      return;
    }
    setActiveStep(Math.min(6, activeStep + 1));
  };

  const handlePrev = () => {
    setActiveStep(Math.max(1, activeStep - 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        joinDate: formData.joinDate,
        gender: formData.gender,
        salary: parseFloat(formData.salary) || 0,
        address: formData.address,
        branch: formData.branch,
        department: formData.department,
        designation: activeTab === 'ADMIN' ? 'Admin' : formData.designation,
        role_name: activeTab === 'ADMIN' ? formData.designation : 'Employee',
      };

      await apiClient.post('/employees', payload);
      Alert.alert('Success', 'Employee created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepScroll}>
        {STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepItemWrapper}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                activeStep >= step.id ? styles.stepCircleActive : null
              ]}>
                {activeStep > step.id ? (
                  <Check size={14} color="#fff" />
                ) : (
                  <Text style={[styles.stepCircleText, activeStep >= step.id && styles.stepCircleTextActive]}>
                    {step.id}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, activeStep >= step.id && styles.stepLabelActive]}>
                {step.label}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View style={[styles.stepLine, activeStep > step.id && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderTabSwitcher = () => {
    if (!isSuperAdmin) return null;
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'ADMIN' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ADMIN')}
        >
          <ShieldCheck size={18} color={activeTab === 'ADMIN' ? '#4F46E5' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'ADMIN' && styles.tabTextActive]}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'EMPLOYEE' && styles.tabButtonActive]}
          onPress={() => setActiveTab('EMPLOYEE')}
        >
          <User size={18} color={activeTab === 'EMPLOYEE' ? '#4F46E5' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'EMPLOYEE' && styles.tabTextActive]}>Employee</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFormContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <View>
            <View style={styles.avatarSection}>
              <HRMSAvatar name={`${formData.firstName} ${formData.lastName}`.trim()} size={80} />
              <HRMSButton 
                title="Upload Photo" 
                variant="secondary" 
                size="sm"
                icon={<UploadCloud size={14} color={COLORS.primary} />}
                style={{ marginTop: 12 }}
              />
            </View>
            <HRMSTextInput label="First Name *" value={formData.firstName} onChangeText={t => handleChange('firstName', t)} />
            <HRMSTextInput label="Last Name *" value={formData.lastName} onChangeText={t => handleChange('lastName', t)} />
            <HRMSTextInput label="Email *" value={formData.email} onChangeText={t => handleChange('email', t)} keyboardType="email-address" />
            <HRMSTextInput label="Gender" value={formData.gender} onChangeText={t => handleChange('gender', t)} />
            <HRMSTextInput label="Date of Birth" value={formData.dob} onChangeText={t => handleChange('dob', t)} placeholder="YYYY-MM-DD" />
          </View>
        );
      case 2:
        return (
          <View>
            <HRMSTextInput label="Department" value={formData.department} onChangeText={t => handleChange('department', t)} />
            <HRMSTextInput 
              label={activeTab === 'ADMIN' ? "Admin Role (e.g. HR_ADMIN)" : "Designation"} 
              value={formData.designation} 
              onChangeText={t => handleChange('designation', t)} 
            />
            <HRMSTextInput label="Branch" value={formData.branch} onChangeText={t => handleChange('branch', t)} />
            <HRMSTextInput label="Joining Date" value={formData.joinDate} onChangeText={t => handleChange('joinDate', t)} placeholder="YYYY-MM-DD" />
          </View>
        );
      case 3:
        return (
          <View>
            <HRMSTextInput label="Phone Number" value={formData.phone} onChangeText={t => handleChange('phone', t)} keyboardType="phone-pad" />
            <HRMSTextInput label="Address" value={formData.address} onChangeText={t => handleChange('address', t)} />
          </View>
        );
      case 4:
        return (
          <View>
            <HRMSTextInput label="Monthly Gross Salary (INR)" value={formData.salary} onChangeText={t => handleChange('salary', t)} keyboardType="numeric" />
          </View>
        );
      case 5:
        return (
          <View style={styles.uploadBox}>
            <UploadCloud size={32} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.uploadTitle}>Tap to upload documents</Text>
            <Text style={styles.uploadSubtitle}>PAN, Aadhaar, Contracts (Max 5MB)</Text>
          </View>
        );
      case 6:
        return (
          <View>
            <Text style={styles.reviewTitle}>Review Details</Text>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Type</Text>
              <Text style={styles.reviewValue}>{activeTab}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Name</Text>
              <Text style={styles.reviewValue}>{formData.firstName} {formData.lastName}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Email:</Text>
              <Text style={styles.reviewValue}>{formData.email}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Role:</Text>
              <Text style={styles.reviewValue}>{formData.designation}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Department:</Text>
              <Text style={styles.reviewValue}>{formData.department}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.pageHeader}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.pageTitle}>Add New {activeTab === 'ADMIN' ? 'Admin' : 'Employee'}</Text>
          <Text style={styles.pageSubtitle}>Fill in the details to onboard a new user</Text>
        </View>
      </LinearGradient>

      {isSuperAdmin && (
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'ADMIN' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ADMIN')}
          >
            <ShieldCheck size={18} color={activeTab === 'ADMIN' ? '#4F46E5' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'ADMIN' && styles.tabTextActive]}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'EMPLOYEE' && styles.tabButtonActive]}
            onPress={() => setActiveTab('EMPLOYEE')}
          >
            <User size={18} color={activeTab === 'EMPLOYEE' ? '#4F46E5' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'EMPLOYEE' && styles.tabTextActive]}>Employee</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderStepIndicator()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {renderFormContent()}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <HRMSButton 
          title="Back" 
          variant="secondary" 
          disabled={activeStep === 1 || loading}
          onPress={handlePrev}
          icon={<ChevronLeft size={16} color={activeStep === 1 ? COLORS.textLight : COLORS.text} />}
          style={{ flex: 1, marginRight: 8 }}
        />
        {activeStep < 6 ? (
          <HRMSButton 
            title="Next" 
            onPress={handleNext}
            style={{ flex: 1, marginLeft: 8 }}
          />
        ) : (
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ flex: 1, marginLeft: 8, borderRadius: 10, overflow: 'hidden' }}>
            <LinearGradient colors={['#2563EB', '#1D4ED8']} style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>
                {loading ? 'Submitting...' : 'Submit'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },
  pageHeader: { 
    padding: 24, 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTextContainer: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, gap: 8
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2
  },
  tabText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#4F46E5' },

  stepContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginTop: 8,
  },
  stepScroll: {
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
  },
  stepItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.inactiveBadgeBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepCircleText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  stepCircleTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.inactiveBadgeBg,
    marginHorizontal: 4,
    marginTop: -16,
  },
  stepLineActive: {
    backgroundColor: '#4F46E5',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius,
    padding: 32,
    alignItems: 'center',
    marginVertical: 16,
  },
  uploadTitle: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
  },
  reviewTitle: {
    fontFamily: FONTS.semibold,
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewLabel: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    width: 100,
  },
  reviewValue: {
    fontFamily: FONTS.semibold,
    fontSize: SIZES.sm,
    color: COLORS.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  }
});
