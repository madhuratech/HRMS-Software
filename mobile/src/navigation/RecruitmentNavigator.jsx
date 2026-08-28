import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecruitmentDashboardScreen from '../screens/recruitment/RecruitmentDashboardScreen';
import JobOpeningsScreen from '../screens/recruitment/JobOpeningsScreen';
import CandidatesScreen from '../screens/recruitment/CandidatesScreen';
import InterviewScheduleScreen from '../screens/recruitment/InterviewScheduleScreen';
import OfferLettersScreen from '../screens/recruitment/OfferLettersScreen';
import HiringPipelineScreen from '../screens/recruitment/HiringPipelineScreen';
import RecruitmentReportsScreen from '../screens/recruitment/RecruitmentReportsScreen';

const Stack = createNativeStackNavigator();

export default function RecruitmentNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecruitmentDashboard" component={RecruitmentDashboardScreen} />
      <Stack.Screen name="JobOpenings" component={JobOpeningsScreen} />
      <Stack.Screen name="Candidates" component={CandidatesScreen} />
      <Stack.Screen name="InterviewSchedule" component={InterviewScheduleScreen} />
      <Stack.Screen name="OfferLetters" component={OfferLettersScreen} />
      <Stack.Screen name="HiringPipeline" component={HiringPipelineScreen} />
      <Stack.Screen name="RecruitmentReports" component={RecruitmentReportsScreen} />
    </Stack.Navigator>
  );
}
