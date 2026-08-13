import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewJoinersScreen from '../screens/onboarding/NewJoinersScreen';
import DocumentVerificationScreen from '../screens/onboarding/DocumentVerificationScreen';
import AssetAllocationScreen from '../screens/onboarding/AssetAllocationScreen';
import WelcomeKitScreen from '../screens/onboarding/WelcomeKitScreen';
import OrientationScreen from '../screens/onboarding/OrientationScreen';
import ProbationScreen from '../screens/onboarding/ProbationScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NewJoiners" component={NewJoinersScreen} />
      <Stack.Screen name="DocumentVerification" component={DocumentVerificationScreen} />
      <Stack.Screen name="AssetAllocation" component={AssetAllocationScreen} />
      <Stack.Screen name="WelcomeKit" component={WelcomeKitScreen} />
      <Stack.Screen name="Orientation" component={OrientationScreen} />
      <Stack.Screen name="Probation" component={ProbationScreen} />
    </Stack.Navigator>
  );
}
