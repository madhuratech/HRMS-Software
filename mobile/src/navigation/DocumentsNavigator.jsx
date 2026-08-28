import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeDocumentsScreen from '../screens/documents/EmployeeDocumentsScreen';
import CompanyDocumentsScreen from '../screens/documents/CompanyDocumentsScreen';
import HRPoliciesScreen from '../screens/documents/HRPoliciesScreen';
import TemplatesScreen from '../screens/documents/TemplatesScreen';
import DigitalSignaturesScreen from '../screens/documents/DigitalSignaturesScreen';

const Stack = createNativeStackNavigator();

export default function DocumentsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EmployeeDocuments" component={EmployeeDocumentsScreen} />
      <Stack.Screen name="CompanyDocuments" component={CompanyDocumentsScreen} />
      <Stack.Screen name="HRPolicies" component={HRPoliciesScreen} />
      <Stack.Screen name="Templates" component={TemplatesScreen} />
      <Stack.Screen name="DigitalSignatures" component={DigitalSignaturesScreen} />
    </Stack.Navigator>
  );
}
