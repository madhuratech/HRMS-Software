import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProjectDashboardScreen from '../screens/projects/ProjectDashboardScreen';
import ProjectsListScreen from '../screens/projects/ProjectsListScreen';
import TasksScreen from '../screens/projects/TasksScreen';
import SprintBoardScreen from '../screens/projects/SprintBoardScreen';
import TimesheetsScreen from '../screens/projects/TimesheetsScreen';
import MilestonesScreen from '../screens/projects/MilestonesScreen';
import TeamMembersScreen from '../screens/projects/TeamMembersScreen';

const Stack = createNativeStackNavigator();

export default function ProjectsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProjectDashboard" component={ProjectDashboardScreen} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="SprintBoard" component={SprintBoardScreen} />
      <Stack.Screen name="Timesheets" component={TimesheetsScreen} />
      <Stack.Screen name="Milestones" component={MilestonesScreen} />
      <Stack.Screen name="TeamMembers" component={TeamMembersScreen} />
    </Stack.Navigator>
  );
}
