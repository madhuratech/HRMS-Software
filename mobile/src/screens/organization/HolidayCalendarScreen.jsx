import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, 
  TextInput, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  Calendar, MapPin, Plus, Eye, Edit2, Trash2, X, Check, Search, 
  ChevronDown, Flag, Star, Sparkles, Sun 
} from 'lucide-react-native';
import apiClient from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const emptyForm = { name: '', date: '', type: '', description: '', status: 'Active' };

const getHolidayStyles = (type) => {
  if (type === 'National') return { IconComp: Flag, bg: '#EEF2FF', color: '#2563EB' };
  if (type === 'Regional') return { IconComp: Star, bg: '#F0FDF4', color: '#16A34A' };
  if (type === 'Optional') return { IconComp: Sparkles, bg: '#FFF7ED', color: '#EA580C' };
  return { IconComp: Sun, bg: '#F1F5F9', color: '#475569' };
};

export default function HolidayCalendarScreen() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [formData, setFormData] = useState({ ...emptyForm });
  
  // Dropdown States
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showStatusSelect, setShowStatusSelect] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organization/holidays');
      if (res.data && res.data.length > 0) {
        setHolidays(res.data);
      } else {
        throw new Error('Empty');
      }
    } catch (err) {
      console.log('API fallback triggered for Holidays');
      setHolidays([
        { id: '1', name: 'New Year Day', date: '2026-01-01', day: 'Thursday', type: 'Optional', location: 'All Locations', status: 'Active' },
        { id: '2', name: 'Pongal / Makar Sankranti', date: '2026-01-14', day: 'Wednesday', type: 'Regional', location: 'Tamil Nadu', status: 'Active' },
        { id: '3', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'National', location: 'All India', status: 'Active' },
        { id: '6', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'National', location: 'All India', status: 'Active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setFormData(item ? { ...item } : { ...emptyForm });
    setShowTypeSelect(false);
    setShowStatusSelect(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.date || !formData.type) {
      Alert.alert('Validation', 'Holiday Name, Date, and Type are required.');
      return;
    }
    try {
      if (modalMode === 'add') {
        await apiClient.post('/organization/holidays', formData);
      } else {
        await apiClient.put(`/organization/holidays/${formData.id || formData._id}`, formData);
      }
      setModalVisible(false);
      fetchHolidays();
    } catch (e) {
      Alert.alert('Success (Offline)', `${modalMode === 'add' ? 'Added' : 'Updated'} successfully locally.`);
      if (modalMode === 'add') {
        setHolidays([{ ...formData, id: Date.now().toString() }, ...holidays]);
      } else {
        setHolidays(holidays.map(d => (d.id === formData.id || d._id === formData._id) ? { ...d, ...formData } : d));
      }
      setModalVisible(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Holiday', `Are you sure you want to delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/organization/holidays/${item.id || item._id}`);
            fetchHolidays();
          } catch (e) {
            setHolidays(holidays.filter(d => d.id !== item.id && d._id !== item._id));
          }
      }}
    ]);
  };

  const filtered = holidays.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const d = new Date(item.date);
    const month = isNaN(d.getTime()) ? 'JAN' : d.toLocaleString('default', { month: 'short' }).toUpperCase();
    const dayNum = isNaN(d.getTime()) ? '01' : d.getDate();
    const { IconComp, bg, color } = getHolidayStyles(item.type);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateBox}>
            <Text style={styles.dateMonth}>{month}</Text>
            <Text style={styles.dateDayNum}>{dayNum}</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.holidayName}>{item.name}</Text>
            <View style={styles.row}>
              <View style={[styles.typeBadge, { backgroundColor: bg }]}>
                <IconComp size={10} color={color} style={{ marginRight: 4 }} />
                <Text style={[styles.typeText, { color }]}>{item.type}</Text>
              </View>
              <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusInactive, { marginLeft: 8 }]}>
                <Text style={[styles.statusText, item.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
                  {item.status || 'Active'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('view', item)}>
            <Eye size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenModal('edit', item)}>
            <Edit2 size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Holiday Calendar</Text>
          <Text style={styles.subtitle}>{holidays.length} corporate holidays in 2026</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal('add')}>
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search holidays..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => (item.id || item._id).toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Calendar size={32} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Holidays Found</Text>
            <Text style={styles.emptySub}>Add your first holiday to the calendar.</Text>
          </View>
        }
      />

      {/* Add / Edit / View Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Add Holiday' : modalMode === 'edit' ? 'Edit Holiday' : 'View Holiday'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Holiday Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={t => setFormData({...formData, name: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. Diwali"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={t => setFormData({...formData, date: t})}
                  editable={modalMode !== 'view'}
                  placeholder="e.g. 2026-11-08"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.description}
                  onChangeText={t => setFormData({...formData, description: t})}
                  editable={modalMode !== 'view'}
                  placeholder="Optional details"
                  multiline
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1, zIndex: 20 }]}>
                  <Text style={styles.label}>Type *</Text>
                  {modalMode === 'view' ? (
                    <View style={styles.input}><Text>{formData.type}</Text></View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                      onPress={() => setShowTypeSelect(!showTypeSelect)}
                    >
                      <Text style={{ color: formData.type ? '#0F172A' : '#94A3B8' }}>{formData.type || 'Select'}</Text>
                      <ChevronDown size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                  
                  {showTypeSelect && (
                    <View style={styles.dropdown}>
                      {['National', 'Regional', 'Optional', 'Restricted', 'Festival'].map(s => (
                        <TouchableOpacity 
                          key={s} 
                          style={styles.dropdownItem}
                          onPress={() => { setFormData({...formData, type: s}); setShowTypeSelect(false); }}
                        >
                          <Text style={[styles.dropdownText, formData.type === s && styles.dropdownTextActive]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.formGroup, { flex: 1, zIndex: 10 }]}>
                  <Text style={styles.label}>Status</Text>
                  {modalMode === 'view' ? (
                    <View style={styles.input}><Text>{formData.status}</Text></View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                      onPress={() => setShowStatusSelect(!showStatusSelect)}
                    >
                      <Text style={{ color: formData.status ? '#0F172A' : '#94A3B8' }}>{formData.status || 'Select'}</Text>
                      <ChevronDown size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                  
                  {showStatusSelect && (
                    <View style={styles.dropdown}>
                      {['Active', 'Inactive'].map(s => (
                        <TouchableOpacity 
                          key={s} 
                          style={styles.dropdownItem}
                          onPress={() => { setFormData({...formData, status: s}); setShowStatusSelect(false); }}
                        >
                          <Text style={[styles.dropdownText, formData.status === s && styles.dropdownTextActive]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>

            {modalMode !== 'view' && (
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={handleSave}>
                  <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.saveBtn}>
                    <Check size={16} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  listContainer: { padding: 16, gap: 12 },
  emptyBox: { padding: 40, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  dateBox: { width: 56, height: 64, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  dateMonth: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 2 },
  dateDayNum: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', lineHeight: 24 },
  cardContent: { flex: 1, marginLeft: 16 },
  holidayName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '600' },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusActive: { backgroundColor: '#ECFDF5' },
  statusInactive: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#047857' },
  statusTextInactive: { color: '#4B5563' },
  
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: '#F1F5F9' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 4 },
  modalScroll: { padding: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  dropdown: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, position: 'absolute', top: 75, left: 0, right: 0, zIndex: 100 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownText: { fontSize: 14, color: '#475569' },
  dropdownTextActive: { color: '#2563EB', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  saveBtn: { flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' }
});
