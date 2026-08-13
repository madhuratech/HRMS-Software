import React from 'react';
import DrawerNavigator from './DrawerNavigator';

export default function AppNavigator() {
  // AppNavigator now just returns the Drawer, which handles the authenticated routing
  return <DrawerNavigator />;
}
