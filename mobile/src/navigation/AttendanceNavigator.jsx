import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import RegularizationScreen from '../screens/attendance/RegularizationScreen';
import ShiftRosterScreen from '../screens/attendance/ShiftRosterScreen';
import OvertimeScreen from '../screens/attendance/OvertimeScreen';
import LateArrivalScreen from '../screens/attendance/LateArrivalScreen';
import AttendanceReportsScreen from '../screens/attendance/AttendanceReportsScreen';

const Stack = createNativeStackNavigator();

export default function AttendanceNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AttendanceMain" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <Stack.Screen name="Regularization" component={RegularizationScreen} />
      <Stack.Screen name="ShiftRoster" component={ShiftRosterScreen} />
      <Stack.Screen name="Overtime" component={OvertimeScreen} />
      <Stack.Screen name="LateArrival" component={LateArrivalScreen} />
      <Stack.Screen name="AttendanceReports" component={AttendanceReportsScreen} />
    </Stack.Navigator>
  );
}
