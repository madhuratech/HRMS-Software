import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { MapPin, CalendarDays, CheckSquare, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import GeoPunchView from './GeoPunchView';
import LeaveApplicationsScreen from '../leave/LeaveApplicationsScreen';
import LeaveApprovalScreen from '../leave/LeaveApprovalScreen';
import { LinearGradient } from 'expo-linear-gradient';

function getRoleKey(user) {
  const r = (user?.role || user?.role_name || '').toUpperCase().replace(/\s+/g, '_');
  if (r.includes('SUPER')) return 'SUPER_ADMIN';
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'HR') return 'HR';
  return 'EMPLOYEE';
}

export default function AttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const roleKey = getRoleKey(user);
  const canApprove = ['SUPER_ADMIN', 'BRANCH_MANAGER', 'HR_MANAGER'].includes(roleKey);

  const [activeTab, setActiveTab] = useState('punch');

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16, padding: 4 }}>
            <ChevronLeft size={24} color='#111827' />
          </TouchableOpacity>
          <View style={s.headerTextContainer}>
            <Text style={s.headerTitle}>Attendance</Text>
            <Text style={s.headerSubtitle}>Manage your time & leaves</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={s.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll}>
          <TouchableOpacity
            style={[s.tabBtn, activeTab === 'punch' && s.tabBtnActive]}
            onPress={() => setActiveTab('punch')}
          >
            <MapPin size={16} color={activeTab === 'punch' ? '#FFFFFF' : '#64748B'} />
            <Text style={[s.tabText, activeTab === 'punch' && s.tabTextActive]}>Attendance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[s.tabBtn, activeTab === 'leave' && s.tabBtnActive]}
            onPress={() => setActiveTab('leave')}
          >
            <CalendarDays size={16} color={activeTab === 'leave' ? '#FFFFFF' : '#64748B'} />
            <Text style={[s.tabText, activeTab === 'leave' && s.tabTextActive]}>Apply Leave</Text>
          </TouchableOpacity>
          
          {canApprove && (
            <TouchableOpacity
              style={[s.tabBtn, activeTab === 'approvals' && s.tabBtnActive]}
              onPress={() => setActiveTab('approvals')}
            >
              <CheckSquare size={16} color={activeTab === 'approvals' ? '#FFFFFF' : '#64748B'} />
              <Text style={[s.tabText, activeTab === 'approvals' && s.tabTextActive]}>Approvals</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={s.contentContainer}>
        {activeTab === 'punch' && <GeoPunchView navigation={navigation} />}
        {activeTab === 'leave' && <LeaveApplicationsScreen navigation={navigation} nested={true} />}
        {activeTab === 'approvals' && canApprove && <LeaveApprovalScreen navigation={navigation} nested={true} />}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: 20, paddingVertical: 16, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  }
});
