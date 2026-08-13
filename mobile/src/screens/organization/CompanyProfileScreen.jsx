import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Building2, Phone, MapPin, Users, IndianRupee, Settings, ShieldCheck, Mail, Globe, Save, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';

const TABS = [
  { id: 'general', label: 'General Info', icon: Building2 },
  { id: 'contact', label: 'Contact Details', icon: Phone },
  { id: 'address', label: 'Locations', icon: MapPin },
  { id: 'hrSettings', label: 'HR Rules', icon: Users },
  { id: 'payroll', label: 'Payroll Configuration', icon: IndianRupee },
  { id: 'systemSettings', label: 'System Prefs', icon: Settings },
];

export default function CompanyProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    general: {}, contact: {}, address: {}, hrSettings: {}, payroll: {}, systemSettings: {}
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organization/profile');
      setProfile(res.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put('/organization/profile', profile);
      Alert.alert('Success', 'Company profile updated successfully');
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (tab, field, value) => {
    setProfile(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const renderInput = (tab, field, label, icon) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, !isEditing && styles.inputDisabled]}>
        {icon}
        <TextInput 
          style={styles.input} 
          value={profile[tab]?.[field]?.toString() || ''} 
          onChangeText={(val) => updateField(tab, field, val)}
          editable={isEditing} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.pageHeader}>
        <View style={styles.headerTextContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>Company Profile</Text>
            <Text style={styles.pageSubtitle}>Manage your organization's core details and settings</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity 
                key={tab.id} 
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} color={isActive ? '#2563EB' : '#64748B'} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.bannerCard}>
          <View style={styles.bannerTop}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>{profile.general?.companyName?.charAt(0) || '?'}</Text>
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>{profile.general?.companyName || 'Company Not Setup'}</Text>
              <Text style={styles.bannerSubtitle}>{profile.general?.companyType || 'Setup Required'}</Text>
            </View>
            {profile.general?.companyName && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{TABS.find(t => t.id === activeTab)?.label}</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Save size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {activeTab === 'general' && (
            <>
              {renderInput('general', 'legalCompanyName', 'Legal Company Name', <Building2 size={18} color="#94A3B8" style={styles.inputIcon} />)}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>{renderInput('general', 'companyCode', 'Company Code', null)}</View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>{renderInput('general', 'companyType', 'Company Type', null)}</View>
              </View>
              {renderInput('general', 'industry', 'Industry', null)}
              {renderInput('general', 'yearEstablished', 'Year Established', null)}
            </>
          )}

          {activeTab === 'contact' && (
            <>
              {renderInput('contact', 'officialEmail', 'Official Email', <Mail size={18} color="#94A3B8" style={styles.inputIcon} />)}
              {renderInput('contact', 'supportEmail', 'Support Email', <Mail size={18} color="#94A3B8" style={styles.inputIcon} />)}
              {renderInput('contact', 'website', 'Website', <Globe size={18} color="#94A3B8" style={styles.inputIcon} />)}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>{renderInput('contact', 'phoneNumber', 'Phone Number', <Phone size={18} color="#94A3B8" style={styles.inputIcon} />)}</View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>{renderInput('contact', 'mobileNumber', 'Mobile Number', null)}</View>
              </View>
            </>
          )}

          {activeTab === 'address' && (
            <>
              {renderInput('address', 'headOfficeAddress1', 'Head Office Address 1', <MapPin size={18} color="#94A3B8" style={styles.inputIcon} />)}
              {renderInput('address', 'headOfficeCity', 'City', null)}
              {renderInput('address', 'headOfficeState', 'State', null)}
              {renderInput('address', 'headOfficeCountry', 'Country', null)}
              {renderInput('address', 'headOfficeZipCode', 'Zip Code', null)}
            </>
          )}

          {activeTab === 'hrSettings' && (
            <>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>{renderInput('hrSettings', 'employeeIdPrefix', 'Employee ID Prefix', null)}</View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>{renderInput('hrSettings', 'probationPeriod', 'Probation (Months)', null)}</View>
              </View>
              {renderInput('hrSettings', 'noticePeriod', 'Notice Period (Days)', null)}
              {renderInput('hrSettings', 'workingDays', 'Working Days per Week', null)}
              {renderInput('hrSettings', 'defaultShift', 'Default Shift', null)}
            </>
          )}

          {activeTab === 'payroll' && (
            <>
              {renderInput('payroll', 'payrollFrequency', 'Payroll Frequency', <IndianRupee size={18} color="#94A3B8" style={styles.inputIcon} />)}
              {renderInput('payroll', 'salaryCycle', 'Salary Cycle', null)}
              {renderInput('payroll', 'salaryPaymentDate', 'Payment Date', null)}
            </>
          )}

          {activeTab === 'systemSettings' && (
            <>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>{renderInput('systemSettings', 'language', 'Language', <Settings size={18} color="#94A3B8" style={styles.inputIcon} />)}</View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>{renderInput('systemSettings', 'timeZone', 'Time Zone', null)}</View>
              </View>
              {renderInput('systemSettings', 'currency', 'Currency', null)}
              {renderInput('systemSettings', 'dateFormat', 'Date Format', null)}
            </>
          )}

        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  pageHeader: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTextContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  pageSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  tabsWrapper: { backgroundColor: '#FFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tabsContainer: { paddingHorizontal: 24, gap: 12 },
  tabButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  tabButtonActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748B', marginLeft: 8 },
  tabTextActive: { color: '#4338CA' },
  contentContainer: { padding: 24 },
  bannerCard: { borderRadius: 20, padding: 24, marginBottom: 30, shadowColor: '#312E81', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  bannerTop: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  logoText: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  bannerInfo: { flex: 1, marginLeft: 16 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  bannerSubtitle: { fontSize: 14, color: '#C7D2FE', marginTop: 4, fontWeight: '500' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: '#A7F3D0' },
  verifiedText: { fontSize: 12, fontWeight: '800', color: '#059669' },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  editBtn: { fontSize: 15, fontWeight: '700', color: '#4338CA', backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4338CA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, backgroundColor: '#FFF', height: 56 },
  inputDisabled: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9', opacity: 0.8 },
  inputIcon: { marginLeft: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '600', paddingHorizontal: 16 },
  row: { flexDirection: 'row' }
});
