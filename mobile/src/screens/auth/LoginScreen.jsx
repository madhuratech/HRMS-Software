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
  Image,
  Alert
} from 'react-native';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  TrendingUp, 
  Wrench,
  Mail,
  BadgeCheck,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, getRegisteredUsers } = useAuth();

  const [activeTab, setActiveTab] = useState('SUPER_ADMIN'); // 'SUPER_ADMIN', 'ADMIN' or 'EMPLOYEE'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState(''); // Only used for EMPLOYEE tab
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }
    if (activeTab === 'EMPLOYEE' && !employeeId) {
      Alert.alert('Validation Error', 'Please enter your Employee ID.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      Alert.alert('Authentication Failed', e.message || 'Invalid email or password.');
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setEmployeeId('');
    setShowPassword(false);
  };

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
            <Text style={styles.heroTitle}>Enterprise Management Solution</Text>
            <Text style={styles.heroSubtitle}>
              Unified platform for HR, Sales, and Service management across all your branches.
            </Text>
          </View>
        </View>

        {/* Bottom Form Section */}
        <View style={styles.formSection}>
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Please sign in to continue.</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'SUPER_ADMIN' && styles.tabButtonActive]}
              onPress={() => handleTabSwitch('SUPER_ADMIN')}
            >
              <Wrench size={18} color={activeTab === 'SUPER_ADMIN' ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.tabText, activeTab === 'SUPER_ADMIN' && styles.tabTextActive]}>Super Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'ADMIN' && styles.tabButtonActive]}
              onPress={() => handleTabSwitch('ADMIN')}
            >
              <ShieldCheck size={18} color={activeTab === 'ADMIN' ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.tabText, activeTab === 'ADMIN' && styles.tabTextActive]}>Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'EMPLOYEE' && styles.tabButtonActive]}
              onPress={() => handleTabSwitch('EMPLOYEE')}
            >
              <User size={18} color={activeTab === 'EMPLOYEE' ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.tabText, activeTab === 'EMPLOYEE' && styles.tabTextActive]}>Employee</Text>
            </TouchableOpacity>
          </View>

          {/* Mail Input (Common) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail style={styles.inputIcon} size={18} color={COLORS.textLight} />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={email}
                   onChangeText={setEmail}
                   placeholder="name@company.com"
                   placeholderTextColor={COLORS.textLight}
                   autoCapitalize="none"
                   keyboardType="email-address"
                 />
              </View>
            </View>
          </View>

          {/* Employee ID Input (Only for Employee) */}
          {activeTab === 'EMPLOYEE' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Employee ID</Text>
              <View style={styles.inputContainer}>
                <BadgeCheck style={styles.inputIcon} size={18} color={COLORS.textLight} />
                <View style={styles.inputWrapper}>
                   <TextInput
                     style={styles.inputText}
                     value={employeeId}
                     onChangeText={setEmployeeId}
                     placeholder="e.g. EMP-1042"
                     placeholderTextColor={COLORS.textLight}
                     autoCapitalize="characters"
                   />
                </View>
              </View>
            </View>
          )}

          {/* Password Input (Common) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={18} color={COLORS.textLight} />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={password}
                   onChangeText={setPassword}
                   placeholder="Password"
                   placeholderTextColor={COLORS.textLight}
                   secureTextEntry={!showPassword}
                 />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 12 }}>
                {showPassword ? <EyeOff size={18} color={COLORS.textLight} /> : <Eye size={18} color={COLORS.textLight} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In to Dashboard</Text>
            <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>© 2026 MADHURA HRMS. All rights reserved.</Text>
        </View>
      </ScrollView>
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
    marginBottom: 24,
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
  inputWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  inputText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  loginButton: {
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
  loginButtonText: {
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
  }
});
