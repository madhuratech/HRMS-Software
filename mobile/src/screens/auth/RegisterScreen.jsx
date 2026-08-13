import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Image,
  Alert
} from 'react-native';
import { 
  User, 
  Lock, 
  TrendingUp, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  BadgeCheck,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = [
  { id: 'HR_ADMIN', label: 'HR Admin / HR Manager' },
  { id: 'HR_EXECUTIVE', label: 'HR Executive' },
  { id: 'FINANCE_ADMIN', label: 'Finance / Payroll Admin' },
  { id: 'RECRUITMENT_ADMIN', label: 'Recruitment Admin' },
  { id: 'ATTENDANCE_ADMIN', label: 'Attendance Admin' },
  { id: 'IT_ADMIN', label: 'IT / System Admin' },
  { id: 'OTHER', label: 'Other' }
];

export default function RegisterScreen({ navigation }) {
  const { login, registerUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('ADMIN'); // 'ADMIN' or 'EMPLOYEE'
  const [adminType, setAdminType] = useState('ADMIN'); // 'SUPER_ADMIN' or 'ADMIN'
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
    role: 'HR_ADMIN',
    customRole: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [generatedEmpId, setGeneratedEmpId] = useState(null);
  const [registeredAdmin, setRegisteredAdmin] = useState(null);

  const handleNextStep = () => {
    // Basic validation
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.email) {
        Alert.alert('Validation Error', 'Please fill in all details.');
        return;
      }
      if (userType === 'EMPLOYEE' && !formData.employeeId) {
        Alert.alert('Validation Error', 'Please enter your Employee ID.');
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else navigation.navigate('Login');
  };

  const handleSubmit = async () => {
    if (!formData.password) {
      Alert.alert('Validation Error', 'Please enter a password.');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    
    try {
      if (userType === 'ADMIN') {
        const newId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
        const assignedRole = adminType === 'SUPER_ADMIN' 
          ? 'SUPER_ADMIN' 
          : (formData.role === 'OTHER' ? formData.customRole.trim().toUpperCase().replace(/ /g, '_') : formData.role);
        
        const newAdminUser = {
          type: 'ADMIN',
          role: assignedRole || 'HR_MANAGER',
          email: formData.email.trim(),
          employeeId: newId,
          password: formData.password,
          name: formData.name.trim(),
          phone: formData.phone.trim()
        };

        await registerUser(newAdminUser);
        setRegisteredAdmin({ email: formData.email.trim(), password: formData.password });
        setGeneratedEmpId(newId);
      } else {
        const newEmployeeUser = {
          type: 'EMPLOYEE',
          role: 'EMPLOYEE',
          email: formData.email.trim(),
          employeeId: formData.employeeId.trim(),
          password: formData.password,
          name: formData.name.trim(),
          phone: formData.phone.trim()
        };

        await registerUser(newEmployeeUser);
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => login({ email: formData.email.trim(), password: formData.password }) }
        ]);
      }
    } catch (e) {
      Alert.alert('Registration Error', e.message || 'Failed to create account.');
    }
  };

  const handleCloseModalAndLogin = () => {
    if (registeredAdmin) {
      login(registeredAdmin);
    }
  };


  const renderStep1 = () => (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>I am registering as an</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, userType === 'ADMIN' && styles.tabButtonActive]}
            onPress={() => setUserType('ADMIN')}
          >
            <ShieldCheck size={18} color={userType === 'ADMIN' ? '#1A2B4C' : COLORS.textMuted} />
            <Text style={[styles.tabText, userType === 'ADMIN' && styles.tabTextActive]}>Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, userType === 'EMPLOYEE' && styles.tabButtonActive]}
            onPress={() => setUserType('EMPLOYEE')}
          >
            <User size={18} color={userType === 'EMPLOYEE' ? '#1A2B4C' : COLORS.textMuted} />
            <Text style={[styles.tabText, userType === 'EMPLOYEE' && styles.tabTextActive]}>Employee</Text>
          </TouchableOpacity>
        </View>
      </View>

      {userType === 'ADMIN' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Admin Level</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, adminType === 'SUPER_ADMIN' && styles.tabButtonActive]}
              onPress={() => setAdminType('SUPER_ADMIN')}
            >
              <ShieldCheck size={18} color={adminType === 'SUPER_ADMIN' ? '#1A2B4C' : COLORS.textMuted} />
              <Text style={[styles.tabText, adminType === 'SUPER_ADMIN' && styles.tabTextActive]}>Super Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, adminType === 'ADMIN' && styles.tabButtonActive]}
              onPress={() => setAdminType('ADMIN')}
            >
              <User size={18} color={adminType === 'ADMIN' ? '#1A2B4C' : COLORS.textMuted} />
              <Text style={[styles.tabText, adminType === 'ADMIN' && styles.tabTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <User style={styles.inputIcon} size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.inputText}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="John Doe"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <Phone style={styles.inputIcon} size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.inputText}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            placeholder="+1 234 567 8900"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <Mail style={styles.inputIcon} size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.inputText}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="name@company.com"
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      {userType === 'EMPLOYEE' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Employee ID</Text>
          <View style={styles.inputContainer}>
            <BadgeCheck style={styles.inputIcon} size={18} color={COLORS.textLight} />
            <TextInput
              style={styles.inputText}
              value={formData.employeeId}
              onChangeText={(text) => setFormData({...formData, employeeId: text})}
              placeholder="EMP-1042"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="characters"
            />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}>
        <Text style={styles.primaryButtonText}>Continue to Step 2</Text>
        <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={16} color="#1A2B4C" />
        <Text style={styles.backButtonText}>Back to Step 1</Text>
      </TouchableOpacity>

      {userType === 'ADMIN' && adminType === 'ADMIN' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Admin Role</Text>
          <View style={styles.roleGrid}>
            {ADMIN_ROLES.map(role => (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleButton, formData.role === role.id && styles.roleButtonActive]}
                onPress={() => setFormData({...formData, role: role.id})}
              >
                <Briefcase size={16} color={formData.role === role.id ? '#1A2B4C' : COLORS.textMuted} />
                <Text style={[styles.roleButtonText, formData.role === role.id && styles.roleButtonTextActive]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {userType === 'ADMIN' && adminType === 'ADMIN' && formData.role === 'OTHER' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Custom Role Title</Text>
          <View style={styles.inputContainer}>
            <Briefcase style={styles.inputIcon} size={18} color={COLORS.textLight} />
            <TextInput
              style={styles.inputText}
              value={formData.customRole}
              onChangeText={(text) => setFormData({...formData, customRole: text})}
              placeholder="e.g. Operations Manager"
              placeholderTextColor={COLORS.textLight}
            />
          </View>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Create Password</Text>
        <View style={styles.inputContainer}>
          <Lock style={styles.inputIcon} size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.inputText}
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            placeholder="Min. 8 characters"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 12 }}>
            {showPassword ? <EyeOff size={18} color={COLORS.textLight} /> : <Eye size={18} color={COLORS.textLight} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputContainer}>
          <Lock style={styles.inputIcon} size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.inputText}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            placeholder="Re-enter password"
            placeholderTextColor={COLORS.textLight}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 12 }}>
            {showConfirmPassword ? <EyeOff size={18} color={COLORS.textLight} /> : <Eye size={18} color={COLORS.textLight} />}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>Create Account</Text>
        <CheckCircle2 size={18} color="#ffffff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Top Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Image 
                  source={require('../../../assets/logo.png')} 
                  style={{ width: '100%', height: '100%', borderRadius: 12 }} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={styles.logoText}>MADHURA HRMS</Text>
            </View>
            <Text style={styles.heroTitle}>Join the Platform</Text>
            <Text style={styles.heroSubtitle}>
              Create your account to start managing your team, tracking sales, and streamlining operations.
            </Text>
          </View>
        </View>

        {/* Bottom Form Section */}
        <View style={styles.formSection}>
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>Step {step} of 2</Text>
            <Text style={styles.welcomeSubtitle}>
              {step === 1 ? 'Enter your details to register.' : 'Complete your profile setup.'}
            </Text>
          </View>

          {step === 1 ? renderStep1() : renderStep2()}

          {step === 1 && (
            <View style={styles.registerPrompt}>
              <Text style={styles.registerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <Text style={styles.footerText}>© 2026 MADHURA HRMS. All rights reserved.</Text>
        </View>

      </ScrollView>

      {/* Admin Employee ID Generation Modal */}
      <Modal visible={!!generatedEmpId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <BadgeCheck size={32} color="#16A34A" />
            </View>
            <Text style={styles.modalTitle}>Account Created!</Text>
            <Text style={styles.modalDesc}>
              Your admin account has been successfully created. Here is your auto-generated Employee ID, which you can use for internal systems:
            </Text>
            
            <View style={styles.empIdBox}>
              <Text style={styles.empIdText}>{generatedEmpId}</Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleCloseModalAndLogin}>
              <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6E8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#FAF6E8',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#1A2B4C',
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#1A2B4C',
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#5C6B83',
    lineHeight: 20,
    marginBottom: 10,
  },
  formSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: -40,
    shadowColor: '#1A2B4C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(26, 43, 76, 0.05)',
  },
  welcomeBox: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#1A2B4C',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: '#5C6B83',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1A2B4C',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: '#1A2B4C',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.text,
    height: '100%',
  },
  primaryButton: {
    backgroundColor: '#1A2B4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: '#1A2B4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: '#ffffff',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  registerText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
  registerLink: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.sm,
    color: '#1A2B4C',
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontFamily: FONTS.medium,
    color: '#1A2B4C',
    marginLeft: 4,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  roleButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  roleButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 8,
    flex: 1,
  },
  roleButtonTextActive: {
    color: '#1d4ed8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  empIdBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
  },
  empIdText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  }
});
