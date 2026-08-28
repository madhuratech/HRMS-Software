import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, CalendarDays, MapPin, Search } from 'lucide-react-native';

const holidayData = [
  { id: '1', date: '01 Jan 2024', day: 'Mon', name: 'New Year', occasion: 'New Year Celebration', location: 'All', type: 'Gazetted' },
  { id: '2', date: '26 Jan 2024', day: 'Fri', name: 'Republic Day', occasion: 'National Holiday', location: 'All', type: 'Gazetted' },
  { id: '3', date: '08 Mar 2024', day: 'Fri', name: 'Mahashivratri', occasion: 'Hindu Festival', location: 'All', type: 'Optional' },
  { id: '4', date: '29 Mar 2024', day: 'Fri', name: 'Good Friday', occasion: 'Christian Holiday', location: 'All', type: 'Optional' },
  { id: '5', date: '11 Apr 2024', day: 'Thu', name: 'Eid ul-Fitr', occasion: 'Islamic Festival', location: 'All', type: 'Gazetted' },
  { id: '6', date: '01 May 2024', day: 'Wed', name: 'Labour Day', occasion: 'International Workers Day', location: 'All', type: 'Gazetted' },
  { id: '7', date: '15 Aug 2024', day: 'Thu', name: 'Independence Day', occasion: 'National Holiday', location: 'All', type: 'Gazetted' },
  { id: '8', date: '02 Oct 2024', day: 'Wed', name: 'Gandhi Jayanti', occasion: 'National Holiday', location: 'All', type: 'Gazetted' },
  { id: '9', date: '31 Oct 2024', day: 'Thu', name: 'Diwali', occasion: 'Hindu Festival', location: 'All', type: 'Optional' },
  { id: '10', date: '25 Dec 2024', day: 'Wed', name: 'Christmas', occasion: 'Christian Festival', location: 'All', type: 'Optional' },
];

export default function HolidayListScreen({ navigation }) {
  const [selectedYear, setSelectedYear] = useState('2024');

  const renderHoliday = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.dateMonth}>{item.date.split(' ')[1]}</Text>
          <Text style={styles.dateDay}>{item.date.split(' ')[0]}</Text>
        </View>
        <View style={styles.holidayInfo}>
          <Text style={styles.holidayName}>{item.name}</Text>
          <Text style={styles.holidayOccasion}>{item.occasion}</Text>
          <View style={styles.holidayMeta}>
            <CalendarDays size={12} color="#64748b" style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{item.day} • {item.type}</Text>
            <MapPin size={12} color="#64748b" style={{ marginLeft: 12, marginRight: 4 }} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Holiday List</Text>
            <Text style={styles.headerSubtitle}>Company holidays & observances</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Upcoming Holidays Widget */}
        <View style={[styles.widgetCard, { marginBottom: 24 }]}>
          <Text style={styles.widgetTitle}>Upcoming Holidays</Text>
          <View style={styles.upcomingItem}>
            <View style={[styles.dateBox, { backgroundColor: '#ecfdf5' }]}>
              <Text style={[styles.dateMonth, { color: '#10b981' }]}>AUG</Text>
              <Text style={[styles.dateDay, { color: '#10b981' }]}>15</Text>
            </View>
            <View style={styles.holidayInfo}>
              <Text style={styles.holidayName}>Independence Day</Text>
              <Text style={styles.metaText}>Thursday • National Holiday</Text>
            </View>
          </View>
          <View style={styles.upcomingItem}>
            <View style={[styles.dateBox, { backgroundColor: '#f5f3ff' }]}>
              <Text style={[styles.dateMonth, { color: '#8b5cf6' }]}>OCT</Text>
              <Text style={[styles.dateDay, { color: '#8b5cf6' }]}>02</Text>
            </View>
            <View style={styles.holidayInfo}>
              <Text style={styles.holidayName}>Gandhi Jayanti</Text>
              <Text style={styles.metaText}>Wednesday • National Holiday</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <Text style={styles.sectionTitle}>All Holidays</Text>
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>{selectedYear}</Text>
          </View>
        </View>

        {/* Holiday List */}
        <View style={styles.listContainer}>
          {holidayData.map(item => (
            <View key={item.id}>
              {renderHoliday({ item })}
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 20, 
    paddingTop: 48,
    paddingVertical: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  widgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  widgetTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  upcomingItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  
  filtersRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  yearBadge: { backgroundColor: '#E0E7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  yearText: { color: '#4338CA', fontWeight: '600', fontSize: 12 },
  
  listContainer: { gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  dateBox: {
    width: 52,
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateMonth: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  dateDay: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  holidayInfo: { flex: 1 },
  holidayName: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  holidayOccasion: { fontSize: 13, color: '#475569', marginBottom: 6 },
  holidayMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
});
