const fs = require('fs');
const path = require('path');

const navFilePath = path.join(__dirname, '..', 'src', 'navigation', 'DrawerNavigator.jsx');
let content = fs.readFileSync(navFilePath, 'utf8');

const importsToAdd = `
// Phase 4 New Screens
import HolidayListScreen from '../screens/leave/HolidayListScreen';
import PayrollReportsScreen from '../screens/payroll/PayrollReportsScreen';

// Documents
import EmployeeDocumentsModuleScreen from '../screens/documents/EmployeeDocumentsModuleScreen';
import CompanyDocumentsScreen from '../screens/documents/CompanyDocumentsScreen';
import HRPoliciesScreen from '../screens/documents/HRPoliciesScreen';
import TemplatesScreen from '../screens/documents/TemplatesScreen';
import DigitalSignaturesScreen from '../screens/documents/DigitalSignaturesScreen';

// Help Desk
import HelpDeskDashboardScreen from '../screens/helpdesk/HelpDeskDashboardScreen';
import TicketsScreen from '../screens/helpdesk/TicketsScreen';
import CategoriesScreen from '../screens/helpdesk/CategoriesScreen';
import PrioritiesScreen from '../screens/helpdesk/PrioritiesScreen';
import KnowledgeBaseScreen from '../screens/helpdesk/KnowledgeBaseScreen';
import HelpDeskReportsScreen from '../screens/helpdesk/HelpDeskReportsScreen';

// Settings
import SettingsCompanyScreen from '../screens/settings/SettingsCompanyScreen';
import SettingsBrandingScreen from '../screens/settings/SettingsBrandingScreen';
import SettingsOrganizationScreen from '../screens/settings/SettingsOrganizationScreen';
import SettingsUsersScreen from '../screens/settings/SettingsUsersScreen';
import SettingsHRScreen from '../screens/settings/SettingsHRScreen';
import SettingsCommunicationScreen from '../screens/settings/SettingsCommunicationScreen';
import SettingsIntegrationsScreen from '../screens/settings/SettingsIntegrationsScreen';
import SettingsSecurityScreen from '../screens/settings/SettingsSecurityScreen';
import SettingsSystemScreen from '../screens/settings/SettingsSystemScreen';

// AI Assistant
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';

// Reports
import EmployeeReportsScreen from '../screens/reports/EmployeeReportsScreen';
import AttendanceReportsModuleScreen from '../screens/reports/AttendanceReportsModuleScreen';
import LeaveReportsScreen from '../screens/reports/LeaveReportsScreen';
import PayrollReportsModuleScreen from '../screens/reports/PayrollReportsModuleScreen';
import RecruitmentReportsScreen from '../screens/reports/RecruitmentReportsScreen';
import PerformanceReportsScreen from '../screens/reports/PerformanceReportsScreen';
import ProjectReportsScreen from '../screens/reports/ProjectReportsScreen';
`;

// Add imports
content = content.replace('const Drawer = createDrawerNavigator();', importsToAdd + '\\nconst Drawer = createDrawerNavigator();');

// Replace PlaceholderScreen mappings
const replacements = {
  'name="HolidayList" component={PlaceholderScreen}': 'name="HolidayList" component={HolidayListScreen}',
  'name="PayrollReports" component={PlaceholderScreen}': 'name="PayrollReports" component={PayrollReportsScreen}',
  'name="EmployeeReports" component={PlaceholderScreen}': 'name="EmployeeReports" component={EmployeeReportsScreen}',
  'name="AttendanceReportsModule" component={PlaceholderScreen}': 'name="AttendanceReportsModule" component={AttendanceReportsModuleScreen}',
  'name="LeaveReports" component={PlaceholderScreen}': 'name="LeaveReports" component={LeaveReportsScreen}',
  'name="PayrollReportsModule" component={PlaceholderScreen}': 'name="PayrollReportsModule" component={PayrollReportsModuleScreen}',
  'name="RecruitmentReports" component={PlaceholderScreen}': 'name="RecruitmentReports" component={RecruitmentReportsScreen}',
  'name="PerformanceReports" component={PlaceholderScreen}': 'name="PerformanceReports" component={PerformanceReportsScreen}',
  'name="ProjectReports" component={PlaceholderScreen}': 'name="ProjectReports" component={ProjectReportsScreen}',
  'name="EmployeeDocumentsModule" component={PlaceholderScreen}': 'name="EmployeeDocumentsModule" component={EmployeeDocumentsModuleScreen}',
  'name="CompanyDocuments" component={PlaceholderScreen}': 'name="CompanyDocuments" component={CompanyDocumentsScreen}',
  'name="HRPolicies" component={PlaceholderScreen}': 'name="HRPolicies" component={HRPoliciesScreen}',
  'name="Templates" component={PlaceholderScreen}': 'name="Templates" component={TemplatesScreen}',
  'name="DigitalSignatures" component={PlaceholderScreen}': 'name="DigitalSignatures" component={DigitalSignaturesScreen}',
  'name="HelpDeskDashboard" component={PlaceholderScreen}': 'name="HelpDeskDashboard" component={HelpDeskDashboardScreen}',
  'name="Tickets" component={PlaceholderScreen}': 'name="Tickets" component={TicketsScreen}',
  'name="Categories" component={PlaceholderScreen}': 'name="Categories" component={CategoriesScreen}',
  'name="Priorities" component={PlaceholderScreen}': 'name="Priorities" component={PrioritiesScreen}',
  'name="KnowledgeBase" component={PlaceholderScreen}': 'name="KnowledgeBase" component={KnowledgeBaseScreen}',
  'name="HelpDeskReports" component={PlaceholderScreen}': 'name="HelpDeskReports" component={HelpDeskReportsScreen}',
  'name="SettingsCompany" component={PlaceholderScreen}': 'name="SettingsCompany" component={SettingsCompanyScreen}',
  'name="SettingsBranding" component={PlaceholderScreen}': 'name="SettingsBranding" component={SettingsBrandingScreen}',
  'name="SettingsOrganization" component={PlaceholderScreen}': 'name="SettingsOrganization" component={SettingsOrganizationScreen}',
  'name="SettingsUsers" component={PlaceholderScreen}': 'name="SettingsUsers" component={SettingsUsersScreen}',
  'name="SettingsHR" component={PlaceholderScreen}': 'name="SettingsHR" component={SettingsHRScreen}',
  'name="SettingsCommunication" component={PlaceholderScreen}': 'name="SettingsCommunication" component={SettingsCommunicationScreen}',
  'name="SettingsIntegrations" component={PlaceholderScreen}': 'name="SettingsIntegrations" component={SettingsIntegrationsScreen}',
  'name="SettingsSecurity" component={PlaceholderScreen}': 'name="SettingsSecurity" component={SettingsSecurityScreen}',
  'name="SettingsSystem" component={PlaceholderScreen}': 'name="SettingsSystem" component={SettingsSystemScreen}',
  'name="AIAssistant" component={PlaceholderScreen}': 'name="AIAssistant" component={AIAssistantScreen}'
};

Object.keys(replacements).forEach(key => {
  content = content.replace(key, replacements[key]);
});

fs.writeFileSync(navFilePath, content, 'utf8');
console.log('Successfully updated DrawerNavigator.jsx');
