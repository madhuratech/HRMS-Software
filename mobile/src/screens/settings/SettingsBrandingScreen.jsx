import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Image, Palette, ShieldCheck, Save, RotateCcw, Upload } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsBrandingScreen() {
  const [primaryColor, setPrimaryColor] = useState('#2952E3');
  const [successColor, setSuccessColor] = useState('#10B981');

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
            <Text style={styles.headerTitle}>Branding Settings</Text>
            <Text style={styles.headerSubtitle}>Customize logos, theme colors, etc</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnSecondary}>
              <RotateCcw size={14} color="#E2E8F0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary}>
              <Save size={16} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          {renderKpi('Logo Status', 'Default Logo', Image, '#2563EB', '#EFF6FF')}
          {renderKpi('Active Theme', 'Enterprise', Palette, '#059669', '#ECFDF5')}
        </View>
        <View style={styles.kpiRow}>
          {renderKpi('Favicon', 'Active 32x32', Image, '#2563EB', '#EFF6FF')}
          {renderKpi('PDF Watermark', 'Enabled', ShieldCheck, '#059669', '#ECFDF5')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Identity & Theme Colors</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Color</Text>
            <View style={styles.colorInputRow}>
              <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
              <TextInput 
                style={styles.colorInput} 
                value={primaryColor} 
                onChangeText={setPrimaryColor} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Accent Success Color</Text>
            <View style={styles.colorInputRow}>
              <View style={[styles.colorPreview, { backgroundColor: successColor }]} />
              <TextInput 
                style={styles.colorInput} 
                value={successColor} 
                onChangeText={setSuccessColor} 
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Logo</Text>
          
          <TouchableOpacity style={styles.uploadBox}>
            <View style={styles.uploadIconCircle}>
              <Upload size={24} color="#3B82F6" />
            </View>
            <Text style={styles.uploadTitle}>Click to upload logo</Text>
            <Text style={styles.uploadSubtitle}>PNG, JPG up to 5MB (Max 800x400px)</Text>
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
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 8 },
  
  colorInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  colorPreview: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  colorInput: { flex: 1, height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB', fontFamily: 'monospace' },
  
  uploadBox: { height: 160, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 20 },
  uploadIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  uploadSubtitle: { fontSize: 12, color: '#6B7280' }
});
