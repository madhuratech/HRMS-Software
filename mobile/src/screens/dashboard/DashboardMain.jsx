import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboardScreen from './SuperAdminDashboardScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import EmployeeDashboardScreen from './EmployeeDashboardScreen';

export default function DashboardMain({ navigation }) {
  const { user } = useAuth();

  const roleStr = String(user?.role || user?.type || '').toUpperCase();
  const isEmployee = roleStr === 'EMPLOYEE' || roleStr === 'TEAM_LEADER' || roleStr === 'STAFF';

  if (isEmployee) {
    return <EmployeeDashboardScreen navigation={navigation} />;
  }

  if (roleStr === 'SUPER_ADMIN') {
    return <SuperAdminDashboardScreen navigation={navigation} />;
  }

  // For other Admins (HR_MANAGER, ADMIN, etc)
  return <AdminDashboardScreen navigation={navigation} />;
}
