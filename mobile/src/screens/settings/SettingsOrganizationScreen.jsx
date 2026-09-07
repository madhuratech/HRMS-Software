import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MapPin, Building, Layers, Globe, Save, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ActionModals from '../../components/common/ActionModals';

const BRANCHES = [
  { id: 1, name: 'Bangalore HQ', type: 'Headquarters', city: 'Bangalore', emps: 150, status: 'Active' },
  { id: 2, name: 'Mumbai Tech Hub', type: 'Regional Office', city: 'Mumbai', emps: 65, status: 'Active' },
  { id: 3, name: 'Hyderabad Branch', type: 'Branch Office', city: 'Hyderabad', emps: 33, status: 'Active' },
];

const BRANCH_SCHEMA = [
  { key: 'name', label: 'Branch Name' },
  { key: 'type', label: 'Branch Type', type: 'select', options: ['Headquarters', 'Regional Office', 'Branch Office', 'Satellite Office'] },
  { key: 'city', label: 'City / Location' },
  { key: 'emps', label: 'Number of Employees', keyboardType: 'numeric' },
];

export default function SettingsOrganizationScreen() {
  const [branches, setBranches] = useState(BRANCHES);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedBranch, setSelectedBranch] = useState(null);

  const handleAddBranch = () => {
    setModalMode('add');
    setSelectedBranch(null);
    setModalVisible(true);
  };

  const handleEditBranch = (branch) => {
    setModalMode('edit');
    setSelectedBranch(branch);
    setModalVisible(true);
  };

  const handleSave = (data) => {
    if (modalMode === 'add') {
      const newBranch = { id: Date.now(), status: 'Active', ...data };
      setBranches([newBranch, ...branches]);
    } else {
      setBranches(branches.map(b => b.id === data.id ? data : b));
    }
    setModalVisible(false);
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
            <Text style={styles.headerTitle}>Organization</Text>
            <Text style={styles.headerSubtitle}>Configure branches, departments</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnSecondary} onPress={handleAddBranch}>
              <Plus size={16} color="#0F172A" />
              <Text style={styles.btnSecondaryText}>Add Branch</Text>
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
          {renderKpi('Branches', '12 Units', MapPin, '#2563EB', '#EFF6FF')}
          {renderKpi('Departments', '8 Divisions', Layers, '#059669', '#ECFDF5')}
        </View>
        <View style={styles.kpiRow}>
          {renderKpi('Business Units', '4 Units', Building, '#2563EB', '#EFF6FF')}
          {renderKpi('Locations', '5 Cities', Globe, '#059669', '#ECFDF5')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Branch Offices & Locations</Text>
          
          {branches.map(branch => (
            <TouchableOpacity key={branch.id} style={styles.branchCard} onPress={() => handleEditBranch(branch)}>
              <View style={styles.branchHeader}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{branch.status}</Text>
                </View>
              </View>
              <View style={styles.branchInfoRow}>
                <Text style={styles.branchInfoText}>{branch.type} • {branch.city}</Text>
                <Text style={styles.branchEmps}>{branch.emps} Employees</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ActionModals 
        visible={modalVisible}
        mode={modalMode}
        item={selectedBranch}
        schema={BRANCH_SCHEMA}
        title={modalMode === 'add' ? 'Add Branch' : 'Edit Branch'}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
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
  btnSecondary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F8FAFC' },
  btnSecondaryText: { color: '#0F172A', fontSize: 13, fontWeight: '600' },
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
  
  branchCard: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  branchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  branchName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  statusBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { color: '#059669', fontSize: 11, fontWeight: '600' },
  branchInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  branchInfoText: { fontSize: 12, color: '#6B7280' },
  branchEmps: { fontSize: 12, fontWeight: '600', color: '#374151' }
});
