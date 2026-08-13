import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HelpDeskDashboardScreen from '../screens/helpdesk/HelpDeskDashboardScreen';
import TicketsScreen from '../screens/helpdesk/TicketsScreen';
import CategoriesScreen from '../screens/helpdesk/CategoriesScreen';
import PrioritiesScreen from '../screens/helpdesk/PrioritiesScreen';
import KnowledgeBaseScreen from '../screens/helpdesk/KnowledgeBaseScreen';
import HelpDeskReportsScreen from '../screens/helpdesk/HelpDeskReportsScreen';

const Stack = createNativeStackNavigator();

export default function HelpdeskNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HelpDeskDashboard" component={HelpDeskDashboardScreen} />
      <Stack.Screen name="Tickets" component={TicketsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Priorities" component={PrioritiesScreen} />
      <Stack.Screen name="KnowledgeBase" component={KnowledgeBaseScreen} />
      <Stack.Screen name="HelpDeskReports" component={HelpDeskReportsScreen} />
    </Stack.Navigator>
  );
}
