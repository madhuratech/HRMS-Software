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
import { User, Lock, ArrowRight, ShieldCheck, TrendingUp, Mail, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { registerUser, login } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState('EMPLOYEE'); // 'ADMIN' | 'EMPLOYEE'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }
    if (selectedRole === 'EMPLOYEE' && !employeeId) {
      Alert.alert('Validation Error', 'Please enter your Employee ID.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (selectedRole === 'ADMIN') {
        const newId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
        await registerUser({
          type: 'ADMIN',
          role: 'HR_MANAGER', // default admin role
          email: email.trim(),
          employeeId: newId,
          password: password,
          name: name.trim(),
          phone: phone.trim()
        });
        Alert.alert('Success', 'Admin account created successfully!', [
          { text: 'OK', onPress: () => login({ email: email.trim(), password }) }
        ]);
      } else {
        await registerUser({
          type: 'EMPLOYEE',
          role: 'EMPLOYEE',
          email: email.trim(),
          employeeId: employeeId.trim(),
          password: password,
          name: name.trim(),
          phone: phone.trim()
        });
        Alert.alert('Success', 'Employee account created successfully!', [
          { text: 'OK', onPress: () => login({ email: email.trim(), password }) }
        ]);
      }
    } catch (e) {
      Alert.alert('Registration Error', e.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
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
          source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80' }} 
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
            <Text style={styles.heroTitle}>Join the Platform</Text>
            <Text style={styles.heroSubtitle}>
              Create your account to start managing your team, tracking sales, and streamlining operations.
            </Text>

            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"A game changer for our branch."</Text>
              <Text style={styles.quoteAuthor}>- Sarah J., Branch Manager</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.formSection}>
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Enter your details to register.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleGrid}>
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'ADMIN' && styles.roleButtonActive]}
                onPress={() => setSelectedRole('ADMIN')}
              >
                <ShieldCheck size={16} color={selectedRole === 'ADMIN' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.roleText, selectedRole === 'ADMIN' && styles.roleTextActive]}>Admin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'EMPLOYEE' && styles.roleButtonActive]}
                onPress={() => setSelectedRole('EMPLOYEE')}
              >
                <User size={16} color={selectedRole === 'EMPLOYEE' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.roleText, selectedRole === 'EMPLOYEE' && styles.roleTextActive]}>Employee</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User style={styles.inputIcon} size={18} color="#94A3B8" />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={name}
                   onChangeText={setName}
                   placeholder="Enter your full name"
                   placeholderTextColor="#94A3B8"
                 />
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Company Email</Text>
            <View style={styles.inputContainer}>
              <Mail style={styles.inputIcon} size={18} color="#94A3B8" />
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
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <User style={styles.inputIcon} size={18} color="#94A3B8" />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={phone}
                   onChangeText={setPhone}
                   placeholder="Enter your phone number"
                   placeholderTextColor="#94A3B8"
                   keyboardType="phone-pad"
                 />
              </View>
            </View>
          </View>

          {selectedRole === 'EMPLOYEE' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Employee ID</Text>
              <View style={styles.inputContainer}>
                <ShieldCheck style={styles.inputIcon} size={18} color="#94A3B8" />
                <View style={styles.inputWrapper}>
                   <TextInput
                     style={styles.inputText}
                     value={employeeId}
                     onChangeText={setEmployeeId}
                     placeholder="e.g. EMP-1024"
                     placeholderTextColor="#94A3B8"
                   />
                </View>
              </View>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={18} color="#94A3B8" />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={password}
                   onChangeText={setPassword}
                   placeholder="Create a password"
                   placeholderTextColor="#94A3B8"
                   secureTextEntry={!showPassword}
                 />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 12 }}>
                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Lock style={styles.inputIcon} size={18} color="#94A3B8" />
              <View style={styles.inputWrapper}>
                 <TextInput
                   style={styles.inputText}
                   value={confirmPassword}
                   onChangeText={setConfirmPassword}
                   placeholder="Confirm your password"
                   placeholderTextColor="#94A3B8"
                   secureTextEntry={!showConfirmPassword}
                 />
              </View>
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 12 }}>
                {showConfirmPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            {!loading && <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerLink}>Sign In</Text>
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
  quoteCard: { marginTop: 24, backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  quoteText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontStyle: 'italic', marginBottom: 4 },
  quoteAuthor: { fontSize: 12, color: '#BFDBFE' },
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
