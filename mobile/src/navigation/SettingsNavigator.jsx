import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsCompanyScreen from '../screens/settings/SettingsCompanyScreen';
import SettingsBrandingScreen from '../screens/settings/SettingsBrandingScreen';
import SettingsOrganizationScreen from '../screens/settings/SettingsOrganizationScreen';
import SettingsUsersScreen from '../screens/settings/SettingsUsersScreen';
import SettingsHRScreen from '../screens/settings/SettingsHRScreen';
import SettingsCommunicationScreen from '../screens/settings/SettingsCommunicationScreen';
import SettingsIntegrationsScreen from '../screens/settings/SettingsIntegrationsScreen';
import SettingsSecurityScreen from '../screens/settings/SettingsSecurityScreen';
import SettingsSystemScreen from '../screens/settings/SettingsSystemScreen';

const Stack = createNativeStackNavigator();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsCompany" component={SettingsCompanyScreen} />
      <Stack.Screen name="SettingsBranding" component={SettingsBrandingScreen} />
      <Stack.Screen name="SettingsOrganization" component={SettingsOrganizationScreen} />
      <Stack.Screen name="SettingsUsers" component={SettingsUsersScreen} />
      <Stack.Screen name="SettingsHR" component={SettingsHRScreen} />
      <Stack.Screen name="SettingsCommunication" component={SettingsCommunicationScreen} />
      <Stack.Screen name="SettingsIntegrations" component={SettingsIntegrationsScreen} />
      <Stack.Screen name="SettingsSecurity" component={SettingsSecurityScreen} />
      <Stack.Screen name="SettingsSystem" component={SettingsSystemScreen} />
    </Stack.Navigator>
  );
}
