import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboardScreen from './SuperAdminDashboardScreen';
import AdminDashboardScreen from './AdminDashboardScreen';
import EmployeeDashboardScreen from './EmployeeDashboardScreen';

export default function DashboardMain({ navigation }) {
  const { user } = useAuth();

  if (user?.type === 'EMPLOYEE') {
    return <EmployeeDashboardScreen navigation={navigation} />;
  }

  // Super Admin
  if (user?.role === 'SUPER_ADMIN' || user?.type === 'SUPER_ADMIN' || !user?.type) {
    return <SuperAdminDashboardScreen navigation={navigation} />;
  }

  // For other Admins
  return <AdminDashboardScreen navigation={navigation} />;
}
