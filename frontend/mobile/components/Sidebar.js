import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { 
  LayoutDashboard, Building2, Users, CalendarCheck, CalendarOff, 
  DollarSign, UserPlus, ClipboardList, BarChart3, FolderKanban, 
  FileText, LifeBuoy, LogOut, ChevronRight, X
} from 'lucide-react-native';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard' },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'leave', label: 'Leave Management', icon: CalendarOff },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
  { id: 'onboarding', label: 'Onboarding', icon: ClipboardList },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'help', label: 'Help Desk', icon: LifeBuoy },
];

export function Sidebar(props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>
          <View>
            <Text style={styles.logoText}>HAWKEYE NEST</Text>
            <Text style={styles.logoSubtext}>HRMS</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <X color="#94A3B8" size={20} />
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView {...props} style={styles.scrollArea}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.menuItem, item.id === 'dashboard' && styles.menuItemActive]}
            onPress={() => item.path && props.navigation.navigate(item.path)}
          >
            <item.icon color={item.id === 'dashboard' ? '#FFFFFF' : '#94A3B8'} size={18} />
            <Text style={[styles.menuText, item.id === 'dashboard' && styles.menuTextActive]}>
              {item.label}
            </Text>
            {!item.path && <ChevronRight color="#94A3B8" size={16} />}
          </TouchableOpacity>
        ))}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SA</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Super Admin</Text>
            <Text style={styles.profileRole}>SUPER_ADMIN</Text>
          </View>
          <TouchableOpacity>
            <LogOut color="#94A3B8" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoSubtext: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#2563EB',
  },
  menuText: {
    flex: 1,
    color: '#94A3B8',
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  menuTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileName: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  profileRole: {
    color: '#94A3B8',
    fontSize: 12,
  }
});
