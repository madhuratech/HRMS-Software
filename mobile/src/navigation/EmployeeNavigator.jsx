import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeDirectoryScreen from '../screens/employee/EmployeeDirectoryScreen';
import EmployeeListScreen from '../screens/employee/EmployeeListScreen';
import AddEmployeeScreen from '../screens/employee/AddEmployeeScreen';
import EmployeeProfileScreen from '../screens/employee/EmployeeProfileScreen';
import EmploymentHistoryScreen from '../screens/employee/EmploymentHistoryScreen';
import PromotionsScreen from '../screens/employee/PromotionsScreen';
import TransfersScreen from '../screens/employee/TransfersScreen';
import ExitManagementScreen from '../screens/employee/ExitManagementScreen';
import EmployeeDocumentsScreen from '../screens/employee/EmployeeDocumentsScreen';

const Stack = createNativeStackNavigator();

export default function EmployeeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EmployeeDirectory" component={EmployeeDirectoryScreen} />
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Stack.Screen name="EmployeeProfile" component={EmployeeProfileScreen} />
      <Stack.Screen name="EmploymentHistory" component={EmploymentHistoryScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
      <Stack.Screen name="Transfers" component={TransfersScreen} />
      <Stack.Screen name="ExitManagement" component={ExitManagementScreen} />
      <Stack.Screen name="EmployeeDocuments" component={EmployeeDocumentsScreen} />
    </Stack.Navigator>
  );
}
