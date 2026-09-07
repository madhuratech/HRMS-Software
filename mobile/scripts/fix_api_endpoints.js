const fs = require('fs');
const path = require('path');

const replacements = {
  'recruitment/JobOpeningsScreen.jsx': { old: '/jobopenings', new: '/requirements' },
  'recruitment/InterviewScheduleScreen.jsx': { old: '/interviewschedules', new: '/interviews' },
  'recruitment/OfferLettersScreen.jsx': { old: '/offerletters', new: '/offers' },
  'recruitment/HiringPipelineScreen.jsx': { old: '/hiringpipelines', new: '/candidates' },
  'onboarding/NewJoinersScreen.jsx': { old: '/newjoiners', new: '/joiners' },
  'onboarding/DocumentVerificationScreen.jsx': { old: '/documentverifications', new: '/verifications' },
  'onboarding/AssetAllocationScreen.jsx': { old: '/assetallocations', new: '/assets' },
  'onboarding/WelcomeKitScreen.jsx': { old: '/welcomekits', new: '/joiners' },
  'onboarding/OrientationScreen.jsx': { old: '/orientations', new: '/orientations' },
  'onboarding/ProbationScreen.jsx': { old: '/probations', new: '/probations' },
  'payroll/SalaryStructureScreen.jsx': { old: '/salarystructures', new: '/payroll' },
  'payroll/SalaryComponentsScreen.jsx': { old: '/salarycomponents', new: '/payroll' },
  'payroll/PayrollProcessingScreen.jsx': { old: '/payrollprocessings', new: '/payroll' },
  'payroll/GeneratePayslipsScreen.jsx': { old: '/generatepayslips', new: '/payroll' },
  'payroll/BonusIncentivesScreen.jsx': { old: '/bonusincentives', new: '/payroll' },
  'payroll/ReimbursementsScreen.jsx': { old: '/reimbursements', new: '/payroll' },
  'payroll/LoansAdvancesScreen.jsx': { old: '/loansadvances', new: '/payroll' },
  'payroll/TaxManagementScreen.jsx': { old: '/taxmanagements', new: '/payroll' },
  'training/TrainingScreen.jsx': { old: '/trainings', new: '/training' },
  'performance/PromotionsScreen.jsx': { old: '/promotions', new: '/promotions' },
  'projects/ProjectDashboardScreen.jsx': { old: '/projectdashboards', new: '/projects' },
  'projects/ProjectsListScreen.jsx': { old: '/projectslists', new: '/projects' },
  'projects/TasksScreen.jsx': { old: '/tasks', new: '/tasks' },
  'projects/SprintBoardScreen.jsx': { old: '/sprintboards', new: '/sprints' },
  'projects/TimesheetsScreen.jsx': { old: '/timesheets', new: '/timesheets' },
  'projects/MilestonesScreen.jsx': { old: '/milestones', new: '/milestones' },
  'projects/TeamMembersScreen.jsx': { old: '/teammembers', new: '/project-team' },
  'expenses/ExpenseClaimsScreen.jsx': { old: '/expenseclaims', new: '/expenses' },
  'expenses/ExpenseCategoriesScreen.jsx': { old: '/expensecategories', new: '/expenses' },
  'expenses/ExpenseApprovalScreen.jsx': { old: '/expenseapprovals', new: '/expenses' },
  'expenses/ReimbursementsScreen.jsx': { old: '/reimbursements', new: '/expenses' },
  'expenses/ExpenseReportsScreen.jsx': { old: '/expensereports', new: '/reports' }
};

const screensDir = path.join(__dirname, '..', 'src', 'screens');

for (const [relativePath, mapping] of Object.entries(replacements)) {
  const filePath = path.join(screensDir, relativePath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace GET
    content = content.replace(new RegExp(`apiClient\\.get\\('${mapping.old}'\\)`, 'g'), `apiClient.get('${mapping.new}')`);
    // Replace POST
    content = content.replace(new RegExp(`apiClient\\.post\\('${mapping.old}'`, 'g'), `apiClient.post('${mapping.new}'`);
    
    // Also replace the deletion endpoint which uses string interpolation
    content = content.replace(new RegExp(`\\\`${mapping.old}/`, 'g'), `\\\`${mapping.new}/`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed endpoints in ${relativePath}`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
}

console.log('Finished fixing endpoints!');
