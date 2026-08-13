const fs = require('fs');
const path = require('path');

const modules = {
  employee: ['EmployeeDirectory', 'EmployeeList', 'AddEmployee', 'EmployeeProfile', 'EmploymentHistory', 'Promotions', 'Transfers', 'ExitManagement', 'EmployeeDocuments'],
  attendance: ['DailyAttendance', 'GPSAttendance', 'Regularization', 'ShiftRoster', 'Overtime', 'LateArrival', 'AttendanceReports'],
  leave: ['LeaveDashboard', 'LeaveApplications', 'LeaveApproval', 'LeaveBalance', 'LeaveTypes', 'HolidayList', 'CompOff'],
  organization: ['CompanyProfile', 'Departments', 'Designations', 'Teams', 'ShiftManagement', 'HolidayCalendar', 'OrganizationChart'],
  payroll: ['SalaryStructure', 'SalaryComponents', 'PayrollProcessing', 'GeneratePayslips', 'BonusIncentives', 'Reimbursements', 'LoansAdvances', 'TaxManagement', 'PayrollReports'],
  recruitment: ['RecruitmentDashboard', 'JobOpenings', 'Candidates', 'InterviewSchedule', 'OfferLetters', 'HiringPipeline', 'RecruitmentReports'],
  onboarding: ['NewJoiners', 'DocumentVerification', 'AssetAllocation', 'WelcomeKit', 'Orientation', 'Probation'],
  performance: ['Goals', 'KPIs', 'KRAs', 'Appraisals', 'Reviews', 'Feedback', 'Promotions'],
  projects: ['ProjectDashboard', 'ProjectsList', 'Tasks', 'SprintBoard', 'Timesheets', 'Milestones', 'TeamMembers'],
  expenses: ['ExpenseClaims', 'ExpenseCategories', 'ExpenseApproval', 'Reimbursements', 'ExpenseReports'],
  documents: ['EmployeeDocuments', 'CompanyDocuments', 'HRPolicies', 'Templates', 'DigitalSignatures'],
  helpdesk: ['HelpDeskDashboard', 'Tickets', 'Categories', 'Priorities', 'KnowledgeBase', 'HelpDeskReports'],
  settings: ['SettingsCompany', 'SettingsBranding', 'SettingsOrganization', 'SettingsUsers', 'SettingsHR', 'SettingsCommunication', 'SettingsIntegrations', 'SettingsSecurity', 'SettingsSystem']
};

const navDir = path.join(__dirname, '..', 'src', 'navigation');

// Generate Module Navigators
Object.entries(modules).forEach(([moduleName, screens]) => {
  const capModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  let imports = `import React from 'react';\nimport { createNativeStackNavigator } from '@react-navigation/native-stack';\n`;
  let stackScreens = '';

  screens.forEach(screen => {
    imports += `import ${screen}Screen from '../screens/${moduleName}/${screen}Screen';\n`;
    stackScreens += `      <Stack.Screen name="${screen}" component={${screen}Screen} />\n`;
  });

  const content = `${imports}\nconst Stack = createNativeStackNavigator();\n\nexport default function ${capModule}Navigator() {\n  return (\n    <Stack.Navigator>\n${stackScreens}    </Stack.Navigator>\n  );\n}\n`;

  fs.writeFileSync(path.join(navDir, `${capModule}Navigator.js`), content);
});

// Generate Drawer Navigator
let drawerImports = `import React from 'react';\nimport { createDrawerNavigator } from '@react-navigation/drawer';\n`;
let drawerScreens = '';

Object.keys(modules).forEach(moduleName => {
  const capModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  drawerImports += `import ${capModule}Navigator from './${capModule}Navigator';\n`;
  drawerScreens += `      <Drawer.Screen name="${capModule}" component={${capModule}Navigator} />\n`;
});

// Also include the original Dashboard
drawerImports += `import DashboardScreen from '../screens/dashboard/DashboardScreen';\n`;
drawerScreens = `      <Drawer.Screen name="Dashboard" component={DashboardScreen} />\n` + drawerScreens;

const drawerContent = `${drawerImports}\nconst Drawer = createDrawerNavigator();\n\nexport default function DrawerNavigator() {\n  return (\n    <Drawer.Navigator>\n${drawerScreens}    </Drawer.Navigator>\n  );\n}\n`;

fs.writeFileSync(path.join(navDir, 'DrawerNavigator.js'), drawerContent);

// Update AppNavigator to use DrawerNavigator
const appNavContent = `import React from 'react';
import DrawerNavigator from './DrawerNavigator';

export default function AppNavigator() {
  // AppNavigator now just returns the Drawer, which handles the authenticated routing
  return <DrawerNavigator />;
}
`;
fs.writeFileSync(path.join(navDir, 'AppNavigator.js'), appNavContent);

console.log('Navigation generated!');
