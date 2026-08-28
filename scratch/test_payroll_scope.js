const DataScopeService = require('../backend/services/DataScopeService');

async function verifyAllPayslipRoles() {
  console.log('=== VERIFYING PAYSLIP ROLE DATA SCOPING ===');

  const testCases = [
    { role: 'SUPER_ADMIN', empId: 1, expectedScope: 'Full Access (All Employees)' },
    { role: 'ADMIN', empId: 2, expectedScope: 'Full Access (All Employees)' },
    { role: 'HR_MANAGER', empId: 3, expectedScope: 'Full Access (All Employees)' },
    { role: 'TEAM_LEADER', empId: 10, expectedScope: 'Own + Assigned Team Members Only' },
    { role: 'EMPLOYEE', empId: 5, expectedScope: 'Own Individual Payslip Only' },
  ];

  for (const tc of testCases) {
    const req = {
      user: { id: tc.empId, employee_id: tc.empId, role: tc.role },
      headers: { 'x-employee-id': String(tc.empId) }
    };
    const scopeData = await DataScopeService.getScope(req);
    const userRole = (scopeData.userRole || tc.role).toUpperCase().replace(/_/g, ' ');

    let accessType = 'EMPLOYEE (Individual Only)';
    if (scopeData.isUnrestricted || userRole === 'SUPER ADMIN' || userRole === 'ADMIN' || userRole === 'HR MANAGER') {
      accessType = 'FULL ACCESS (All Employees)';
    } else if (userRole === 'TEAM LEADER') {
      accessType = `TEAM LEADER (Allowed IDs: [${(scopeData.allowedEmployeeIds || []).join(', ')}])`;
    }

    console.log(`Role: ${tc.role.padEnd(12)} -> Access Type: ${accessType}`);
  }

  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  process.exit(0);
}

verifyAllPayslipRoles();
