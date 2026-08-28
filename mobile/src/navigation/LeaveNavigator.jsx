import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LeaveScreen from '../screens/leave/LeaveScreen';
import LeaveApprovalScreen from '../screens/leave/LeaveApprovalScreen';
import LeaveBalanceScreen from '../screens/leave/LeaveBalanceScreen';
import LeaveTypesScreen from '../screens/leave/LeaveTypesScreen';
import HolidayListScreen from '../screens/leave/HolidayListScreen';
import CompOffScreen from '../screens/leave/CompOffScreen';

const Stack = createNativeStackNavigator();

export default function LeaveNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LeaveMain" component={LeaveScreen} options={{ title: 'Leave' }} />
      <Stack.Screen name="LeaveApproval" component={LeaveApprovalScreen} />
      <Stack.Screen name="LeaveBalance" component={LeaveBalanceScreen} />
      <Stack.Screen name="LeaveTypes" component={LeaveTypesScreen} />
      <Stack.Screen name="HolidayList" component={HolidayListScreen} />
      <Stack.Screen name="CompOff" component={CompOffScreen} />
    </Stack.Navigator>
  );
}
