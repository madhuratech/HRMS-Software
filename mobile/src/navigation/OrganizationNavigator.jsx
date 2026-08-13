import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompanyProfileScreen from '../screens/organization/CompanyProfileScreen';
import DepartmentsScreen from '../screens/organization/DepartmentsScreen';
import DesignationsScreen from '../screens/organization/DesignationsScreen';
import TeamsScreen from '../screens/organization/TeamsScreen';
import ShiftManagementScreen from '../screens/organization/ShiftManagementScreen';
import HolidayCalendarScreen from '../screens/organization/HolidayCalendarScreen';
import OrganizationChartScreen from '../screens/organization/OrganizationChartScreen';

const Stack = createNativeStackNavigator();

export default function OrganizationNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
      <Stack.Screen name="Departments" component={DepartmentsScreen} />
      <Stack.Screen name="Designations" component={DesignationsScreen} />
      <Stack.Screen name="Teams" component={TeamsScreen} />
      <Stack.Screen name="ShiftManagement" component={ShiftManagementScreen} />
      <Stack.Screen name="HolidayCalendar" component={HolidayCalendarScreen} />
      <Stack.Screen name="OrganizationChart" component={OrganizationChartScreen} />
    </Stack.Navigator>
  );
}
