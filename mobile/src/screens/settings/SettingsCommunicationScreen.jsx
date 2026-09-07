import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Mail, Bell, Server, CheckCircle2, Save, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsCommunicationScreen() {
  const renderKpi = (label, value) => (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color: value === 'Connected' ? '#059669' : '#111827' }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Communication Settings</Text>
            <Text style={styles.headerSubtitle}>Manage email templates, SMTP settings</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnPrimary}>
              <Save size={16} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Save Config</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          {renderKpi('Email Templates', '24 Configured')}
          {renderKpi('Notifications', 'Push + Email')}
        </View>
        <View style={styles.kpiRow}>
          {renderKpi('SMTP Status', 'Connected')}
          {renderKpi('Delivery Success', '99.8%')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMTP Gateway Configuration</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>SMTP Host</Text>
            <TextInput style={styles.input} defaultValue="smtp.gmail.com" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>SMTP Port</Text>
            <TextInput style={styles.input} defaultValue="587" keyboardType="numeric" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sender Email</Text>
            <TextInput style={styles.input} defaultValue="notifications@acmehrms.com" keyboardType="email-address" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Encryption</Text>
            <TextInput style={styles.input} defaultValue="TLS / STARTTLS" />
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
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#2952E3' },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  
  content: { padding: 16, paddingBottom: 60 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiCard: { flex: 0.48, backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  kpiLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { height: 42, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB' }
});
