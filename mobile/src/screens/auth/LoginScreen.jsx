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
import { User, Lock, ArrowRight, ShieldCheck, Briefcase, TrendingUp, Wrench, Mail, BadgeCheck, Eye, EyeOff } from 'lucide-react-native';
import { COLORS, SIZES, FONTS } from '../../components/ui/theme';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, getRegisteredUsers } = useAuth();

  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      Alert.alert('Authentication Failed', e.message || 'Invalid email or password.');
    }
  };

  const setPreset = (role, emailVal) => {
    setSelectedRole(role);
    setEmail(emailVal);
    setPassword('password123');
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleGrid}>
              <View style={styles.roleRow}>
                <TouchableOpacity 
                  style={[styles.roleButton, selectedRole === 'SUPER_ADMIN' && styles.roleButtonActive]}
                  onPress={() => setPreset('SUPER_ADMIN', 'admin@hawkeye.com')}
                >
                  <ShieldCheck size={16} color={selectedRole === 'SUPER_ADMIN' ? '#1d4ed8' : COLORS.textMuted} />
                  <Text style={[styles.roleText, selectedRole === 'SUPER_ADMIN' && styles.roleTextActive]}>Super Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, selectedRole === 'SALES_MANAGER' && styles.roleButtonActive]}
                  onPress={() => setPreset('SALES_MANAGER', 'sales@hawkeye.com')}
                >
                  <TrendingUp size={16} color={selectedRole === 'SALES_MANAGER' ? '#1d4ed8' : COLORS.textMuted} />
                  <Text style={[styles.roleText, selectedRole === 'SALES_MANAGER' && styles.roleTextActive]}>Sales Mgr</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.roleRow}>
                <TouchableOpacity 
                  style={[styles.roleButton, selectedRole === 'SERVICE_STAFF' && styles.roleButtonActive]}
                  onPress={() => setPreset('SERVICE_STAFF', 'tech@hawkeye.com')}
                >
                  <Wrench size={16} color={selectedRole === 'SERVICE_STAFF' ? '#1d4ed8' : COLORS.textMuted} />
                  <Text style={[styles.roleText, selectedRole === 'SERVICE_STAFF' && styles.roleTextActive]}>Service Staff</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, selectedRole === 'BRANCH_MANAGER' && styles.roleButtonActive]}
                  onPress={() => setPreset('BRANCH_MANAGER', 'branch@hawkeye.com')}
                >
                  <Briefcase size={16} color={selectedRole === 'BRANCH_MANAGER' ? '#1d4ed8' : COLORS.textMuted} />
                  <Text style={[styles.roleText, selectedRole === 'BRANCH_MANAGER' && styles.roleTextActive]}>Branch Mgr</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    backgroundColor: '#111827', // slate-900
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#2563EB', // blue-600
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
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#DBEAFE', // blue-100
    lineHeight: 24,
    marginBottom: 10,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeBox: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#1E293B', // slate-800
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#6B7280', // slate-500
  },
  roleGrid: {
    gap: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200
    borderRadius: 8,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    borderColor: '#3B82F6', // blue-500
    backgroundColor: '#EFF6FF', // blue-50
  },
  roleText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#475569', // slate-600
  },
  roleTextActive: {
    color: '#1D4ED8', // blue-700
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#334155', // slate-700
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200
    borderRadius: 12,
    height: 48,
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
    fontSize: 14,
    color: '#111827', // slate-900
  },
  loginButton: {
    backgroundColor: '#2563EB', // blue-600
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  registerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#6B7280', // slate-500
  },
  registerLink: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#2563EB', // blue-600
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#94A3B8', // slate-400
    textAlign: 'center',
    marginTop: 32,
  }
});
