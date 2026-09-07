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
  ImageBackground,
  Alert
} from 'react-native';
import { User, Lock, ArrowRight, ShieldCheck, TrendingUp, Mail, Eye, EyeOff, Wrench } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login({ 
        email: email.trim(), 
        password,
        loginType: selectedRole === 'EMPLOYEE' ? 'employee' : 'admin'
      });
    } catch (e) {
      Alert.alert('Authentication Failed', e.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
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
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' }} 
          style={styles.headerSection}
        >
          <LinearGradient 
            colors={['rgba(37,99,235,0.9)', 'rgba(49,46,129,0.95)']} 
            style={StyleSheet.absoluteFillObject} 
          />
          <View style={styles.headerContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <TrendingUp size={24} color="#2563EB" />
              </View>
              <Text style={styles.logoText}>HAWKEYE NEST</Text>
            </View>
            <Text style={styles.heroTitle}>Enterprise Management Solution</Text>
            <Text style={styles.heroSubtitle}>
              Unified platform for HR, Sales, and Service management across all your branches.
            </Text>

            <View style={styles.infoCardsRow}>
              <View style={styles.infoCard}>
                <ShieldCheck size={20} color="#BFDBFE" style={{ marginBottom: 8 }} />
                <Text style={styles.infoCardTitle}>Role Based</Text>
                <Text style={styles.infoCardText}>Secure access control</Text>
              </View>
              <View style={styles.infoCard}>
                <Wrench size={20} color="#BFDBFE" style={{ marginBottom: 8 }} />
                <Text style={styles.infoCardTitle}>Service Ops</Text>
                <Text style={styles.infoCardText}>Job card tracking</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.formSection}>
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Please choose your role and sign in.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleGrid}>
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'SUPER_ADMIN' && styles.roleButtonActive]}
                onPress={() => setPreset('SUPER_ADMIN', 'admin@hawkeye.com')}
              >
                <ShieldCheck size={16} color={selectedRole === 'SUPER_ADMIN' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.roleText, selectedRole === 'SUPER_ADMIN' && styles.roleTextActive]}>Admin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'EMPLOYEE' && styles.roleButtonActive]}
                onPress={() => setPreset('EMPLOYEE', 'Madhuratechcbe@gmail.com')}
              >
                <User size={16} color={selectedRole === 'EMPLOYEE' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.roleText, selectedRole === 'EMPLOYEE' && styles.roleTextActive]}>Employee</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <User style={styles.inputIcon} size={18} color="#94A3B8" />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={email}
                   onChangeText={setEmail}
                   placeholder="name@company.com"
                   placeholderTextColor="#94A3B8"
                   autoCapitalize="none"
                   keyboardType="email-address"
                 />
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={18} color="#94A3B8" />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={password}
                   onChangeText={setPassword}
                   placeholder="••••••••"
                   placeholderTextColor="#94A3B8"
                   secureTextEntry={!showPassword}
                 />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 12 }}>
                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Signing in...' : 'Sign In to Dashboard'}</Text>
            {!loading && <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>© 2026 HAWKEYE NEST. All rights reserved.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { flexGrow: 1 },
  headerSection: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 60, minHeight: 300, justifyContent: 'center' },
  headerContent: { alignItems: 'flex-start' },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoIcon: { width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  heroTitle: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginBottom: 12, lineHeight: 40 },
  heroSubtitle: { fontSize: 16, color: '#DBEAFE', lineHeight: 24, marginBottom: 10 },
  infoCardsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  infoCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  infoCardTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  infoCardText: { fontSize: 12, color: '#DBEAFE' },
  formSection: { backgroundColor: '#FFFFFF', padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, minHeight: 500 },
  welcomeBox: { marginBottom: 24, marginTop: 8 },
  welcomeTitle: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 14, color: '#64748B' },
  roleGrid: { flexDirection: 'row', gap: 12 },
  roleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 12, gap: 8, backgroundColor: '#FFFFFF' },
  roleButtonActive: { borderColor: '#2563EB', backgroundColor: '#2563EB', shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
  roleText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  roleTextActive: { color: '#FFFFFF' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden' },
  inputIcon: { paddingHorizontal: 16 },
  inputWrapper: { flex: 1 },
  inputText: { paddingVertical: 14, paddingRight: 16, fontSize: 15, color: '#1E293B' },
  loginButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  registerPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  registerText: { fontSize: 14, color: '#64748B' },
  registerLink: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  footerText: { textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 32, marginBottom: 20 }
});
