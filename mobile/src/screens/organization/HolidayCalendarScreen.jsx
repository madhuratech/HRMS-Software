import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Search, Plus, MoreVertical, Calendar as CalendarIcon, MapPin, X, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import apiClient from '../../api/client';

export default function HolidayCalendarScreen() {
  const navigation = useNavigation();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/organization/holidays');
      if (Array.isArray(res.data)) {
        setHolidays(res.data);
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newName.trim() || !newDate.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post('/organization/holidays', { 
        name: newName, 
        date: newDate, 
        type: newType || 'National' 
      });
      setNewName('');
      setNewDate('');
      setNewType('');
      setModalVisible(false);
      fetchHolidays();
    } catch (err) {
      console.error('Error adding holiday:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = holidays.filter(h => 
    h.holiday_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const markedDates = holidays.reduce((acc, curr) => {
    if (curr.holiday_date) {
      const dateStr = new Date(curr.holiday_date).toISOString().split('T')[0];
      acc[dateStr] = { marked: true, dotColor: '#4F46E5', selected: true, selectedColor: '#4F46E5' };
    }
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Holidays</Text>
            <Text style={styles.headerSubtitle}>Manage company holidays</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.gradientBtn}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.addButtonText}>Add Holiday</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search holidays..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={markedDates}
              theme={{
                calendarBackground: '#FFF',
                textSectionTitleColor: '#64748B',
                selectedDayBackgroundColor: '#4F46E5',
                selectedDayTextColor: '#FFF',
                todayTextColor: '#4F46E5',
                dayTextColor: '#1E293B',
                textDisabledColor: '#94A3B8',
                dotColor: '#4F46E5',
                selectedDotColor: '#FFF',
                arrowColor: '#4F46E5',
                monthTextColor: '#0F172A',
                indicatorColor: '#4F46E5',
                textDayFontWeight: '500',
                textMonthFontWeight: '800',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
            />
          </View>
          
          <Text style={styles.sectionTitle}>Upcoming Holidays</Text>

          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No holidays found</Text>
            </View>
          ) : (
            filtered.map((holiday, i) => (
              <View key={holiday.id || i} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateMonth}>{new Date(holiday.holiday_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</Text>
                    <Text style={styles.dateDay}>{new Date(holiday.holiday_date).getDate()}</Text>
                  </View>
                </View>
                
                <View style={styles.cardRight}>
                  <View style={styles.cardTop}>
                    <Text style={styles.holidayName}>{holiday.holiday_name}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <CalendarIcon size={14} color="#64748B" />
                    <Text style={styles.infoText}>{formatDay(holiday.holiday_date)}</Text>
                  </View>
                  
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{holiday.holiday_type}</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color="#64748B" />
                      <Text style={styles.locationText}>{holiday.location}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Holiday</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Holiday Name</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. Christmas"
                  placeholderTextColor="#94A3B8"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="2026-12-25"
                  placeholderTextColor="#94A3B8"
                  value={newDate}
                  onChangeText={setNewDate}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <TextInput 
                  style={styles.modalInput}
                  placeholder="e.g. National, Optional"
                  placeholderTextColor="#94A3B8"
                  value={newType}
                  onChangeText={setNewType}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
                onPress={handleAddHoliday}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>{submitting ? 'Adding...' : 'Add Holiday'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 24, 
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  addButton: { borderRadius: 20, overflow: 'hidden', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  toolbar: { padding: 24 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 52,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 24 },
  calendarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16
  },
  card: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20,
    flexDirection: 'row', borderWidth: 1, borderColor: '#F1F5F9', 
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4,
  },
  cardLeft: { marginRight: 20 },
  dateBox: { 
    width: 64, height: 64, backgroundColor: '#EEF2FF', borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C7D2FE'
  },
  dateMonth: { fontSize: 13, fontWeight: '800', color: '#4338CA', marginBottom: 2 },
  dateDay: { fontSize: 24, fontWeight: '900', color: '#312E81', lineHeight: 28 },
  cardRight: { flex: 1, justifyContent: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  holidayName: { fontSize: 18, fontWeight: '800', color: '#0F172A', flex: 1, marginRight: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  infoText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  modalBody: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  modalInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B', backgroundColor: '#F8FAFC' },
  submitButton: { backgroundColor: '#4338CA', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
