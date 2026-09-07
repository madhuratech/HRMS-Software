import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Building2, MapPin, Users, CheckCircle2, Save, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsCompanyScreen() {
  const [formData, setFormData] = useState({
    name: 'Acme Enterprise HRMS Solutions Pvt Ltd',
    cin: 'U72900KA2020PTC134567',
    gst: '29AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    email: 'contact@acmehrms.com',
    phone: '+91 80 4567 8900',
    address: 'Plot 42, Electronic City Phase 1, Hosur Road, Bangalore',
    currency: 'INR (₹)',
    timezone: '(UTC+05:30) IST - Kolkata',
    fiscalYear: 'April 1st'
  });

  const handleSave = () => {
    Alert.alert('Success', 'Company details updated successfully.');
  };
  const renderKpi = (label, value, Icon, color, bgColor) => (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIconBox, { backgroundColor: bgColor }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Company Information</Text>
            <Text style={styles.headerSubtitle}>Manage company profile and organization details</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setFormData({
              name: 'Acme Enterprise HRMS Solutions Pvt Ltd',
              cin: 'U72900KA2020PTC134567',
              gst: '29AAAAA0000A1Z5',
              pan: 'AAAAA0000A',
              email: 'contact@acmehrms.com',
              phone: '+91 80 4567 8900',
              address: 'Plot 42, Electronic City Phase 1, Hosur Road, Bangalore',
              currency: 'INR (₹)',
              timezone: '(UTC+05:30) IST - Kolkata',
              fiscalYear: 'April 1st'
            })}>
              <RotateCcw size={14} color="#E2E8F0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
              <Save size={16} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          {renderKpi('Profile', 'Active', Building2, '#2563EB', '#EFF6FF')}
          {renderKpi('Branches', '12 Units', MapPin, '#059669', '#ECFDF5')}
        </View>
        <View style={styles.kpiRow}>
          {renderKpi('Employees', '248 Active', Users, '#2563EB', '#EFF6FF')}
          {renderKpi('Status', 'Verified', CheckCircle2, '#059669', '#ECFDF5')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Number (CIN)</Text>
            <TextInput style={styles.input} value={formData.cin} onChangeText={t => setFormData({...formData, cin: t})} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>GST Number</Text>
            <TextInput style={styles.input} value={formData.gst} onChangeText={t => setFormData({...formData, gst: t})} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAN Number</Text>
            <TextInput style={styles.input} value={formData.pan} onChangeText={t => setFormData({...formData, pan: t})} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Official Email</Text>
            <TextInput style={styles.input} value={formData.email} onChangeText={t => setFormData({...formData, email: t})} keyboardType="email-address" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData({...formData, phone: t})} keyboardType="phone-pad" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Headquarters Address</Text>
          
          <View style={styles.inputGroup}>
            <TextInput style={styles.input} value={formData.address} onChangeText={t => setFormData({...formData, address: t})} multiline />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Currency</Text>
              <TextInput style={styles.input} value={formData.currency} onChangeText={t => setFormData({...formData, currency: t})} />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Financial Year Start</Text>
              <TextInput style={styles.input} value={formData.fiscalYear} onChangeText={t => setFormData({...formData, fiscalYear: t})} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time Zone</Text>
            <TextInput style={styles.input} value={formData.timezone} onChangeText={t => setFormData({...formData, timezone: t})} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { padding: 20, paddingTop: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  btnSecondary: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#2952E3' },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  
  content: { padding: 16, paddingBottom: 60 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiCard: { flex: 0.48, backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  kpiIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  kpiLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 14, fontSize: 15, color: '#0F172A' }
});
