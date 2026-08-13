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

const screensDir = path.join(__dirname, '..', 'src', 'screens');

// Create the template for a screen
const getScreenTemplate = (screenName) => `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ${screenName}Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${screenName}</Text>
      <Text style={styles.subtitle}>This screen is under construction.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
  }
});
`;

// Create the directories and files
Object.entries(modules).forEach(([moduleName, screens]) => {
  const dirPath = path.join(screensDir, moduleName);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  screens.forEach(screen => {
    const filePath = path.join(dirPath, `${screen}Screen.js`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, getScreenTemplate(screen));
      console.log(`Created: ${filePath}`);
    }
  });
});

console.log('Finished scaffolding screens.');
