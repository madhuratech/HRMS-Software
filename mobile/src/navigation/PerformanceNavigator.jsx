import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GoalsScreen from '../screens/performance/GoalsScreen';
import KPIsScreen from '../screens/performance/KPIsScreen';
import KRAsScreen from '../screens/performance/KRAsScreen';
import AppraisalsScreen from '../screens/performance/AppraisalsScreen';
import ReviewsScreen from '../screens/performance/ReviewsScreen';
import FeedbackScreen from '../screens/performance/FeedbackScreen';
import PromotionsScreen from '../screens/performance/PromotionsScreen';

const Stack = createNativeStackNavigator();

export default function PerformanceNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="KPIs" component={KPIsScreen} />
      <Stack.Screen name="KRAs" component={KRAsScreen} />
      <Stack.Screen name="Appraisals" component={AppraisalsScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
    </Stack.Navigator>
  );
}
