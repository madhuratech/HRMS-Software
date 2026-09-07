import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link2, Key, Cpu, Globe, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsIntegrationsScreen() {
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
            <Text style={styles.headerTitle}>Integrations</Text>
            <Text style={styles.headerSubtitle}>Configure biometric devices, API keys</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnPrimary}>
              <Save size={16} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          {renderKpi('Connected Apps', '6 Apps', Link2, '#2563EB', '#EFF6FF')}
          {renderKpi('API Keys', '4 Active', Key, '#059669', '#ECFDF5')}
        </View>
        <View style={styles.kpiRow}>
          {renderKpi('Biometric', '12 Online', Cpu, '#059669', '#ECFDF5')}
          {renderKpi('Webhooks', '3 Active', Globe, '#2563EB', '#EFF6FF')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometric Sync (ZKTeco / Matrix)</Text>
          <Text style={styles.infoText}>Device IP: 192.168.1.120:4370</Text>
          <TouchableOpacity style={styles.statusBtnSuccess}>
            <Text style={styles.statusBtnSuccessText}>Connected (Auto Sync Every 5 Mins)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REST API Tokens</Text>
          <Text style={styles.infoText}>Prod Token: hrms_live_89a7f6e210b4</Text>
          <TouchableOpacity style={styles.statusBtnPrimary}>
            <Text style={styles.statusBtnPrimaryText}>Regenerate Secret Key</Text>
          </TouchableOpacity>
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
  kpiIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  kpiLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  
  section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#374151', marginBottom: 12 },
  
  statusBtnSuccess: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, borderRadius: 6, alignItems: 'center' },
  statusBtnSuccessText: { color: '#059669', fontSize: 13, fontWeight: '600' },
  
  statusBtnPrimary: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 6, alignItems: 'center' },
  statusBtnPrimaryText: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
});
